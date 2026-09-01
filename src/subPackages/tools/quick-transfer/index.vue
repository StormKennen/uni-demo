<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import { registerQuickTransferPageShare } from '@/features/quick-transfer/pageShare'
  import { getQuickTransferToolSharePayload, QUICK_TRANSFER_TOOL_SHARE_TITLE } from '@/features/quick-transfer/share'
  import {
    QUICK_TRANSFER_RECEIPTS_ROUTE,
    QUICK_TRANSFER_RECEIVE_ROUTE,
    QUICK_TRANSFER_SEND_CREATE_ROUTE,
    QUICK_TRANSFER_SENT_RECORDS_ROUTE,
  } from '@/features/quick-transfer/constants'
  import { getQuickTransferIndexRedirectRoute } from '@/features/quick-transfer/helpers'
  import type { QuickTransferPageQuery } from '@/features/quick-transfer/types'

  const sharePayload = getQuickTransferToolSharePayload()
  registerQuickTransferPageShare(sharePayload)

  const openSendCreate = () => {
    uni.navigateTo({ url: QUICK_TRANSFER_SEND_CREATE_ROUTE })
  }

  const openReceive = () => {
    uni.navigateTo({ url: QUICK_TRANSFER_RECEIVE_ROUTE })
  }

  const openSentRecords = () => {
    uni.navigateTo({ url: QUICK_TRANSFER_SENT_RECORDS_ROUTE })
  }

  const openReceivedRecords = () => {
    uni.navigateTo({ url: QUICK_TRANSFER_RECEIPTS_ROUTE })
  }

  onLoad(options => {
    const query = (options || {}) as QuickTransferPageQuery
    if (query.shareToken?.trim()) {
      uni.redirectTo({ url: `${QUICK_TRANSFER_RECEIVE_ROUTE}?shareToken=${encodeURIComponent(query.shareToken.trim())}` })
      return
    }
    if (query.mode === 'receive') {
      uni.redirectTo({ url: QUICK_TRANSFER_RECEIVE_ROUTE })
      return
    }
    const legacyHistoryRoute = getQuickTransferIndexRedirectRoute(query.tab)
    if (legacyHistoryRoute) uni.redirectTo({ url: legacyHistoryRoute })
  })
</script>

<template>
  <PageLayout
    title=""
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-image-url="sharePayload.imageUrl"
    :share-timeline-title="QUICK_TRANSFER_TOOL_SHARE_TITLE"
    nav-overlay
    nav-bg-color="transparent"
    nav-init-bg-color="transparent"
    nav-custom-class="light">
    <!-- #ifdef MP-WEIXIN -->
    <template #nav-right>
      <button class="nav-share-button" hover-class="nav-share-button--hover" open-type="share">分享</button>
    </template>
    <!-- #endif -->
    <view class="quick-transfer-page">
      <view class="hero-panel">
        <view class="hero-glow hero-glow--left"></view>
        <view class="hero-glow hero-glow--right"></view>
        <view class="hero-orbit hero-orbit--one"></view>
        <view class="hero-orbit hero-orbit--two"></view>
        <text class="hero-title">飞船</text>
        <text class="hero-desc">跨设备快速传递内容</text>
      </view>

      <view class="quick-transfer-sheet">
        <view class="operation-section">
          <view class="operation-heading">
            <text class="operation-heading__eyebrow">开始传递</text>
            <text class="operation-heading__hint">选择一种方式</text>
          </view>

          <view class="operation-content">
            <button class="operation-button operation-button--send" hover-class="operation-button--hover" @click="openSendCreate">
              <view class="operation-button__icon operation-button__icon--send">
                <uni-icons type="paperplane-filled" size="24" color="#fff" />
              </view>
              <text class="operation-button__label">飞船</text>
            </button>
            <button class="operation-button operation-button--receive" hover-class="operation-button--hover" @click="openReceive">
              <view class="operation-button__icon operation-button__icon--receive">
                <uni-icons type="download" size="24" color="var(--theme-brand)" />
              </view>
              <text class="operation-button__label">收船</text>
            </button>
          </view>
        </view>

        <view class="history-section">
          <view class="history-heading">
            <text class="history-heading__title">历史记录</text>
            <text class="history-heading__hint">查看过往传递</text>
          </view>
          <view class="history-links">
            <view class="history-link" hover-class="history-link--hover" @click="openSentRecords">
              <uni-icons type="upload" size="18" color="var(--theme-brand)" />
              <text>发送记录</text>
            </view>
            <view class="history-link" hover-class="history-link--hover" @click="openReceivedRecords">
              <uni-icons type="download" size="18" color="var(--theme-brand)" />
              <text>接收记录</text>
            </view>
          </view>
        </view>
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

  .hero-panel {
    position: relative;
    min-height: 280rpx;
    padding: 132rpx 34rpx 54rpx;
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
    top: 78rpx;
    left: -110rpx;
    background: rgba(37, 99, 235, 0.68);
  }

  .hero-glow--right {
    right: -100rpx;
    bottom: 16rpx;
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
    top: 138rpx;
    left: -230rpx;
  }

  .hero-orbit--two {
    right: -230rpx;
    bottom: 60rpx;
    transform: rotate(22deg);
  }

  .hero-title,
  .hero-desc {
    position: relative;
    z-index: 1;
    display: block;
  }

  .hero-title {
    font-size: 60rpx;
    font-weight: 800;
    letter-spacing: 8rpx;
  }

  .hero-desc {
    margin-top: 6rpx;
    color: rgba(255, 255, 255, 0.8);
    font-size: 27rpx;
  }

  .quick-transfer-sheet {
    position: relative;
    z-index: 2;
    min-height: calc(100vh - 264rpx);
    margin-top: -28rpx;
    padding: 34rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    border-radius: 34rpx 34rpx 0 0;
    background: var(--theme-bg);
  }

  .operation-heading,
  .history-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .operation-heading__eyebrow,
  .history-heading__title {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }

  .operation-heading__hint,
  .history-heading__hint {
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .operation-content {
    display: flex;
    gap: 18rpx;
    padding-top: 22rpx;
  }

  .operation-button {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    height: 148rpx;
    margin: 0;
    padding: 0 12rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    font-size: 28rpx;
    font-weight: 700;
  }

  .operation-button::after {
    border: 0;
  }

  .operation-button__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54rpx;
    height: 54rpx;
    border-radius: 18rpx;
  }

  .operation-button__icon--send {
    background: rgba(255, 255, 255, 0.18);
  }

  .operation-button__icon--receive {
    background: rgba(37, 99, 235, 0.1);
  }

  .operation-button__label {
    line-height: 1;
  }

  .operation-button--send {
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
    box-shadow: 0 12rpx 28rpx rgba(37, 99, 235, 0.18);
  }

  .operation-button--receive {
    color: var(--theme-brand);
    background: var(--theme-surface);
  }

  .operation-button--hover {
    opacity: 0.82;
  }

  .history-section {
    margin-top: 64rpx;
    padding-top: 30rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .history-links {
    display: flex;
    gap: 18rpx;
    margin-top: 20rpx;
    padding: 8rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    background: var(--theme-surface);
  }

  .history-link {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 10rpx;
    min-height: 78rpx;
    padding: 12rpx 18rpx;
    box-sizing: border-box;
    border-radius: 14rpx;
    color: var(--theme-brand);
    font-size: 25rpx;
    font-weight: 600;
    text-align: center;
  }

  .history-link--hover {
    background: var(--theme-surface-muted);
  }
</style>
