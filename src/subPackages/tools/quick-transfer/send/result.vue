<script setup lang="ts">
  import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
  import { computed, ref } from 'vue'
  import QuickShipSendResult from '../components/QuickShipSendResult.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { buildQuickTransferBrowserShareUrl } from '@/utilsH5/quick-transfer-share'
  import {
    getQuickTransferToolSharePayload,
    getQuickTransferTransferSharePayload,
    QUICK_TRANSFER_TOOL_SHARE_TITLE,
  } from '@/features/quick-transfer/share'
  import { QUICK_TRANSFER_ROUTE, QUICK_TRANSFER_SEND_CREATE_ROUTE } from '@/features/quick-transfer/constants'
  import {
    getQuickTransferSenderClaimLabel,
    getQuickTransferSenderDescription,
    getQuickTransferSenderTitle,
  } from '@/features/quick-transfer/presentation'
  import { clearQuickTransferSendResultContext, getQuickTransferSendResultContext } from '@/features/quick-transfer/sendResultContext'
  import { useQuickTransfer } from '@/features/quick-transfer/useQuickTransfer'
  import type { QuickTransferSendResultContext } from '@/features/quick-transfer/types'

  const quickTransfer = useQuickTransfer()
  const resultContext = ref<QuickTransferSendResultContext | null>(null)

  const hasContext = computed(() => Boolean(resultContext.value))
  const senderClaimCount = computed(() => quickTransfer.senderStatus.value?.claimCount ?? resultContext.value?.claimCount ?? 0)
  const senderMaxClaims = computed(() => quickTransfer.senderStatus.value?.maxClaims ?? resultContext.value?.maxClaims ?? 1)
  const senderStatusTitle = computed(() => getQuickTransferSenderTitle(quickTransfer.sendState.value))
  const senderStatusDescription = computed(() => getQuickTransferSenderDescription(quickTransfer.sendState.value))
  const senderClaimLabel = computed(() =>
    getQuickTransferSenderClaimLabel(quickTransfer.sendState.value, senderClaimCount.value, senderMaxClaims.value),
  )
  const sharePayload = computed(() => {
    if (quickTransfer.sendState.value !== 'ready') return getQuickTransferToolSharePayload()
    return getQuickTransferTransferSharePayload(quickTransfer.shareToken.value, quickTransfer.expiresAt.value)
  })
  const shareUrl = computed(() => {
    if (sharePayload.value.kind !== 'transfer') return ''
    let url = sharePayload.value.path
    // #ifdef H5
    url = buildQuickTransferBrowserShareUrl(quickTransfer.shareToken.value)
    // #endif
    return url
  })
  const shareTimelineQuery = computed(() =>
    sharePayload.value.kind === 'transfer' ? `shareToken=${encodeURIComponent(quickTransfer.shareToken.value)}` : '',
  )

  const copyText = (value: string, successMessage: string) => {
    if (!value) return
    uni.setClipboardData({ data: value, success: () => uni.showToast({ title: successMessage, icon: 'none' }) })
  }

  const copyCode = () => copyText(quickTransfer.code.value, '飞船码已复制')
  const copyShareUrl = () => copyText(shareUrl.value, '分享链接已复制')
  const cancelSend = () => {
    if (quickTransfer.transferId.value) void quickTransfer.cancel()
  }

  const openHistory = () => uni.redirectTo({ url: `${QUICK_TRANSFER_ROUTE}?tab=sent` })
  const openCreate = () => uni.redirectTo({ url: QUICK_TRANSFER_SEND_CREATE_ROUTE })

  onLoad(() => {
    const context = getQuickTransferSendResultContext()
    clearQuickTransferSendResultContext()
    if (!context) return
    resultContext.value = context
    quickTransfer.initializeSendResult(context)
  })

  onShow(() => quickTransfer.resumeTimers())
  onHide(() => quickTransfer.pauseTimers())
  onUnload(() => quickTransfer.pauseTimers())
</script>

<template>
  <PageLayout
    title="飞船票据"
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-image-url="sharePayload.imageUrl"
    :share-timeline-query="shareTimelineQuery"
    :share-timeline-title="sharePayload.title || QUICK_TRANSFER_TOOL_SHARE_TITLE"
    :back-fallback="`${QUICK_TRANSFER_ROUTE}?tab=sent`"
    nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <view class="send-result-page">
      <template v-if="hasContext">
        <view class="page-heading">
          <text class="page-kicker">TRANSFER TICKET</text>
          <text class="page-title">当前飞船</text>
          <text class="page-description">这是一艘刚刚创建的飞船。</text>
        </view>
        <QuickShipSendResult
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
          @reset="openCreate"
          @view-history="openHistory" />
      </template>
      <view v-else class="missing-context-panel">
        <view class="missing-context-mark">⌁</view>
        <text class="missing-context-title">这张飞船票据已经离开本次会话</text>
        <text class="missing-context-description">你仍可以在「我发送的」查看发送记录。</text>
        <button class="quick-ship-button primary-button full-button" @click="openHistory">查看我发送的</button>
        <button class="quick-ship-button text-button full-button" @click="openCreate">返回飞船</button>
      </view>
    </view>
  </PageLayout>
</template>

<style lang="scss">
  .send-result-page {
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

  .page-description,
  .missing-context-description {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.6;
  }

  .missing-context-panel {
    padding: 110rpx 18rpx;
    text-align: center;
  }

  .missing-context-mark {
    color: var(--theme-brand);
    font-size: 80rpx;
    font-weight: 800;
  }

  .missing-context-title {
    display: block;
    margin-top: 20rpx;
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }

  .full-button {
    width: 100%;
    margin-top: 20rpx;
  }

  .quick-ship-button {
    border: 0;
    border-radius: 14rpx;
    font-size: 25rpx;
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

  .text-button {
    min-height: 58rpx;
    padding: 0 18rpx;
    color: var(--theme-brand);
    background: transparent;
  }
</style>
