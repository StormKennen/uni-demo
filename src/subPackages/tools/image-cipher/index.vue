<template>
  <view class="cipher-page">
    <NavBar
      always-title
      title="图片混淆"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }"
    />

    <view class="content">
      <view class="card upload-card">
        <view v-if="!baseImage.src" class="upload-area" @click="selectImage">
          <uni-icons type="image" size="56" color="#b0bec5" />
          <text class="upload-title">点击上传需要混淆的图片</text>
          <text class="upload-desc">支持 JPG / PNG / WebP，最大 20MB</text>
          <text class="upload-hint">所有处理均在本地完成，不会上传服务器</text>
        </view>

        <view v-else class="preview-area">
          <view class="preview-header">
            <view>
              <text class="preview-title">当前图片</text>
              <text class="preview-meta">{{ baseImage.width }} × {{ baseImage.height }} · {{ formatFileSize(currentImage.size || baseImage.size) }}</text>
            </view>
            <button class="ghost-btn" @click="resetAll">重新选择</button>
          </view>
          <view class="preview-wrapper">
            <image class="preview-image" :src="currentImage.src || baseImage.previewSrc" mode="widthFix" show-menu-by-longpress />
            <view v-if="isProcessing" class="preview-overlay">
              <view class="loader-circle"></view>
              <text class="loader-text">处理中...</text>
            </view>
          </view>
          <view class="preview-footer">
            <text class="result-meta">兼容模式：依据密钥即可在任意渠道还原</text>
            <view class="preview-actions">
              <button class="ghost-btn" @click="saveResult">保存/下载</button>
              <button class="ghost-btn" @click="copyDataUrl" :disabled="!currentImage.src.startsWith('data:')">复制 DataURL</button>
            </view>
          </view>
        </view>
      </view>

      <view class="share-entry" v-if="!isH5">
        <text class="share-tip" v-if="isWeixinMiniProgram">请点击右上角 · 分享「图片混淆」工具</text>
        <text class="share-tip" v-else>请点击右上角 · 分享本工具</text>
      </view>
      <view class="share-entry" v-else>
        <button class="share-btn" @click="handleShare">复制分享链接</button>
      </view>

      <view class="card control-card" v-if="baseImage.src">
        <text class="mode-hint">兼容模式：可在微信相册、社交平台等渠道保存后再还原</text>

        <view class="control-group">
          <text class="control-label">密钥（任意字符）</text>
          <input v-model.trim="cipherSettings.seed" class="text-input" placeholder="例如：123" />
        </view>
        <!-- <view class="control-group">
          <text class="control-label">混淆网格 {{ cipherSettings.grid }} × {{ cipherSettings.grid }}</text>
          <slider
            :value="cipherSettings.grid"
            :min="4"
            :max="20"
            :step="1"
            @change="(e) => (cipherSettings.grid = Number(e.detail.value))"
            activeColor="#f6d365"
            backgroundColor="#ffe0b2"
          />
          <text class="hint">网格越大越复杂，但处理时间也更长</text>
        </view> -->

        <view class="btn-row">
          <button
            class="primary-btn"
            :loading="isProcessing"
            loading-text="处理中..."
            :disabled="isProcessing"
            @click="() => handleCipher('encrypt')"
          >混淆一次</button>
          <button
            class="ghost-btn"
            :loading="isProcessing"
            loading-text="处理中..."
            :disabled="isProcessing"
            @click="() => handleCipher('decrypt')"
          >还原一次</button>
        </view>
        <button
          class="ghost-btn full"
          :loading="isProcessing"
          loading-text="处理中..."
          :disabled="isProcessing || !baseImage.src || currentImage.src === baseImage.previewSrc"
          @click="restoreOriginal"
        >还原到原图</button>
      </view>

    </view>

    <canvas
      canvas-id="cipherCanvas"
      id="cipherCanvas"
      class="hidden-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { reportToolVisit } from '@/utils/tracker'
import NavBar from '@/components/nav-bar.vue'
import { SimpleScrambler } from '@/engine/simple-scrambler'

const canvasId = 'cipherCanvas'
const simpleScrambler = new SimpleScrambler()

const MAX_DECRYPT_ROUNDS = 10

const baseImage = reactive({
  src: '',
  previewSrc: '',
  width: 0,
  height: 0,
  size: 0
})

const currentImage = reactive({
  src: '',
  size: 0
})

const cipherSettings = reactive({
  grid: 12,
  seed: '123'
})

const isProcessing = ref(false)
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const isWeixinMiniProgram = ref(false)
const isH5 = ref(false)

// #ifdef MP-WEIXIN
isWeixinMiniProgram.value = true
uni.showShareMenu({ withShareTicket: true })
// #endif

// #ifdef H5
isH5.value = true
// #endif

const platformType = computed<'weapp' | 'h5' | 'app'>(() => {
  if (isH5.value) return 'h5'
  if (isWeixinMiniProgram.value) return 'weapp'
  return 'app'
})

