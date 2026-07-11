<template>
  <view class="image-shuffle-panel" :class="[`mode--${props.mode}`, { 'is-sheet': props.mode === 'sheet' }]">
    <ToolSectionCard title="图片打乱" subtitle="按密钥重新排序图片，需要时可再次重组回来">
      <view v-if="!baseImage.src" class="upload-area" @click="selectImage">
        <uni-icons type="image" size="56" color="#b0bec5" />
        <text class="upload-title">点击上传需要打乱的图片</text>
        <text class="upload-desc">支持 JPG / PNG / WebP，最大 20MB</text>
        <text class="upload-hint">所有处理均在本地完成，不会上传服务器</text>
      </view>

      <view v-else class="preview-area">
        <view class="preview-header">
          <view>
            <text class="preview-title">当前图片</text>
            <text class="preview-meta">{{ baseImage.width }} × {{ baseImage.height }} · {{ formatFileSize(currentImage.size || baseImage.size) }}</text>
          </view>
          <button class="ghost-btn" @click="resetOrSelect">{{ props.allowUpload ? '重新选择' : '清空图片' }}</button>
        </view>
        <view class="preview-wrapper">
          <image class="preview-image" :src="currentImage.src || baseImage.previewSrc" mode="widthFix" show-menu-by-longpress />
          <view v-if="isProcessing" class="preview-overlay">
            <view class="loader-circle"></view>
            <text class="loader-text">处理中...</text>
          </view>
        </view>
        <view class="preview-footer">
          <text class="result-meta">使用相同密钥即可重新拼回图片</text>
          <ToolActionRow>
            <button class="ghost-btn action-mini" @click="saveResult">保存/下载</button>
            <button class="ghost-btn action-mini" @click="copyDataUrl" :disabled="!currentImage.src.startsWith('data:')">复制 DataURL</button>
          </ToolActionRow>
        </view>
      </view>
    </ToolSectionCard>

    <view v-if="props.showShareEntry && props.mode === 'page'" class="share-entry">
      <text class="share-tip" v-if="!isH5">请点击右上角 · 分享「图片打乱」工具</text>
      <button v-else class="share-btn" @click="handleShare">复制分享链接</button>
    </view>

    <ToolSectionCard v-if="baseImage.src" title="打乱设置">
      <view class="control-group">
        <text class="control-label">密钥（任意字符）</text>
        <input v-model.trim="cipherSettings.seed" class="text-input" placeholder="例如：123" />
      </view>

      <ToolActionRow class="btn-row">
        <button class="primary-btn" :loading="isProcessing" loading-text="处理中..." :disabled="isProcessing" @click="() => handleCipher('encrypt')">
          打乱一次
        </button>
        <button class="ghost-btn" :loading="isProcessing" loading-text="处理中..." :disabled="isProcessing" @click="() => handleCipher('decrypt')">
          重组一次
        </button>
      </ToolActionRow>
      <button
        class="ghost-btn full"
        :loading="isProcessing"
        loading-text="处理中..."
        :disabled="isProcessing || !baseImage.src || currentImage.src === baseImage.previewSrc"
        @click="restoreOriginal">
        恢复原图
      </button>
    </ToolSectionCard>

    <canvas
      :canvas-id="canvasId"
      :id="canvasId"
      class="hidden-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      :width="canvasWidth"
      :height="canvasHeight"></canvas>
  </view>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref, watch } from 'vue'
  import { SimpleScrambler } from '@/engine/simple-scrambler'
  import ToolActionRow from '@/components/toolkit/base/tool-action-row.vue'
  import ToolSectionCard from '@/components/toolkit/base/tool-section-card.vue'
  import type { ToolImagePayload } from '@/components/toolkit/types'

  type PanelMode = 'page' | 'sheet'
  type ImageSourceInput = string | ToolImagePayload | null | undefined

  const props = withDefaults(
    defineProps<{
      mode?: PanelMode
      initialImage?: ImageSourceInput
      autoRun?: boolean
      allowUpload?: boolean
      showShareEntry?: boolean
    }>(),
    {
      mode: 'page',
      initialImage: '',
      autoRun: false,
      allowUpload: true,
      showShareEntry: true,
    },
  )

  const canvasId = `cipherCanvas-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const simpleScrambler = new SimpleScrambler()
  const MAX_DECRYPT_ROUNDS = 10

  const baseImage = reactive({
    src: '',
    previewSrc: '',
    width: 0,
    height: 0,
    size: 0,
  })

  const currentImage = reactive({
    src: '',
    size: 0,
  })

  const cipherSettings = reactive({
    grid: 12,
    seed: '123',
  })

  const isProcessing = ref(false)
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)
  const isH5 = ref(false)

  // #ifdef H5
  isH5.value = true
  // #endif

  const platformType = computed<'weapp' | 'h5' | 'app'>(() => {
    if (isH5.value) return 'h5'
    // #ifdef MP-WEIXIN
    return 'weapp'
    // #endif
    // #ifndef MP-WEIXIN
    return 'app'
    // #endif
  })

  const normalizeImageInput = (source: ImageSourceInput): ToolImagePayload | null => {
    if (!source) return null
    if (typeof source === 'string') return { uri: source }
    if (!source.uri) return null
    return source
  }

  const formatFileSize = (size: number) => {
    if (!size) return '—'
    if (size < 1024) return `${size}B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
    return `${(size / 1024 / 1024).toFixed(2)}MB`
  }

  const fillImageState = (payload: Required<ToolImagePayload>) => {
    baseImage.src = payload.uri
    baseImage.previewSrc = payload.uri
    baseImage.width = payload.width
    baseImage.height = payload.height
    baseImage.size = payload.size
    currentImage.src = payload.uri
    currentImage.size = payload.size
    canvasWidth.value = payload.width
    canvasHeight.value = payload.height
  }

  const applyDataImage = async (payload: ToolImagePayload) => {
    const size = payload.size || Math.round(((payload.uri.split(',')[1] || '').length * 3) / 4)

    if (payload.width && payload.height) {
      fillImageState({
        uri: payload.uri,
        width: payload.width,
        height: payload.height,
        size,
      })
      return true
    }

    // #ifdef H5
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('图片加载失败'))
      element.src = payload.uri
    }).catch(() => null)

    if (!image) {
      uni.showToast({ title: '图片加载失败', icon: 'none' })
      return false
    }

    fillImageState({
      uri: payload.uri,
      width: image.naturalWidth || image.width || 0,
      height: image.naturalHeight || image.height || 0,
      size,
    })
    return true
    // #endif

    // #ifndef H5
    uni.showToast({ title: '当前环境不支持该图片来源', icon: 'none' })
    return false
    // #endif
  }

  const applyFileImage = async (payload: ToolImagePayload) =>
    new Promise<boolean>(resolve => {
      uni.getImageInfo({
        src: payload.uri,
        success: info => {
          if (payload.size) {
            fillImageState({
              uri: info.path,
              width: payload.width || info.width,
              height: payload.height || info.height,
              size: payload.size,
            })
            resolve(true)
            return
          }

          uni.getFileInfo({
            filePath: info.path,
            success: fileInfo => {
              fillImageState({
                uri: info.path,
                width: payload.width || info.width,
                height: payload.height || info.height,
                size: fileInfo.size,
              })
              resolve(true)
            },
            fail: () => {
              fillImageState({
                uri: info.path,
                width: payload.width || info.width,
                height: payload.height || info.height,
                size: 0,
              })
              resolve(true)
            },
          })
        },
        fail: () => {
          uni.showToast({ title: '图片加载失败', icon: 'none' })
          resolve(false)
        },
      })
    })

  const loadImageSource = async (source: ImageSourceInput, autoRun = false) => {
    const normalized = normalizeImageInput(source)
    if (!normalized?.uri) return

    const loaded = normalized.uri.startsWith('data:') ? await applyDataImage(normalized) : await applyFileImage(normalized)
    if (loaded && autoRun) {
      await nextTick()
      await handleCipher('encrypt')
    }
  }

  watch(
    () => props.initialImage,
    value => {
      if (value) {
        loadImageSource(value, props.autoRun)
      }
    },
    { immediate: true },
  )

  const selectImage = () => {
    if (!props.allowUpload && !props.initialImage) {
      return
    }
    uni.chooseImage({
      count: 1,
      sizeType: ['original'],
      success: async res => {
        const tempPath = res.tempFilePaths[0]
        const tempFiles = Array.isArray(res.tempFiles) ? res.tempFiles : []
        const fileSize = tempFiles[0]?.size || 0
        await loadImageSource({ uri: tempPath, size: fileSize })
      },
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

  const resetOrSelect = () => {
    resetAll()
    if (props.allowUpload) {
      selectImage()
    }
  }

  const isTempFileUri = (uri: string) => {
    if (!uri) return true
    return uri.startsWith('wxfile://') || uri.startsWith('file://') || uri.startsWith('/') || /^https?:\/\/tmp\//i.test(uri)
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
      currentImage.size = Math.round((base64.length * 3) / 4)
      return
    }
    uni.getFileInfo({
      filePath: uri,
      success: info => {
        currentImage.size = info.size
      },
      fail: () => {
        currentImage.size = 0
      },
    })
  }

  const runSimpleCipher = async (mode: 'encrypt' | 'decrypt') => {
    const sourceType = resolveSourceType(currentImage.src)
    const result = await simpleScrambler[mode === 'encrypt' ? 'encrypt' : 'decrypt']({
      source: { uri: currentImage.src, type: sourceType },
      seed: cipherSettings.seed,
      grid: cipherSettings.grid,
      platform: platformType.value,
      adapterOptions: { canvasId },
    })
    currentImage.src = result.uri
    updateCurrentImageSize(result.uri)
    return result.uri
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
      uni.showToast({ title: mode === 'encrypt' ? '打乱成功' : '重组完成', icon: 'success' })
    } catch (error) {
      console.error(error)
      uni.showToast({ title: '处理失败，请重试', icon: 'none' })
    } finally {
      isProcessing.value = false
    }
  }

  const restoreOriginal = async () => {
    if (!baseImage.src) {
      uni.showToast({ title: '请先上传图片', icon: 'none' })
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
        if (currentImage.src === previousUri) break
      }

      if (currentImage.src === baseImage.previewSrc) {
        currentImage.size = baseImage.size
        uni.showToast({ title: '已恢复原图', icon: 'success' })
      } else {
        uni.showToast({ title: `已尝试 ${rounds} 次重组`, icon: 'none' })
      }
    } catch (error) {
      console.error(error)
      uni.showToast({ title: '恢复失败，请重试', icon: 'none' })
    } finally {
      isProcessing.value = false
    }
  }

  const saveResult = () => {
    if (!currentImage.src) return

    if (currentImage.src.startsWith('data:')) {
      // #ifdef H5
      const link = document.createElement('a')
      link.href = currentImage.src
      link.download = 'cipher-image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // #endif
      return
    }

    uni.saveImageToPhotosAlbum({
      filePath: currentImage.src,
      success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: () => uni.showToast({ title: '保存失败，请检查权限', icon: 'none' }),
    })
  }

  const copyDataUrl = () => {
    if (!currentImage.src.startsWith('data:')) {
      uni.showToast({ title: '当前图片无 DataURL', icon: 'none' })
      return
    }
    uni.setClipboardData({
      data: currentImage.src,
      success: () => uni.showToast({ title: 'DataURL 已复制', icon: 'success' }),
    })
  }

  const handleShare = () => {
    if (!isH5.value) {
      uni.showToast({ title: '请点击右上角分享', icon: 'none' })
      return
    }
    const shareUrl = `${window.location.origin}/subPackages/tools/image-cipher/index`
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => uni.showToast({ title: '链接已复制', icon: 'success' }))
        .catch(() => uni.showModal({ title: '分享链接', content: shareUrl, showCancel: false }))
    } else {
      uni.showModal({ title: '分享链接', content: shareUrl, showCancel: false })
    }
  }
