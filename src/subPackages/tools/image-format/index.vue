<template>
  <view class="format-page">
    <NavBar
      always-title
      title="图片格式转换"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' }"
    />

    <view class="content">
      <view class="card upload-card">
        <view v-if="!baseImage.src" class="upload-area" @click="selectImage">
          <uni-icons type="cloud-upload" size="54" color="#90a4ae" />
          <text class="upload-title">点击上传图片</text>
          <text class="upload-desc">支持 JPG / PNG / WebP，单张 ≤ 20MB</text>
          <text class="upload-hint">建议使用清晰原图，便于保持画质</text>
        </view>

        <view v-else class="preview-area">
          <view class="preview-header">
            <view>
              <text class="preview-title">原图预览</text>
              <text class="preview-meta">{{ baseImage.width }} × {{ baseImage.height }} · {{ formatFileSize(baseImage.size) }}</text>
            </view>
            <button class="ghost-btn" @click="reset">重新选择</button>
          </view>
          <image class="preview-image" :src="baseImage.previewSrc" mode="widthFix" />
        </view>
      </view>

      <view class="card control-card" v-if="baseImage.src">
        <view class="control-group">
          <text class="control-label">目标格式</text>
          <view class="format-options">
            <view
              v-for="option in formatOptions"
              :key="option.value"
              class="format-item"
              :class="{ active: targetFormat === option.value, disabled: !option.supported }"
              @click="selectFormat(option)"
            >
              <text>{{ option.label }}</text>
              <text class="format-desc" v-if="option.tip">{{ option.tip }}</text>
            </view>
          </view>
        </view>

        <view class="control-group" v-if="targetFormat !== 'png'">
          <text class="control-label">压缩质量 {{ quality }}%</text>
          <slider
            :value="quality"
            :min="40"
            :max="100"
            :step="5"
            @change="(e) => (quality = Number(e.detail.value))"
            activeColor="#4caf50"
            backgroundColor="#e0e0e0"
          />
          <text class="quality-hint">数值越高体积越大，建议 80% 以上保留清晰度</text>
        </view>

        <view class="warning" v-if="targetFormat === 'webp' && !isH5">
          <uni-icons type="info" size="20" color="#fb8c00" />
          <text>小程序暂不支持导出 WebP，请改用 PNG / JPG 或前往 H5 访问。</text>
        </view>

        <button class="primary-btn" :loading="isConverting" @click="convertImage">开始转换</button>
      </view>

      <view class="card result-card" v-if="convertedImage.src">
        <view class="result-header">
          <text class="result-title">转换结果 · {{ convertedImage.format.toUpperCase() }}</text>
          <text class="result-meta">{{ formatFileSize(convertedImage.size) }}</text>
        </view>
        <image class="result-image" :src="convertedImage.src" mode="widthFix" show-menu-by-longpress />
        <view class="result-actions">
          <button class="ghost-btn" @click="saveResult">保存到本地</button>
          <button class="ghost-btn" @click="copyLink" :disabled="!canCopyPath">复制地址</button>
        </view>
      </view>
    </view>

    <canvas
      canvas-id="formatCanvas"
      id="formatCanvas"
      class="hidden-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/nav-bar.vue'
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { reportToolVisit } from '@/utils/tracker'

onShow(() => {
  reportToolVisit('image-format')
})

const canvasId = 'formatCanvas'
const { proxy } = getCurrentInstance() as any

const baseImage = reactive({
  src: '',
  previewSrc: '',
  width: 0,
  height: 0,
  size: 0
})

const convertedImage = reactive({
  src: '',
  format: '',
  size: 0
})

const targetFormat = ref<'png' | 'jpg' | 'webp'>('png')
const quality = ref(90)
const isConverting = ref(false)
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const isH5 = ref(false)

// #ifdef H5
isH5.value = true
// #endif

type FormatOption = { value: 'png' | 'jpg' | 'webp'; label: string; tip?: string; supported: boolean }

const formatOptions = computed<FormatOption[]>(() => [
  { value: 'png', label: 'PNG', tip: '透明背景，体积较大', supported: true },
  { value: 'jpg', label: 'JPG', tip: '照片常用，支持压缩', supported: true },
  { value: 'webp', label: 'WebP', tip: isH5.value ? '浏览器优选，小体积' : 'H5 可用', supported: isH5.value }
])

const canCopyPath = computed(() => convertedImage.src.startsWith('http') || convertedImage.src.startsWith('data:'))

