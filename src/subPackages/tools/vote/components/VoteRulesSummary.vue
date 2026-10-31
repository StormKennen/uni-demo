<script setup lang="ts">
  import { getVoteRuleSummary, formatVoteDate } from '../constants'
  import type { Vote } from '../types'

  const props = defineProps<{ vote: Vote }>()
</script>

<template>
  <view class="rules-card">
    <view class="rules-heading">
      <text class="rules-title">投票规则</text>
      <text class="rules-hint">提交前请先确认</text>
    </view>
    <view class="rules-list">
      <text v-for="rule in getVoteRuleSummary(props.vote)" :key="rule" class="rule-chip">{{ rule }}</text>
    </view>
    <text class="deadline">{{ props.vote.schedule.endAt ? `截止：${formatVoteDate(props.vote.schedule.endAt)}` : '不限制截止时间' }}</text>
  </view>
</template>

<style scoped lang="scss">
  .rules-card {
    margin-bottom: 20rpx;
    padding: 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    background: var(--theme-surface);
  }

  .rules-heading {
    display: flex;
    align-items: baseline;
  }

  .rules-title {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .rules-hint {
    margin-left: 12rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .rules-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 16rpx;
  }

  .rule-chip {
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 21rpx;
  }

  .deadline {
    display: block;
    margin-top: 16rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }
</style>