</script>

<style scoped lang="scss">
  .image-shuffle-panel {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
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
    gap: 20rpx;
  }

  .preview-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--theme-text);
  }

  .preview-meta {
    display: block;
    font-size: 24rpx;
    color: var(--theme-text-secondary);
  }

  .preview-wrapper {
    position: relative;
  }

  .preview-image {
    width: 100%;
    border-radius: 20rpx;
    border: 1rpx solid #ffe0b2;
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

  .result-meta {
    font-size: 24rpx;
    color: var(--theme-text-secondary);
  }

  .action-mini {
    flex: 1;
  }

  .share-entry {
    text-align: center;
  }

  .share-tip {
    font-size: 24rpx;
    color: var(--theme-text-secondary);
  }

  .share-btn {
    width: 100%;
    border: 1rpx dashed #f6d365;
    border-radius: 20rpx;
    height: 88rpx;
    background: #fff7e0;
    color: #f57f17;
    font-size: 28rpx;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    margin-bottom: 24rpx;
  }

  .control-label {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--theme-text);
  }

  .text-input {
    border: 1rpx solid #ffd6a5;
    border-radius: 16rpx;
    padding: 18rpx;
    font-size: 28rpx;
    color: var(--theme-text);
    background: var(--theme-surface-2);
  }

  .btn-row {
    margin-bottom: 16rpx;
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
  }

  .hidden-canvas {
    position: fixed;
    left: -9999px;
    top: -9999px;
  }
</style>
