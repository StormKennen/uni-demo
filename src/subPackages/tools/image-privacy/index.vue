<template>
  <PageLayout title="图片隐私清理" nav-gradient="linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)">
    <view class="privacy-page">
      <view class="content">
        <view class="card">
          <view v-if="!imageInfo.path" class="upload-area" @click="selectImage">
            <uni-icons type="image" size="52" color="var(--theme-text-tertiary)" />
            <text class="upload-title">{{ isChecking ? '图片安全校验中...' : '选择要处理的图片' }}</text>
            <text class="upload-desc">重新生成图片会移除定位、拍摄设备等原图元信息</text>
          </view>

          <view v-else class="preview-block">
            <view class="preview-head">
              <view>
                <text class="preview-title">原图</text>
                <text class="preview-meta">{{ imageInfo.width }} × {{ imageInfo.height }}</text>
              </view>
              <button class="ghost-btn" @click="reset">重新选择</button>
            </view>
            <image class="preview-image" :src="imageInfo.path" mode="widthFix" />
          </view>
        </view>

        <view v-if="imageInfo.path" class="card">
          <text class="section-title">清理方式</text>
          <view class="option-list">
            <view
              v-for="option in maskOptions"
              :key="option.value"
              class="option-item"
              :class="{ active: selectedMasks.includes(option.value) }"
              @click="toggleMask(option.value)">
              <text class="option-title">{{ option.label }}</text>
              <text class="option-desc">{{ option.desc }}</text>
            </view>
          </view>
          <text class="safe-note">提示：系统会重新绘制图片。遮挡区域适合处理头像、昵称、手机号、二维码等敏感信息。</text>
          <button class="primary-btn" :loading="isGenerating" :disabled="isGenerating || isChecking" @click="generateCleanImage">
            {{ isGenerating ? '处理中...' : '生成清理后的图片' }}
          </button>
        </view>

        <view v-if="resultImage" class="card result-card">
          <view class="preview-head">
            <view>
              <text class="preview-title">处理结果</text>
              <text class="preview-meta">已重新生成，原图元信息不会带入</text>
            </view>
          </view>
          <image class="preview-image" :src="resultImage" mode="widthFix" show-menu-by-longpress />
          <view class="result-actions">
            <button class="ghost-btn" @click="saveResult">保存到相册</button>
            <button class="ghost-btn" @click="copyResultPath">复制临时地址</button>
          </view>
        </view>
      </view>

      <canvas
        canvas-id="privacyCanvas"
        id="privacyCanvas"
        class="hidden-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        :width="canvasWidth"
        :height="canvasHeight"></canvas>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { getCurrentInstance, reactive, ref } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import { checkMediaSecurity } from '@/services/security'
  import { reportToolVisit } from '@/utils/tracker'

  type MaskArea = 'top' | 'bottom' | 'center' | 'corners'

  interface ImageInfo {
    height: number
    path: string
    width: number
  }

  interface MaskOption {
    desc: string
    label: string
    value: MaskArea
  }

  const instance = getCurrentInstance()
  const proxy = instance?.proxy
  const imageInfo = reactive<ImageInfo>({ path: '', width: 0, height: 0 })
  const resultImage = ref('')
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)
  const isGenerating = ref(false)
  const isChecking = ref(false)
  const selectedMasks = ref<MaskArea[]>([])

  const maskOptions: MaskOption[] = [
    { value: 'top', label: '遮挡顶部', desc: '适合隐藏状态栏、昵称、标题' },
    { value: 'bottom', label: '遮挡底部', desc: '适合隐藏水印、定位、操作栏' },
    { value: 'center', label: '遮挡中心', desc: '适合隐藏头像、二维码、手机号' },
    { value: 'corners', label: '遮挡四角', desc: '适合隐藏角标和截图来源' },
  ]

  onShow(() => {
    reportToolVisit('image-privacy')
  })

  function reset() {
    imageInfo.path = ''
    imageInfo.width = 0
    imageInfo.height = 0
    resultImage.value = ''
    selectedMasks.value = []
  }

  function toggleMask(value: MaskArea) {
    selectedMasks.value = selectedMasks.value.includes(value)
      ? selectedMasks.value.filter(item => item !== value)
      : [...selectedMasks.value, value]
  }

  function selectImage() {
    if (isChecking.value) return
    uni.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: async res => {
        const path = res.tempFilePaths?.[0] || ''
        if (!path) return
        const passed = await validateImage(path)
        if (!passed) return
        uni.getImageInfo({
          src: path,
          success: info => {
            imageInfo.path = path
            imageInfo.width = info.width
            imageInfo.height = info.height
            resultImage.value = ''
            fitCanvas(info.width, info.height)
          },
          fail: () => uni.showToast({ title: '读取图片失败', icon: 'none' }),
        })
      },
      fail: err => {
        if (String(err.errMsg || '').includes('cancel')) return
        uni.showToast({ title: '选择图片失败', icon: 'none' })
      },
    })
  }

  async function validateImage(path: string): Promise<boolean> {
    // #ifndef MP-WEIXIN
    return true
    // #endif

    // #ifdef MP-WEIXIN
    isChecking.value = true
    try {
      const result = await checkMediaSecurity(path, 'image_privacy')
      if (!result.safe || result.suggestion !== 'pass') {
        uni.showToast({ title: '所发布内容含违规信息', icon: 'none' })
        return false
      }
      return true
    } catch {
      uni.showToast({ title: '所发布内容含违规信息', icon: 'none' })
      return false
    } finally {
      isChecking.value = false
    }
    // #endif
  }

  function fitCanvas(width: number, height: number) {
    const maxWidth = 1200
    const ratio = Math.min(1, maxWidth / Math.max(width, 1))
    canvasWidth.value = Math.max(1, Math.round(width * ratio))
    canvasHeight.value = Math.max(1, Math.round(height * ratio))
  }

  function drawMask(ctx: UniApp.CanvasContext, x: number, y: number, width: number, height: number) {
    ctx.setFillStyle('rgba(15, 23, 42, 0.82)')
    ctx.fillRect(x, y, width, height)
    ctx.setFillStyle('rgba(255, 255, 255, 0.18)')
    const step = 18
    for (let offset = -height; offset < width; offset += step) {
      ctx.fillRect(x + offset, y, 10, height * 2)
    }
  }

  function drawSelectedMasks(ctx: UniApp.CanvasContext) {
    const width = canvasWidth.value
    const height = canvasHeight.value
    const band = Math.max(56, Math.round(height * 0.12))
    const centerW = Math.round(width * 0.48)
    const centerH = Math.round(height * 0.22)

    if (selectedMasks.value.includes('top')) drawMask(ctx, 0, 0, width, band)
    if (selectedMasks.value.includes('bottom')) drawMask(ctx, 0, height - band, width, band)
    if (selectedMasks.value.includes('center'))
      drawMask(ctx, Math.round((width - centerW) / 2), Math.round((height - centerH) / 2), centerW, centerH)
    if (selectedMasks.value.includes('corners')) {
      const size = Math.round(Math.min(width, height) * 0.18)
      drawMask(ctx, 0, 0, size, size)
      drawMask(ctx, width - size, 0, size, size)
      drawMask(ctx, 0, height - size, size, size)
      drawMask(ctx, width - size, height - size, size, size)
    }
  }

  function generateCleanImage() {
    if (!imageInfo.path) return
    isGenerating.value = true
    const ctx = uni.createCanvasContext('privacyCanvas', proxy)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
    ctx.drawImage(imageInfo.path, 0, 0, canvasWidth.value, canvasHeight.value)
    drawSelectedMasks(ctx)
    ctx.draw(false, () => {
      uni.canvasToTempFilePath(
        {
          canvasId: 'privacyCanvas',
          width: canvasWidth.value,
          height: canvasHeight.value,
          destWidth: canvasWidth.value,
          destHeight: canvasHeight.value,
          fileType: 'jpg',
          quality: 0.92,
          success: res => {
            resultImage.value = res.tempFilePath
            uni.showToast({ title: '处理完成', icon: 'success' })
          },
          fail: () => uni.showToast({ title: '生成失败', icon: 'none' }),
          complete: () => {
            isGenerating.value = false
          },
        },
        proxy,
      )
    })
  }

  function saveResult() {
    if (!resultImage.value) return
    // #ifdef MP-WEIXIN
    uni.saveImageToPhotosAlbum({
      filePath: resultImage.value,
      success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: () => uni.showToast({ title: '保存失败，请检查权限', icon: 'none' }),
    })
    // #endif
    // #ifdef H5
    const link = document.createElement('a')
    link.href = resultImage.value
    link.download = 'privacy-clean-image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // #endif
  }

  function copyResultPath() {
    if (!resultImage.value) return
    uni.setClipboardData({
      data: resultImage.value,
      success: () => uni.showToast({ title: '已复制', icon: 'success' }),
    })
  }
