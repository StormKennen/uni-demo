<template>
  <view class="qr-generator-panel" :class="[`mode--${props.mode}`, { 'is-sheet': props.mode === 'sheet' }]">
    <ToolSectionCard v-if="props.editable" title="输入内容">
      <textarea
        v-model="inputContent"
        class="input-textarea"
        placeholder="请输入要生成二维码的文本内容或链接地址..."
        :maxlength="500"
        auto-height />
      <view class="input-footer">
        <text class="paste-btn" @click="readClipboard">粘贴</text>
        <text class="input-counter">{{ inputContent.length }}/500</text>
      </view>
    </ToolSectionCard>

    <ToolSectionCard v-else title="当前内容" subtitle="当前弹层会直接基于这条内容生成二维码">
      <view class="fixed-content">
        <text class="fixed-content__text" selectable>{{ activeContent || '暂无内容' }}</text>
      </view>
    </ToolSectionCard>

    <button class="generate-btn" :class="{ loading: isGenerating }" :disabled="!activeContent || isGenerating" @click="generateQRCode">
      {{ isGenerating ? '生成中...' : qrGenerated ? '重新生成二维码' : '生成二维码' }}
    </button>

    <ToolSectionCard v-show="qrGenerated || isGenerating" title="生成结果">
      <view class="scale-control">
        <text class="scale-label">显示比例</text>
        <slider min="70" max="100" step="1" :value="Math.round(displayScale * 100)" @change="onScaleChanged" activeColor="#667eea" />
      </view>
      <view ref="canvasHostRef" class="qr-container">
        <canvas
          :id="canvasId"
          :canvas-id="canvasId"
          :width="canvasPixelSize"
          :height="canvasPixelSize"
          :style="{ width: canvasDisplaySize + 'px', height: canvasDisplaySize + 'px' }"
          class="qr-canvas" />
      </view>

      <ToolActionRow class="result-actions">
        <button class="action-btn download-btn" @click="downloadQRCode">保存二维码</button>
        <button class="action-btn secondary-btn" @click="copyContent">复制内容</button>
        <button class="action-btn shuffle-btn" @click="emitShuffleImage">图片打乱</button>
      </ToolActionRow>

      <view class="qr-info">
        <view class="info-item">
          <text class="info-label">内容长度</text>
          <text class="info-value">{{ activeContent.length }} 字符</text>
        </view>
      </view>
    </ToolSectionCard>
  </view>
</template>

