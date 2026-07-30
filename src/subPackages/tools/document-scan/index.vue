<template>
  <PageLayout title="文档扫描" nav-gradient="linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)">
    <view class="scan-page">
      <view class="content">
        <view class="card hero-card">
          <view class="hero-copy">
            <text class="hero-title">手机资料整理成一张长图</text>
            <text class="hero-desc">适合证件、票据、作业、纸质资料。当前提供稳定的长图导出，便于保存和分享。</text>
          </view>
          <button class="primary-btn" :disabled="isGenerating || isChecking" @click="choosePages">
            {{ pages.length ? '重新选择页面' : isChecking ? '安全校验中...' : '拍照或从相册选择' }}
          </button>
        </view>

        <view v-if="pages.length" class="card">
          <view class="section-head">
            <view>
              <text class="section-title">已选择 {{ pages.length }} 页</text>
              <text class="section-desc">最多 6 页，按选择顺序生成</text>
            </view>
            <button class="ghost-btn" @click="clearPages">清空</button>
          </view>

          <scroll-view scroll-x class="page-strip">
            <view class="page-strip-inner">
              <view v-for="(page, index) in pages" :key="page.path" class="page-thumb">
                <image class="page-image" :src="page.path" mode="aspectFill" />
                <text class="page-index">{{ index + 1 }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view v-if="pages.length" class="card">
          <text class="section-title">整理模式</text>
          <view class="mode-grid">
            <view
              v-for="mode in modeOptions"
              :key="mode.value"
              class="mode-item"
              :class="{ active: scanMode === mode.value }"
              @click="scanMode = mode.value">
              <text class="mode-title">{{ mode.label }}</text>
              <text class="mode-desc">{{ mode.desc }}</text>
            </view>
          </view>
          <button class="primary-btn" :loading="isGenerating" :disabled="isGenerating || isChecking" @click="generateDocumentImage">
            {{ isGenerating ? '生成中...' : '生成文档长图' }}
          </button>
        </view>

        <view v-if="resultImage" class="card result-card">
          <view class="section-head">
            <view>
              <text class="section-title">生成结果</text>
              <text class="section-desc">{{ resultMeta }}</text>
            </view>
          </view>
          <image class="result-image" :src="resultImage" mode="widthFix" show-menu-by-longpress />
          <view class="result-actions">
            <button class="ghost-btn" @click="saveResult">保存长图</button>
            <button class="ghost-btn" @click="copyResultPath">复制临时地址</button>
          </view>
        </view>
      </view>

      <canvas
        canvas-id="documentScanCanvas"
        id="documentScanCanvas"
        class="hidden-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        :width="canvasWidth"
        :height="canvasHeight"></canvas>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, ref } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import { checkMediaSecurity } from '@/services/security'
  import { reportToolVisit } from '@/utils/tracker'

  type ScanMode = 'original' | 'clean' | 'compact'

  interface ScanPage {
    height: number
    path: string
    width: number
  }

  interface ModeOption {
    desc: string
    label: string
    value: ScanMode
  }

  const instance = getCurrentInstance()
  const proxy = instance?.proxy
  const pages = ref<ScanPage[]>([])
  const scanMode = ref<ScanMode>('clean')
  const resultImage = ref('')
  const resultMeta = ref('')
  const canvasWidth = ref(1)
  const canvasHeight = ref(1)
  const isGenerating = ref(false)
  const isChecking = ref(false)

  const modeOptions: ModeOption[] = [
    { value: 'clean', label: '清爽文档', desc: '白底留边，适合资料归档' },
    { value: 'compact', label: '紧凑拼接', desc: '减少页间距，适合快速分享' },
    { value: 'original', label: '保留原图', desc: '不加页面底板，尽量保留原貌' },
  ]

  const pageGap = computed(() => (scanMode.value === 'compact' ? 12 : 28))
  const pagePadding = computed(() => (scanMode.value === 'original' ? 0 : 28))

  onShow(() => {
    reportToolVisit('document-scan')
  })

  function clearPages() {
    pages.value = []
    resultImage.value = ''
    resultMeta.value = ''
  }

  function choosePages() {
    if (isGenerating.value || isChecking.value) return
    uni.chooseImage({
      count: 6,
      sizeType: ['original'],
      sourceType: ['camera', 'album'],
      success: async res => {
        const paths = res.tempFilePaths || []
        if (!paths.length) return
        const validPaths: string[] = []
        for (const path of paths) {
          const passed = await validateImage(path)
          if (passed) validPaths.push(path)
        }
        if (!validPaths.length) return
        const infos = await Promise.all(validPaths.map(path => readImageInfo(path)))
        pages.value = infos.filter((item): item is ScanPage => !!item)
        resultImage.value = ''
        resultMeta.value = ''
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
      const result = await checkMediaSecurity(path, 'document_scan')
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

  function readImageInfo(path: string): Promise<ScanPage | null> {
    return new Promise(resolve => {
      uni.getImageInfo({
        src: path,
        success: info => resolve({ path, width: info.width, height: info.height }),
        fail: () => resolve(null),
      })
    })
  }

  function calculateLayout() {
    const maxWidth = 1000
    const outerPadding = pagePadding.value
    const contentWidth = maxWidth - outerPadding * 2
    let totalHeight = outerPadding
    const layouts = pages.value.map(page => {
      const ratio = contentWidth / Math.max(page.width, 1)
      const width = Math.round(page.width * ratio)
      const height = Math.round(page.height * ratio)
      const x = outerPadding + Math.round((contentWidth - width) / 2)
      const y = totalHeight
      totalHeight += height + pageGap.value
      return { height, page, width, x, y }
    })
    totalHeight = Math.max(1, totalHeight - pageGap.value + outerPadding)
    canvasWidth.value = maxWidth
    canvasHeight.value = Math.min(totalHeight, 16000)
    return layouts
  }

  function generateDocumentImage() {
    if (!pages.value.length) return
    isGenerating.value = true
    const layouts = calculateLayout()
    const ctx = uni.createCanvasContext('documentScanCanvas', proxy)
    ctx.setFillStyle(scanMode.value === 'original' ? '#ffffff' : '#f8fafc')
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

    layouts.forEach(({ page, x, y, width, height }, index) => {
      if (y > canvasHeight.value) return
      if (scanMode.value !== 'original') {
        ctx.setFillStyle('#ffffff')
        ctx.fillRect(x - 12, y - 12, width + 24, height + 24)
        ctx.setStrokeStyle('rgba(148, 163, 184, 0.35)')
        ctx.strokeRect(x - 12, y - 12, width + 24, height + 24)
      }
      ctx.drawImage(page.path, x, y, width, height)
      if (scanMode.value === 'clean') {
        ctx.setFillStyle('rgba(255, 255, 255, 0.08)')
        ctx.fillRect(x, y, width, height)
      }
      ctx.setFillStyle('rgba(15, 23, 42, 0.62)')
      ctx.fillRect(x + 18, y + 18, 54, 38)
      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(22)
      ctx.fillText(String(index + 1), x + 38, y + 44)
    })

    ctx.draw(false, () => {
      uni.canvasToTempFilePath(
        {
          canvasId: 'documentScanCanvas',
          width: canvasWidth.value,
          height: canvasHeight.value,
          destWidth: canvasWidth.value,
          destHeight: canvasHeight.value,
          fileType: 'jpg',
          quality: 0.92,
          success: res => {
            resultImage.value = res.tempFilePath
            resultMeta.value = `${pages.value.length} 页 · ${canvasWidth.value} × ${canvasHeight.value}`
            uni.showToast({ title: '生成成功', icon: 'success' })
          },
          fail: () => uni.showToast({ title: '生成失败，请减少页数', icon: 'none' }),
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
    link.download = 'document-scan.jpg'
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
  .scan-page {
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

  .hero-card,
  .hero-copy,
  .result-card {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  .hero-title {
    font-size: 38rpx;
    font-weight: 800;
    color: var(--theme-text);
  }

  .hero-desc,
  .section-desc,
  .mode-desc {
    font-size: 24rpx;
    line-height: 1.55;
    color: var(--theme-text-secondary);
  }

  .primary-btn {
    height: 94rpx;
    border: none;
    border-radius: 24rpx;
    background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 700;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .section-head > view {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .section-title {
    font-size: 32rpx;
    font-weight: 750;
    color: var(--theme-text);
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

  .page-strip {
    margin-top: 22rpx;
    width: 100%;
    white-space: nowrap;
  }

  .page-strip-inner {
    display: flex;
    gap: 16rpx;
  }

  .page-thumb {
    position: relative;
    width: 132rpx;
    height: 176rpx;
    border-radius: 18rpx;
    overflow: hidden;
    background: var(--theme-surface-2);
    flex: 0 0 auto;
  }

  .page-image {
    width: 100%;
    height: 100%;
  }

  .page-index {
    position: absolute;
    left: 10rpx;
    top: 10rpx;
    min-width: 34rpx;
    height: 34rpx;
    border-radius: 999rpx;
    background: rgba(15, 23, 42, 0.66);
    color: #fff;
    font-size: 22rpx;
    line-height: 34rpx;
    text-align: center;
  }

  .mode-grid {
    margin: 22rpx 0 24rpx;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14rpx;
  }

  .mode-item {
    min-height: 138rpx;
    padding: 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    background: var(--theme-surface-2);
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .mode-item.active {
    border-color: rgba(99, 102, 241, 0.45);
    background: rgba(99, 102, 241, 0.1);
  }

  .mode-title {
    font-size: 26rpx;
    font-weight: 750;
    color: var(--theme-text);
  }

  .result-image {
    width: 100%;
    border-radius: 22rpx;
    background: var(--theme-surface-2);
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
