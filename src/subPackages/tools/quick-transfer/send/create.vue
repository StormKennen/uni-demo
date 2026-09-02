<script setup lang="ts">
  import { onHide, onLoad, onShareAppMessage, onShareTimeline, onShow, onUnload } from '@dcloudio/uni-app'
  import { computed, ref } from 'vue'
  import QuickShipSendForm from '../components/QuickShipSendForm.vue'
  import QuickShipReferencePicker from '../components/QuickShipReferencePicker.vue'
  import QuickShipTransition from '../components/QuickShipTransition.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { filePicker, isFilePickerCancel } from '@/platform/file'
  import type { SelectedFile } from '@/platform/file'
  import { getToken } from '@/utils/storage'
  import {
    MAX_QUICK_TRANSFER_FILE_COUNT,
    QUICK_TRANSFER_MAX_MAX_CLAIMS,
    QUICK_TRANSFER_ROUTE,
    QUICK_TRANSFER_SEND_CREATE_ROUTE,
    QUICK_TRANSFER_SEND_RESULT_ROUTE,
    QUICK_TRANSFER_TTL_OPTIONS,
  } from '@/features/quick-transfer/constants'
  import { getQuickTransferErrorMessage } from '@/features/quick-transfer/errors'
  import {
    createQuickShipDraft,
    createQuickShipFileDraft,
    getFileExtension,
    hasQuickShipPayload,
    isValidQuickTransferTitle,
    isValidQuickTransferMaxClaims,
    isValidQuickTransferUrl,
    normalizeQuickTransferDisplayName,
    restoreQuickTransferDisplayName,
    validateQuickTransferFiles,
  } from '@/features/quick-transfer/helpers'
  import { getQuickTransferSendButtonLabel } from '@/features/quick-transfer/presentation'
  import { getQuickTransferToolSharePayload, QUICK_TRANSFER_TOOL_SHARE_TITLE } from '@/features/quick-transfer/share'
  import { consumeQuickShipReferences } from '@/features/quick-transfer/reference/registry'
  import { setQuickTransferSendResultContext } from '@/features/quick-transfer/sendResultContext'
  import { useQuickTransfer } from '@/features/quick-transfer/useQuickTransfer'
  import type {
    QuickShipDraft,
    QuickShipFileDraft,
    QuickShipLinkDraft,
    QuickShipReferenceDraft,
    QuickTransferTtl,
  } from '@/features/quick-transfer/types'
  import { getQuickShipTransitionForSend, type QuickShipTransitionType } from '@/features/quick-transfer/visual'

  interface LinkEditor {
    localId: string
    title: string
    url: string
  }

  const quickTransfer = useQuickTransfer()
  const draft = ref<QuickShipDraft>(createQuickShipDraft())
  const isMiniProgram = ref(false)
  const isLoggedIn = ref(false)
  const showSendGate = ref(false)
  const titleError = ref('')
  const fileError = ref('')
  const showFileSourceSheet = ref(false)
  const showReferencePicker = ref(false)
  const linkEditor = ref<LinkEditor | null>(null)
  const shipTransition = ref<QuickShipTransitionType | null>(null)

  // #ifdef MP-WEIXIN
  isMiniProgram.value = true
  // #endif

  const sharePayload = getQuickTransferToolSharePayload()

  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  onShareAppMessage(() => ({
    title: sharePayload.title,
    path: sharePayload.path,
    imageUrl: sharePayload.imageUrl,
  }))

  onShareTimeline(() => ({
    title: QUICK_TRANSFER_TOOL_SHARE_TITLE,
    query: '',
    imageUrl: sharePayload.imageUrl,
  }))
  // #endif

  const canSend = computed(() => isMiniProgram.value || isLoggedIn.value)
  const isSending = computed(() => ['creating', 'uploading', 'completing'].includes(quickTransfer.sendState.value))
  const sendErrorMessage = computed(() => quickTransfer.sendError.value?.message || '')
  const hasFailedUploadFiles = computed(() => draft.value.files.some(file => file.uploadState === 'error'))
  const isSubmitHardDisabled = computed(() => isSending.value || Boolean(quickTransfer.transferId.value))
  const sendButtonLabel = computed(() => getQuickTransferSendButtonLabel(quickTransfer.sendState.value, quickTransfer.uploadProgress.value))

  const refreshLoginState = () => {
    isLoggedIn.value = Boolean(getToken())
    showSendGate.value = !canSend.value
  }

  const readFileSize = (path: string): Promise<number> =>
    new Promise((resolve, reject) => {
      uni.getFileInfo({ filePath: path, success: result => resolve(result.size), fail: reject })
    })

  const normalizePickedFiles = async (files: SelectedFile[], sequenceOffset = 0): Promise<QuickShipFileDraft[]> => {
    const normalized: QuickShipFileDraft[] = []
    const selectedAt = new Date()
    for (const [index, file] of files.entries()) {
      const size = file.size ?? (file.path ? await readFileSize(file.path) : undefined)
      normalized.push(createQuickShipFileDraft({ ...file, size }, selectedAt, sequenceOffset + index + 1))
    }
    return normalized
  }

  const pickFiles = async (kind: 'image' | 'file') => {
    if (isSending.value) return
    fileError.value = ''
    showFileSourceSheet.value = false
    try {
      const remaining = MAX_QUICK_TRANSFER_FILE_COUNT - draft.value.files.length
      if (remaining <= 0) {
        fileError.value = `最多添加 ${MAX_QUICK_TRANSFER_FILE_COUNT} 个文件`
        return
      }
      const files =
        isMiniProgram.value && kind === 'image'
          ? await filePicker.pickImage({ count: remaining, sizeType: ['original'], sourceType: ['album'] })
          : await filePicker.pickFile({ count: remaining, type: 'all' })
      const nextFiles = await normalizePickedFiles(files, draft.value.files.length)
      const error = validateQuickTransferFiles([...draft.value.files, ...nextFiles])
      if (error) {
        fileError.value = error
        return
      }
      draft.value.files.push(...nextFiles)
    } catch (error) {
      if (!isFilePickerCancel(error)) fileError.value = getQuickTransferErrorMessage(error, '选择文件失败，请重试')
    }
  }

  const openFileSourceSheet = () => {
    if (isSending.value) return
    fileError.value = ''
    if (isMiniProgram.value) {
      showFileSourceSheet.value = true
      return
    }
    void pickFiles('file')
  }

  const removeFile = (file: QuickShipFileDraft) => {
    if (isSending.value) return
    draft.value.files = draft.value.files.filter(item => item.clientFileId !== file.clientFileId)
    fileError.value = ''
  }

  const updateFileDisplayName = (file: QuickShipFileDraft, value: string, restore = false) => {
    if (isSending.value) return
    if (restore) {
      file.displayName = restoreQuickTransferDisplayName(file)
      return
    }
    const extension = getFileExtension(file.defaultDisplayName)
    file.displayName = normalizeQuickTransferDisplayName(value, extension) || extension
  }

  const createLocalId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const openAddLink = () => {
    if (!isSending.value) linkEditor.value = { localId: '', title: '', url: '' }
  }

  const openEditLink = (link: QuickShipLinkDraft) => {
    if (!isSending.value) linkEditor.value = { ...link }
  }

  const saveLink = () => {
    const editor = linkEditor.value
    if (!editor) return
    if (!isValidQuickTransferUrl(editor.url)) {
      fileError.value = '请输入 http:// 或 https:// 开头的链接'
      return
    }
    const next: QuickShipLinkDraft = {
      localId: editor.localId || createLocalId('link'),
      title: editor.title.trim(),
      url: editor.url.trim(),
    }
    const index = draft.value.links.findIndex(link => link.localId === next.localId)
    if (index === -1) draft.value.links.push(next)
    else draft.value.links[index] = next
    linkEditor.value = null
    fileError.value = ''
  }

  const removeLink = (link: QuickShipLinkDraft) => {
    if (!isSending.value) draft.value.links = draft.value.links.filter(item => item.localId !== link.localId)
  }

  const removeReference = (localId: string) => {
    if (!isSending.value) draft.value.references = draft.value.references.filter(item => item.localId !== localId)
  }

  const openAddReference = () => {
    if (!isSending.value) showReferencePicker.value = true
  }

  const addReference = (reference: QuickShipReferenceDraft) => {
    if (isSending.value) return
    draft.value.references.push(reference)
    showReferencePicker.value = false
  }

  const submitSend = async () => {
    if (!canSend.value) {
      showSendGate.value = true
      return
    }
    fileError.value = ''
    if (!isValidQuickTransferTitle(draft.value.title)) {
      titleError.value = '标题最多 40 个字符'
      return
    }
    if (!hasQuickShipPayload(draft.value)) {
      fileError.value = '请至少填写标题或添加一项飞船内容'
      return
    }
    titleError.value = ''
    if (!isValidQuickTransferMaxClaims(draft.value.maxClaims)) {
      fileError.value = '领取次数需设置为 1～10 次'
      return
    }
    const fileLimitError = validateQuickTransferFiles(draft.value.files)
    if (fileLimitError) {
      fileError.value = fileLimitError
      return
    }
    shipTransition.value = getQuickShipTransitionForSend()
    const success = await quickTransfer.send(draft.value)
    if (!success) return
    const status = quickTransfer.senderStatus.value
    if (!status) {
      fileError.value = '飞船状态暂时不可用，请稍后重试'
      return
    }
    setQuickTransferSendResultContext({
      title: quickTransfer.resolvedTitle.value || '飞船',
      transferId: status.transferId,
      code: quickTransfer.code.value,
      shareToken: quickTransfer.shareToken.value,
      expiresAt: status.expiresAt,
      claimCount: status.claimCount,
      maxClaims: status.maxClaims,
      status: status.status,
    })
    uni.redirectTo({ url: QUICK_TRANSFER_SEND_RESULT_ROUTE })
  }

  const retryUpload = () => {
    if (hasFailedUploadFiles.value) void quickTransfer.retryUpload(draft.value)
  }

  const retryComplete = () => {
    if (quickTransfer.canRetryComplete.value) void quickTransfer.retryComplete(draft.value)
  }

  const abandon = async () => {
    if (quickTransfer.transferId.value && !['idle', 'consumed', 'expired', 'cancelled'].includes(quickTransfer.sendState.value)) {
      const cancelled = await quickTransfer.cancel()
      if (!cancelled) return
    }
    quickTransfer.resetSendResult(draft.value)
    draft.value = createQuickShipDraft()
    shipTransition.value = null
  }

  const goToLogin = () => {
    uni.navigateTo({
      url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(QUICK_TRANSFER_SEND_CREATE_ROUTE)}`,
    })
  }

  const updateDraftText = (value: string) => {
    draft.value.text = value
  }

  const updateDraftTitle = (value: string) => {
    draft.value.title = value
    titleError.value = ''
  }

  const updateExpiresIn = (value: QuickTransferTtl) => {
    draft.value.expiresIn = value
  }

  const updateMaxClaims = (value: number) => {
    if (value >= 1 && value <= QUICK_TRANSFER_MAX_MAX_CLAIMS) draft.value.maxClaims = value
  }

  onLoad(() => {
    draft.value.references.push(...consumeQuickShipReferences())
    refreshLoginState()
  })

  onShow(refreshLoginState)
  onHide(() => quickTransfer.pauseTimers())
  onUnload(() => quickTransfer.pauseTimers())
</script>

<template>
  <PageLayout
    title="发送飞船"
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-image-url="sharePayload.imageUrl"
    :share-timeline-title="QUICK_TRANSFER_TOOL_SHARE_TITLE"
    :back-fallback="QUICK_TRANSFER_ROUTE"
    nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <!-- #ifdef MP-WEIXIN -->
    <template #nav-right>
      <button class="nav-share-button" hover-class="nav-share-button--hover" open-type="share">分享</button>
    </template>
    <!-- #endif -->
    <view class="send-create-page">
      <view v-if="showSendGate" class="gate-panel">
        <text class="page-kicker">SEND SHIP</text>
        <text class="page-title">登录后才能发送</text>
        <text class="page-description">接收飞船不需要登录，登录后即可把内容送给别人。</text>
        <button class="quick-ship-button primary-button full-button" @click="goToLogin">登录后发送</button>
      </view>

      <template v-else>
        <view class="page-heading">
          <text class="page-kicker">SEND SHIP</text>
          <text class="page-title">装载一艘飞船</text>
          <text class="page-description">内容会在有效期内安全送达对方。</text>
        </view>
        <QuickShipSendForm
          :draft="draft"
          :is-sending="isSending"
          :is-submit-hard-disabled="isSubmitHardDisabled"
          :title-error="titleError"
          :send-button-label="sendButtonLabel"
          :file-error="fileError"
          :send-error="sendErrorMessage"
          :upload-progress="quickTransfer.uploadProgress.value"
          :can-retry-upload="quickTransfer.canRetryUpload.value"
          :has-failed-upload-files="hasFailedUploadFiles"
          :can-retry-complete="quickTransfer.canRetryComplete.value"
          :max-file-count="MAX_QUICK_TRANSFER_FILE_COUNT"
          :ttl-options="QUICK_TRANSFER_TTL_OPTIONS"
          @update:title="updateDraftTitle"
          @update:text="updateDraftText"
          @update:expires-in="updateExpiresIn"
          @update:max-claims="updateMaxClaims"
          @add-link="openAddLink"
          @edit-link="openEditLink"
          @remove-link="removeLink"
          @add-file="openFileSourceSheet"
          @add-reference="openAddReference"
          @remove-file="removeFile"
          @update:file-display-name="updateFileDisplayName"
          @remove-reference="removeReference"
          @submit="submitSend"
          @retry-upload="retryUpload"
          @retry-complete="retryComplete"
          @abandon="abandon" />
      </template>
    </view>

    <QuickShipTransition v-if="shipTransition" :type="shipTransition" @finished="shipTransition = null" />

    <QuickShipReferencePicker :visible="showReferencePicker" @cancel="showReferencePicker = false" @selected="addReference" />

    <view v-if="showFileSourceSheet" class="sheet-mask" @click="showFileSourceSheet = false">
      <view class="source-sheet" @click.stop>
        <text class="sheet-title">添加文件</text>
        <button class="quick-ship-button primary-button full-button" @click="pickFiles('image')">选择图片</button>
        <button class="quick-ship-button secondary-button full-button" @click="pickFiles('file')">选择文件</button>
        <button class="quick-ship-button text-button full-button" @click="showFileSourceSheet = false">取消</button>
      </view>
    </view>

    <view v-if="linkEditor" class="sheet-mask" @click="linkEditor = null">
      <view class="source-sheet link-editor" @click.stop>
        <text class="sheet-title">{{ linkEditor.localId ? '修改链接' : '添加链接' }}</text>
        <text class="form-label">链接地址</text>
        <input v-model="linkEditor.url" class="text-input" placeholder="https://..." />
        <text class="form-label">显示名称（可选）</text>
        <input v-model="linkEditor.title" class="text-input" placeholder="项目地址" />
        <button class="quick-ship-button primary-button full-button" @click="saveLink">{{ linkEditor.localId ? '保存' : '添加' }}</button>
        <button class="quick-ship-button text-button full-button" @click="linkEditor = null">取消</button>
      </view>
    </view>
  </PageLayout>
</template>

<style lang="scss">
  .nav-share-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 88rpx;
    height: 58rpx;
    margin: 0;
    padding: 0 16rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.68);
    border-radius: 999rpx;
    color: #fff;
    background: rgba(7, 20, 38, 0.28);
    font-size: 22rpx;
    line-height: 1;
  }

  .nav-share-button::after {
    border: 0;
  }

  .nav-share-button--hover {
    opacity: 0.78;
  }

  .send-create-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    color: var(--theme-text);
  }

  .page-heading,
  .gate-panel {
    padding: 18rpx 4rpx 28rpx;
    text-align: center;
  }

  .page-kicker {
    display: block;
    color: var(--theme-brand);
    font-size: 19rpx;
    font-weight: 700;
    letter-spacing: 3rpx;
  }

  .page-title {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text);
    font-size: 38rpx;
    font-weight: 800;
  }

  .page-description {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.6;
  }

  .full-button {
    width: 100%;
    margin-top: 16rpx;
  }

  .quick-ship-button {
    border: 0;
    border-radius: 16rpx;
    font-size: 26rpx;
  }

  .quick-ship-button::after {
    border: 0;
  }

  .primary-button {
    min-height: 82rpx;
    padding: 0 24rpx;
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
  }

  .secondary-button {
    min-height: 82rpx;
    padding: 0 24rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
  }

  .text-button {
    min-height: 70rpx;
    padding: 0;
    color: var(--theme-text-secondary);
    background: transparent;
  }

  .sheet-mask {
    position: fixed;
    z-index: 20;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: flex-end;
    background: rgba(0, 0, 0, 0.45);
  }

  .source-sheet {
    width: 100%;
    padding: 30rpx 24rpx calc(30rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    border-radius: 28rpx 28rpx 0 0;
    background: var(--theme-surface);
  }

  .sheet-title,
  .form-label {
    display: block;
    color: var(--theme-text);
    font-weight: 700;
  }

  .sheet-title {
    margin-bottom: 18rpx;
    font-size: 32rpx;
  }

  .form-label {
    margin-top: 22rpx;
    font-size: 26rpx;
  }

  .text-input {
    width: 100%;
    height: 86rpx;
    margin-top: 12rpx;
    padding: 0 22rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
    font-size: 28rpx;
  }
</style>
