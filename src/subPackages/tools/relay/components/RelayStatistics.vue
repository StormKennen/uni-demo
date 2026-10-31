<script setup lang="ts">
  import { computed } from 'vue'
  import { getAggregateRows } from '../normalizers'
  import type { RelayDetailViewModel } from '../types'

  const props = defineProps<{ detail: RelayDetailViewModel }>()
  const aggregateRows = computed(() => getAggregateRows(props.detail))
</script>

<template>
  <view v-if="detail.relay.settings.showStatistics" class="statistics-card">
    <view v-if="detail.relay.settings.showParticipantCount" class="statistics-item statistics-item--primary">
      <text class="statistics-value">{{ detail.statistics.participantCount }}</text>
      <text class="statistics-label">人参与</text>
    </view>
    <view class="statistics-item">
      <text class="statistics-value">{{ detail.statistics.entryCount }}</text>
      <text class="statistics-label">条接龙</text>
    </view>
    <view v-for="row in aggregateRows" :key="row.key" class="statistics-item">
      <text class="statistics-value">{{ row.value }}</text>
      <text class="statistics-label">{{ row.label }}合计</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .statistics-card {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 24rpx;
    padding: 24rpx 20rpx;
    border-radius: 20rpx;
    background: var(--theme-brand);
    color: var(--theme-bg);
  }

  .statistics-item {
    flex: 1;
    min-width: 150rpx;
    padding: 4rpx 12rpx;
    border-left: 1rpx solid var(--theme-border);
  }

  .statistics-item--primary {
    border-left: 0;
  }

  .statistics-value,
  .statistics-label {
    display: block;
  }

  .statistics-value {
    font-size: 38rpx;
    font-weight: 800;
  }

  .statistics-label {
    margin-top: 6rpx;
    font-size: 22rpx;
    opacity: 0.86;
  }
</style>
