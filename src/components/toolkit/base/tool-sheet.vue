<template>
  <MyPopup v-model="visible" type="bottom" :safe-area="true" :scrollable="false" background-color="var(--theme-elevated)">
    <view class="tool-sheet">
      <view class="tool-sheet__handle"></view>
      <view class="tool-sheet__header">
        <view class="tool-sheet__title-wrap">
          <text class="tool-sheet__title">{{ title }}</text>
          <text v-if="description" class="tool-sheet__desc">{{ description }}</text>
        </view>
        <view class="tool-sheet__close" @click="visible = false">
          <uni-icons type="closeempty" size="20" color="var(--theme-text-secondary)" />
        </view>
      </view>
      <view class="tool-sheet__body">
        <slot></slot>
      </view>
    </view>
  </MyPopup>
</template>

<script setup lang="ts">
  import MyPopup from '@/components/popup.vue'

  defineProps<{
    title: string
    description?: string
  }>()

  const visible = defineModel<boolean>({ default: false })
</script>

<style scoped lang="scss">
  .tool-sheet {
    padding: 16rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
    background: var(--theme-elevated);
  }

  .tool-sheet__handle {
    width: 88rpx;
    height: 8rpx;
    border-radius: 999rpx;
    background: var(--theme-border);
    margin: 8rpx auto 20rpx;
  }

  .tool-sheet__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24rpx;
    padding: 0 8rpx 20rpx;
  }

  .tool-sheet__title-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .tool-sheet__title {
    font-size: 32rpx;
    font-weight: 700;
    color: var(--theme-text);
  }

  .tool-sheet__desc {
    font-size: 24rpx;
    line-height: 1.5;
    color: var(--theme-text-secondary);
  }

  .tool-sheet__close {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: var(--theme-surface-2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .tool-sheet__body {
    max-height: 78vh;
    overflow-y: auto;
  }
</style>
