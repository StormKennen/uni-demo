<script setup lang="ts">
  import { computed } from 'vue'
  import type { VoteOption, VoteResult } from '../types'

  const props = defineProps<{
    options: VoteOption[]
    result: VoteResult | null | undefined
  }>()

  const resultByOptionId = computed(() => new Map((props.result?.options || []).map(item => [item.optionId, item])))
  const highestCount = computed(() => Math.max(...(props.result?.options || []).map(item => item.count), 0))
</script>

<template>
  <view class="result-card">
    <view class="section-heading">
      <text class="section-title">投票结果</text>
      <text class="section-hint">{{ props.result?.totalBallots || 0 }} 人已投</text>
    </view>
    <view v-if="props.result && props.options.length" class="result-list">
      <view v-for="option in props.options" :key="option.id" class="result-row">
        <view class="result-label-row">
          <text class="result-label">{{ option.text }}</text>
          <text class="result-value"
            >{{ resultByOptionId.get(option.id)?.count || 0 }} 票 · {{ resultByOptionId.get(option.id)?.percentage || 0 }}%</text
          >
        </view>
        <view class="progress-track">
          <view
            class="progress-bar"
            :class="{ highest: highestCount > 0 && resultByOptionId.get(option.id)?.count === highestCount }"
            :style="{ width: `${Math.min(100, resultByOptionId.get(option.id)?.percentage || 0)}%` }" />
        </view>
      </view>
    </view>
    <view v-else class="empty-result"><text>暂无结果</text></view>
  </view>
</template>

<style scoped lang="scss">
  .result-card {
    margin-bottom: 20rpx;
    padding: 22rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    box-shadow: 0 8rpx 28rpx var(--theme-shadow-xs);
  }

  .section-heading,
  .result-label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .section-hint,
  .result-value {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .result-row + .result-row {
    margin-top: 24rpx;
  }

  .result-label {
    min-width: 0;
    color: var(--theme-text);
    font-size: 25rpx;
  }

  .progress-track {
    height: 16rpx;
    margin-top: 10rpx;
    overflow: hidden;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
  }

  .progress-bar {
    height: 100%;
    min-width: 4rpx;
    border-radius: inherit;
    background: var(--theme-surface-2);
  }

  .progress-bar.highest {
    background: var(--theme-brand);
  }

  .empty-result {
    padding: 28rpx 0 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
    text-align: center;
  }
</style>
