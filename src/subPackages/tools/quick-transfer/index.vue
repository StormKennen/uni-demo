<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import { filePicker, isFilePickerCancel } from '@/platform/file'
  import { getToken } from '@/utils/storage'
  import { buildQuickTransferBrowserShareUrl } from '@/utilsH5/quick-transfer-share'
  import { openQuickTransferBrowserUrl } from '@/utilsH5/quick-transfer-url'
  import { QUICK_TRANSFER_ROUTE, QUICK_TRANSFER_TITLE, QUICK_TRANSFER_TTL_OPTIONS } from '@/features/quick-transfer/constants'
  import { getQuickTransferErrorMessage } from '@/features/quick-transfer/errors'
  import {
    buildQuickTransferSharePath,
    canSendQuickTransfer,
    createQuickTransferFileMetadata,
    formatQuickTransferFileSize,
    getQuickTransferTypeLabel,
    isValidQuickTransferUrl,
    normalizeQuickTransferCode,
    parseQuickTransferPageQuery,
    validateQuickTransferFile,
  } from '@/features/quick-transfer/helpers'
  import { useQuickTransfer } from '@/features/quick-transfer/useQuickTransfer'
  import { getQuickTransferSharePayload, QUICK_TRANSFER_TOOL_SHARE_TITLE } from '@/features/quick-transfer/share'
  import type { QuickTransferPageQuery, QuickTransferSelectedFile } from '@/features/quick-transfer/types'

  const quickTransfer = useQuickTransfer()
  const mode = ref<'send' | 'receive'>('send')
  const isMiniProgram = ref(false)
  const isLoggedIn = ref(false)
  const selectedType = ref<'text' | 'url' | 'file'>('file')
  const selectedTtl = ref<(typeof QUICK_TRANSFER_TTL_OPTIONS)[number]['value']>(600)
  const textContent = ref('')
  const urlContent = ref('')
  const selectedFile = ref<QuickTransferSelectedFile | null>(null)
  const receiveCode = ref('')
  const shareToken = ref('')
  const showShareConfirm = ref(false)
  const showSendGate = ref(false)
  const fileError = ref('')

  // #ifdef MP-WEIXIN
  isMiniProgram.value = true
  // #endif

  const canSend = computed(() => canSendQuickTransfer(isMiniProgram.value, isLoggedIn.value))
  const isSending = computed(() => ['creating', 'uploading', 'completing'].includes(quickTransfer.sendState.value))
  const isReceiving = computed(() => quickTransfer.receiveState.value === 'resolving')
  const sendButtonLabel = computed(() => {
    if (quickTransfer.sendState.value === 'creating') return '创建中…'
    if (quickTransfer.sendState.value === 'uploading') {
      return quickTransfer.uploadProgress.value === null ? '正在上传文件…' : `正在上传 ${quickTransfer.uploadProgress.value}%`
    }
    if (quickTransfer.sendState.value === 'completing') return '校验中…'
    return '生成提取码'
  })
  const sharePayload = computed(() =>
    getQuickTransferSharePayload({
      mode: mode.value,
      sendState: quickTransfer.sendState.value,
      shareToken: quickTransfer.shareToken.value,
      expiresAt: quickTransfer.expiresAt.value,
    }),
  )
  const sharePath = computed(() => {
    return sharePayload.value.path
  })
  const shareUrl = computed(() => {
    if (sharePayload.value.kind !== 'transfer') return ''
    const token = quickTransfer.shareToken.value
    if (!token) return ''
    let url = buildQuickTransferSharePath(token)
    // #ifdef H5
    url = buildQuickTransferBrowserShareUrl(token)
    // #endif
    return url
  })
  const receiveErrorMessage = computed(() => quickTransfer.receiveError.value?.message || '')
  const sendErrorMessage = computed(() => quickTransfer.sendError.value?.message || '')
  const receivedFile = computed(() => quickTransfer.receivedResult.value?.file || null)
  const receivedText = computed(() => quickTransfer.receivedResult.value?.text || '')
  const receivedUrl = computed(() => quickTransfer.receivedResult.value?.url || '')

  const refreshLoginState = () => {
    isLoggedIn.value = Boolean(getToken())
  }

  const readFileSize = (path: string): Promise<number> =>
    new Promise((resolve, reject) => {
      uni.getFileInfo({ filePath: path, success: result => resolve(result.size), fail: reject })
    })

  const pickQuickTransferFile = async () => {
    if (isSending.value) return
    fileError.value = ''
    try {
      const [file] = await filePicker.pickFile({ count: 1, type: 'all' })
      if (!file) return
      const size = file.size ?? (file.path ? await readFileSize(file.path) : undefined)
      const sizeError = validateQuickTransferFile(size)
      if (sizeError) {
        fileError.value = sizeError
        return
      }
      selectedFile.value = {
        ...file,
        size,
        mimeType: createQuickTransferFileMetadata(file.name, size, file.type).mimeType,
      }
    } catch (error) {
      if (!isFilePickerCancel(error)) fileError.value = getQuickTransferErrorMessage(error, '选择文件失败，请重试')
    }
  }

  const clearSelectedFile = () => {
    if (isSending.value) return
    selectedFile.value = null
    fileError.value = ''
  }

  const submitSend = async () => {
    if (!canSend.value) {
      showSendGate.value = true
      return
    }
    fileError.value = ''
    if (selectedType.value === 'text' && !textContent.value.trim()) {
      fileError.value = '请输入要发送的文本'
      return
    }
    if (selectedType.value === 'url' && !isValidQuickTransferUrl(urlContent.value)) {
      fileError.value = '请输入 http:// 或 https:// 开头的链接'
      return
    }
    if (selectedType.value === 'file' && !selectedFile.value) {
      fileError.value = '请先选择一个文件'
      return
    }

    const file = selectedFile.value
    const payload =
      selectedType.value === 'text'
        ? { type: 'text' as const, text: textContent.value.trim(), expiresIn: selectedTtl.value }
        : selectedType.value === 'url'
          ? { type: 'url' as const, url: urlContent.value.trim(), expiresIn: selectedTtl.value }
          : {
              type: 'file' as const,
              file: file ? { name: file.name, size: file.size || 0, mimeType: file.mimeType } : undefined,
              expiresIn: selectedTtl.value,
            }

    await quickTransfer.send(payload, file || undefined)
  }

  const retryComplete = () => {
    if (quickTransfer.canRetryComplete.value) void quickTransfer.complete()
  }

  const cancelSend = () => {
    if (quickTransfer.transferId.value) void quickTransfer.cancel()
  }

  const copyText = (value: string, successMessage: string) => {
    if (!value) return
    uni.setClipboardData({ data: value, success: () => uni.showToast({ title: successMessage, icon: 'none' }) })
  }

  const copyCode = () => copyText(quickTransfer.code.value, '提取码已复制')
  const copyShareUrl = () => copyText(shareUrl.value, '分享链接已复制')
  const copyReceivedText = () => copyText(receivedText.value, '文本已复制')
  const copyReceivedUrl = () => copyText(receivedUrl.value, '链接已复制')

  const openReceivedUrl = () => {
    if (!receivedUrl.value) return
    // #ifdef H5
    openQuickTransferBrowserUrl(receivedUrl.value)
    // #endif
    // #ifdef MP-WEIXIN
    copyReceivedUrl()
    // #endif
  }

  const claim = () => {
    if (shareToken.value) {
      showShareConfirm.value = false
      void quickTransfer.receive({ shareToken: shareToken.value })
      return
    }
    if (normalizeQuickTransferCode(receiveCode.value).length !== 6) {
      return
    }
    void quickTransfer.receive({ code: normalizeQuickTransferCode(receiveCode.value) })
  }

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

  const resetToSend = () => {
    quickTransfer.resetSendResult()
    mode.value = 'send'
  }

  onLoad(options => {
    const query = (options || {}) as QuickTransferPageQuery
    const parsed = parseQuickTransferPageQuery(query)
    mode.value = parsed.mode
    shareToken.value = parsed.shareToken
    showShareConfirm.value = Boolean(parsed.shareToken)
    refreshLoginState()
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
        <view class="hero-kicker">QUICK TRANSFER</view>
        <text class="hero-title">临时、跨设备、无需接收方登录</text>
        <text class="hero-desc">文本、链接、文件，换个设备继续用。</text>
      </view>

      <view class="mode-tabs">
        <view class="mode-tab" :class="{ active: mode === 'send' }" @click="enterSend">
          <text>我要发送</text>
        </view>
        <view class="mode-tab" :class="{ active: mode === 'receive' }" @click="enterReceive">
          <text>我要接收</text>
        </view>
      </view>

      <view v-if="mode === 'send'" class="content-card">
        <view v-if="showSendGate" class="gate-panel">
          <text class="gate-title">网页端发送目前需要登录</text>
          <text class="gate-desc">接收不需要登录；使用微信小程序则无需登录即可发送。</text>
          <view class="action-row">
            <button class="primary-button" @click="goToLogin">登录后发送</button>
            <button class="secondary-button" @click="enterReceive">继续接收</button>
          </view>
        </view>

        <template v-else>
          <view class="type-tabs">
            <view
              v-for="item in ['text', 'url', 'file']"
              :key="item"
              class="type-tab"
              :class="{ active: selectedType === item }"
              @click="selectedType = item as 'text' | 'url' | 'file'">
              <text>{{ getQuickTransferTypeLabel(item as 'text' | 'url' | 'file') }}</text>
            </view>
          </view>

          <view v-if="selectedType === 'text'" class="field-block">
            <view class="field-label"
              ><text>文本内容</text><text class="field-count">{{ textContent.length }} 字</text></view
            >
            <textarea v-model="textContent" class="content-input" placeholder="输入临时传输的文本内容" :maxlength="20000" auto-height />
          </view>

          <view v-if="selectedType === 'url'" class="field-block">
            <view class="field-label"><text>链接地址</text></view>
            <input v-model="urlContent" class="text-input" placeholder="https://example.com" :maxlength="2000" />
          </view>

          <view v-if="selectedType === 'file'" class="field-block">
            <view v-if="!selectedFile" class="file-picker" @click="pickQuickTransferFile">
              <text class="file-picker-icon">＋</text>
              <text class="file-picker-title">选择要传送的文件</text>
              <text class="file-picker-desc">单个文件最大 50 MiB</text>
            </view>
            <view v-else class="file-preview">
              <view class="file-icon">FILE</view>
              <view class="file-info">
                <text class="file-name">{{ selectedFile.name }}</text>
                <text class="file-meta">{{ formatQuickTransferFileSize(selectedFile.size || 0) }} · {{ selectedFile.mimeType }}</text>
              </view>
              <button class="text-button" @click="clearSelectedFile">移除</button>
            </view>
            <view v-if="selectedFile" class="change-file" @click="pickQuickTransferFile">重新选择</view>
          </view>

          <view class="ttl-block">
            <view class="field-label"><text>有效期</text><text class="field-hint">领取后即失效</text></view>
            <view class="ttl-options">
              <view
                v-for="item in QUICK_TRANSFER_TTL_OPTIONS"
                :key="item.value"
                class="ttl-option"
                :class="{ active: selectedTtl === item.value }"
                @click="selectedTtl = item.value">
                <text>{{ item.label }}</text>
              </view>
            </view>
          </view>

          <view v-if="fileError" class="inline-error">{{ fileError }}</view>
          <view v-if="sendErrorMessage" class="inline-error">{{ sendErrorMessage }}</view>

          <button class="primary-button submit-button" :disabled="isSending" @click="submitSend">{{ sendButtonLabel }}</button>
          <button v-if="quickTransfer.canRetryComplete" class="secondary-button full-button" :disabled="isSending" @click="retryComplete"
            >重新校验</button
          >
        </template>

        <view v-if="quickTransfer.sendState.value === 'ready' || quickTransfer.sendState.value === 'consumed'" class="ready-panel">
          <text class="ready-label">提取码</text>
          <text class="ready-code" selectable>{{ quickTransfer.code.value }}</text>
          <text v-if="quickTransfer.sendState.value === 'ready'" class="ready-expiry">{{ quickTransfer.countdown.value }} 后失效</text>
          <text v-if="quickTransfer.sendState.value === 'consumed'" class="consumed-label">✓ 对方已领取</text>
          <view class="action-row">
            <button class="primary-button" @click="copyCode">复制提取码</button>
            <button v-if="sharePayload.kind === 'transfer'" class="secondary-button" @click="copyShareUrl">复制分享链接</button>
          </view>
          <!-- #ifdef MP-WEIXIN -->
          <button v-if="sharePayload.kind === 'transfer'" class="secondary-button full-button" open-type="share">分享给好友</button>
          <!-- #endif -->
          <view v-if="quickTransfer.sendState.value === 'ready'" class="cancel-link" @click="cancelSend">取消快传</view>
          <view class="change-file" @click="resetToSend">发送新的内容</view>
        </view>
      </view>

      <view v-else class="content-card receive-card">
        <view v-if="showShareConfirm" class="share-confirm-panel">
          <text class="share-confirm-title">收到一个临时快传</text>
          <text class="share-confirm-desc">该内容仅可领取一次，确认后将立即消费。</text>
          <button class="primary-button" :disabled="isReceiving" @click="claim">确认领取</button>
        </view>
        <template v-else-if="quickTransfer.receiveState.value !== 'received'">
          <text class="receive-title">请输入 6 位提取码</text>
          <input
            v-model="receiveCode"
            class="code-input"
            type="number"
            :maxlength="6"
            placeholder="000000"
            @input="receiveCode = normalizeQuickTransferCode(receiveCode)" />
          <button
            class="primary-button submit-button"
            :disabled="isReceiving || normalizeQuickTransferCode(receiveCode).length !== 6"
            @click="claim"
            >{{ isReceiving ? '领取中…' : '领取内容' }}</button
          >
          <view v-if="receiveErrorMessage" class="inline-error">{{ receiveErrorMessage }}</view>
        </template>

        <view v-if="quickTransfer.receiveState.value === 'received'" class="received-panel">
          <view class="received-heading"><text class="success-mark">✓</text><text>领取成功</text></view>
          <view v-if="receivedText" class="received-content">
            <text class="received-type">收到文本</text>
            <text class="received-text" selectable>{{ receivedText }}</text>
            <button class="secondary-button full-button" @click="copyReceivedText">复制全部</button>
          </view>
          <view v-if="receivedUrl" class="received-content">
            <text class="received-type">收到链接</text>
            <text class="received-url" selectable>{{ receivedUrl }}</text>
            <view class="action-row">
              <button class="secondary-button" @click="copyReceivedUrl">复制链接</button>
              <button class="primary-button" @click="openReceivedUrl">打开链接</button>
            </view>
          </view>
          <view v-if="receivedFile" class="received-content">
            <text class="received-type">文件已领取</text>
            <text class="file-name">{{ receivedFile.name }}</text>
            <text class="file-meta">{{ formatQuickTransferFileSize(receivedFile.size) }} · {{ receivedFile.mimeType }}</text>
            <button
              class="primary-button full-button"
              :disabled="quickTransfer.isDownloading.value"
              @click="quickTransfer.downloadReceivedFile"
              >{{ quickTransfer.isDownloading.value ? '下载中…' : '重新下载' }}</button
            >
          </view>
          <view v-if="receiveErrorMessage" class="inline-error">{{ receiveErrorMessage }}</view>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<style lang="scss" scoped>
  .quick-transfer-page {
    min-height: 100vh;
    padding: 24rpx 24rpx 60rpx;
    background: var(--theme-bg);
    box-sizing: border-box;
  }

  .hero-card,
  .content-card {
    border: 1rpx solid var(--theme-border);
    border-radius: 28rpx;
    background: var(--theme-surface);
    box-shadow: 0 12rpx 32rpx var(--theme-shadow-xs);
  }

  .hero-card {
    padding: 34rpx 30rpx;
    background: linear-gradient(135deg, var(--theme-brand), var(--theme-brand));
  }

  .hero-kicker {
    color: var(--theme-surface);
    font-size: 20rpx;
    letter-spacing: 4rpx;
    opacity: 0.78;
  }

  .hero-title,
  .hero-desc {
    display: block;
    color: var(--theme-surface);
  }

  .hero-title {
    margin-top: 16rpx;
    font-size: 38rpx;
    font-weight: 700;
    line-height: 1.4;
  }

  .hero-desc {
    margin-top: 10rpx;
    font-size: 26rpx;
    opacity: 0.84;
  }

  .mode-tabs,
  .type-tabs {
    display: flex;
    gap: 16rpx;
  }

  .mode-tabs {
    margin: 24rpx 0 16rpx;
    padding: 8rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-muted);
  }

  .mode-tab,
  .type-tab {
    flex: 1;
    padding: 20rpx 12rpx;
    border-radius: 14rpx;
    color: var(--theme-text-secondary);
    text-align: center;
    font-size: 28rpx;
  }

  .mode-tab.active,
  .type-tab.active,
  .ttl-option.active {
    color: var(--theme-brand);
    background: var(--theme-surface-2);
    font-weight: 600;
  }

  .content-card {
    padding: 28rpx;
  }

  .type-tabs {
    margin-bottom: 30rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .type-tab {
    padding: 16rpx 8rpx;
    border-radius: 12rpx 12rpx 0 0;
  }

  .field-block,
  .ttl-block {
    margin-bottom: 26rpx;
  }

  .field-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12rpx;
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 600;
  }

  .field-count,
  .field-hint,
  .file-meta {
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
    font-weight: 400;
  }

  .content-input,
  .text-input,
  .code-input {
    width: 100%;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-muted);
    color: var(--theme-text);
  }

  .content-input {
    min-height: 220rpx;
    padding: 22rpx;
    line-height: 1.6;
  }

  .text-input {
    height: 92rpx;
    padding: 0 22rpx;
  }

  .file-picker {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 54rpx 24rpx;
    border: 2rpx dashed var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-muted);
  }

  .file-picker-icon {
    color: var(--theme-brand);
    font-size: 58rpx;
    line-height: 1;
  }

  .file-picker-title,
  .file-picker-desc,
  .gate-title,
  .gate-desc,
  .share-confirm-title,
  .share-confirm-desc,
  .receive-title,
  .received-type,
  .received-text,
  .received-url,
  .file-name {
    display: block;
  }

  .file-picker-title,
  .gate-title,
  .share-confirm-title,
  .receive-title {
    margin-top: 14rpx;
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 600;
  }

  .file-picker-desc,
  .gate-desc,
  .share-confirm-desc {
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.6;
  }

  .file-preview {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 22rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-muted);
  }

  .file-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 76rpx;
    height: 76rpx;
    border-radius: 16rpx;
    color: var(--theme-brand);
    background: var(--theme-surface-2);
    font-size: 18rpx;
    font-weight: 700;
  }

  .file-info {
    flex: 1;
    min-width: 0;
  }

  .file-name {
    overflow: hidden;
    color: var(--theme-text);
    font-size: 27rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-meta {
    display: block;
    margin-top: 8rpx;
  }

  .change-file,
  .cancel-link {
    margin-top: 14rpx;
    color: var(--theme-brand);
    font-size: 25rpx;
    text-align: center;
  }

  .ttl-options {
    display: flex;
    gap: 12rpx;
  }

  .ttl-option {
    flex: 1;
    padding: 18rpx 8rpx;
    border-radius: 14rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
    font-size: 24rpx;
    text-align: center;
  }

  .primary-button,
  .secondary-button {
    min-width: 0;
    margin: 0;
    padding: 0 22rpx;
    border-radius: 14rpx;
    font-size: 26rpx;
    line-height: 80rpx;
  }

  .primary-button {
    color: var(--theme-surface);
    background: var(--theme-brand);
  }

  .secondary-button {
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
  }

  .primary-button::after,
  .secondary-button::after {
    border: 0;
  }

  .primary-button[disabled] {
    opacity: 0.55;
  }

  .submit-button,
  .full-button {
    width: 100%;
    margin-top: 20rpx;
  }

  .text-button {
    padding: 0;
    border: 0;
    color: var(--theme-brand);
    background: transparent;
    font-size: 24rpx;
  }

  .text-button::after {
    border: 0;
  }

  .inline-error {
    margin: 14rpx 0;
    padding: 16rpx 18rpx;
    border-radius: 12rpx;
    color: var(--theme-brand);
    background: var(--theme-surface-2);
    font-size: 24rpx;
    line-height: 1.5;
  }

  .gate-panel,
  .share-confirm-panel {
    text-align: center;
  }

  .gate-panel .action-row,
  .share-confirm-panel .primary-button {
    margin-top: 28rpx;
  }

  .action-row {
    display: flex;
    gap: 16rpx;
  }

  .action-row > button {
    flex: 1;
  }

  .ready-panel,
  .received-panel {
    margin-top: 30rpx;
    padding-top: 28rpx;
    border-top: 1rpx solid var(--theme-border);
    text-align: center;
  }

  .ready-label,
  .ready-expiry,
  .consumed-label {
    display: block;
    color: var(--theme-text-secondary);
    font-size: 25rpx;
  }

  .ready-code {
    display: block;
    margin: 12rpx 0;
    color: var(--theme-brand);
    font-size: 72rpx;
    font-weight: 700;
    letter-spacing: 12rpx;
  }

  .consumed-label,
  .success-mark {
    color: var(--theme-brand);
  }

  .ready-panel .action-row {
    margin-top: 26rpx;
  }

  .receive-card {
    min-height: 440rpx;
  }

  .receive-title {
    margin: 0 0 22rpx;
    text-align: center;
  }

  .code-input {
    height: 110rpx;
    padding: 0 20rpx;
    color: var(--theme-brand);
    font-size: 48rpx;
    letter-spacing: 16rpx;
    text-align: center;
  }

  .received-heading {
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 600;
  }

  .success-mark {
    margin-right: 8rpx;
  }

  .received-content {
    margin-top: 24rpx;
    padding: 22rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-muted);
    text-align: left;
  }

  .received-type {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }

  .received-text,
  .received-url {
    margin-top: 14rpx;
    color: var(--theme-text);
    font-size: 28rpx;
    line-height: 1.7;
    word-break: break-all;
    white-space: pre-wrap;
  }
</style>
