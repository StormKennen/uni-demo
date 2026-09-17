<template>
  <view class="ranking-card" :class="`tier-${tierClass}`" @tap="handleTap">
    <view class="ranking-position">
      <text class="position-number">{{ item.rank }}</text>
      <text class="position-label">位</text>
    </view>

    <view class="avatar-wrap">
      <SwcAvatarFrame :src="item.character?.avatar || ''" :name="displayName" :size="92" shape="square">
        <view v-if="item.character?.element" class="element-badge">
          <SwcElementBadge
            :element-key="item.character.element.key"
            :label="item.character.element.name"
            :size="24"
            :font-size="18"
            :gap="4" />
        </view>
      </SwcAvatarFrame>
    </view>

    <view class="identity">
      <view class="identity-heading">
        <text class="character-name">{{ displayName }}</text>
        <text v-if="item.character?.stars" class="stars">{{ item.character.stars }}★</text>
      </view>
      <SwcElementBadge
        v-if="item.character?.element"
        class="identity-element"
        :element-key="item.character.element.key"
        :label="item.character.element.name"
        :size="22"
        :font-size="20"
        :gap="5" />
      <text v-if="!item.character" class="unmapped">图鉴暂未收录</text>
      <text v-else-if="item.character.code" class="character-code">{{ item.character.code }}</text>
    </view>

    <view class="tier-badge">
      <text class="tier-key">{{ item.tier.name }}</text>
      <text v-if="item.score !== null" class="tier-score">{{ item.score.toFixed(2) }}</text>
      <text class="tier-caption">AI评分</text>
    </view>

    <uni-icons v-if="item.character" type="right" size="16" color="var(--theme-text-tertiary)" />
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import SwcAvatarFrame from '../../components/swc-avatar-frame.vue'
  import SwcElementBadge from '../../components/swc-element-badge.vue'
  import type { TierRankingItem } from '../types'

  const props = defineProps<{
    item: TierRankingItem
  }>()

  const emit = defineEmits<{
    (event: 'select', item: TierRankingItem): void
  }>()

  const displayName = computed(() => props.item.character?.name || props.item.source.name || '未知魔灵')
  const tierClass = computed(() => props.item.tier.key.toLowerCase().replace(/[^a-z0-9]+/g, '-'))

  const handleTap = () => {
    if (props.item.character) emit('select', props.item)
  }
</script>

<style scoped lang="scss">
  .ranking-card {
    display: grid;
    grid-template-columns: 48rpx 92rpx minmax(0, 1fr) auto 18rpx;
    align-items: center;
    gap: 14rpx;
    min-height: 132rpx;
    padding: 18rpx 16rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-left: 6rpx solid var(--tier-color, var(--theme-border));
    border-radius: 16rpx;
    background: var(--theme-surface);
    box-shadow: 0 5rpx 14rpx var(--theme-shadow-xs);
  }

  .ranking-card:active {
    background: var(--theme-surface-2);
  }

  .tier-sss {
    --tier-color: #b45309;
  }

  .tier-ss {
    --tier-color: #c2410c;
  }

  .tier-s {
    --tier-color: #7c3aed;
  }

  .tier-a {
    --tier-color: #2563eb;
  }

  .tier-b {
    --tier-color: #0f766e;
  }

  .tier-c {
    --tier-color: #64748b;
  }

  .tier-other {
    --tier-color: #94a3b8;
  }

  .ranking-position {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--theme-text-tertiary);
  }

  .position-number {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 800;
    line-height: 1.1;
  }

  .position-label {
    margin-top: 3rpx;
    font-size: 18rpx;
    line-height: 1.1;
  }

  .avatar-wrap {
    width: 92rpx;
    height: 92rpx;
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
  }

  .element-badge {
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    padding: 3rpx 5rpx;
    color: #fff;
    background: rgba(15, 23, 42, 0.78);
  }

  .identity {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 7rpx;
  }

  .identity-heading {
    display: flex;
    align-items: baseline;
    min-width: 0;
    max-width: 100%;
    gap: 8rpx;
  }

  .character-name {
    min-width: 0;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 750;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stars {
    flex: none;
    color: #d97706;
    font-size: 18rpx;
    line-height: 1.2;
  }

  .identity-element {
    color: var(--theme-text-secondary);
  }

  .character-code,
  .unmapped {
    max-width: 100%;
    overflow: hidden;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tier-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 86rpx;
    min-height: 82rpx;
    padding: 6rpx 4rpx;
    box-sizing: border-box;
    border-radius: 12rpx;
    border: 1rpx solid var(--tier-color);
    background: var(--theme-surface-2);
  }

  .tier-key {
    color: var(--tier-color);
    font-size: 30rpx;
    font-weight: 900;
    line-height: 1.05;
  }

  .tier-caption {
    margin-top: 5rpx;
    color: var(--theme-text-tertiary);
    font-size: 16rpx;
    line-height: 1.1;
  }

  .tier-score {
    margin-top: 4rpx;
    color: var(--tier-color);
    font-size: 19rpx;
    font-weight: 750;
    line-height: 1.1;
  }
</style>