const SHARE_TITLE = '图片混淆 · 凉白开工具箱'
const SHARE_PATH = '/subPackages/tools/image-cipher/index'

const formatFileSize = (size: number) => {
  if (!size) return '—'
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(2)}MB`
}

const selectImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original'],
    success: async (res) => {
      const tempPath = res.tempFilePaths[0]
      uni.getImageInfo({
        src: tempPath,
        success: async (info) => {
          baseImage.src = info.path
          baseImage.previewSrc = info.path
          baseImage.width = info.width
          baseImage.height = info.height
          const tempFiles = res.tempFiles as any
          baseImage.size = Array.isArray(tempFiles) ? tempFiles[0]?.size || 0 : tempFiles?.size || 0
          currentImage.src = info.path
          currentImage.size = baseImage.size
          canvasWidth.value = info.width
          canvasHeight.value = info.height
        },
        fail: () => uni.showToast({ title: '图片加载失败', icon: 'none' })
      })
    }
  })
}

const resetAll = () => {
  baseImage.src = ''
  baseImage.previewSrc = ''
  baseImage.width = 0
  baseImage.height = 0
  baseImage.size = 0
  currentImage.src = ''
  currentImage.size = 0
  canvasWidth.value = 0
  canvasHeight.value = 0
}

const restoreOriginal = async () => {
  if (!baseImage.src) {
    uni.showToast({ title: '请先上传图片', icon: 'none' })
    return
  }
  if (!currentImage.src) {
    uni.showToast({ title: '当前已是原图', icon: 'none' })
    return
  }
  if (!cipherSettings.seed) {
    uni.showToast({ title: '请填写密钥', icon: 'none' })
    return
  }
  isProcessing.value = true
  try {
    let rounds = 0
    let previousUri = ''
    while (rounds < MAX_DECRYPT_ROUNDS) {
      previousUri = currentImage.src
      await runSimpleCipher('decrypt')
      rounds += 1
      if (currentImage.src === previousUri) {
        break
      }
    }
    if (currentImage.src === baseImage.previewSrc) {
      currentImage.size = baseImage.size
      uni.showToast({ title: '已还原到原图', icon: 'success' })
    } else {
      uni.showToast({ title: `已尝试 ${rounds} 次还原`, icon: 'none' })
    }
  } catch (err) {
    console.error(err)
    uni.showToast({ title: '还原失败，请重试', icon: 'none' })
  } finally {
    isProcessing.value = false
  }
}

const isTempFileUri = (uri: string) => {
  if (!uri) return true
  return (
    uri.startsWith('wxfile://') ||
    uri.startsWith('file://') ||
    uri.startsWith('/') ||
    /^https?:\/\/tmp\//i.test(uri)
  )
}

const resolveSourceType = (uri: string): 'tempFile' | 'base64' | 'remote' => {
  if (!uri) return 'tempFile'
  if (uri.startsWith('data:')) return 'base64'
  if (isTempFileUri(uri)) return 'tempFile'
  if (/^https?:\/\//i.test(uri)) return 'remote'
  return 'tempFile'
}

const updateCurrentImageSize = (uri: string) => {
  if (uri.startsWith('data:')) {
    const base64 = uri.split(',')[1] || ''
    const size = Math.round((base64.length * 3) / 4)
    currentImage.size = size
    return
  }
  uni.getFileInfo({
    filePath: uri,
    success: (info) => {
      currentImage.size = info.size
    },
    fail: () => {
      currentImage.size = 0
    }
  })
}

const handleCipher = async (mode: 'encrypt' | 'decrypt') => {
  if (!baseImage.src || !currentImage.src) {
    uni.showToast({ title: '请先上传图片', icon: 'none' })
    return
  }
  if (!cipherSettings.seed) {
    uni.showToast({ title: '请填写密钥', icon: 'none' })
    return
  }
  isProcessing.value = true
  try {
    await runSimpleCipher(mode)
    uni.showToast({ title: mode === 'encrypt' ? '混淆成功' : '还原完成', icon: 'success' })
  } catch (err) {
    console.error(err)
    uni.showToast({ title: '处理失败，请重试', icon: 'none' })
  } finally {
    isProcessing.value = false
  }
}

const runSimpleCipher = async (mode: 'encrypt' | 'decrypt') => {
  const sourceType = resolveSourceType(currentImage.src)
  const result = await simpleScrambler[mode === 'encrypt' ? 'encrypt' : 'decrypt']({
    source: { uri: currentImage.src, type: sourceType },
    seed: cipherSettings.seed,
    grid: cipherSettings.grid,
    platform: platformType.value,
    adapterOptions: { canvasId }
  })
  currentImage.src = result.uri
  updateCurrentImageSize(result.uri)
  return result.uri
}


const saveResult = () => {
  if (!currentImage.src) return
  if (currentImage.src.startsWith('data:')) {
    // #ifdef H5
    const link = document.createElement('a')
    link.href = currentImage.src
    link.download = `cipher-image.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // #endif
    return
  }

  // #ifdef MP-WEIXIN
  uni.saveImageToPhotosAlbum({
    filePath: currentImage.src,
    success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
    fail: () => uni.showToast({ title: '保存失败，请检查权限', icon: 'none' })
  })
  // #endif
  // #ifdef H5
  const link = document.createElement('a')
  link.href = currentImage.src
  link.download = 'cipher-image.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // #endif
}

