<template>
  <view class="tier-list">
    <view v-for="group in props.groups" :key="group.key" class="tier-section" :class="`tier-section-${tierClass(group.key)}`">
      <view class="tier-label">
        <text class="tier-label-name">{{ group.name }}</text>
        <text v-if="props.showCounts" class="tier-label-count">{{ group.items.length }}</text>
      </view>

      <view class="tier-items">
        <view
          v-for="item in group.items"
          :key="item.id"
          class="tier-item"
          :class="{ unmapped: !item.character }"
          :aria-label="item.character ? `查看${displayName(item)}` : `${displayName(item)}未收录`"
          @tap="handleTap(item)">
          <view class="tier-avatar">
            <SwcAvatarFrame :src="item.character?.avatar || ''" :name="displayName(item)" :size="96" shape="square">
              <text v-if="props.showScore && item.score !== null" class="score-badge">{{ item.score.toFixed(2) }}</text>
              <view v-if="props.showAvatarElementBadge && item.character?.element" class="element-badge">
                <SwcSquareIcon kind="element" :icon-key="item.character.element.key" :size="28" :radius="0" />
              </view>
            </SwcAvatarFrame>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import SwcAvatarFrame from '../../components/swc-avatar-frame.vue'
  import SwcSquareIcon from '../../components/swc-square-icon.vue'
  import type { TierRankingItem } from '../types'

  interface TierRankingGroup {
    key: string
    name: string
    items: TierRankingItem[]
  }

  const props = defineProps<{
    groups: TierRankingGroup[]
    showAvatarElementBadge: boolean
    showCounts: boolean
    showScore: boolean
  }>()

  const emit = defineEmits<{
    (event: 'select', item: TierRankingItem): void
  }>()

  const displayName = (item: TierRankingItem): string => item.character?.name || item.source.name || '未知魔灵'
  const tierClass = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const handleTap = (item: TierRankingItem) => {
    if (item.character) emit('select', item)
  }
</script>

<style scoped lang="scss">
  .tier-list {
    display: grid;
    gap: 0;
  }

  .tier-section {
    display: flex;
    align-items: stretch;
    min-width: 0;
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 0;
    background: var(--theme-surface);
    box-shadow: 0 5rpx 14rpx var(--theme-shadow-xs);
  }

  .tier-section:first-child {
    border-top-left-radius: 14rpx;
    border-top-right-radius: 14rpx;
  }

  .tier-section:last-child {
    border-bottom-left-radius: 14rpx;
    border-bottom-right-radius: 14rpx;
  }

  .tier-section:only-child {
    border-radius: 14rpx;
  }

  .tier-label {
    display: flex;
    flex: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 112rpx;
    padding: 20rpx 10rpx;
    box-sizing: border-box;
    background: var(--tier-background, var(--theme-surface-2));
    color: var(--tier-foreground, #172033);
  }

  .tier-label-name {
    max-width: 100%;
    overflow: hidden;
    font-size: 30rpx;
    font-weight: 900;
    line-height: 1.15;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tier-label-count {
    margin-top: 9rpx;
    font-size: 17rpx;
    font-weight: 700;
    opacity: 0.68;
  }

  .tier-items {
    display: grid;
    flex: 1;
    min-width: 0;
    padding: 16rpx 14rpx;
    box-sizing: border-box;
    background: var(--theme-surface);
  }

  .tier-item-grid,
  .tier-items {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16rpx 8rpx;
  }

  .tier-item {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    flex-direction: column;
    gap: 6rpx;
    color: var(--theme-text);
  }

  .tier-item:active .tier-avatar {
    transform: scale(0.94);
  }

  .tier-item.unmapped {
    color: var(--theme-text-tertiary);
    opacity: 0.62;
  }

  .tier-avatar {
    width: 96rpx;
    height: 96rpx;
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    transition: transform 120ms ease;
  }

  .element-badge {
    position: absolute;
    z-index: 3;
    right: 0;
    bottom: -1rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28rpx;
    height: 28rpx;
    background: transparent;
  }

  .score-badge {
    position: absolute;
    z-index: 3;
    top: 4rpx;
    left: 4rpx;
    padding: 3rpx 5rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.35);
    border-radius: 6rpx;
    background: rgba(15, 23, 42, 0.68);
    color: #f8fafc;
    font-size: 16rpx;
    font-weight: 700;
    line-height: 1.1;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.28);
    white-space: nowrap;
  }

  .tier-section-other .tier-label-name {
    overflow: visible;
    font-size: 24rpx;
    text-overflow: clip;
    white-space: nowrap;
  }

  .tier-section-sss {
    --tier-background: #f7787f;
  }

  .tier-section-ss {
    --tier-background: #ffc078;
  }

  .tier-section-s {
    --tier-background: #f9df7b;
  }

  .tier-section-a {
    --tier-background: #a6f276;
  }

  .tier-section-b {
    --tier-background: #8d88f3;
  }

  .tier-section-c {
    --tier-background: #49e4e8;
  }

  .tier-section-other {
    --tier-background: #cbd5e1;
  }

  @media screen and (min-width: 700px) {
    .tier-items {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }
  }
</style>
