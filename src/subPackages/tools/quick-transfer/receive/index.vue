<script setup lang="ts">
  import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
  import { computed, ref } from 'vue'
  import QuickShipReceivePanel from '../components/QuickShipReceivePanel.vue'
  import QuickShipReceivedContent from '../components/QuickShipReceivedContent.vue'
  import QuickShipTransition from '../components/QuickShipTransition.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { getToken } from '@/utils/storage'
  import { openQuickTransferBrowserUrl } from '@/utilsH5/quick-transfer-url'
  import {
    QUICK_TRANSFER_RECEIPTS_ROUTE,
    QUICK_TRANSFER_ROUTE,
    QUICK_TRANSFER_SEND_CREATE_ROUTE,
  } from '@/features/quick-transfer/constants'
  import { formatQuickTransferSummary, isQuickTransferReceivedContentVisible } from '@/features/quick-transfer/presentation'
  import { extractQuickTransferCode, isValidQuickTransferCode, parseQuickTransferPageQuery } from '@/features/quick-transfer/helpers'
  import { openQuickTransferReference } from '@/features/quick-transfer/reference/registry'
  import {
    getQuickTransferReceiveSharePayload,
    getQuickTransferTransferSharePayload,
    QUICK_TRANSFER_TOOL_SHARE_TITLE,
  } from '@/features/quick-transfer/share'
  import { registerQuickTransferPageShare } from '@/features/quick-transfer/pageShare'
  import { useQuickTransfer } from '@/features/quick-transfer/useQuickTransfer'
  import type { QuickTransferContentReference, QuickTransferPageQuery } from '@/features/quick-transfer/types'
  import { getQuickShipTransitionForReceive, type QuickShipTransitionType } from '@/features/quick-transfer/visual'

  const quickTransfer = useQuickTransfer()
  const receiveCode = ref('')
  const shareToken = ref('')
  const isMiniProgram = ref(false)
  const isLoggedIn = ref(false)
  const isReceivedContentOpened = ref(false)
  const shipTransition = ref<QuickShipTransitionType | null>(null)

  // #ifdef MP-WEIXIN
  isMiniProgram.value = true
  // #endif

  const sharePayload = computed(() =>
    shareToken.value
      ? getQuickTransferTransferSharePayload(shareToken.value, quickTransfer.inspectResult.value?.expiresAt || '')
      : getQuickTransferReceiveSharePayload(),
  )
  const shareTimelineQuery = computed(() =>
    sharePayload.value.kind === 'transfer' ? `shareToken=${encodeURIComponent(shareToken.value)}` : '',
  )
  registerQuickTransferPageShare(sharePayload)
  const canViewHistory = computed(() => isMiniProgram.value || isLoggedIn.value)
  const isReceiving = computed(() => ['inspecting', 'resolving'].includes(quickTransfer.receiveState.value))
  const receivedContent = computed(() => quickTransfer.receivedResult.value?.content || null)
  const receivedTitle = computed(() => quickTransfer.receivedResult.value?.title || quickTransfer.inspectResult.value?.title || '飞船')
  const isReceivedContentVisible = computed(() =>
    isQuickTransferReceivedContentVisible(quickTransfer.receiveState.value, isReceivedContentOpened.value),
  )
  const receiveSummaryText = computed(() =>
    quickTransfer.inspectResult.value ? formatQuickTransferSummary(quickTransfer.inspectResult.value.summary) : '',
  )
  const receiveErrorCode = computed(() => quickTransfer.receiveError.value?.code || '')
  const isClaimTokenError = computed(
    () => receiveErrorCode.value === 'CLAIM_TOKEN_INVALID' || receiveErrorCode.value === 'CLAIM_TOKEN_EXPIRED',
  )
  const isReceiveUnavailable = computed(
    () => receiveErrorCode.value === 'TRANSFER_NOT_AVAILABLE' || receiveErrorCode.value === 'TRANSFER_NOT_FOUND',
  )
  const receiveErrorMessage = computed(() => quickTransfer.receiveError.value?.message || '')
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
  const isReceiveCodeValid = computed(() => isValidQuickTransferCode(receiveCode.value))

  const refreshLoginState = () => {
    isLoggedIn.value = Boolean(getToken())
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
    const code = extractQuickTransferCode(receiveCode.value)
    if (isValidQuickTransferCode(code)) await performReceive({ code })
  }

  const retryReceive = () => {
    quickTransfer.resetReceive()
    isReceivedContentOpened.value = false
    if (shareToken.value) void quickTransfer.inspectShare(shareToken.value)
    else if (isReceiveCodeValid.value) void claim()
  }

  const openReceivedContent = () => {
    if (quickTransfer.receiveState.value === 'received') isReceivedContentOpened.value = true
  }

  const copyText = (value: string, successMessage: string) => {
    if (!value) return
    uni.setClipboardData({ data: value, success: () => uni.showToast({ title: successMessage, icon: 'none' }) })
  }

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

  const openReference = (reference: QuickTransferContentReference) => openQuickTransferReference(reference)
  const dismissReceiveError = () => quickTransfer.clearReceiveError()

  const openReceivedHistory = () => {
    if (canViewHistory.value) uni.redirectTo({ url: QUICK_TRANSFER_RECEIPTS_ROUTE })
  }

  const openSendCreate = () => uni.navigateTo({ url: QUICK_TRANSFER_SEND_CREATE_ROUTE })
  const updateReceiveCode = (value: string) => {
    receiveCode.value = extractQuickTransferCode(value)
  }

  onLoad(options => {
    const parsed = parseQuickTransferPageQuery((options || {}) as QuickTransferPageQuery)
    shareToken.value = parsed.shareToken
    refreshLoginState()
    if (shareToken.value) void quickTransfer.inspectShare(shareToken.value)
  })

  onShow(refreshLoginState)
  onHide(() => quickTransfer.pauseTimers())
  onUnload(() => quickTransfer.pauseTimers())
