<template>
  <view class="lineup-avatar-card">
    <view v-if="showName || showType" class="card-head">
      <text v-if="showName" class="card-name">{{ name || '未命名阵容' }}</text>
      <text v-if="showType && typeText" class="card-type">{{ typeText }}</text>
    </view>

    <text v-if="showDescription && description" class="card-desc">{{ description }}</text>

    <StateBlock v-if="!characters.length" class="empty-inner" :text="emptyText" />

    <view v-else class="avatar-grid" :style="gridStyle">
      <view v-for="(item, index) in characters" :key="item.characterId || item.id || index" class="avatar-card">
        <view class="avatar-wrap">
          <view v-if="showAttributes && (item.elementKey || item.element)" class="avatar-element">
            <SwcElementBadge :element-key="item.elementKey || item.element" :label="item.elementName" :size="24" :show-label="false" />
          </view>
          <image v-if="item.avatar" class="avatar-image" :src="item.avatar" mode="aspectFill" />
          <view v-else class="avatar-image avatar-placeholder">
            <text>{{ (item.name || item.label || '?').slice(0, 1) }}</text>
          </view>
          <text v-if="showStars && item.stars" class="avatar-stars">{{ item.stars }}★</text>
        </view>
        <text v-if="showCharacterName" class="avatar-name">{{ item.name || item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import SwcElementBadge from './swc-element-badge.vue'
  import StateBlock from './state-block.vue'
  import { getLineupTypeLabel } from '../lineup-meta'
  import type { LineupCharacterPreview } from '@/services/compendium-lineups'

  const props = withDefaults(
    defineProps<{
      characters?: LineupCharacterPreview[]
      name?: string
      type?: string
      description?: string
      showName?: boolean
      showType?: boolean
      showDescription?: boolean
      showAttributes?: boolean
      showStars?: boolean
      showCharacterName?: boolean
      columns?: number
      avatarSize?: number
      emptyText?: string
    }>(),
    {
      characters: () => [],
      name: '',
      type: '',
      description: '',
      showName: false,
      showType: false,
      showDescription: false,
      showAttributes: false,
      showStars: false,
      showCharacterName: false,
      columns: 5,
      avatarSize: 92,
      emptyText: '暂无角色',
    },
  )

  const typeText = computed(() => (props.type ? getLineupTypeLabel(props.type) : ''))

  const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
    '--avatar-size': `${props.avatarSize}rpx`,
  }))
</script>

<style scoped lang="scss">
  .lineup-avatar-card {
    display: flex;
    flex-direction: column;
    gap: 14rpx;
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex-wrap: wrap;
  }

  .card-name {
    color: #172033;
    font-size: 28rpx;
    font-weight: 800;
  }

  .card-type {
    font-size: 22rpx;
    font-weight: 700;
    color: #0f766e;
    background: #ccfbf1;
    border-radius: 999rpx;
    padding: 4rpx 14rpx;
  }

  .card-desc {
    color: #667085;
    font-size: 22rpx;
    line-height: 1.6;
  }

  .empty-inner {
    padding: 20rpx;
    text-align: center;
    color: #98a2b3;
    font-size: 22rpx;
    background: #f8fafc;
    border-radius: 16rpx;
  }

  .avatar-grid {
    display: grid;
    gap: 16rpx 12rpx;
    align-items: start;
  }

  .avatar-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
  }

  .avatar-wrap {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .avatar-element {
    position: absolute;
    top: -6rpx;
    right: 10rpx;
    width: 40rpx;
    height: 40rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.96);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6rpx 14rpx rgba(15, 23, 42, 0.14);
    z-index: 1;
  }

  .avatar-image {
    width: var(--avatar-size);
    height: var(--avatar-size);
    border-radius: 24rpx;
    background: #e5e7eb;
    box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.12);
    flex-shrink: 0;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f766e;
    font-weight: 800;
  }

  .avatar-stars {
    position: absolute;
    bottom: -6rpx;
    left: 50%;
    transform: translateX(-50%);
    padding: 2rpx 12rpx;
    border-radius: 999rpx;
    background: rgba(15, 23, 42, 0.82);
    color: #fde68a;
    font-size: 18rpx;
    font-weight: 800;
    white-space: nowrap;
  }

  .avatar-name {
    max-width: 100%;
    color: #475467;
    font-size: 20rpx;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
