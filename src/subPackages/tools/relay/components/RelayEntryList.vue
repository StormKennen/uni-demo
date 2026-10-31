<script setup lang="ts">
  import RelayEntryCard from './RelayEntryCard.vue'
  import type { RelayEntryViewModel, RelayFieldViewModel } from '../types'

  const props = withDefaults(
    defineProps<{
      entries: RelayEntryViewModel[]
      fields: RelayFieldViewModel[]
      showSequence: boolean
      canEdit: boolean
      canWithdraw: boolean
      loadingMore?: boolean
      hasMore?: boolean
      error?: string
    }>(),
    { loadingMore: false, hasMore: false, error: '' },
  )

  const emit = defineEmits<{
    loadMore: []
    edit: [entry: RelayEntryViewModel]
    withdraw: [entry: RelayEntryViewModel]
  }>()
</script>

<template>
  <view class="entry-list">
    <view v-if="!entries.length && !loadingMore" class="entry-empty">
      <text class="entry-empty__title">还没有人接龙</text>
      <text class="entry-empty__hint">成为第一个参与的人吧</text>
    </view>
    <RelayEntryCard
      v-for="entry in entries"
      :key="entry.id || entry.sequenceNo"
      :entry="entry"
      :fields="fields"
      :show-sequence="showSequence"
      :can-edit="canEdit"
      :can-withdraw="canWithdraw"
      @edit="emit('edit', entry)"
      @withdraw="emit('withdraw', entry)" />

    <view v-if="error" class="entry-list-error">
      <text>{{ error }}</text>
      <text class="retry-text" @click="emit('loadMore')">重试</text>
    </view>
    <button v-if="hasMore && !loadingMore" class="load-more-button" @click="emit('loadMore')">加载更多</button>
    <text v-else-if="loadingMore" class="list-status">正在加载…</text>
    <text v-else-if="entries.length" class="list-status">已经到底了</text>
  </view>
</template>

<style scoped lang="scss">
  .entry-empty {
    padding: 90rpx 20rpx;
    text-align: center;
  }

  .entry-empty__title,
  .entry-empty__hint,
  .entry-list-error,
  .list-status {
    display: block;
  }

  .entry-empty__title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .entry-empty__hint,
  .entry-list-error,
  .list-status {
    margin-top: 10rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    text-align: center;
  }

  .entry-list-error {
    color: var(--theme-danger);
  }

  .retry-text {
    margin-left: 12rpx;
    color: var(--theme-brand);
  }

  .load-more-button {
    height: 72rpx;
    margin: 12rpx 0 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface);
    color: var(--theme-brand);
    font-size: 24rpx;
    line-height: 70rpx;
  }

  .load-more-button::after {
    display: none;
  }
</style>