const copyDataUrl = () => {
  if (!currentImage.src.startsWith('data:')) {
    uni.showToast({ title: '当前图片无 DataURL', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: currentImage.src,
    success: () => uni.showToast({ title: 'DataURL 已复制', icon: 'success' })
  })
}

const handleShare = () => {
  if (!isH5.value) {
    uni.showToast({ title: '请点击右上角分享', icon: 'none' })
    return
  }
  const shareUrl = `${window.location.origin}${SHARE_PATH}`
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => uni.showToast({ title: '链接已复制', icon: 'success' }))
      .catch(() => uni.showModal({ title: '分享链接', content: shareUrl, showCancel: false }))
  } else {
    uni.showModal({ title: '分享链接', content: shareUrl, showCancel: false })
  }
}

onShow(() => {
  reportToolVisit('image-cipher')
})

// #ifdef MP-WEIXIN
onShareAppMessage(() => ({
  title: SHARE_TITLE,
  path: SHARE_PATH
}))

onShareTimeline(() => ({
  title: SHARE_TITLE,
  query: ''
}))
// #endif
</script>

<style scoped lang="scss">
.cipher-page {
  min-height: 100vh;
  background: #fff7ec;
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
  box-shadow: 0 12rpx 30rpx rgba(253, 160, 133, 0.18);
}

.upload-area {
  border: 2rpx dashed #ffd6a5;
  border-radius: 24rpx;
  padding: 120rpx 32rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  color: #8d6e63;
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
  color: #a1887f;
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
  color: #a1887f;
}

.preview-image,
.result-image {
  width: 100%;
  border-radius: 20rpx;
  border: 1rpx solid #ffe0b2;
}

.preview-wrapper {
  position: relative;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  border-radius: 20rpx;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12rpx;
}

.loader-circle {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

.loader-text {
  color: #fff;
  font-size: 26rpx;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.preview-footer {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.preview-actions {
  display: flex;
  gap: 16rpx;
}

.share-entry {
  padding: 12rpx 0 0;
  text-align: center;
}

.share-tip {
  font-size: 24rpx;
  color: #a1887f;
}

.share-btn {
  width: 100%;
  margin-top: 12rpx;
  border: 1rpx dashed #f6d365;
  border-radius: 20rpx;
  height: 88rpx;
  background: #fff7e0;
  color: #f57f17;
  font-size: 28rpx;
}

.control-card {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.mode-switch {
  display: flex;
  gap: 16rpx;
  background: #fff8ec;
  border-radius: 20rpx;
  padding: 8rpx;
}

.mode-chip {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #fb8c00;
}

.mode-chip.active {
  background: linear-gradient(135deg, #f6d365, #fda085);
  color: #fff;
  font-weight: 600;
}

.mode-hint {
  font-size: 24rpx;
  color: #8d6e63;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.control-label {
  font-size: 28rpx;
  font-weight: 600;
}

.control-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

@media (min-width: 768px) {
  .control-grid {
    flex-direction: row;
    gap: 24rpx;
  }
  .control-group {
    flex: 1;
  }
}

.text-input {
  border: 1rpx solid #ffd6a5;
  border-radius: 16rpx;
  padding: 18rpx;
  font-size: 28rpx;
}

.hint {
  font-size: 24rpx;
  color: #a1887f;
}

.btn-row {
  display: flex;
  gap: 16rpx;
}

.primary-btn,
.ghost-btn {
  height: 96rpx;
  border-radius: 22rpx;
  border: none;
  font-size: 30rpx;
}

.primary-btn {
  flex: 1;
  background: linear-gradient(135deg, #f6d365, #fda085);
  color: #fff;
}

.ghost-btn {
  flex: 1;
  background: #fff3e0;
  color: #fb8c00;
}

.ghost-btn.full {
  width: 100%;
  margin-top: 12rpx;
}

.history-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #fff7e6;
}

.history-index {
  width: 64rpx;
  text-align: center;
  font-weight: 600;
  color: #fb8c00;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.history-type {
  font-size: 26rpx;
  font-weight: 600;
}

.history-desc {
  font-size: 24rpx;
  color: #a1887f;
}

.history-time {
  font-size: 24rpx;
  color: #a1887f;
}

.text-btn {
  background: none;
  border: none;
  color: #fb8c00;
  font-size: 26rpx;
}

.hidden-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
