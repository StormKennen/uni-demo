<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
  import QuickShipReceivePanel from './components/QuickShipReceivePanel.vue'
  import QuickShipReceivedContent from './components/QuickShipReceivedContent.vue'
  import QuickShipSendForm from './components/QuickShipSendForm.vue'
  import QuickShipSendResult from './components/QuickShipSendResult.vue'
  import QuickShipTransition from './components/QuickShipTransition.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { filePicker, isFilePickerCancel } from '@/platform/file'
  import type { SelectedFile } from '@/platform/file'
  import { getToken } from '@/utils/storage'
  import { buildQuickTransferBrowserShareUrl } from '@/utilsH5/quick-transfer-share'
  import { openQuickTransferBrowserUrl } from '@/utilsH5/quick-transfer-url'
  import {
    MAX_QUICK_TRANSFER_FILE_COUNT,
    QUICK_TRANSFER_MAX_MAX_CLAIMS,
    QUICK_TRANSFER_RECEIPTS_ROUTE,
    QUICK_TRANSFER_ROUTE,
    QUICK_TRANSFER_TTL_OPTIONS,
  } from '@/features/quick-transfer/constants'
  import { getQuickTransferErrorMessage } from '@/features/quick-transfer/errors'
  import {
    buildQuickTransferSharePath,
    createQuickShipDraft,
    createQuickShipFileDraft,
    hasQuickShipContent,
    isValidQuickTransferMaxClaims,
    isValidQuickTransferUrl,
    normalizeQuickTransferCode,
    parseQuickTransferPageQuery,
    validateQuickTransferFiles,
  } from '@/features/quick-transfer/helpers'
  import { useQuickTransfer } from '@/features/quick-transfer/useQuickTransfer'
  import { getQuickTransferSharePayload, QUICK_TRANSFER_TOOL_SHARE_TITLE } from '@/features/quick-transfer/share'
  import {
    formatQuickTransferSummary,
    getQuickTransferSenderDescription,
    getQuickTransferSenderTitle,
    getQuickTransferSendButtonLabel,
    getQuickTransferSenderClaimLabel,
    isQuickTransferReceivedContentVisible,
    QUICK_TRANSFER_COPY,
  } from '@/features/quick-transfer/presentation'
  import { consumeQuickShipReferences, openQuickTransferReference } from '@/features/quick-transfer/reference/registry'
  import type {
    QuickShipDraft,
    QuickShipFileDraft,
    QuickShipLinkDraft,
    QuickTransferContentReference,
    QuickTransferPageQuery,
    QuickTransferTtl,
  } from '@/features/quick-transfer/types'
  import {
    getQuickShipTransitionForReceive,
    getQuickShipTransitionForSend,
    isQuickShipModeSwitchLocked,
    type QuickShipTransitionType,
  } from '@/features/quick-transfer/visual'

  interface LinkEditor {
    localId: string
    title: string
    url: string
  }

  const quickTransfer = useQuickTransfer()
  const draft = ref<QuickShipDraft>(createQuickShipDraft())
  const mode = ref<'send' | 'receive'>('send')
  const isMiniProgram = ref(false)
  const isLoggedIn = ref(false)
  const receiveCode = ref('')
  const shareToken = ref('')
  const showSendGate = ref(false)
  const fileError = ref('')
  const isReceivedContentOpened = ref(false)
  const showFileSourceSheet = ref(false)
  const linkEditor = ref<LinkEditor | null>(null)
  const shipTransition = ref<QuickShipTransitionType | null>(null)

  // #ifdef MP-WEIXIN
  isMiniProgram.value = true
  // #endif

  const canSend = computed(() => isMiniProgram.value || isLoggedIn.value)
  const canViewReceipts = computed(() => isMiniProgram.value || isLoggedIn.value)
  const isSending = computed(() => ['creating', 'uploading', 'completing'].includes(quickTransfer.sendState.value))
  const isReceiving = computed(() => ['inspecting', 'resolving'].includes(quickTransfer.receiveState.value))
  const isModeSwitchLocked = computed(() => isQuickShipModeSwitchLocked(isSending.value, isReceiving.value))
  const isSendResultVisible = computed(() => ['ready', 'consumed', 'expired', 'cancelled'].includes(quickTransfer.sendState.value))
  const sendErrorMessage = computed(() => quickTransfer.sendError.value?.message || '')
  const receiveErrorMessage = computed(() => quickTransfer.receiveError.value?.message || '')
  const canSubmit = computed(
    () =>
      canSend.value &&
      (!quickTransfer.transferId.value || quickTransfer.sendState.value === 'idle') &&
      hasQuickShipContent(draft.value) &&
      !validateQuickTransferFiles(draft.value.files),
  )
  const sendButtonDisabledReason = computed(() => {
    if (canSubmit.value || isSending.value) return ''
    if (!canSend.value) return '登录后才能发送'
    if (!hasQuickShipContent(draft.value)) return '请先添加内容'
    if (validateQuickTransferFiles(draft.value.files)) return '请修正文件后发送'
    if (quickTransfer.transferId.value) return '请先处理当前飞船'
    return '暂不可发送'
  })
  const sendButtonLabel = computed(() =>
    getQuickTransferSendButtonLabel(quickTransfer.sendState.value, quickTransfer.uploadProgress.value, sendButtonDisabledReason.value),
  )
  const sharePayload = computed(() =>
    getQuickTransferSharePayload({
      mode: mode.value,
      sendState: quickTransfer.sendState.value,
      shareToken: quickTransfer.shareToken.value,
      expiresAt: quickTransfer.expiresAt.value,
    }),
  )
  const sharePath = computed(() => sharePayload.value.path)
  const shareUrl = computed(() => {
    if (sharePayload.value.kind !== 'transfer' || !quickTransfer.shareToken.value) return ''
    let url = buildQuickTransferSharePath(quickTransfer.shareToken.value)
    // #ifdef H5
    url = buildQuickTransferBrowserShareUrl(quickTransfer.shareToken.value)
    // #endif
    return url
  })
  const senderClaimCount = computed(() => quickTransfer.senderStatus.value?.claimCount ?? 0)
  const senderMaxClaims = computed(() => quickTransfer.senderStatus.value?.maxClaims ?? draft.value.maxClaims)
  const senderStatusTitle = computed(() => getQuickTransferSenderTitle(quickTransfer.sendState.value))
  const senderStatusDescription = computed(() => getQuickTransferSenderDescription(quickTransfer.sendState.value))
  const senderClaimLabel = computed(() =>
    getQuickTransferSenderClaimLabel(quickTransfer.sendState.value, senderClaimCount.value, senderMaxClaims.value),
  )
  const receiveErrorCode = computed(() => quickTransfer.receiveError.value?.code || '')
  const isClaimTokenError = computed(
    () => receiveErrorCode.value === 'CLAIM_TOKEN_INVALID' || receiveErrorCode.value === 'CLAIM_TOKEN_EXPIRED',
  )
  const isReceiveUnavailable = computed(
    () => receiveErrorCode.value === 'TRANSFER_NOT_AVAILABLE' || receiveErrorCode.value === 'TRANSFER_NOT_FOUND',
  )
  const hasFailedUploadFiles = computed(() => draft.value.files.some(file => file.uploadState === 'error'))
  const receiveErrorTitle = computed(() => {
    if (isReceiveUnavailable.value) return '这艘飞船已经不在了'
    if (isClaimTokenError.value) return '文件访问凭证已失效'
    if (receiveErrorCode.value === '429') return '收船太频繁了'
    if (receiveErrorCode.value === 'NETWORK_ERROR') return '暂时联系不上飞船'
    return receiveErrorMessage.value
  })
  const receiveErrorDescription = computed(() => {
    if (isReceiveUnavailable.value) return '内容可能已经过期、被召回或已经领取完。'
    if (isClaimTokenError.value) return '重新收船可能会再次占用一次领取次数。'
    if (receiveErrorCode.value === '429') return '稍后再试。'
    if (receiveErrorCode.value === 'NETWORK_ERROR') return '检查网络后再试一次。'
    return '请稍后再试。'
  })
  const receivedContent = computed(() => quickTransfer.receivedResult.value?.content || null)
  const isReceivedContentVisible = computed(() =>
    isQuickTransferReceivedContentVisible(quickTransfer.receiveState.value, isReceivedContentOpened.value),
  )
  const receiveSummaryText = computed(() =>
    quickTransfer.inspectResult.value ? formatQuickTransferSummary(quickTransfer.inspectResult.value.summary) : '',
  )

  const refreshLoginState = () => {
    isLoggedIn.value = Boolean(getToken())
    if (mode.value === 'send' && quickTransfer.sendState.value === 'idle') showSendGate.value = !canSend.value
  }

  const readFileSize = (path: string): Promise<number> =>
    new Promise((resolve, reject) => {
      uni.getFileInfo({ filePath: path, success: result => resolve(result.size), fail: reject })
    })

  const normalizePickedFiles = async (files: SelectedFile[]): Promise<QuickShipFileDraft[]> => {
    const normalized: QuickShipFileDraft[] = []
    for (const file of files) {
      const size = file.size ?? (file.path ? await readFileSize(file.path) : undefined)
      normalized.push(createQuickShipFileDraft({ ...file, size }))
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
      const nextFiles = await normalizePickedFiles(files)
      const next = [...draft.value.files, ...nextFiles]
      const error = validateQuickTransferFiles(next)
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

  const updateDraftText = (value: string) => {
    draft.value.text = value
  }

  const updateExpiresIn = (value: QuickTransferTtl) => {
    draft.value.expiresIn = value
  }

  const updateMaxClaims = (value: number) => {
    if (value >= 1 && value <= QUICK_TRANSFER_MAX_MAX_CLAIMS) draft.value.maxClaims = value
  }

  const submitSend = async () => {
    if (!canSend.value) {
      showSendGate.value = true
      return
    }
    fileError.value = ''
    if (!hasQuickShipContent(draft.value)) {
      fileError.value = '请至少添加一项内容'
      return
    }
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
    await quickTransfer.send(draft.value)
  }

  const retryUpload = () => {
    if (hasFailedUploadFiles.value) void quickTransfer.retryUpload(draft.value)
  }

  const retryComplete = () => {
    if (quickTransfer.canRetryComplete.value) void quickTransfer.retryComplete(draft.value)
  }

  const cancelSend = () => {
    if (quickTransfer.transferId.value) void quickTransfer.cancel()
  }

  const copyText = (value: string, successMessage: string) => {
    if (!value) return
    uni.setClipboardData({ data: value, success: () => uni.showToast({ title: successMessage, icon: 'none' }) })
  }

  const copyCode = () => copyText(quickTransfer.code.value, '收船码已复制')
  const copyShareUrl = () => copyText(shareUrl.value, '分享链接已复制')
  const copyReceivedText = () => copyText(receivedContent.value?.text || '', '留言已复制')
  const copyReceivedUrl = (url: string) => copyText(url, '链接已复制')

  const openReceivedUrl = (url: string) => {
    // #ifdef H5
    openQuickTransferBrowserUrl(url)
    // #endif
    // #ifdef MP-WEIXIN
    copyReceivedUrl(url)
    // #endif
  }

  const performReceive = async (input: { code?: string; shareToken?: string }): Promise<boolean> => {
    const success = await quickTransfer.receive(input)
    const transition = getQuickShipTransitionForReceive(success)
    if (transition) shipTransition.value = transition
    return success
  }

  const claim = async () => {
    if (shareToken.value) {
      await performReceive({ shareToken: shareToken.value })
      return
    }
    const code = normalizeQuickTransferCode(receiveCode.value)
    if (code.length === 6) await performReceive({ code })
  }

  const openReceivedContent = () => {
    if (quickTransfer.receiveState.value === 'received') isReceivedContentOpened.value = true
  }

  const retryReceive = () => {
    quickTransfer.resetReceive()
    isReceivedContentOpened.value = false
    if (shareToken.value) void quickTransfer.inspectShare(shareToken.value)
    else if (normalizeQuickTransferCode(receiveCode.value).length === 6)
      void performReceive({ code: normalizeQuickTransferCode(receiveCode.value) })
  }

  const dismissReceiveError = () => quickTransfer.clearReceiveError()

  const enterSend = () => {
    if (isModeSwitchLocked.value) return
    mode.value = 'send'
    showSendGate.value = !canSend.value
  }

  const enterReceive = () => {
    if (isModeSwitchLocked.value) return
    mode.value = 'receive'
    showSendGate.value = false
  }

  const goToLogin = () => {
    const redirectUrl = `${QUICK_TRANSFER_ROUTE}?mode=send`
    uni.navigateTo({ url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(redirectUrl)}` })
  }

  const resetToSend = async () => {
    if (quickTransfer.transferId.value && !['idle', 'consumed', 'expired', 'cancelled'].includes(quickTransfer.sendState.value)) {
      const cancelled = await quickTransfer.cancel()
      if (!cancelled) return
    }
    quickTransfer.resetSendResult(draft.value)
    draft.value = createQuickShipDraft()
    mode.value = 'send'
    showSendGate.value = !canSend.value
    isReceivedContentOpened.value = false
    shipTransition.value = null
  }

  const openReference = (reference: QuickTransferContentReference) => openQuickTransferReference(reference)

  const openReceiptList = () => {
    if (canViewReceipts.value) uni.navigateTo({ url: QUICK_TRANSFER_RECEIPTS_ROUTE })
  }

  onLoad(options => {
    const query = (options || {}) as QuickTransferPageQuery
    const parsed = parseQuickTransferPageQuery(query)
    const hasExplicitMode = query.mode === 'send' || query.mode === 'receive'
    mode.value = !hasExplicitMode && parsed.mode === 'send' && !isMiniProgram.value && !getToken() ? 'receive' : parsed.mode
    shareToken.value = parsed.shareToken
    isReceivedContentOpened.value = false
    shipTransition.value = null
    if (mode.value === 'send') draft.value.references.push(...consumeQuickShipReferences())
    refreshLoginState()
    if (shareToken.value) void quickTransfer.inspectShare(shareToken.value)
  })

  onShow(() => {
    refreshLoginState()
    quickTransfer.resumeTimers()
  })

  onHide(() => quickTransfer.pauseTimers())
  onUnload(() => quickTransfer.pauseTimers())
</script>

<template>
  <PageLayout
    title=""
    :share-title="sharePayload.title"
    :share-path="sharePath"
    :share-image-url="sharePayload.imageUrl"
    :share-timeline-title="QUICK_TRANSFER_TOOL_SHARE_TITLE"
    nav-overlay
    nav-bg-color="transparent"
    nav-init-bg-color="transparent"
    nav-custom-class="light">
    <view class="quick-transfer-page">
      <view class="hero-panel">
        <view class="hero-glow hero-glow--left"></view>
        <view class="hero-glow hero-glow--right"></view>
        <view class="hero-orbit hero-orbit--one"></view>
        <view class="hero-orbit hero-orbit--two"></view>
        <text class="hero-kicker">FAST TRANSFER</text>
        <text class="hero-title">飞船</text>
        <text class="hero-desc">{{ QUICK_TRANSFER_COPY.heroDescription }}</text>
        <view class="mode-tabs">
          <view class="mode-tab" :class="{ active: mode === 'send', locked: isModeSwitchLocked }" @click="enterSend"
            ><text>{{ QUICK_TRANSFER_COPY.sendTab }}</text></view
          >
          <view class="mode-tab" :class="{ active: mode === 'receive', locked: isModeSwitchLocked }" @click="enterReceive"
            ><text>{{ QUICK_TRANSFER_COPY.receiveTab }}</text></view
          >
        </view>
      </view>

      <view class="operation-sheet">
        <template v-if="mode === 'send'">
          <view v-if="showSendGate" class="gate-panel">
            <text class="gate-title">登录后才能发送</text>
            <text class="gate-desc">接收飞船不需要登录。</text>
            <view class="action-row">
              <button class="primary-button" @click="goToLogin">登录后发送</button>
              <button class="secondary-button" @click="enterReceive">去接收</button>
            </view>
          </view>

          <QuickShipSendResult
            v-else-if="isSendResultVisible"
            :state="quickTransfer.sendState.value"
            :title="senderStatusTitle"
            :description="senderStatusDescription"
            :code="quickTransfer.code.value"
            :countdown="quickTransfer.countdown.value"
            :claim-label="senderClaimLabel"
            :show-share-link="sharePayload.kind === 'transfer'"
            @copy-code="copyCode"
            @copy-share-url="copyShareUrl"
            @cancel="cancelSend"
            @reset="resetToSend" />

          <QuickShipSendForm
            v-else
            :draft="draft"
            :is-sending="isSending"
            :can-submit="canSubmit"
            :send-button-label="sendButtonLabel"
            :file-error="fileError"
            :send-error="sendErrorMessage"
            :upload-progress="quickTransfer.uploadProgress.value"
            :can-retry-upload="quickTransfer.canRetryUpload.value"
            :has-failed-upload-files="hasFailedUploadFiles"
            :can-retry-complete="quickTransfer.canRetryComplete.value"
            :max-file-count="MAX_QUICK_TRANSFER_FILE_COUNT"
            :ttl-options="QUICK_TRANSFER_TTL_OPTIONS"
            @update:text="updateDraftText"
            @update:expires-in="updateExpiresIn"
            @update:max-claims="updateMaxClaims"
            @add-link="openAddLink"
            @edit-link="openEditLink"
            @remove-link="removeLink"
            @add-file="openFileSourceSheet"
            @remove-file="removeFile"
            @remove-reference="removeReference"
            @submit="submitSend"
            @retry-upload="retryUpload"
            @retry-complete="retryComplete"
            @abandon="resetToSend" />
        </template>

        <template v-else>
          <view v-if="!shareToken && canViewReceipts" class="receipt-entry" @click="openReceiptList">
            <view class="receipt-entry__main">
              <text class="receipt-entry__title">已收飞船</text>
              <text class="receipt-entry__description">查看曾经收到的内容</text>
            </view>
            <text class="receipt-entry__arrow">›</text>
          </view>
          <QuickShipReceivePanel
            :share-token="shareToken"
            :receive-state="quickTransfer.receiveState.value"
            :inspect-result="quickTransfer.inspectResult.value"
            :receive-code="receiveCode"
            :is-receiving="isReceiving"
            :is-content-opened="isReceivedContentVisible"
            :has-receipt="Boolean(quickTransfer.receivedResult.value?.receiptId)"
            :summary-text="receiveSummaryText"
            :receive-error-message="receiveErrorMessage"
            :receive-error-title="receiveErrorTitle"
            :receive-error-description="receiveErrorDescription"
            :is-claim-token-error="isClaimTokenError"
            :is-receive-unavailable="isReceiveUnavailable"
            @update:receive-code="receiveCode = $event"
            @claim="claim"
            @open-content="openReceivedContent"
            @retry="retryReceive"
            @dismiss="dismissReceiveError" />
          <QuickShipReceivedContent
            v-if="isReceivedContentVisible && receivedContent"
            :content="receivedContent"
            :is-downloading="quickTransfer.isDownloading.value"
            @copy-text="copyReceivedText"
            @open-url="openReceivedUrl"
            @download-file="quickTransfer.downloadReceivedFile"
            @open-reference="openReference" />
        </template>
      </view>
    </view>

    <QuickShipTransition v-if="shipTransition" :type="shipTransition" @finished="shipTransition = null" />

    <view v-if="showFileSourceSheet" class="sheet-mask" @click="showFileSourceSheet = false">
      <view class="source-sheet" @click.stop>
        <text class="sheet-title">添加文件</text>
        <button class="primary-button full-button" @click="pickFiles('image')">选择图片</button>
        <button class="secondary-button full-button" @click="pickFiles('file')">选择文件</button>
        <button class="text-button full-button" @click="showFileSourceSheet = false">取消</button>
      </view>
    </view>

    <view v-if="linkEditor" class="sheet-mask" @click="linkEditor = null">
      <view class="source-sheet link-editor" @click.stop>
        <text class="sheet-title">{{ linkEditor.localId ? '修改链接' : '添加链接' }}</text>
        <text class="form-label">链接地址</text>
        <input v-model="linkEditor.url" class="text-input" placeholder="https://..." />
        <text class="form-label">显示名称（可选）</text>
        <input v-model="linkEditor.title" class="text-input" placeholder="项目地址" />
        <button class="primary-button full-button" @click="saveLink">{{ linkEditor.localId ? '保存' : '添加' }}</button>
        <button class="text-button full-button" @click="linkEditor = null">取消</button>
      </view>
    </view>
  </PageLayout>
</template>

<style lang="scss">
  .quick-transfer-page {
    min-height: 100vh;
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .hero-panel {
    position: relative;
    min-height: 400rpx;
    padding: 150rpx 34rpx 74rpx;
    overflow: hidden;
    box-sizing: border-box;
    color: #fff;
    background: linear-gradient(155deg, #071426 0%, #102b51 48%, #07566a 100%);
    text-align: center;
  }

  .hero-glow,
  .hero-orbit {
    position: absolute;
    pointer-events: none;
  }

  .hero-glow {
    width: 300rpx;
    height: 220rpx;
    border-radius: 50%;
    filter: blur(46rpx);
    opacity: 0.5;
  }

  .hero-glow--left {
    top: 88rpx;
    left: -110rpx;
    background: rgba(37, 99, 235, 0.68);
  }

  .hero-glow--right {
    right: -100rpx;
    bottom: 26rpx;
    background: rgba(20, 184, 166, 0.62);
  }

  .hero-orbit {
    width: 500rpx;
    height: 130rpx;
    border: 1rpx solid rgba(165, 243, 252, 0.22);
    border-radius: 50%;
    transform: rotate(-15deg);
  }

  .hero-orbit--one {
    top: 164rpx;
    left: -230rpx;
  }

  .hero-orbit--two {
    right: -230rpx;
    bottom: 76rpx;
    transform: rotate(22deg);
  }

  .hero-kicker,
  .hero-title,
  .hero-desc,
  .mode-tabs {
    position: relative;
    z-index: 1;
    display: block;
  }

  .hero-kicker {
    color: rgba(255, 255, 255, 0.62);
    font-size: 20rpx;
    font-weight: 700;
    letter-spacing: 5rpx;
  }

  .hero-title {
    margin-top: 14rpx;
    font-size: 66rpx;
    font-weight: 800;
    letter-spacing: 8rpx;
  }

  .hero-desc {
    margin-top: 8rpx;
    color: rgba(255, 255, 255, 0.8);
    font-size: 27rpx;
  }

  .mode-tabs {
    display: flex;
    gap: 8rpx;
    width: 100%;
    max-width: 520rpx;
    margin: 34rpx auto 0;
    padding: 8rpx;
    box-sizing: border-box;
    border: 1rpx solid rgba(255, 255, 255, 0.16);
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12rpx);
  }

  .mode-tab {
    flex: 1;
    padding: 18rpx 0;
    border-radius: 14rpx;
    color: rgba(255, 255, 255, 0.7);
    font-size: 27rpx;
  }

  .mode-tab.active {
    color: #10233d;
    background: #fff;
    box-shadow: 0 8rpx 20rpx rgba(1, 19, 46, 0.18);
    font-weight: 700;
  }

  .mode-tab.locked {
    opacity: 0.55;
  }

  .operation-sheet {
    position: relative;
    z-index: 2;
    min-height: calc(100vh - 364rpx);
    margin-top: -36rpx;
    padding: 38rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    border-radius: 38rpx 38rpx 0 0;
    background: var(--theme-bg);
  }

  .receipt-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18rpx;
    padding: 18rpx 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface);
  }

  .receipt-entry__main {
    min-width: 0;
  }

  .receipt-entry__title,
  .receipt-entry__description {
    display: block;
  }

  .receipt-entry__title {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .receipt-entry__description {
    margin-top: 5rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .receipt-entry__arrow {
    flex: 0 0 auto;
    color: var(--theme-text-secondary);
    font-size: 38rpx;
  }

  .gate-panel {
    padding: 28rpx 6rpx 16rpx;
    text-align: center;
  }

  .gate-title {
    display: block;
    color: var(--theme-text);
    font-size: 34rpx;
    font-weight: 700;
  }

  .gate-desc,
  .result-description {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 25rpx;
    line-height: 1.6;
  }

  .action-row {
    display: flex;
    gap: 14rpx;
    margin-top: 24rpx;
  }

  .action-row > button {
    flex: 1;
  }

  .primary-button,
  .secondary-button,
  .text-button {
    border: 0;
    border-radius: 16rpx;
    font-size: 26rpx;
  }

  .primary-button,
  .secondary-button {
    min-height: 82rpx;
    padding: 0 22rpx;
  }

  .primary-button {
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
  }

  .secondary-button {
    color: var(--theme-text);
    background: var(--theme-surface-muted);
  }

  .full-button {
    width: 100%;
    margin-top: 16rpx;
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

  .text-button {
    min-height: 70rpx;
    padding: 0;
    color: var(--theme-text-secondary);
    background: transparent;
  }
</style>
