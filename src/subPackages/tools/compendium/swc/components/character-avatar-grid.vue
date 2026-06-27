<template>
  <view class="avatar-grid" :style="gridStyle">
    <view v-for="(item, index) in items" :key="item.characterId || item.id || index" class="avatar-card">
      <view class="avatar-wrap">
        <text v-if="showOrder" class="avatar-order">{{ index + 1 }}</text>
        <view v-if="showElement && (item.elementKey || item.elementName || item.element)" class="avatar-element">
          <SwcElementBadge :element-key="item.elementKey || item.element" :label="item.elementName" :size="24" :show-label="false" />
        </view>
        <image v-if="item.avatar" class="avatar-image" :src="item.avatar" mode="aspectFill" />
        <view v-else class="avatar-image avatar-placeholder">
          <text>{{ (item.name || item.label || '?').slice(0, 1) }}</text>
        </view>
      </view>

      <button
        v-if="showAction"
        class="avatar-action"
        :class="actionThemeClass"
        size="mini"
        @click="emit('action', item.characterId || item.id)">
        {{ actionText }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import SwcElementBadge from './swc-element-badge.vue'
  import type { CharacterOption } from '@/services/compendium-lineups'

  type ActionTheme = 'danger' | 'primary' | 'default'

  const props = withDefaults(
    defineProps<{
      items: CharacterOption[]
      columns?: number
      minHeight?: number
      showOrder?: boolean
      showAction?: boolean
      actionText?: string
      actionTheme?: ActionTheme
      avatarSize?: number
      showElement?: boolean
    }>(),
    {
      columns: 5,
      minHeight: 176,
      showOrder: false,
      showAction: true,
      actionText: '移除',
      actionTheme: 'danger',
      avatarSize: 92,
      showElement: true,
    },
  )

  const emit = defineEmits<{
    (event: 'action', characterId: string): void
  }>()

  const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
    minHeight: `${props.minHeight}rpx`,
    '--avatar-size': `${props.avatarSize}rpx`,
  }))

  const actionThemeClass = computed(() => `theme-${props.actionTheme}`)
</script>

<style scoped lang="scss">
  .avatar-grid {
    display: grid;
    gap: 18rpx 12rpx;
    align-items: start;
  }

  .avatar-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding-top: 4rpx;
  }

  .avatar-wrap {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .avatar-order {
    position: absolute;
    top: -8rpx;
    left: 50%;
    transform: translateX(-50%);
    min-width: 36rpx;
    height: 36rpx;
    line-height: 36rpx;
    padding: 0 8rpx;
    border-radius: 999rpx;
    background: #7c3aed;
    color: #fff;
    font-size: 22rpx;
    font-weight: 800;
    text-align: center;
    z-index: 1;
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
    color: #7c3aed;
    font-weight: 800;
  }

  .avatar-action {
    min-width: 88rpx;
    height: 44rpx;
    line-height: 44rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    font-weight: 700;
  }

  .avatar-action.theme-danger {
    color: #dc2626;
    background: #fff1f2;
    border: 1rpx solid #fecdd3;
  }

  .avatar-action.theme-primary {
    color: #92400e;
    background: #fff7ed;
    border: 1rpx solid #fed7aa;
  }

  .avatar-action.theme-default {
    color: #475467;
    background: #f8fafc;
    border: 1rpx solid #e5e7eb;
  }
</style>
