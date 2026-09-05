<script setup lang="ts">
  import { onLoad, onPullDownRefresh, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import QuickShipReceiptList from './components/QuickShipReceiptList.vue'
  import QuickShipSentRecordList from './components/QuickShipSentRecordList.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { getQuickTransferToolSharePayload, QUICK_TRANSFER_TOOL_SHARE_TITLE } from '@/features/quick-transfer/share'
  import { QUICK_TRANSFER_RECEIVE_ROUTE, QUICK_TRANSFER_SEND_CREATE_ROUTE } from '@/features/quick-transfer/constants'
  import { getQuickTransferIndexRedirectRoute } from '@/features/quick-transfer/helpers'
  import { QUICK_TRANSFER_COPY } from '@/features/quick-transfer/presentation'
  import type { QuickTransferPageQuery } from '@/features/quick-transfer/types'

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

  const activeHistoryTab = ref<'sent' | 'received'>('sent')
  const refreshKey = ref(0)
  const sentListRef = ref<InstanceType<typeof QuickShipSentRecordList> | null>(null)
  const receivedListRef = ref<InstanceType<typeof QuickShipReceiptList> | null>(null)

  const openSendCreate = () => {
    uni.navigateTo({ url: QUICK_TRANSFER_SEND_CREATE_ROUTE })
  }

  const openReceive = () => {
    uni.navigateTo({ url: QUICK_TRANSFER_RECEIVE_ROUTE })
  }

  const switchHistoryTab = (tab: 'sent' | 'received') => {
    activeHistoryTab.value = tab
  }

  const refreshActiveHistory = async (): Promise<void> => {
    if (activeHistoryTab.value === 'sent') await sentListRef.value?.refresh()
    else await receivedListRef.value?.refresh()
  }

  const loadMoreActiveHistory = (): void => {
    if (activeHistoryTab.value === 'sent') void sentListRef.value?.loadMore()
    else void receivedListRef.value?.loadMore()
  }

  onShow(() => {
    refreshKey.value += 1
  })

  onPullDownRefresh(async () => {
    try {
      await refreshActiveHistory()
    } finally {
      uni.stopPullDownRefresh()
    }
  })

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
    title="飞船"
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-image-url="sharePayload.imageUrl"
    :share-timeline-title="QUICK_TRANSFER_TOOL_SHARE_TITLE"
    nav-divider>
    <view class="quick-transfer-page">
      <!-- <view class="hero-panel">
        <text class="hero-eyebrow">QUICK TRANSFER</text>
        <text class="hero-title">飞船</text>
        <text class="hero-desc">{{ QUICK_TRANSFER_COPY.heroDescription }}</text>
      </view> -->

      <view class="quick-transfer-sheet">
        <view class="operation-section">
          <view class="operation-heading">
            <text class="operation-heading__eyebrow">开始传递</text>
            <text class="operation-heading__hint">快速送达另一端</text>
          </view>

          <view class="operation-content">
            <button class="operation-button operation-button--send" hover-class="operation-button--hover" @click="openSendCreate">
              <view class="operation-button__icon operation-button__icon--send">
                <uni-icons type="paperplane-filled" size="24" color="#fff" />
              </view>
              <text class="operation-button__label">飞船</text>
              <text class="operation-button__hint">快速发送内容</text>
            </button>
            <button class="operation-button operation-button--receive" hover-class="operation-button--hover" @click="openReceive">
              <view class="operation-button__icon operation-button__icon--receive">
                <uni-icons type="download" size="24" color="var(--theme-brand)" />
              </view>
              <text class="operation-button__label">收船</text>
              <text class="operation-button__hint">飞船码 / 分享链接</text>
            </button>
          </view>
        </view>

        <view class="history-section">
          <view class="history-heading">
            <text class="history-heading__title">历史记录</text>
            <!-- <text class="history-heading__hint">查看过往传递</text> -->
          </view>
          <view class="history-tabs">
            <button class="history-tab" :class="{ 'history-tab--active': activeHistoryTab === 'sent' }" @click="switchHistoryTab('sent')"
              >发送记录</button
            >
            <button
              class="history-tab"
              :class="{ 'history-tab--active': activeHistoryTab === 'received' }"
              @click="switchHistoryTab('received')"
              >接收记录</button
            >
          </view>
          <scroll-view class="history-content" scroll-y lower-threshold="160" @scrolltolower="loadMoreActiveHistory">
            <QuickShipSentRecordList v-if="activeHistoryTab === 'sent'" ref="sentListRef" :refresh-key="refreshKey" embedded />
            <QuickShipReceiptList v-else ref="receivedListRef" :refresh-key="refreshKey" embedded />
          </scroll-view>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<style lang="scss">
  .quick-transfer-page {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: auto;
    min-height: 0;
    box-sizing: border-box;
    overflow: hidden;
    background: var(--theme-bg);
  }

  .hero-panel {
    flex-shrink: 0;
    padding: 28rpx 28rpx 0;
    box-sizing: border-box;
    color: var(--theme-text);
  }

  .hero-eyebrow,
  .hero-title,
  .hero-desc {
    display: block;
  }

  .hero-eyebrow {
    color: var(--theme-brand);
    font-size: 20rpx;
    font-weight: 800;
    letter-spacing: 4rpx;
  }

  .hero-title {
    margin-top: 8rpx;
    font-size: 42rpx;
    font-weight: 800;
  }

  .hero-desc {
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .quick-transfer-sheet {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    z-index: 2;
    height: auto;
    min-height: 0;
    margin-top: 28rpx;
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
    box-sizing: border-box;
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
    line-height: 1.2;
  }

  .operation-button__hint {
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    font-weight: 400;
    line-height: 1.2;
    white-space: nowrap;
  }

  .operation-button--send .operation-button__hint {
    color: rgba(255, 255, 255, 0.78);
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
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    margin-top: 64rpx;
    padding-top: 30rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .history-tabs {
    display: flex;
    margin-top: 20rpx;
    padding: 8rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .history-tab {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 64rpx;
    margin: 0;
    box-sizing: border-box;
    border-radius: 14rpx;
    color: var(--theme-text-secondary);
    background: transparent;
    font-size: 25rpx;
    line-height: 1.2;
  }

  .history-tab::after {
    display: none;
  }

  .history-tab--active {
    color: var(--theme-brand);
    background: var(--theme-surface);
    font-weight: 700;
  }

  .history-content {
    flex: 1;
    min-height: 0;
    height: 0;
    margin-top: 18rpx;
  }
</style>
