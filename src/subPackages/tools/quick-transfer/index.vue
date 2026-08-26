<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
  import QuickShipVisual from './components/QuickShipVisual.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { filePicker, isFilePickerCancel } from '@/platform/file'
  import type { SelectedFile } from '@/platform/file'
  import { getToken } from '@/utils/storage'
  import { buildQuickTransferBrowserShareUrl } from '@/utilsH5/quick-transfer-share'
  import { openQuickTransferBrowserUrl } from '@/utilsH5/quick-transfer-url'
  import {
    MAX_QUICK_TRANSFER_FILE_COUNT,
    QUICK_TRANSFER_MAX_MAX_CLAIMS,
    QUICK_TRANSFER_MIN_MAX_CLAIMS,
    QUICK_TRANSFER_ROUTE,
    QUICK_TRANSFER_TITLE,
    QUICK_TRANSFER_TTL_OPTIONS,
  } from '@/features/quick-transfer/constants'
  import { getQuickTransferErrorMessage } from '@/features/quick-transfer/errors'
  import {
    buildQuickTransferSharePath,
    createQuickShipDraft,
    createQuickShipFileDraft,
    formatQuickTransferExpiry,
    formatQuickTransferFileSize,
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
    getQuickTransferFileStateLabel,
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
  } from '@/features/quick-transfer/types'
  import { getQuickShipVisualState, type QuickShipVisualState } from '@/features/quick-transfer/visual'

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

  // #ifdef MP-WEIXIN
  isMiniProgram.value = true
  // #endif

  const canSend = computed(() => isMiniProgram.value || isLoggedIn.value)
  const isSending = computed(() => ['creating', 'uploading', 'completing'].includes(quickTransfer.sendState.value))
  const isReceiving = computed(() => ['inspecting', 'resolving'].includes(quickTransfer.receiveState.value))
  const isSendResultVisible = computed(() => ['ready', 'consumed', 'expired', 'cancelled'].includes(quickTransfer.sendState.value))
  const sendErrorMessage = computed(() => quickTransfer.sendError.value?.message || '')
  const receiveErrorMessage = computed(() => quickTransfer.receiveError.value?.message || '')
  const sendButtonLabel = computed(() => getQuickTransferSendButtonLabel(quickTransfer.sendState.value, quickTransfer.uploadProgress.value))
  const canSubmit = computed(
    () =>
      canSend.value &&
      (!quickTransfer.transferId.value || quickTransfer.sendState.value === 'idle') &&
      hasQuickShipContent(draft.value) &&
      !validateQuickTransferFiles(draft.value.files),
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
    if (isReceiveUnavailable.value) {
      return '内容可能已经过期、被召回或已经领取完。'
    }
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
  const receivedText = computed(() => receivedContent.value?.text || '')
  const receivedLinks = computed(() => receivedContent.value?.links || [])
  const receivedFiles = computed(() => receivedContent.value?.files || [])
  const receivedReferences = computed(() => receivedContent.value?.references || [])
  const quickShipVisualState = computed<QuickShipVisualState>(() => {
    return getQuickShipVisualState(mode.value, quickTransfer.sendState.value, quickTransfer.receiveState.value)
  })
  const quickShipVisualCompact = computed(() => mode.value === 'receive' || isSendResultVisible.value)

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

  const decreaseMaxClaims = () => {
    draft.value.maxClaims = Math.max(QUICK_TRANSFER_MIN_MAX_CLAIMS, draft.value.maxClaims - 1)
  }

  const increaseMaxClaims = () => {
    draft.value.maxClaims = Math.min(QUICK_TRANSFER_MAX_MAX_CLAIMS, draft.value.maxClaims + 1)
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
      fileError.value = '收船次数需设置为 1～10 次'
      return
    }
    const fileLimitError = validateQuickTransferFiles(draft.value.files)
    if (fileLimitError) {
      fileError.value = fileLimitError
      return
    }
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
  const copyReceivedText = () => copyText(receivedText.value, '留言已复制')
  const copyReceivedUrl = (url: string) => copyText(url, '链接已复制')

  const openReceivedUrl = (url: string) => {
    // #ifdef H5
    openQuickTransferBrowserUrl(url)
    // #endif
    // #ifdef MP-WEIXIN
    copyReceivedUrl(url)
    // #endif
  }

  const claim = () => {
    if (shareToken.value) {
      void quickTransfer.receive({ shareToken: shareToken.value })
      return
    }
    const code = normalizeQuickTransferCode(receiveCode.value)
    if (code.length === 6) void quickTransfer.receive({ code })
  }

  const openReceivedContent = () => {
    if (quickTransfer.receiveState.value === 'received') isReceivedContentOpened.value = true
  }

  const retryReceive = () => {
    quickTransfer.resetReceive()
    isReceivedContentOpened.value = false
    if (shareToken.value) void quickTransfer.inspectShare(shareToken.value)
    else if (normalizeQuickTransferCode(receiveCode.value).length === 6)
      void quickTransfer.receive({ code: normalizeQuickTransferCode(receiveCode.value) })
  }

  const dismissReceiveError = () => quickTransfer.clearReceiveError()

  const enterSend = () => {
    mode.value = 'send'
    showSendGate.value = !canSend.value
  }

  const enterReceive = () => {
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
  }

  const openReference = (reference: QuickTransferContentReference) => openQuickTransferReference(reference)

  onLoad(options => {
    const query = (options || {}) as QuickTransferPageQuery
    const parsed = parseQuickTransferPageQuery(query)
    const hasExplicitMode = query.mode === 'send' || query.mode === 'receive'
    mode.value = !hasExplicitMode && parsed.mode === 'send' && !isMiniProgram.value && !getToken() ? 'receive' : parsed.mode
    shareToken.value = parsed.shareToken
    isReceivedContentOpened.value = false
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
    :title="QUICK_TRANSFER_TITLE"
    :share-title="sharePayload.title"
    :share-path="sharePath"
    :share-timeline-title="QUICK_TRANSFER_TOOL_SHARE_TITLE"
    :always-title="true">
    <view class="quick-transfer-page">
      <view class="hero-card">
        <text class="hero-title">飞船</text>
        <QuickShipVisual :state="quickShipVisualState" :compact="quickShipVisualCompact" />
        <text class="hero-desc">{{ QUICK_TRANSFER_COPY.heroDescription }}</text>
      </view>

      <view class="mode-tabs">
        <view class="mode-tab" :class="{ active: mode === 'send' }" @click="enterSend"><text>送船</text></view>
        <view class="mode-tab" :class="{ active: mode === 'receive' }" @click="enterReceive"><text>收船</text></view>
      </view>

      <view v-if="mode === 'send'" class="content-card">
        <view v-if="showSendGate" class="gate-panel">
          <text class="gate-title">登录后才能送船</text>
          <text class="gate-desc">收船不需要登录。</text>
          <view class="action-row">
            <button class="primary-button" @click="goToLogin">登录后送船</button>
            <button class="secondary-button" @click="enterReceive">去收船</button>
          </view>
        </view>

        <view v-else-if="isSendResultVisible" class="result-panel">
          <text v-if="quickTransfer.sendState.value === 'ready'" class="result-kicker">飞船出发了！</text>
          <text class="result-title">{{ senderStatusTitle }}</text>
          <text class="result-description">{{ senderStatusDescription }}</text>
          <template v-if="quickTransfer.sendState.value === 'ready'">
            <text class="result-label">收船码</text>
            <text class="ready-code" selectable>{{ quickTransfer.code.value }}</text>
            <text class="result-expiry">{{ quickTransfer.countdown.value }} 后返航</text>
            <text class="result-claims">{{ senderClaimLabel }}</text>
            <view class="action-row">
              <button class="primary-button" @click="copyCode">复制收船码</button>
              <!-- #ifdef H5 -->
              <button v-if="sharePayload.kind === 'transfer'" class="secondary-button" @click="copyShareUrl">复制分享链接</button>
              <!-- #endif -->
            </view>
            <!-- #ifdef MP-WEIXIN -->
            <button class="secondary-button full-button" open-type="share">分享给好友</button>
            <!-- #endif -->
            <view class="cancel-link" @click="cancelSend">召回飞船</view>
          </template>
          <button v-else class="secondary-button full-button" @click="resetToSend">再送一艘</button>
        </view>

        <template v-else>
          <view class="section-block">
            <view class="section-heading"><text class="section-title">留言</text><text class="section-hint">可选</text></view>
            <textarea v-model="draft.text" class="content-input" placeholder="留句话……" :maxlength="20000" auto-height />
          </view>

          <view class="section-block">
            <view class="section-heading"
              ><text class="section-title">链接</text><text class="section-hint">{{ draft.links.length }} 个</text></view
            >
            <view v-for="link in draft.links" :key="link.localId" class="item-row" @click="openEditLink(link)">
              <view class="item-main">
                <text class="item-title">{{ link.title || link.url }}</text>
                <text v-if="link.title" class="item-subtitle">{{ link.url }}</text>
              </view>
              <text class="item-arrow">›</text>
              <button class="remove-button" @click.stop="removeLink(link)">删除</button>
            </view>
            <button class="add-button" @click="openAddLink">＋ 添加链接</button>
          </view>

          <view class="section-block">
            <view class="section-heading"
              ><text class="section-title">文件</text
              ><text class="section-hint">{{ draft.files.length }} / {{ MAX_QUICK_TRANSFER_FILE_COUNT }}</text></view
            >
            <view v-for="file in draft.files" :key="file.clientFileId" class="item-row">
              <view class="file-badge">FILE</view>
              <view class="item-main">
                <text class="item-title">{{ file.name }}</text>
                <text class="item-subtitle">{{ formatQuickTransferFileSize(file.size) }} · {{ file.mimeType }}</text>
                <text v-if="isSending" class="item-status">{{ getQuickTransferFileStateLabel(file) }}</text>
              </view>
              <button v-if="!isSending" class="remove-button" @click="removeFile(file)">删除</button>
            </view>
            <button class="add-button" :disabled="isSending" @click="openFileSourceSheet">＋ 添加文件</button>
          </view>

          <view v-if="draft.references.length" class="section-block">
            <view class="section-heading"
              ><text class="section-title">引用</text><text class="section-hint">{{ draft.references.length }} 个</text></view
            >
            <view v-for="reference in draft.references" :key="reference.localId" class="item-row reference-row">
              <view class="reference-mark">↗</view>
              <view class="item-main"
                ><text class="item-title">{{ reference.title }}</text
                ><text v-if="reference.subtitle" class="item-subtitle">{{ reference.subtitle }}</text></view
              >
              <button
                v-if="!isSending"
                class="remove-button"
                @click="draft.references = draft.references.filter(item => item.localId !== reference.localId)"
                >删除</button
              >
            </view>
          </view>

          <view class="settings-block">
            <view class="setting-row"
              ><text>有效期</text
              ><text class="setting-value">{{ QUICK_TRANSFER_TTL_OPTIONS.find(item => item.value === draft.expiresIn)?.label }}</text></view
            >
            <view class="ttl-options">
              <view
                v-for="item in QUICK_TRANSFER_TTL_OPTIONS"
                :key="item.value"
                class="ttl-option"
                :class="{ active: draft.expiresIn === item.value }"
                @click="draft.expiresIn = item.value"
                ><text>{{ item.label }}</text></view
              >
            </view>
            <view class="setting-row"
              ><text>收船次数</text><text class="setting-value">{{ draft.maxClaims }} 次</text></view
            >
            <view class="stepper-row"
              ><button class="stepper-button" :disabled="draft.maxClaims <= QUICK_TRANSFER_MIN_MAX_CLAIMS" @click="decreaseMaxClaims"
                >−</button
              ><text>{{ draft.maxClaims }}</text
              ><button class="stepper-button" :disabled="draft.maxClaims >= QUICK_TRANSFER_MAX_MAX_CLAIMS" @click="increaseMaxClaims"
                >＋</button
              ></view
            >
          </view>

          <view v-if="fileError" class="inline-error">{{ fileError }}</view>
          <view v-if="sendErrorMessage" class="inline-error">{{ sendErrorMessage }}</view>
          <view v-if="quickTransfer.uploadProgress.value !== null && isSending" class="progress-bar"
            ><view class="progress-value" :style="{ width: `${quickTransfer.uploadProgress.value}%` }"></view
          ></view>
          <button class="primary-button submit-button" :disabled="isSending || !canSubmit" @click="submitSend">{{
            sendButtonLabel
          }}</button>
          <button
            v-if="quickTransfer.canRetryUpload.value && hasFailedUploadFiles"
            class="secondary-button full-button"
            :disabled="isSending"
            @click="retryUpload"
            >重新上传失败文件</button
          >
          <button
            v-if="quickTransfer.canRetryComplete.value"
            class="secondary-button full-button"
            :disabled="isSending"
            @click="retryComplete"
            >重新校验</button
          >
          <button
            v-if="quickTransfer.sendState.value === 'error' && quickTransfer.transferId.value"
            class="secondary-button full-button"
            :disabled="isSending"
            @click="resetToSend"
            >放弃本次飞船</button
          >
        </template>
      </view>

      <view v-else class="content-card receive-card">
        <view v-if="shareToken && quickTransfer.receiveState.value === 'inspecting'" class="receive-state-panel"
          ><text class="receive-title">正在确认飞船…</text></view
        >
        <view
          v-else-if="shareToken && quickTransfer.inspectResult.value && quickTransfer.receiveState.value !== 'received'"
          class="inspect-panel">
          <text class="receive-title">收到一艘飞船</text>
          <text class="receive-description">包含：{{ receiveSummaryText }}</text>
          <text class="receive-description"
            >还可收船 {{ quickTransfer.inspectResult.value.remainingClaims }} 次 ·
            {{ formatQuickTransferExpiry(quickTransfer.inspectResult.value.expiresAt) }}</text
          >
          <button class="primary-button full-button" :disabled="isReceiving" @click="claim">收船</button>
        </view>
        <view v-else-if="quickTransfer.receiveState.value === 'received' && !isReceivedContentVisible" class="arrived-panel">
          <text class="success-mark">✓</text><text class="receive-title">{{ QUICK_TRANSFER_COPY.receivedTitle }}</text>
          <text class="receive-description">{{ QUICK_TRANSFER_COPY.receivedDescription }}</text>
          <button class="primary-button full-button" @click="openReceivedContent">{{ QUICK_TRANSFER_COPY.openReceived }}</button>
        </view>
        <template v-else-if="!isReceivedContentVisible && !shareToken">
          <text class="receive-title">输入 6 位收船码</text>
          <input v-model="receiveCode" class="code-input" type="number" :maxlength="6" placeholder="000000" />
          <button
            class="primary-button submit-button"
            :disabled="isReceiving || normalizeQuickTransferCode(receiveCode).length !== 6"
            @click="claim"
            >{{ isReceiving ? QUICK_TRANSFER_COPY.receiveLoading : QUICK_TRANSFER_COPY.receiveButton }}</button
          >
        </template>

        <view v-if="receiveErrorMessage" class="receive-error-panel">
          <text class="receive-error-title">{{ receiveErrorTitle }}</text>
          <text class="receive-error-description">{{ receiveErrorDescription }}</text>
          <view v-if="isClaimTokenError" class="action-row">
            <button class="secondary-button" @click="dismissReceiveError">返回</button>
            <button class="primary-button" @click="retryReceive">重新收船</button>
          </view>
          <button v-else-if="!isReceiveUnavailable" class="secondary-button full-button" @click="retryReceive">重新尝试</button>
        </view>

        <view v-if="isReceivedContentVisible && receivedContent" class="received-content-panel">
          <text class="receive-title">飞船内容</text>
          <view v-if="receivedText" class="received-section"
            ><text class="section-title">留言</text><text class="received-text" selectable>{{ receivedText }}</text
            ><button class="secondary-button full-button" @click="copyReceivedText">复制留言</button></view
          >
          <view v-if="receivedLinks.length" class="received-section"
            ><text class="section-title">链接</text
            ><view v-for="link in receivedLinks" :key="link.url" class="item-row" @click="openReceivedUrl(link.url)"
              ><view class="item-main"
                ><text class="item-title">{{ link.title || link.url }}</text
                ><text v-if="link.title" class="item-subtitle">{{ link.url }}</text></view
              ><text class="item-arrow">›</text></view
            ></view
          >
          <view v-if="receivedFiles.length" class="received-section"
            ><text class="section-title">文件</text
            ><view v-for="file in receivedFiles" :key="file.fileId || file.name" class="item-row"
              ><view class="file-badge">FILE</view
              ><view class="item-main"
                ><text class="item-title">{{ file.name }}</text
                ><text class="item-subtitle">{{ formatQuickTransferFileSize(file.size) }} · {{ file.mimeType }}</text></view
              ><button
                class="primary-small-button"
                :disabled="quickTransfer.isDownloading.value"
                @click="quickTransfer.downloadReceivedFile(file.fileId || '')"
                >{{ file.mimeType.startsWith('image/') ? '预览' : '打开' }}</button
              ></view
            ></view
          >
          <view v-if="receivedReferences.length" class="received-section"
            ><text class="section-title">引用</text
            ><view
              v-for="reference in receivedReferences"
              :key="`${reference.type}-${reference.resourceId || reference.title}`"
              class="item-row"
              @click="openReference(reference)"
              ><view class="reference-mark">↗</view
              ><view class="item-main"
                ><text class="item-title">{{ reference.title }}</text
                ><text v-if="reference.subtitle" class="item-subtitle">{{ reference.subtitle }}</text></view
              ><text class="item-arrow">›</text></view
            ></view
          >
        </view>
      </view>
    </view>

    <view v-if="showFileSourceSheet" class="sheet-mask" @click="showFileSourceSheet = false">
      <view class="source-sheet" @click.stop
        ><text class="sheet-title">添加文件</text><button class="primary-button full-button" @click="pickFiles('image')">选择图片</button
        ><button class="secondary-button full-button" @click="pickFiles('file')">选择文件</button
        ><button class="text-button full-button" @click="showFileSourceSheet = false">取消</button></view
      >
    </view>

    <view v-if="linkEditor" class="sheet-mask" @click="linkEditor = null">
      <view class="source-sheet link-editor" @click.stop
        ><text class="sheet-title">{{ linkEditor.localId ? '修改链接' : '添加链接' }}</text
        ><text class="form-label">链接地址</text><input v-model="linkEditor.url" class="text-input" placeholder="https://..." /><text
          class="form-label"
          >显示名称（可选）</text
        ><input v-model="linkEditor.title" class="text-input" placeholder="项目地址" /><button
          class="primary-button full-button"
          @click="saveLink"
          >{{ linkEditor.localId ? '保存' : '添加' }}</button
        ><button class="text-button full-button" @click="linkEditor = null">取消</button></view
      >
    </view>
  </PageLayout>
</template>

<style lang="scss">
  .quick-transfer-page {
    min-height: 100vh;
    padding: 28rpx 24rpx 60rpx;
    box-sizing: border-box;
    background: var(--theme-bg);
  }
  .hero-card,
  .content-card {
    border: 1rpx solid var(--theme-border);
    border-radius: 28rpx;
    background: var(--theme-surface);
    box-shadow: 0 16rpx 48rpx var(--theme-shadow-xs);
  }
  .hero-card {
    padding: 42rpx 34rpx 38rpx;
    background: linear-gradient(145deg, var(--theme-surface), var(--theme-surface-muted));
  }
  .hero-kicker {
    display: block;
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 700;
    letter-spacing: 4rpx;
  }
  .hero-title {
    display: block;
    margin-top: 14rpx;
    color: var(--theme-text);
    font-size: 58rpx;
    font-weight: 800;
  }
  .hero-desc,
  .gate-desc,
  .receive-description,
  .result-description,
  .receive-error-description {
    display: block;
    margin-top: 14rpx;
    color: var(--theme-text-secondary);
    font-size: 26rpx;
    line-height: 1.6;
  }
  .mode-tabs {
    display: flex;
    margin: 24rpx 0;
    padding: 8rpx;
    border-radius: 20rpx;
    background: var(--theme-surface-muted);
  }
  .mode-tab {
    flex: 1;
    padding: 20rpx 0;
    border-radius: 14rpx;
    color: var(--theme-text-secondary);
    text-align: center;
    font-size: 28rpx;
  }
  .mode-tab.active {
    color: var(--theme-text);
    background: var(--theme-surface);
    box-shadow: 0 6rpx 20rpx var(--theme-shadow-xs);
    font-weight: 700;
  }
  .content-card {
    padding: 30rpx;
  }
  .section-block,
  .settings-block,
  .received-section {
    padding: 28rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }
  .section-block:first-child {
    padding-top: 0;
  }
  .section-heading,
  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .section-title,
  .setting-row {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }
  .section-hint,
  .setting-value {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 400;
  }
  .content-input {
    width: 100%;
    min-height: 140rpx;
    margin-top: 18rpx;
    padding: 20rpx;
    box-sizing: border-box;
    border-radius: 16rpx;
    background: var(--theme-surface-muted);
    color: var(--theme-text);
    font-size: 28rpx;
    line-height: 1.6;
  }
  .item-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    min-height: 90rpx;
    padding: 14rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }
  .item-main {
    flex: 1;
    min-width: 0;
  }
  .item-title,
  .item-subtitle,
  .item-status {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item-title {
    color: var(--theme-text);
    font-size: 28rpx;
  }
  .item-subtitle,
  .item-status {
    margin-top: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }
  .item-status {
    color: var(--theme-brand);
  }
  .item-arrow {
    color: var(--theme-text-secondary);
    font-size: 42rpx;
  }
  .file-badge,
  .reference-mark {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68rpx;
    height: 68rpx;
    border-radius: 16rpx;
    color: var(--theme-brand);
    background: var(--theme-surface-muted);
    font-size: 18rpx;
    font-weight: 700;
  }
  .reference-mark {
    font-size: 34rpx;
  }
  .remove-button,
  .text-button {
    padding: 0;
    border: 0;
    color: var(--theme-danger);
    background: transparent;
    font-size: 24rpx;
    line-height: 1.5;
  }
  .text-button {
    color: var(--theme-text-secondary);
  }
  .add-button,
  .secondary-button,
  .primary-button,
  .primary-small-button {
    border: 0;
    border-radius: 14rpx;
    font-size: 26rpx;
  }
  .add-button {
    width: 100%;
    margin-top: 18rpx;
    padding: 20rpx;
    color: var(--theme-brand);
    background: var(--theme-surface-muted);
  }
  .primary-button,
  .secondary-button {
    min-height: 82rpx;
    padding: 0 24rpx;
  }
  .primary-button {
    color: #fff;
    background: var(--theme-brand);
  }
  .secondary-button {
    color: var(--theme-text);
    background: var(--theme-surface-muted);
  }
  .primary-small-button {
    flex: 0 0 auto;
    padding: 14rpx 18rpx;
    color: #fff;
    background: var(--theme-brand);
  }
  .full-button {
    width: 100%;
    margin-top: 18rpx;
  }
  button[disabled] {
    opacity: 0.45;
  }
  .settings-block {
    border-bottom: 0;
  }
  .ttl-options {
    display: flex;
    gap: 12rpx;
    margin-top: 18rpx;
  }
  .ttl-option {
    flex: 1;
    padding: 18rpx 8rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 12rpx;
    color: var(--theme-text-secondary);
    text-align: center;
    font-size: 24rpx;
  }
  .ttl-option.active {
    border-color: var(--theme-brand);
    color: var(--theme-brand);
    background: var(--theme-surface-muted);
  }
  .stepper-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 24rpx;
    margin-top: 18rpx;
    color: var(--theme-text);
    font-size: 30rpx;
  }
  .stepper-button {
    width: 64rpx;
    height: 64rpx;
    padding: 0;
    border: 1rpx solid var(--theme-border);
    border-radius: 12rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
    line-height: 64rpx;
  }
  .inline-error,
  .receive-error-panel {
    margin-top: 20rpx;
    padding: 18rpx;
    border-radius: 14rpx;
    color: var(--theme-danger);
    background: rgba(220, 80, 80, 0.1);
    font-size: 24rpx;
    line-height: 1.5;
  }
  .submit-button {
    width: 100%;
    margin-top: 24rpx;
  }
  .progress-bar {
    height: 10rpx;
    margin-top: 24rpx;
    overflow: hidden;
    border-radius: 10rpx;
    background: var(--theme-surface-muted);
  }
  .progress-value {
    height: 100%;
    border-radius: inherit;
    background: var(--theme-brand);
    transition: width 0.2s ease;
  }
  .gate-panel,
  .result-panel,
  .receive-state-panel,
  .inspect-panel,
  .arrived-panel,
  .received-content-panel {
    padding: 12rpx 0;
    text-align: center;
  }
  .gate-title,
  .receive-title,
  .result-title {
    display: block;
    color: var(--theme-text);
    font-size: 34rpx;
    font-weight: 700;
  }
  .result-kicker {
    display: block;
    color: var(--theme-brand);
    font-size: 28rpx;
    font-weight: 700;
  }
  .result-title {
    margin-top: 12rpx;
  }
  .result-label {
    display: block;
    margin-top: 28rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }
  .ready-code {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-brand);
    font-size: 64rpx;
    font-weight: 800;
    letter-spacing: 10rpx;
  }
  .result-expiry,
  .result-claims {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }
  .action-row {
    display: flex;
    gap: 16rpx;
    margin-top: 24rpx;
  }
  .action-row > button {
    flex: 1;
  }
  .cancel-link {
    margin-top: 26rpx;
    color: var(--theme-danger);
    font-size: 24rpx;
  }
  .receive-card {
    min-height: 520rpx;
  }
  .code-input,
  .text-input {
    width: 100%;
    height: 86rpx;
    margin-top: 26rpx;
    padding: 0 22rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
    font-size: 32rpx;
  }
  .code-input {
    text-align: center;
    letter-spacing: 10rpx;
  }
  .success-mark {
    display: block;
    color: var(--theme-brand);
    font-size: 72rpx;
    font-weight: 800;
  }
  .received-content-panel {
    text-align: left;
  }
  .received-content-panel > .receive-title {
    text-align: center;
  }
  .received-section {
    text-align: left;
  }
  .received-section:last-child {
    border-bottom: 0;
  }
  .received-text {
    display: block;
    margin-top: 16rpx;
    padding: 20rpx;
    border-radius: 14rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
    font-size: 28rpx;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .receive-error-title {
    display: block;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }
  .form-label,
  .sheet-title {
    display: block;
    margin-top: 22rpx;
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 700;
  }
  .sheet-mask {
    position: fixed;
    z-index: 20;
    inset: 0;
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
  .sheet-title {
    margin: 0 0 18rpx;
    font-size: 32rpx;
  }
  .link-editor .text-input {
    margin-top: 12rpx;
  }
</style>