const formatFileSize = (size: number) => {
  if (!size) return '—'
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(2)}MB`
}

const selectFormat = (option: FormatOption) => {
  if (!option.supported) {
    uni.showToast({ title: '当前平台暂不支持该格式', icon: 'none' })
    return
  }
  targetFormat.value = option.value
}

const selectImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original'],
    success: (res) => {
      const tempPath = res.tempFilePaths[0]
      uni.getImageInfo({
        src: tempPath,
        success: (info) => {
          baseImage.src = info.path
          baseImage.previewSrc = info.path
          baseImage.width = info.width
          baseImage.height = info.height
          const tempFiles = res.tempFiles as any
          baseImage.size = Array.isArray(tempFiles) ? tempFiles[0]?.size || 0 : tempFiles?.size || 0
          canvasWidth.value = info.width
          canvasHeight.value = info.height
          convertedImage.src = ''
          convertedImage.format = ''
          convertedImage.size = 0
        },
        fail: () => uni.showToast({ title: '图片加载失败', icon: 'none' })
      })
    }
  })
}

const reset = () => {
  baseImage.src = ''
  baseImage.previewSrc = ''
  baseImage.width = 0
  baseImage.height = 0
  baseImage.size = 0
  convertedImage.src = ''
  convertedImage.format = ''
  convertedImage.size = 0
}

const convertImage = () => {
  if (!baseImage.src) {
    uni.showToast({ title: '请先上传图片', icon: 'none' })
    return
  }
  if (targetFormat.value === 'webp' && !isH5.value) {
    uni.showToast({ title: '请在 H5 环境导出 WebP', icon: 'none' })
    return
  }
  isConverting.value = true
  const ctx = uni.createCanvasContext(canvasId, proxy)
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  ctx.drawImage(baseImage.src, 0, 0, canvasWidth.value, canvasHeight.value)
  ctx.draw(false, () => {
    if (targetFormat.value === 'webp') {
      // #ifdef H5
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
      if (!canvas) {
        uni.showToast({ title: 'Canvas 不可用', icon: 'none' })
        isConverting.value = false
        return
      }
      const dataUrl = canvas.toDataURL('image/webp', quality.value / 100)
      convertedImage.src = dataUrl
      convertedImage.format = 'webp'
      convertedImage.size = Math.round((dataUrl.length * 3) / 4)
      uni.showToast({ title: '转换成功', icon: 'success' })
      isConverting.value = false
      // #endif
      // #ifndef H5
      isConverting.value = false
      // #endif
      return
    }

    uni.canvasToTempFilePath(
      {
        canvasId,
        width: canvasWidth.value,
        height: canvasHeight.value,
        destWidth: canvasWidth.value,
        destHeight: canvasHeight.value,
        quality: targetFormat.value === 'jpg' ? quality.value / 100 : 1,
        fileType: targetFormat.value === 'png' ? 'png' : 'jpg',
        success: (res) => {
          convertedImage.src = res.tempFilePath
          convertedImage.format = targetFormat.value
          uni.getFileInfo({
            filePath: res.tempFilePath,
            success: (info) => {
              convertedImage.size = info.size
            },
            fail: () => {
              convertedImage.size = 0
            }
          })
          uni.showToast({ title: '转换成功', icon: 'success' })
        },
        fail: (err) => {
          console.error(err)
          uni.showToast({ title: '转换失败，请重试', icon: 'none' })
        },
        complete: () => {
          isConverting.value = false
        }
      },
      proxy
    )
  })
}

const saveResult = () => {
  if (!convertedImage.src) return
  if (convertedImage.src.startsWith('data:')) {
    // #ifdef H5
    const link = document.createElement('a')
    link.href = convertedImage.src
    link.download = `converted.${convertedImage.format || 'png'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // #endif
    return
  }
  // #ifdef MP-WEIXIN
  uni.saveImageToPhotosAlbum({
    filePath: convertedImage.src,
    success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
    fail: () => uni.showToast({ title: '保存失败，请检查权限', icon: 'none' })
  })
  // #endif
  // #ifdef H5
  const link = document.createElement('a')
  link.href = convertedImage.src
  link.download = `converted.${convertedImage.format || 'png'}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // #endif
}

const copyLink = () => {
  if (!canCopyPath.value || !convertedImage.src) {
    uni.showToast({ title: '无可复制地址', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: convertedImage.src,
    success: () => uni.showToast({ title: '已复制', icon: 'success' })
  })
}
</script>

<style scoped lang="scss">
.format-page {
  min-height: 100vh;
  background: #f2faf5;
}

.content {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.15);
}

.upload-area {
  border: 2rpx dashed #b0bec5;
  border-radius: 24rpx;
  padding: 120rpx 32rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  color: #607d8b;
}

.upload-title {
  font-size: 32rpx;
  font-weight: 600;
}

.upload-desc {
  font-size: 26rpx;
}

.upload-hint {
  font-size: 24rpx;
  color: #9e9e9e;
}

.preview-area {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 30rpx;
  font-weight: 600;
}

.preview-meta {
  display: block;
  font-size: 24rpx;
  color: #90a4ae;
}

.preview-image {
  width: 100%;
  border-radius: 20rpx;
  border: 1rpx solid #e0f2f1;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.control-label {
  font-size: 28rpx;
  font-weight: 600;
}

.format-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.format-item {
  border: 1rpx solid #e0e0e0;
  border-radius: 18rpx;
  padding: 20rpx;
  background: #f9fbff;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  color: #455a64;
}

.format-item.active {
  border-color: #4caf50;
  background: linear-gradient(135deg, rgba(132, 250, 176, 0.2), rgba(143, 211, 244, 0.2));
  box-shadow: 0 8rpx 18rpx rgba(76, 175, 80, 0.2);
}

.format-item.disabled {
  opacity: 0.5;
}

.format-desc {
  font-size: 24rpx;
  color: #90a4ae;
}

.quality-hint {
  font-size: 24rpx;
  color: #90a4ae;
}

.warning {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #fff8e1;
  color: #fb8c00;
  padding: 16rpx;
  border-radius: 16rpx;
}

.primary-btn {
  margin-top: 12rpx;
  height: 96rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, #84fab0, #8fd3f4);
  color: #fff;
  font-size: 32rpx;
  border: none;
}

.ghost-btn {
  height: 72rpx;
  padding: 0 32rpx;
  border-radius: 18rpx;
  border: none;
  background: #e0f7fa;
  color: #00796b;
  font-size: 26rpx;
}

.result-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-title {
  font-size: 30rpx;
  font-weight: 600;
}

.result-meta {
  font-size: 24rpx;
  color: #90a4ae;
}

.result-image {
  width: 100%;
  border-radius: 20rpx;
  border: 1rpx solid #e0f2f1;
}

.result-actions {
  display: flex;
  gap: 16rpx;
}

.hidden-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