</script>

<style scoped lang="scss">
  .privacy-page {
    min-height: 100vh;
    background: var(--theme-bg);
  }

  .content {
    padding: calc(32rpx + var(--nav-height, 120rpx)) 32rpx 40rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .card {
    padding: 28rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 28rpx;
    background: var(--theme-surface);
    box-shadow: 0 12rpx 30rpx var(--theme-shadow-xs);
  }

  .upload-area {
    min-height: 360rpx;
    border: 2rpx dashed var(--theme-border);
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14rpx;
    text-align: center;
    background: var(--theme-surface-2);
  }

  .upload-title,
  .preview-title,
  .section-title {
    font-size: 32rpx;
    font-weight: 700;
    color: var(--theme-text);
  }

  .upload-desc,
  .preview-meta,
  .safe-note {
    font-size: 24rpx;
    line-height: 1.5;
    color: var(--theme-text-secondary);
  }

  .preview-block,
  .result-card {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  .preview-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .preview-head > view {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .preview-image {
    width: 100%;
    border-radius: 22rpx;
    background: var(--theme-surface-2);
  }

  .ghost-btn {
    height: 70rpx;
    padding: 0 26rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 26rpx;
  }

  .option-list {
    margin-top: 22rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
  }

  .option-item {
    padding: 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface-2);
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .option-item.active {
    border-color: rgba(14, 165, 233, 0.48);
    background: rgba(14, 165, 233, 0.1);
  }

  .option-title {
    font-size: 28rpx;
    font-weight: 700;
    color: var(--theme-text);
  }

  .option-desc {
    font-size: 23rpx;
    line-height: 1.45;
    color: var(--theme-text-secondary);
  }

  .safe-note {
    display: block;
    margin-top: 22rpx;
  }

  .primary-btn {
    margin-top: 24rpx;
    height: 92rpx;
    border: none;
    border-radius: 24rpx;
    background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 700;
  }

  .result-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
  }

  .hidden-canvas {
    position: fixed;
    left: -9999px;
    top: -9999px;
    pointer-events: none;
  }
</style>
