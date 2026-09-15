<script setup lang="ts">
  import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
  import { formatQuickTransferFileSize, isQuickTransferImageFile } from '@/features/quick-transfer/helpers'
  import { getQuickTransferFileTypeLabel } from '@/features/quick-transfer/presentation'
  import { logFileOperationFailure, previewLocalImage } from '@/platform/file'
  import type {
    QuickTransferContent,
    QuickTransferContentReference,
    QuickTransferFileMetadata,
    QuickTransferContentLink,
  } from '@/features/quick-transfer/types'

  interface Props {
    content: QuickTransferContent
    isDownloading: boolean
    context?: 'received' | 'sent'
    getPreviewImage: (fileId: string, forceRefresh?: boolean) => Promise<string | null>
  }

  interface InlineImageState {
    fileId: string
    url: string
    loading: boolean
    error: boolean
  }

  interface InlineImageLoadTask {
    key: string
    fileId: string
    file: QuickTransferFileMetadata
    generation: number
    forceRefresh: boolean
  }

  const INLINE_IMAGE_CONCURRENCY = 2

  const props = withDefaults(defineProps<Props>(), { context: 'received' })
  const previewImageUrl = ref('')
  const previewImageFileId = ref('')
  const previewImageKey = ref('')
  const inlineImageStates = reactive<Record<string, InlineImageState>>({})
  const inlineImageQueue: InlineImageLoadTask[] = []
  const queuedImageTasks = new Set<string>()
  let activeImageLoads = 0
  let imageGeneration = 0
  const emit = defineEmits<{
    copyText: []
    openUrl: [url: string]
    downloadFile: [fileId: string]
    openReference: [reference: QuickTransferContentReference]
  }>()

  const isVideoFile = (file: QuickTransferFileMetadata): boolean => file.mimeType.startsWith('video/')
  const imageFiles = computed(() => props.content.files.filter(isQuickTransferImageFile))
  const attachmentFiles = computed(() => props.content.files.filter(file => !isQuickTransferImageFile(file)))
  const getFileKey = (file: QuickTransferFileMetadata, index: number): string => file.fileId || `${file.displayName}-${index}`
  const imageSignature = computed(() =>
    imageFiles.value
      .map((file, index) => `${getFileKey(file, index)}:${file.mimeType}:${file.available === false ? 'expired' : 'available'}`)
      .join('|'),
  )

  const getInlineImageState = (file: QuickTransferFileMetadata, index: number): InlineImageState | undefined =>
    inlineImageStates[getFileKey(file, index)]

  const createInlineImageState = (file: QuickTransferFileMetadata): InlineImageState => ({
    fileId: file.fileId || '',
    url: '',
    loading: false,
    error: false,
  })

  const resetInlineImageStates = (): void => {
    imageGeneration += 1
    inlineImageQueue.splice(0)
    queuedImageTasks.clear()
    Object.keys(inlineImageStates).forEach(key => delete inlineImageStates[key])
  }

  const getPreviewErrorMessage = (event: unknown): string => {
    if (!event || typeof event !== 'object') return 'image load error'
    const detail = (event as { detail?: unknown }).detail
    if (!detail || typeof detail !== 'object') return 'image load error'
    const errMsg = (detail as { errMsg?: unknown }).errMsg
    return typeof errMsg === 'string' && errMsg ? errMsg : 'image load error'
  }

  const markInlineImageError = (file: QuickTransferFileMetadata, state: InlineImageState, event?: unknown): void => {
    logFileOperationFailure('PREVIEW_FAILED', { fileId: file.fileId, mimeType: file.mimeType }, { errMsg: getPreviewErrorMessage(event) })
    state.url = ''
    state.loading = false
    state.error = true
  }

  const loadInlineImage = async (task: InlineImageLoadTask): Promise<void> => {
    const state = inlineImageStates[task.key]
    if (!state || task.generation !== imageGeneration) return
    state.loading = true
    state.error = false
    try {
      const url = await props.getPreviewImage(task.fileId, task.forceRefresh)
      if (task.generation !== imageGeneration) return
      if (url) {
        state.url = url
        state.error = false
      } else {
        markInlineImageError(task.file, state)
      }
    } catch (error) {
      if (task.generation === imageGeneration) {
        markInlineImageError(task.file, state, error)
      }
    } finally {
      if (task.generation === imageGeneration) state.loading = false
    }
  }

  const processInlineImageQueue = (): void => {
    while (activeImageLoads < INLINE_IMAGE_CONCURRENCY && inlineImageQueue.length) {
      const task = inlineImageQueue.shift()
      if (!task) return
      queuedImageTasks.delete(`${task.generation}:${task.key}`)
      activeImageLoads += 1
      void loadInlineImage(task).finally(() => {
        activeImageLoads -= 1
        processInlineImageQueue()
      })
    }
  }

  const queueInlineImage = (file: QuickTransferFileMetadata, index: number, forceRefresh = false): void => {
    const key = getFileKey(file, index)
    const state = inlineImageStates[key] || (inlineImageStates[key] = createInlineImageState(file))
    const taskKey = `${imageGeneration}:${key}`
    if (!file.fileId || state.url || state.loading || state.error || queuedImageTasks.has(taskKey)) return
    queuedImageTasks.add(taskKey)
    inlineImageQueue.push({ key, fileId: file.fileId, file, generation: imageGeneration, forceRefresh })
  }

  const syncInlineImages = (): void => {
    resetInlineImageStates()
    imageFiles.value.forEach((file, index) => {
      const key = getFileKey(file, index)
      const state = (inlineImageStates[key] = createInlineImageState(file))
      if (file.available === false) return
      if (!file.fileId) {
        state.error = true
        return
      }
      queueInlineImage(file, index)
    })
    processInlineImageQueue()
  }

  watch(imageSignature, syncInlineImages, { immediate: true })

  const retryInlineImage = (file: QuickTransferFileMetadata, index: number): void => {
    if (file.available === false || !file.fileId) return
    const state = getInlineImageState(file, index)
    if (!state) return
    state.url = ''
    state.loading = false
    state.error = false
    queueInlineImage(file, index, true)
    processInlineImageQueue()
  }

  const handleInlineImageError = (file: QuickTransferFileMetadata, index: number, event: unknown): void => {
    const state = getInlineImageState(file, index)
    if (state) markInlineImageError(file, state, event)
  }

  const openInlineImage = async (file: QuickTransferFileMetadata, index: number): Promise<void> => {
    const state = getInlineImageState(file, index)
    if (!state?.url || !file.fileId) return

    // #ifdef H5
    previewImageKey.value = getFileKey(file, index)
    previewImageFileId.value = file.fileId
    previewImageUrl.value = state.url
    // #endif

    // #ifdef MP-WEIXIN
    const success = await previewLocalImage({ path: state.url, isRemote: false }, { fileId: file.fileId, mimeType: file.mimeType })
    if (!success) uni.showToast({ title: '图片预览失败，请稍后重试', icon: 'none' })
    // #endif
  }

  const handlePreviewImageError = (event: unknown): void => {
    const state = previewImageKey.value ? inlineImageStates[previewImageKey.value] : undefined
    const file = props.content.files.find(item => item.fileId === previewImageFileId.value)
    if (state && file) markInlineImageError(file, state, event)
    previewImageUrl.value = ''
    previewImageFileId.value = ''
    previewImageKey.value = ''
  }

  const closePreview = (): void => {
    previewImageUrl.value = ''
    previewImageFileId.value = ''
    previewImageKey.value = ''
  }

  const linkKey = (link: QuickTransferContentLink, index: number): string => `${link.url}-${index}`
  const referenceKey = (reference: QuickTransferContentReference, index: number): string =>
    `${reference.type}-${reference.resourceId || reference.title}-${index}`

  onBeforeUnmount(() => {
    resetInlineImageStates()
  })
