<script setup lang="ts">
  import { computed } from 'vue'
  import {
    formatQuickTransferHistoryDate,
    getQuickTransferSentClaimLabel,
    getQuickTransferSentStatusLabel,
  } from '@/features/quick-transfer/presentation'
  import type { QuickTransferStatus } from '@/features/quick-transfer/types'

  interface Props {
    mode: 'sent' | 'received'
    title: string
    time: string
    status?: QuickTransferStatus
    claimCount?: number
    maxClaims?: number
    deleting?: boolean
  }

  const props = withDefaults(defineProps<Props>(), { deleting: false })
  const emit = defineEmits<{
    select: []
    delete: []
  }>()

  const displayTitle = computed(() => props.title.trim() || '飞船')
  const showClaimProgress = computed(() => props.mode === 'sent' && props.claimCount !== undefined && props.maxClaims !== undefined)
  const claimProgress = computed(() => getQuickTransferSentClaimLabel(props.claimCount ?? 0, props.maxClaims ?? 0))

  const handleDelete = (): void => {
    if (!props.deleting) emit('delete')
  }
</script>

<template>
  <view class="history-card" hover-class="history-card--hover" :class="`history-card--${props.mode}`" @click="emit('select')">
    <view class="history-card__main">
      <view class="history-card__title-line">
        <text class="history-card__title">{{ displayTitle }}</text>
        <text
          v-if="props.mode === 'sent' && props.status"
          class="history-card__status"
          :class="{ 'history-card__status--ready': props.status === 'ready' }">
          {{ getQuickTransferSentStatusLabel(props.status) }}
        </text>
        <text v-else class="history-card__status history-card__status--received">已接收</text>
      </view>
      <view class="history-card__meta">
        <text>{{ formatQuickTransferHistoryDate(props.time) }}</text>
        <text v-if="showClaimProgress"> · {{ claimProgress }}</text>
      </view>
    </view>
    <uni-icons class="history-card__open" type="right" size="18" color="var(--theme-text-secondary)" />
    <view
      class="history-card__delete"
      :class="{ 'history-card__delete--loading': props.deleting }"
      hover-class="history-card__delete--hover"
      :aria-label="props.deleting ? '删除中' : '删除记录'"
      @click.stop="handleDelete">
      <uni-icons :type="props.deleting ? 'spinner-cycle' : 'trash'" size="19" color="var(--theme-danger)" />
    </view>
  </view>
</template>

<style scoped lang="scss">
  .history-card {
    position: relative;
    min-height: 124rpx;
    padding: 22rpx 72rpx 52rpx 20rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 6rpx 18rpx var(--theme-shadow-xs);
  }

  .history-card--hover {
    background: var(--theme-surface-muted);
  }

  .history-card__main {
    min-width: 0;
  }

  .history-card__title-line {
    display: flex;
    align-items: flex-start;
    gap: 10rpx;
    padding-right: 30rpx;
  }

  .history-card__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 700;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-card__status {
    flex: 0 0 auto;
    max-width: 150rpx;
    overflow: hidden;
    padding: 6rpx 10rpx;
    border-radius: 999rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
    font-size: 20rpx;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-card__status--ready {
    color: #15803d;
    background: #dcfce7;
  }

  .history-card__status--received {
    color: var(--theme-brand);
    background: rgba(37, 99, 235, 0.1);
  }

  .history-card__meta {
    display: block;
    margin-top: 10rpx;
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-card__open {
    position: absolute;
    top: 22rpx;
    right: 20rpx;
  }

  .history-card__delete {
    position: absolute;
    right: 10rpx;
    bottom: 5rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    border-radius: 36rpx;
  }

  .history-card__delete--hover {
    background: rgba(220, 38, 38, 0.08);
  }

  .history-card__delete--loading {
    opacity: 0.6;
  }
</style>