</script>

<template>
  <PageLayout
    title="接收飞船"
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-image-url="sharePayload.imageUrl"
    :share-timeline-query="shareTimelineQuery"
    :share-timeline-title="sharePayload.title || QUICK_TRANSFER_TOOL_SHARE_TITLE"
    :back-fallback="QUICK_TRANSFER_ROUTE"
    nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <view class="receive-page">
      <view class="page-heading">
        <text class="page-kicker">RECEIVE SHIP</text>
        <text class="page-title">{{ shareToken ? '一艘飞船抵达了' : '接收飞船' }}</text>
        <text class="page-description">{{ shareToken ? '确认后即可领取别人送来的内容。' : '输入别人告诉你的 6 位飞船码。' }}</text>
      </view>

      <QuickShipReceivePanel
        :share-token="shareToken"
        :receive-state="quickTransfer.receiveState.value"
        :inspect-result="quickTransfer.inspectResult.value"
        :receive-code="receiveCode"
        :is-receiving="isReceiving"
        :is-content-opened="isReceivedContentVisible"
        :has-receipt="Boolean(quickTransfer.receivedResult.value?.receiptId)"
        :received-title="receivedTitle"
        :summary-text="receiveSummaryText"
        :receive-error-message="receiveErrorMessage"
        :receive-error-title="receiveErrorTitle"
        :receive-error-description="receiveErrorDescription"
        :is-claim-token-error="isClaimTokenError"
        :is-receive-unavailable="isReceiveUnavailable"
        :is-code-valid="isReceiveCodeValid"
        @update:receive-code="updateReceiveCode"
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

      <view v-if="isReceivedContentVisible" class="receive-footer-actions">
        <button v-if="canViewHistory" class="quick-ship-button text-button" @click="openReceivedHistory">查看我收到的</button>
        <button class="quick-ship-button text-button" @click="openSendCreate">我也要发送飞船</button>
      </view>
    </view>

    <QuickShipTransition v-if="shipTransition" :type="shipTransition" @finished="shipTransition = null" />
  </PageLayout>
</template>

<style lang="scss">
  .receive-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    color: var(--theme-text);
  }

  .page-heading {
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

  .receive-footer-actions {
    margin-top: 30rpx;
    padding-top: 12rpx;
    border-top: 1rpx solid var(--theme-border);
    text-align: center;
  }

  .quick-ship-button {
    border: 0;
    border-radius: 14rpx;
    font-size: 24rpx;
  }

  .quick-ship-button::after {
    border: 0;
  }

  .text-button {
    display: block;
    min-height: 58rpx;
    margin: 0 auto;
    padding: 0 18rpx;
    color: var(--theme-brand);
    background: transparent;
  }
</style>
