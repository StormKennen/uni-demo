<script setup lang="ts">
  import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import { formatQuickTransferReceiptDate, formatQuickTransferReceiptSummary } from '@/features/quick-transfer/presentation'
  import { useQuickTransferReceipts } from '@/features/quick-transfer/useQuickTransferReceipts'
  import { QUICK_TRANSFER_RECEIPT_DETAIL_ROUTE } from '@/features/quick-transfer/constants'

  const receipts = useQuickTransferReceipts()
  const { items, pagination, isLoading, isLoadingMore, error } = receipts

  const getPreview = (item: (typeof receipts.items.value)[number]): string =>
    item.preview.text?.trim() || item.preview.referenceTitle || item.preview.fileName || '收到了一份内容'

  const openDetail = (receiptId: string) => {
    uni.navigateTo({ url: `${QUICK_TRANSFER_RECEIPT_DETAIL_ROUTE}?receiptId=${encodeURIComponent(receiptId)}` })
  }

  const loadInitial = async () => {
    await receipts.loadReceipts(true)
  }

  const retry = () => {
    void loadInitial()
  }

  onShow(() => {
    void loadInitial()
  })

  onPullDownRefresh(async () => {
    await receipts.loadReceipts(true)
    uni.stopPullDownRefresh()
  })

  onReachBottom(() => {
    void receipts.loadMore()
  })
</script>

<template>
  <PageLayout title="已收飞船" nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <view class="receipt-list-page">
      <view class="page-heading">
        <text class="page-kicker">RECEIVED SHIPS</text>
        <text class="page-title">已收飞船</text>
        <text class="page-description">曾经收到的内容，都在这里。</text>
      </view>

      <view v-if="isLoading && !items.length" class="state-panel">
        <text class="state-title">正在读取已收飞船</text>
        <text class="state-description">请稍候…</text>
      </view>

      <view v-else-if="error && !items.length" class="state-panel">
        <text class="state-title">加载失败</text>
        <text class="state-description">{{ error.message }}</text>
        <button class="secondary-button" @click="retry">重新加载</button>
      </view>

      <view v-else-if="!items.length" class="state-panel state-panel--empty">
        <view class="empty-orbit"><text>✦</text></view>
        <text class="state-title">还没有收到飞船</text>
        <text class="state-description">收到的内容会出现在这里</text>
      </view>

      <view v-else class="receipt-list">
        <view v-for="item in items" :key="item.receiptId" class="receipt-row" @click="openDetail(item.receiptId)">
          <view class="receipt-row__main">
            <text class="receipt-row__title">{{ item.displayTitle }}</text>
            <text class="receipt-row__meta">{{ formatQuickTransferReceiptDate(item.claimedAt) }}</text>
            <text class="receipt-row__summary">{{ formatQuickTransferReceiptSummary(item.summary) }}</text>
            <text class="receipt-row__preview">{{ getPreview(item) }}</text>
          </view>
          <text class="receipt-row__arrow">›</text>
        </view>
        <view v-if="isLoadingMore" class="loading-more">正在加载更多…</view>
        <view v-else-if="!pagination.hasNext" class="list-end">已经看到全部内容</view>
      </view>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .receipt-list-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    color: var(--theme-text);
  }

  .page-heading {
    padding: 18rpx 4rpx 28rpx;
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
    font-size: 42rpx;
    font-weight: 800;
  }

  .page-description,
  .state-description,
  .receipt-row__meta,
  .receipt-row__summary,
  .receipt-row__preview,
  .loading-more,
  .list-end {
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .page-description {
    display: block;
    margin-top: 10rpx;
  }

  .receipt-list {
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
  }

  .receipt-row {
    display: flex;
    align-items: center;
    gap: 18rpx;
    min-height: 148rpx;
    padding: 24rpx 22rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .receipt-row:last-of-type {
    border-bottom: 0;
  }

  .receipt-row__main {
    flex: 1;
    min-width: 0;
  }

  .receipt-row__title,
  .receipt-row__meta,
  .receipt-row__summary,
  .receipt-row__preview {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .receipt-row__title {
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 700;
  }

  .receipt-row__meta,
  .receipt-row__summary {
    margin-top: 7rpx;
  }

  .receipt-row__preview {
    margin-top: 10rpx;
    color: var(--theme-text);
  }

  .receipt-row__arrow {
    flex: 0 0 auto;
    color: var(--theme-text-secondary);
    font-size: 42rpx;
  }

  .state-panel {
    padding: 96rpx 28rpx;
    text-align: center;
  }

  .empty-orbit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 92rpx;
    height: 92rpx;
    margin: 0 auto 24rpx;
    border: 2rpx solid rgba(37, 99, 235, 0.35);
    border-radius: 50%;
    color: var(--theme-brand);
    font-size: 36rpx;
  }

  .state-title {
    display: block;
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }

  .state-description {
    display: block;
    margin-top: 12rpx;
    line-height: 1.6;
  }

  .secondary-button {
    min-height: 72rpx;
    margin-top: 24rpx;
    padding: 0 22rpx;
    border: 0;
    border-radius: 14rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
    font-size: 24rpx;
  }

  .loading-more,
  .list-end {
    padding: 22rpx;
    text-align: center;
  }
</style>