</script>

<template>
  <view class="received-content">
    <view class="received-heading">
      <text class="received-kicker">{{ props.context === 'sent' ? 'TRANSFER SENT' : 'TRANSFER RECEIVED' }}</text>
      <text class="received-title">{{ props.context === 'sent' ? '发送内容' : '收到的内容' }}</text>
    </view>

    <view v-if="props.content.text" class="received-section">
      <view class="section-heading"><text class="section-title">文本</text><text class="section-count">1 条</text></view>
      <text class="received-text" selectable>{{ props.content.text }}</text>
      <button class="quick-ship-button secondary-button full-button" @click="emit('copyText')">复制文本</button>
    </view>

    <view v-if="imageFiles.length" class="received-section inline-images-section">
      <view v-for="(file, index) in imageFiles" :key="`${file.fileId || file.displayName}-${index}`" class="inline-image-item">
        <view v-if="file.available === false" class="inline-image-placeholder">
          <text>图片已过期</text>
        </view>
        <view v-else-if="getInlineImageState(file, index)?.loading" class="inline-image-placeholder inline-image-skeleton">
          <text>图片正在加载</text>
        </view>
        <view v-else-if="getInlineImageState(file, index)?.error" class="inline-image-placeholder inline-image-error">
          <text>图片加载失败</text>
          <button class="quick-ship-button secondary-small-button" @click.stop="retryInlineImage(file, index)">重试</button>
        </view>
        <view v-else-if="getInlineImageState(file, index)?.url" class="inline-image-frame" @click="openInlineImage(file, index)">
          <image
            class="inline-image"
            :src="getInlineImageState(file, index)?.url || ''"
            mode="widthFix"
            lazy-load
            @error="handleInlineImageError(file, index, $event)" />
        </view>
        <view v-if="getInlineImageState(file, index)?.url" class="inline-image-meta">
          <text class="inline-image-name">{{ file.displayName }}</text>
          <button
            class="quick-ship-button secondary-small-button inline-image-save"
            :disabled="props.isDownloading"
            @click.stop="emit('downloadFile', file.fileId || '')">
            保存
          </button>
        </view>
      </view>
    </view>

    <view v-if="props.content.links.length" class="received-section">
      <view class="section-heading"
        ><text class="section-title">链接</text><text class="section-count">{{ props.content.links.length }} 个</text></view
      >
      <view
        v-for="(link, index) in props.content.links"
        :key="linkKey(link, index)"
        class="received-row"
        @click="emit('openUrl', link.url)">
        <view class="item-icon">↗</view>
        <view class="item-main">
          <text class="item-title">{{ link.title || link.url }}</text>
          <text v-if="link.title" class="item-subtitle">{{ link.url }}</text>
        </view>
        <text class="item-arrow">›</text>
      </view>
    </view>

    <view v-if="props.content.references.length" class="received-section">
      <view class="section-heading"
        ><text class="section-title">引用</text><text class="section-count">{{ props.content.references.length }} 个</text></view
      >
      <view
        v-for="(reference, index) in props.content.references"
        :key="referenceKey(reference, index)"
        class="received-row"
        @click="emit('openReference', reference)">
        <view class="item-icon">↗</view>
        <view class="item-main">
          <text class="item-title">{{ reference.title }}</text>
          <text v-if="reference.subtitle" class="item-subtitle">{{ reference.subtitle }}</text>
        </view>
        <text class="item-arrow">›</text>
      </view>
    </view>

    <view v-if="attachmentFiles.length" class="received-section received-section--last">
      <view class="section-heading"
        ><text class="section-title">附件</text><text class="section-count">{{ attachmentFiles.length }} 个</text></view
      >
      <view v-for="(file, index) in attachmentFiles" :key="`${file.fileId || file.displayName}-${index}`" class="received-row">
        <view class="item-icon item-icon--file">FILE</view>
        <view class="item-main">
          <text class="item-title">{{ file.displayName }}</text>
          <text class="item-subtitle"
            >{{ formatQuickTransferFileSize(file.size) }} · {{ getQuickTransferFileTypeLabel(file.mimeType) }}</text
          >
        </view>
        <text v-if="file.available === false" class="file-expired-badge">已过期</text>
        <button
          v-else
          class="quick-ship-button primary-small-button"
          :disabled="props.isDownloading"
          @click="emit('downloadFile', file.fileId || '')">
          {{ isVideoFile(file) ? '保存' : '下载' }}
        </button>
      </view>
    </view>

    <!-- #ifdef H5 -->
    <view v-if="previewImageUrl" class="image-preview-overlay" @click="closePreview">
      <view class="image-preview-close" aria-label="关闭预览" @click.stop="closePreview">×</view>
      <image class="image-preview" :src="previewImageUrl" mode="aspectFit" @error="handlePreviewImageError" @click.stop />
    </view>
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
  .received-content {
    color: var(--theme-text);
  }

  .received-heading {
    padding: 10rpx 0 22rpx;
    text-align: center;
  }

  .received-kicker {
    display: block;
    color: var(--theme-brand);
    font-size: 19rpx;
    font-weight: 700;
    letter-spacing: 3rpx;
  }

  .received-title {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text);
    font-size: 36rpx;
    font-weight: 800;
  }

  .received-section {
    padding: 24rpx 0;
    border-top: 1rpx solid var(--theme-border);
  }

  .received-section--last {
    padding-bottom: 4rpx;
  }

  .section-heading,
  .received-row {
    display: flex;
    align-items: center;
  }

  .section-heading {
    justify-content: space-between;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .section-count,
  .item-subtitle {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .received-text {
    display: block;
    margin-top: 14rpx;
    padding: 18rpx;
    border-radius: 16rpx;
    color: var(--theme-text);
    background: var(--theme-surface);
    font-size: 27rpx;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .inline-images-section {
    padding-bottom: 18rpx;
  }

  .inline-image-item + .inline-image-item {
    margin-top: 22rpx;
  }

  .inline-image-frame {
    overflow: hidden;
    border-radius: 18rpx;
    background: var(--theme-surface-muted);
  }

  .inline-image {
    display: block;
    width: 100%;
    max-height: 720rpx;
  }

  .inline-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240rpx;
    border-radius: 18rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
    font-size: 24rpx;
  }

  .inline-image-skeleton {
    animation: quick-ship-image-pulse 1.4s ease-in-out infinite;
  }

  .inline-image-error {
    flex-direction: column;
    gap: 16rpx;
  }

  .inline-image-meta {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-top: 10rpx;
  }

  .inline-image-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inline-image-save {
    padding: 10rpx 16rpx;
  }

  .received-row {
    gap: 14rpx;
    min-height: 82rpx;
    padding: 12rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .received-row:last-child {
    border-bottom: 0;
  }

  .item-icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 58rpx;
    height: 58rpx;
    border-radius: 15rpx;
    color: var(--theme-brand);
    background: var(--theme-surface-muted);
    font-size: 29rpx;
  }

  .item-icon--file {
    font-size: 17rpx;
    font-weight: 700;
  }

  .item-main {
    flex: 1;
    min-width: 0;
  }

  .item-title,
  .item-subtitle {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-title {
    color: var(--theme-text);
    font-size: 27rpx;
  }

  .item-subtitle {
    margin-top: 6rpx;
  }

  .file-expired-badge {
    flex: 0 0 auto;
    padding: 10rpx 14rpx;
    border-radius: 12rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
    font-size: 22rpx;
  }

  .item-arrow {
    flex: 0 0 auto;
    color: var(--theme-text-secondary);
    font-size: 40rpx;
  }

  .quick-ship-button {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    line-height: 1.2;
    text-align: center;
  }

  .primary-small-button,
  .secondary-small-button,
  .secondary-button {
    flex: 0 0 auto;
    border: 0;
    border-radius: 13rpx;
    font-size: 23rpx;
  }

  .primary-small-button {
    padding: 13rpx 16rpx;
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
  }

  .secondary-small-button {
    padding: 13rpx 16rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
  }

  .secondary-button {
    min-height: 76rpx;
    padding: 0 20rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
  }

  .full-button {
    width: 100%;
    margin-top: 16rpx;
  }

  .quick-ship-button::after {
    border: 0;
  }

  button[disabled] {
    opacity: 0.45;
  }

  .image-preview-overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 96rpx 28rpx;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.88);
  }

  .image-preview {
    width: 100%;
    height: 100%;
  }

  .image-preview-close {
    position: absolute;
    top: 28rpx;
    right: 28rpx;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.65);
    border-radius: 50%;
    color: #fff;
    font-size: 44rpx;
    line-height: 1;
  }

  @keyframes quick-ship-image-pulse {
    0%,
    100% {
      opacity: 0.55;
    }
    50% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .inline-image-skeleton {
      animation: none;
    }
  }
</style>
