<template>
  <view class="rta-card" :class="{ disabled: !item.character }" @click="handleClick">
    <view class="rank" :class="{ podium: item.rank <= 3 }">
      <text>{{ item.rank }}</text>
    </view>

    <view class="identity">
      <view class="avatar-wrap">
        <SwcAvatarFrame :src="item.character?.avatar || ''" :name="displayName" :size="112" shape="square" />
        <view v-if="item.character?.element" class="element-overlay">
          <SwcSquareIcon kind="element" :icon-key="item.character.element.key" :size="30" :radius="0" />
        </view>
      </view>
      <view class="identity-copy">
        <text class="monster-name">{{ displayName }}</text>
        <text v-if="!item.character" class="unmapped">图鉴暂未收录</text>
      </view>
    </view>

    <view class="primary-metrics">
      <view class="metric primary">
        <text class="metric-value">{{ formatRate(item.stats.pickRate) }}</text>
        <text class="metric-label">选择率</text>
      </view>
      <view class="metric primary count">
        <text class="metric-value">{{ formatCount(item.stats.pickCount) }}</text>
        <text class="metric-label">场次</text>
      </view>
    </view>

    <view class="secondary-metrics">
      <view class="metric">
        <text class="metric-value secondary-value">{{ formatRate(item.stats.banRate) }}</text>
        <text class="metric-label">被 Ban 率</text>
      </view>
      <view class="metric">
        <text class="metric-value secondary-value">{{ formatRate(item.stats.leaderRate) }}</text>
        <text class="metric-label">队长选取率</text>
      </view>
      <view class="metric">
        <text class="metric-value secondary-value win-value">{{ formatRate(item.stats.winRate) }}</text>
        <text class="metric-label">队伍胜率</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import SwcAvatarFrame from '../../components/swc-avatar-frame.vue'
  import SwcSquareIcon from '../../components/swc-square-icon.vue'
  import { formatCount, formatRate } from '../rta-normalizers'
  import type { RtaRankingItem } from '../rta-types'

  const props = defineProps<{
    item: RtaRankingItem
  }>()

  const emit = defineEmits<{
    (event: 'select', item: RtaRankingItem): void
    (event: 'unmapped'): void
  }>()

  const displayName = computed(() => props.item.character?.family?.name || props.item.character?.name || '')

  const handleClick = () => {
    if (!props.item.character) {
      emit('unmapped')
      return
    }
    emit('select', props.item)
  }
</script>

<style scoped lang="scss">
  .rta-card {
    display: grid;
    grid-template-columns: 48rpx 112rpx minmax(0, 1fr);
    grid-template-areas:
      'rank identity primary'
      'rank identity secondary';
    column-gap: 14rpx;
    row-gap: 18rpx;
    padding: 22rpx 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 6rpx 18rpx var(--theme-shadow-xs);
    transition: background-color 160ms ease;
  }

  .rta-card:active:not(.disabled) {
    background: var(--theme-surface-2);
  }

  .rta-card.disabled {
    cursor: default;
  }

  .rank {
    grid-area: rank;
    align-self: center;
    color: var(--theme-text-tertiary);
    font-size: 28rpx;
    font-weight: 800;
    text-align: center;
  }

  .rank.podium {
    color: var(--theme-brand);
    font-size: 34rpx;
  }

  .identity {
    grid-area: identity;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  .avatar-wrap {
    position: relative;
    width: 112rpx;
    height: 112rpx;
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
  }

  .element-overlay {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    width: 30rpx;
    height: 30rpx;
  }

  .identity-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
    text-align: center;
  }

  .monster-name {
    display: block;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 700;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .unmapped {
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
    white-space: nowrap;
  }

  .primary-metrics {
    grid-area: primary;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10rpx;
  }

  .secondary-metrics {
    grid-area: secondary;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .metric {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5rpx;
    text-align: center;
  }

  .metric-value {
    max-width: 100%;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 750;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .metric.primary .metric-value {
    font-size: 31rpx;
  }

  .metric.primary.count .metric-value {
    font-size: 27rpx;
  }

  .metric-label {
    max-width: 100%;
    overflow: hidden;
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .secondary-value {
    font-size: 22rpx;
  }

  .win-value {
    color: var(--theme-brand);
  }
</style>
