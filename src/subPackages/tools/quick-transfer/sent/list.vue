<script setup lang="ts">
  import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import { QUICK_TRANSFER_SENT_RECORD_DETAIL_ROUTE } from '@/features/quick-transfer/constants'
  import {
    formatQuickTransferReceiptDate,
    formatQuickTransferSentRecordSummary,
    getQuickTransferSentClaimLabel,
    getQuickTransferSentStatusLabel,
  } from '@/features/quick-transfer/presentation'
  import { useQuickTransferSentRecords } from '@/features/quick-transfer/useQuickTransferSentRecords'

  const sentRecords = useQuickTransferSentRecords()
  const { items, pagination, isLoading, isLoadingMore, error, loadMoreError } = sentRecords

  const getPreview = (item: (typeof sentRecords.items.value)[number]): string =>
    item.preview.text?.trim() || item.preview.referenceTitle || item.preview.fileName || '发送了一份内容'

  const openDetail = (sentRecordId: string) => {
    uni.navigateTo({ url: `${QUICK_TRANSFER_SENT_RECORD_DETAIL_ROUTE}?sentRecordId=${encodeURIComponent(sentRecordId)}` })
  }

  const loadInitial = async () => {
    await sentRecords.loadSentRecords(true)
  }

  const retry = () => {
    void loadInitial()
  }

  const retryLoadMore = () => {
    void sentRecords.loadMore()
  }

  onShow(() => {
    void loadInitial()
  })

  onPullDownRefresh(async () => {
    await sentRecords.loadSentRecords(true)
    uni.stopPullDownRefresh()
  })

  onReachBottom(() => {
    void sentRecords.loadMore()
  })
</script>

<template>
  <PageLayout title="我发送的" nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <view class="sent-list-page">
      <view class="page-heading">
        <text class="page-kicker">SENT SHIPS</text>
        <text class="page-title">我发送的</text>
        <text class="page-description">曾经发送的飞船，都在这里。</text>
      </view>

      <view v-if="isLoading && !items.length" class="state-panel">
        <text class="state-title">正在读取发送记录</text>
        <text class="state-description">请稍候…</text>
      </view>

      <view v-else-if="error && !items.length" class="state-panel">
        <text class="state-title">加载失败</text>
        <text class="state-description">{{ error.message }}</text>
        <button class="secondary-button" @click="retry">重新加载</button>
      </view>

      <view v-else-if="!items.length" class="state-panel state-panel--empty">
        <view class="empty-orbit"><text>✦</text></view>
        <text class="state-title">还没有发送过飞船</text>
        <text class="state-description">发送的内容会出现在这里</text>
      </view>

      <view v-else class="sent-list">
        <view v-for="item in items" :key="item.sentRecordId" class="sent-row" @click="openDetail(item.sentRecordId)">
          <view class="sent-row__main">
            <view class="sent-row__title-line">
              <text class="sent-row__title">{{ item.displayTitle }}</text>
              <text class="status-badge" :class="`status-badge--${item.status}`">{{ getQuickTransferSentStatusLabel(item.status) }}</text>
            </view>
            <text class="sent-row__meta">{{ formatQuickTransferReceiptDate(item.sentAt) }}</text>
            <text class="sent-row__claim">{{ getQuickTransferSentClaimLabel(item.claimCount, item.maxClaims) }}</text>
            <text class="sent-row__summary">{{ formatQuickTransferSentRecordSummary(item.summary) }}</text>
            <text class="sent-row__preview">{{ getPreview(item) }}</text>
          </view>
          <text class="sent-row__arrow">›</text>
        </view>
        <view v-if="isLoadingMore" class="loading-more">正在加载更多…</view>
        <view v-else-if="loadMoreError" class="load-more-error">
          <text>{{ loadMoreError.message }}</text>
          <button class="secondary-button load-more-retry" @click.stop="retryLoadMore">重试加载更多</button>
        </view>
        <view v-else-if="!pagination.hasNext" class="list-end">已经看到全部发送记录</view>
      </view>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .sent-list-page {
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
  .sent-row__meta,
  .sent-row__claim,
  .sent-row__summary,
  .sent-row__preview,
  .loading-more,
  .list-end {
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .page-description {
    display: block;
    margin-top: 10rpx;
  }

  .sent-list {
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
  }

  .sent-row {
    display: flex;
    align-items: center;
    gap: 18rpx;
    min-height: 170rpx;
    padding: 24rpx 22rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .sent-row:last-of-type {
    border-bottom: 0;
  }

  .sent-row__main {
    flex: 1;
    min-width: 0;
  }

  .sent-row__title-line {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .sent-row__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sent-row__meta,
  .sent-row__claim,
  .sent-row__summary,
  .sent-row__preview {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sent-row__meta,
  .sent-row__claim,
  .sent-row__summary {
    margin-top: 7rpx;
  }

  .sent-row__preview {
    margin-top: 10rpx;
    color: var(--theme-text);
  }

  .status-badge {
    flex: 0 0 auto;
    padding: 7rpx 12rpx;
    border-radius: 999rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
    font-size: 20rpx;
    white-space: nowrap;
  }

  .status-badge--ready {
    color: #15803d;
    background: #dcfce7;
  }

  .status-badge--cancelled,
  .status-badge--expired,
  .status-badge--deleted,
  .status-badge--deleting {
    color: var(--theme-text-secondary);
  }

  .sent-row__arrow {
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
  .list-end,
  .load-more-error {
    padding: 22rpx;
    text-align: center;
  }

  .load-more-error {
    color: var(--theme-danger);
  }

  .load-more-retry {
    min-height: 62rpx;
    margin-top: 12rpx;
    font-size: 22rpx;
  }
</style>