<script setup lang="ts">
  import UQRCode from 'uqrcodejs'
  import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import ToolActionRow from '@/components/toolkit/base/tool-action-row.vue'
  import ToolSectionCard from '@/components/toolkit/base/tool-section-card.vue'
  import type { ToolImagePayload } from '@/components/toolkit/types'

  type PanelMode = 'page' | 'sheet'

  const props = withDefaults(
    defineProps<{
      mode?: PanelMode
      initialContent?: string
      editable?: boolean
      autoGenerate?: boolean
    }>(),
    {
      mode: 'page',
      initialContent: '',
      editable: true,
      autoGenerate: false,
    },
  )

  const emit = defineEmits<{
    (e: 'shuffle-image', payload: ToolImagePayload): void
  }>()

  const instance = getCurrentInstance()
  const canvasId = `tool-qrcode-${instance?.uid || Date.now()}`
  const canvasHostRef = ref<HTMLElement | null>(null)

  const inputContent = ref(props.initialContent)
  const isGenerating = ref(false)
  const qrGenerated = ref(false)
  const canvasDisplaySize = ref(300)
  const canvasPixelSize = ref(300)
  const displayScale = ref(0.95)

  const activeContent = computed(() => (props.editable ? inputContent.value.trim() : props.initialContent.trim()))

  watch(
    () => props.initialContent,
    value => {
      if (props.editable) {
        inputContent.value = value
      }
    },
  )

  const updateCanvasDisplaySize = () => {
    const sys = uni.getSystemInfoSync()
    const vw = sys.windowWidth || sys.screenWidth || 375
    const vh = sys.windowHeight || sys.screenHeight || 667
    const pr = sys.pixelRatio || 2
    const rpxUnit = vw / 750
    const horizontalPaddingPx = Math.floor(rpxUnit * (20 * 2 + 30 * 2))
    const safeInset = Math.max(12, horizontalPaddingPx)
    const base = Math.floor(Math.min(vw - safeInset, vh - safeInset))
    const display = Math.floor(base * displayScale.value)
    const pixel = Math.min(Math.floor(display * pr), 1024)
    canvasDisplaySize.value = Math.max(220, display)
    canvasPixelSize.value = Math.max(220, pixel)
  }

  const resolveH5Canvas = () => {
    const host = canvasHostRef.value
    const candidates = [host?.querySelector?.('canvas'), document.getElementById(canvasId)]
    for (const el of candidates) {
      if (el && typeof (el as HTMLCanvasElement).getContext === 'function') {
        return el as HTMLCanvasElement
      }
    }
    return null
  }

  const normalizeContent = (raw: string) => {
    let content = raw.trim()
    const domainPattern = /^[\w-]+(\.[\w-]+)+\.?$/

    if (domainPattern.test(content) && !content.startsWith('http')) {
      if (content.startsWith('www.')) {
        content = 'https://' + content
      } else if (!content.includes('.') && content.length > 3) {
        if (content.toLowerCase().includes('baidu')) {
          content = 'https://www.baidu.com'
        } else if (content.toLowerCase().includes('google')) {
          content = 'https://www.google.com'
        } else {
          content = 'https://www.' + content + '.com'
        }
      } else {
        content = 'https://' + content
      }

      if (props.editable) {
        inputContent.value = content
      }

      uni.showToast({
        title: '已自动补全URL格式',
        icon: 'none',
        duration: 1500,
      })
    }

    return content
  }

  const drawQrModulesForH5 = (ctx: CanvasRenderingContext2D, qr: UQRCode, drawSize: number) => {
    const modules = qr.modules
    const moduleCount = modules && modules.length ? modules.length : qr.moduleCount
    const cell = Math.floor(drawSize / moduleCount)
    const offset = Math.floor((drawSize - cell * moduleCount) / 2)
    ctx.clearRect(0, 0, drawSize, drawSize)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, drawSize, drawSize)
    ctx.fillStyle = '#000000'
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col]) {
          ctx.fillRect(offset + col * cell, offset + row * cell, cell, cell)
        }
      }
    }
  }

  const generateQRCode = async () => {
    if (!activeContent.value) {
      uni.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    isGenerating.value = true
    const content = normalizeContent(activeContent.value)
    await nextTick()
    updateCanvasDisplaySize()

    try {
      let ctx: CanvasRenderingContext2D | ReturnType<typeof uni.createCanvasContext>

      // #ifdef H5
      let canvas = resolveH5Canvas()
      if (!canvas) {
        await nextTick()
        canvas = resolveH5Canvas()
      }
      if (!canvas) {
        throw new Error('Canvas元素未找到')
      }
      const h5Context = canvas.getContext('2d')
      if (!h5Context) {
        throw new Error('Canvas上下文不可用')
      }
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(canvasDisplaySize.value * dpr)
      canvas.height = Math.floor(canvasDisplaySize.value * dpr)
      if (h5Context.setTransform) {
        h5Context.setTransform(dpr, 0, 0, dpr, 0, 0)
      } else {
        h5Context.scale(dpr, dpr)
      }
      ctx = h5Context
      // #endif

      // #ifndef H5
      ctx = uni.createCanvasContext(canvasId, instance?.proxy)
      // #endif

      ctx.clearRect(0, 0, canvasDisplaySize.value, canvasDisplaySize.value)

      const qr = new UQRCode()
      qr.data = content
      qr.size = canvasDisplaySize.value
      qr.margin = 10
      qr.areaColor = '#FFFFFF'
      qr.backgroundColor = '#FFFFFF'
      qr.foregroundColor = '#000000'
      qr.errorCorrectLevel = UQRCode.errorCorrectLevel.M
      qr.useDynamicSize = true
      qr.make()

      const drawSize = qr.useDynamicSize && qr.dynamicSize ? qr.dynamicSize : qr.size

      // #ifdef H5
      const h5Canvas = resolveH5Canvas()
      if (!h5Canvas) {
        throw new Error('Canvas元素未找到')
      }
      const finalH5Context = h5Canvas.getContext('2d')
      if (!finalH5Context) {
        throw new Error('Canvas上下文不可用')
      }
      const dpr2 = window.devicePixelRatio || 1
      h5Canvas.width = Math.floor(drawSize * dpr2)
      h5Canvas.height = Math.floor(drawSize * dpr2)
      if (finalH5Context.setTransform) {
        finalH5Context.setTransform(dpr2, 0, 0, dpr2, 0, 0)
      } else {
        finalH5Context.scale(dpr2, dpr2)
      }
      finalH5Context.imageSmoothingEnabled = false
      qr.canvasContext = finalH5Context

      try {
        await Promise.resolve(qr.drawCanvas())
      } catch (error) {
        console.warn('二维码库绘制失败，回退手绘模式:', error)
        drawQrModulesForH5(finalH5Context, qr, drawSize)
      }
      // #endif

      // #ifndef H5
      qr.canvasContext = ctx as ReturnType<typeof uni.createCanvasContext>
      await Promise.resolve(qr.drawCanvas())
      // #endif

      qrGenerated.value = true
      uni.showToast({ title: '二维码生成成功', icon: 'success' })
    } catch (error) {
      console.error('生成二维码失败:', error)
      uni.showToast({ title: '生成失败，请重试', icon: 'none' })
    } finally {
      isGenerating.value = false
    }
  }

  const onScaleChanged = (event: { detail: { value: number } }) => {
    displayScale.value = event.detail.value / 100
    updateCanvasDisplaySize()
    if (qrGenerated.value) {
      generateQRCode()
    }
  }

  const exportGeneratedImage = async (): Promise<ToolImagePayload | null> => {
    if (!qrGenerated.value) {
      uni.showToast({ title: '请先生成二维码', icon: 'none' })
      return null
    }

    // #ifdef H5
    const canvas = resolveH5Canvas()
    if (!canvas) {
      uni.showToast({ title: '图片导出失败', icon: 'none' })
      return null
    }
    const dataUrl = canvas.toDataURL('image/png')
    const base64 = dataUrl.split(',')[1] || ''
    return {
      uri: dataUrl,
      width: canvasDisplaySize.value,
      height: canvasDisplaySize.value,
      size: Math.round((base64.length * 3) / 4),
    }
    // #endif

    // #ifndef H5
    return await new Promise(resolve => {
      uni.canvasToTempFilePath(
        {
          canvasId,
          success: res => {
            resolve({
              uri: res.tempFilePath,
              width: canvasDisplaySize.value,
              height: canvasDisplaySize.value,
            })
          },
          fail: error => {
            console.error('导出二维码失败:', error)
            uni.showToast({ title: '图片导出失败', icon: 'none' })
            resolve(null)
          },
        },
        instance?.proxy,
      )
    })
    // #endif
  }

  const downloadQRCode = async () => {
    const image = await exportGeneratedImage()
    if (!image) return

    if (image.uri.startsWith('data:')) {
      // #ifdef H5
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = image.uri
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      uni.showToast({ title: '下载成功', icon: 'success' })
      // #endif
      return
    }

    uni.saveImageToPhotosAlbum({
      filePath: image.uri,
      success: () => uni.showToast({ title: '保存成功', icon: 'success' }),
      fail: error => {
        console.error('保存失败:', error)
        uni.showToast({ title: '保存失败', icon: 'none' })
      },
    })
  }

  const copyContent = () => {
    if (!activeContent.value) {
      uni.showToast({ title: '暂无可复制内容', icon: 'none' })
      return
    }
    uni.setClipboardData({
      data: activeContent.value,
      success: () => uni.showToast({ title: '内容已复制', icon: 'success' }),
    })
  }

  const emitShuffleImage = async () => {
    const image = await exportGeneratedImage()
    if (!image) return
    emit('shuffle-image', image)
  }

  const readClipboard = () => {
    uni.getClipboardData({
      success: res => {
        const text = res.data?.trim?.() || ''
        if (!text) {
          uni.showToast({ title: '剪贴板为空', icon: 'none' })
          return
        }
        inputContent.value = text
        uni.showToast({ title: '已粘贴', icon: 'success' })
      },
      fail: () => {
        uni.showToast({ title: '读取剪贴板失败', icon: 'none' })
      },
    })
  }

  onMounted(async () => {
    updateCanvasDisplaySize()
    if (props.autoGenerate && activeContent.value) {
      await nextTick()
      generateQRCode()
    }

    // #ifdef H5
    window.addEventListener('resize', updateCanvasDisplaySize)
    // #endif
  })

  onUnmounted(() => {
    // #ifdef H5
    window.removeEventListener('resize', updateCanvasDisplaySize)
    // #endif
  })
</script>

<style scoped lang="scss">
  .qr-generator-panel {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .qr-generator-panel.is-sheet {
    padding-bottom: 8rpx;
  }

  .input-textarea {
    width: 100%;
    min-height: 220rpx;
    padding: 24rpx;
    border: 2rpx solid var(--theme-border);
    border-radius: 16rpx;
    font-size: 28rpx;
    line-height: 1.5;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    box-sizing: border-box;
  }

  .input-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12rpx;
  }

  .paste-btn {
    padding: 6rpx 20rpx;
    border-radius: 999rpx;
    background: linear-gradient(135deg, #eef2ff 0%, #f0e6ff 100%);
    color: #667eea;
    font-size: 24rpx;
    font-weight: 600;
  }

  .input-counter {
    font-size: 24rpx;
    color: var(--theme-text-tertiary);
  }

  .fixed-content {
    padding: 24rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .fixed-content__text {
    font-size: 26rpx;
    line-height: 1.6;
    color: var(--theme-text);
    word-break: break-all;
  }

  .generate-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 600;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  }

  .generate-btn.loading,
  .generate-btn:disabled {
    background: #9ca3af;
    box-shadow: none;
  }

  .scale-control {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 20rpx;
  }

  .scale-label {
    font-size: 26rpx;
    color: var(--theme-text-secondary);
    flex-shrink: 0;
  }

  .qr-container {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 24rpx;
    overflow: visible;
  }

  .qr-canvas {
    max-width: 100%;
    height: auto;
    display: block;
    background: #fff;
    box-sizing: content-box;
    border-radius: 18rpx;
  }

  .result-actions {
    margin-bottom: 24rpx;
  }

  .action-btn {
    flex: 1;
    min-width: 180rpx;
    height: 80rpx;
    border: none;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .download-btn {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: #fff;
  }

  .secondary-btn {
    background: rgba(102, 126, 234, 0.12);
    color: #5266d4;
  }

  .shuffle-btn {
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    color: #fff;
  }

  .qr-info {
    border-top: 1rpx solid var(--theme-border);
    padding-top: 24rpx;
  }

  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .info-label {
    font-size: 26rpx;
    color: var(--theme-text-secondary);
  }

  .info-value {
    font-size: 26rpx;
    color: var(--theme-text);
    font-weight: 600;
  }
</style>
