<script setup lang="ts">
  import { onMounted, watch } from 'vue'
  import QuickShipHistoryCard from './QuickShipHistoryCard.vue'
  import { QUICK_TRANSFER_SENT_RECORD_DETAIL_ROUTE } from '@/features/quick-transfer/constants'
  import { useQuickTransferSentRecords } from '@/features/quick-transfer/useQuickTransferSentRecords'

  interface Props {
    canViewHistory?: boolean
    refreshKey?: number
    embedded?: boolean
  }

  const props = withDefaults(defineProps<Props>(), { canViewHistory: true, refreshKey: 0, embedded: false })
  const sentRecords = useQuickTransferSentRecords()
  const { items, pagination, isLoading, isLoadingMore, error, loadMoreError } = sentRecords

  const openDetail = (sentRecordId: string) => {
    uni.navigateTo({ url: `${QUICK_TRANSFER_SENT_RECORD_DETAIL_ROUTE}?sentRecordId=${encodeURIComponent(sentRecordId)}` })
  }

  const refresh = async (): Promise<boolean> => {
    if (!props.canViewHistory) return false
    return sentRecords.loadSentRecords(true)
  }

  const retry = (): void => {
    void refresh()
  }
  const retryLoadMore = (): void => {
    void sentRecords.loadMore()
  }
  const handleMounted = (): void => {
    void refresh()
  }
  onMounted(handleMounted)
  watch(
    () => props.refreshKey,
    () => void refresh(),
  )

  defineExpose({ refresh, loadMore: sentRecords.loadMore })
</script>

<template>
  <view class="sent-list-page" :class="{ 'sent-list-page--embedded': props.embedded }">
    <view v-if="!props.embedded" class="page-heading">
      <text class="page-kicker">SENT SHIPS</text>
      <text class="page-title">我发送的</text>
      <text class="page-description">曾经发送的飞船，都在这里。</text>
    </view>

    <view v-if="!props.canViewHistory" class="state-panel">
      <text class="state-title">登录后查看发送记录</text>
      <text class="state-description">登录后即可管理曾经发送的飞船。</text>
    </view>
    <view v-else-if="isLoading && !items.length" class="state-panel">
      <text class="state-title">正在读取发送记录</text>
      <text class="state-description">请稍候…</text>
    </view>
    <view v-else-if="error && !items.length" class="state-panel">
      <text class="state-title">加载失败</text>
      <text class="state-description">{{ error.message }}</text>
      <button class="quick-ship-button quick-ship-button--secondary" @click="retry">重新加载</button>
    </view>
    <view v-else-if="!items.length" class="state-panel state-panel--empty">
      <view class="empty-orbit"><text>✦</text></view>
      <text class="state-title">还没有发送过飞船</text>
      <text class="state-description">发送的内容会出现在这里</text>
    </view>
    <view v-else class="sent-list">
      <QuickShipHistoryCard
        v-for="item in items"
        :key="item.sentRecordId"
        mode="sent"
        :primary-type="item.primaryType"
        :title="item.displayTitle"
        :summary="item.summary"
        :preview="item.preview"
        :time="item.sentAt"
        :status="item.status"
        :claim-count="item.claimCount"
        :max-claims="item.maxClaims"
        @select="openDetail(item.sentRecordId)" />
      <view v-if="isLoadingMore" class="loading-more">正在加载更多…</view>
      <view v-else-if="loadMoreError" class="load-more-error">
        <text>{{ loadMoreError.message }}</text>
        <button class="quick-ship-button quick-ship-button--secondary load-more-retry" @click.stop="retryLoadMore">重试加载更多</button>
      </view>
      <view v-else-if="!pagination.hasNext" class="list-end">已经看到全部发送记录</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .sent-list-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    color: var(--theme-text);
  }

  .sent-list-page--embedded {
    min-height: 0;
    padding: 0 0 calc(40rpx + env(safe-area-inset-bottom));
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
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    padding-top: 28rpx;
  }

  .state-panel {
    padding: 96rpx 28rpx;
    text-align: center;
  }

  .sent-list-page--embedded .state-panel {
    padding: 64rpx 20rpx;
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

  .quick-ship-button {
    border: 0;
    border-radius: 14rpx;
    font-size: 24rpx;
  }

  .quick-ship-button::after {
    border: 0;
  }

  .quick-ship-button--secondary {
    min-height: 72rpx;
    margin-top: 24rpx;
    padding: 0 22rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
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
