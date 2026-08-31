<script setup lang="ts">
  import { computed } from 'vue'
  import {
    formatQuickTransferHistoryDate,
    formatQuickTransferHistorySummary,
    getQuickTransferHistoryIconType,
    getQuickTransferHistoryTypeLabel,
    getQuickTransferHistoryPreview,
    getQuickTransferSentClaimLabel,
    getQuickTransferSentStatusLabel,
    shouldShowQuickTransferHistoryPreview,
    shouldShowQuickTransferHistorySummary,
  } from '@/features/quick-transfer/presentation'
  import type {
    QuickTransferHistoryPrimaryType,
    QuickTransferHistoryPreview,
    QuickTransferStatus,
    QuickTransferSummary,
  } from '@/features/quick-transfer/types'

  interface Props {
    mode: 'sent' | 'received'
    primaryType: QuickTransferHistoryPrimaryType
    title: string
    summary: QuickTransferSummary
    preview?: QuickTransferHistoryPreview
    time: string
    status?: QuickTransferStatus
    claimCount?: number
    maxClaims?: number
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{ select: [] }>()

  const iconType = computed(() => getQuickTransferHistoryIconType(props.primaryType))
  const iconLabel = computed(() => getQuickTransferHistoryTypeLabel(props.primaryType))
  const summaryText = computed(() => formatQuickTransferHistorySummary(props.summary))
  const showSummary = computed(() => shouldShowQuickTransferHistorySummary(props.primaryType, props.title, props.summary))
  const previewText = computed(() => getQuickTransferHistoryPreview(props.primaryType, props.preview))
  const showPreview = computed(() => shouldShowQuickTransferHistoryPreview(props.primaryType, props.title, props.preview))
  const showClaimProgress = computed(() => props.mode === 'sent' && props.claimCount !== undefined && props.maxClaims !== undefined)
  const claimProgress = computed(() =>
    showClaimProgress.value ? getQuickTransferSentClaimLabel(props.claimCount ?? 0, props.maxClaims ?? 0) : '',
  )

  const handleSelect = (): void => emit('select')
</script>

<template>
  <view class="history-card" hover-class="history-card--hover" :class="`history-card--${props.mode}`" @click="handleSelect">
    <view class="history-card__icon" :aria-label="iconLabel">
      <uni-icons :type="iconType" size="24" color="var(--theme-brand)" />
    </view>
    <view class="history-card__main">
      <view class="history-card__title-line">
        <text class="history-card__title">{{ props.title }}</text>
        <text
          v-if="props.mode === 'sent' && props.status"
          class="history-card__status"
          :class="{ 'history-card__status--ready': props.status === 'ready' }">
          {{ getQuickTransferSentStatusLabel(props.status) }}
        </text>
      </view>
      <text v-if="showSummary" class="history-card__summary">{{ summaryText }}</text>
      <text v-if="showPreview" class="history-card__preview">{{ previewText }}</text>
      <view class="history-card__meta">
        <text>{{ formatQuickTransferHistoryDate(props.time) }}</text>
        <text v-if="showClaimProgress"> · {{ claimProgress }}</text>
      </view>
    </view>
    <uni-icons type="right" size="18" color="var(--theme-text-secondary)" />
  </view>
</template>

<style scoped lang="scss">
  .history-card {
    display: flex;
    align-items: center;
    gap: 16rpx;
    min-height: 124rpx;
    padding: 18rpx 16rpx 18rpx 18rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 6rpx 18rpx var(--theme-shadow-xs);
  }

  .history-card--hover {
    background: var(--theme-surface-muted);
  }

  .history-card__icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 68rpx;
    height: 68rpx;
    border-radius: 20rpx;
    background: var(--theme-surface-muted);
  }

  .history-card__main {
    flex: 1;
    min-width: 0;
  }

  .history-card__title-line {
    display: flex;
    align-items: flex-start;
    gap: 10rpx;
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

  .history-card__summary,
  .history-card__preview,
  .history-card__meta {
    display: block;
    overflow: hidden;
    font-size: 22rpx;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-card__summary,
  .history-card__meta {
    margin-top: 5rpx;
    color: var(--theme-text-secondary);
  }

  .history-card__preview {
    margin-top: 5rpx;
    color: var(--theme-text);
  }

  .history-card__status {
    flex: 0 0 auto;
    max-width: 132rpx;
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
</style>
