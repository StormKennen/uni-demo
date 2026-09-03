<script setup lang="ts">
  import { onHide, onLoad, onShareAppMessage, onShareTimeline, onShow, onUnload } from '@dcloudio/uni-app'
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
  import { useQuickTransfer } from '@/features/quick-transfer/useQuickTransfer'
  import type { QuickTransferContentReference, QuickTransferPageQuery } from '@/features/quick-transfer/types'
  import {
    getQuickShipAnimationForInspectSuccess,
    getQuickShipAnimationForReceiveSuccess,
    getQuickShipAnimationForReceiverEntry,
    type QuickShipAnimationType,
  } from '@/features/quick-transfer/visual'

  const quickTransfer = useQuickTransfer()
  const receiveCode = ref('')
  const shareToken = ref('')
  const isMiniProgram = ref(false)
  const isLoggedIn = ref(false)
  const isReceivedContentOpened = ref(false)
  const pageShipType = ref<QuickShipAnimationType | null>(null)
  const shipPlayId = ref(0)
  const isShipParked = ref(false)
  let hasPlayedArrive = false

  // #ifdef MP-WEIXIN
  isMiniProgram.value = true
  // #endif

  const sharePayload = computed(() =>
    shareToken.value
      ? getQuickTransferTransferSharePayload(
          shareToken.value,
          quickTransfer.inspectResult.value?.expiresAt || '',
          quickTransfer.inspectResult.value?.title || '飞船',
        )
      : getQuickTransferReceiveSharePayload(),
  )
  const shareTimelineQuery = computed(() =>
    sharePayload.value.kind === 'transfer' ? `shareToken=${encodeURIComponent(shareToken.value)}` : '',
  )
  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  onShareAppMessage(() => ({
    title: sharePayload.value.title,
    path: sharePayload.value.path,
    imageUrl: sharePayload.value.imageUrl,
  }))

  onShareTimeline(() => ({
    title: sharePayload.value.title || QUICK_TRANSFER_TOOL_SHARE_TITLE,
    query: shareTimelineQuery.value,
    imageUrl: sharePayload.value.imageUrl,
  }))
  // #endif

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

  const showPageShip = computed(() => Boolean(pageShipType.value) && !isReceivedContentVisible.value)
  const isShipArriving = computed(() => pageShipType.value === 'arrive' && !isShipParked.value)

  const playArriveOnce = () => {
    if (hasPlayedArrive) return
    hasPlayedArrive = true
    isShipParked.value = false
    shipPlayId.value += 1
    pageShipType.value = 'arrive'
  }

  const onArriveFinished = () => {
    isShipParked.value = true
  }

  const performReceive = async (input: { code?: string; shareToken?: string }): Promise<boolean> => {
    const success = await quickTransfer.receive(input)
    if (getQuickShipAnimationForReceiveSuccess(success, hasPlayedArrive)) playArriveOnce()
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
    if (shareToken.value) {
      void quickTransfer.inspectShare(shareToken.value).then(success => {
        if (getQuickShipAnimationForInspectSuccess(success)) playArriveOnce()
      })
      return
    }
    if (isReceiveCodeValid.value) void claim()
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
  const handlePreviewFailed = () => {
    quickTransfer.receiveError.value = { code: 'PREVIEW_FAILED', message: '图片预览失败，请稍后重试' }
  }

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
    if (!shareToken.value) {
      pageShipType.value = getQuickShipAnimationForReceiverEntry(false)
      return
    }
    void quickTransfer.inspectShare(shareToken.value).then(success => {
      if (getQuickShipAnimationForInspectSuccess(success)) playArriveOnce()
    })
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
    <!-- #ifdef MP-WEIXIN -->
    <template #nav-right>
      <button class="nav-share-button" hover-class="nav-share-button--hover" open-type="share">分享</button>
    </template>
    <!-- #endif -->
    <view class="receive-page" :class="{ 'receive-page--docking': isShipArriving }">
      <view class="page-heading">
        <text class="page-kicker">RECEIVE SHIP</text>
        <text class="page-title">{{ shareToken ? '一艘飞船抵达了' : '接收飞船' }}</text>
        <text class="page-description">{{ shareToken ? '确认后即可领取别人送来的内容。' : '输入别人告诉你的 6 位飞船码。' }}</text>
      </view>

      <QuickShipTransition
        v-if="showPageShip && pageShipType"
        :key="shipPlayId"
        :type="pageShipType || 'standby'"
        layout="inline"
        :hold="pageShipType === 'arrive'"
        @finished="onArriveFinished" />

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
        :preview-file="quickTransfer.previewReceivedFile"
        @copy-text="copyReceivedText"
        @open-url="openReceivedUrl"
        @download-file="quickTransfer.downloadReceivedFile"
        @preview-failed="handlePreviewFailed"
        @open-reference="openReference" />

      <view v-if="isReceivedContentVisible" class="receive-footer-actions">
        <button v-if="canViewHistory" class="quick-ship-button text-button" @click="openReceivedHistory">查看我收到的</button>
        <button class="quick-ship-button text-button" @click="openSendCreate">我也要发送飞船</button>
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

  .receive-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    overflow: visible;
    color: var(--theme-text);
  }

  .page-heading,
  .receive-page :deep(.receive-panel) {
    transition:
      opacity 280ms ease,
      transform 280ms ease;
  }

  .page-heading {
    padding: 18rpx 4rpx 28rpx;
    text-align: center;
  }

  .receive-page--docking .page-heading,
  .receive-page--docking :deep(.receive-panel) {
    opacity: 0.72;
    transform: translateY(10rpx);
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

  @media (prefers-reduced-motion: reduce) {
    .page-heading,
    .receive-page :deep(.receive-panel),
    .receive-page--docking .page-heading,
    .receive-page--docking :deep(.receive-panel) {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>
