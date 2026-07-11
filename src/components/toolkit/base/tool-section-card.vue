<template>
  <view class="tool-section-card">
    <view v-if="title || subtitle || $slots.header" class="tool-section-card__header">
      <slot name="header">
        <view class="tool-section-card__title-wrap">
          <text v-if="title" class="tool-section-card__title">{{ title }}</text>
          <text v-if="subtitle" class="tool-section-card__subtitle">{{ subtitle }}</text>
        </view>
      </slot>
    </view>
    <view class="tool-section-card__body">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
  defineProps<{
    title?: string
    subtitle?: string
  }>()
</script>

<style scoped lang="scss">
  .tool-section-card {
    background: var(--theme-surface);
    border-radius: 24rpx;
    padding: 28rpx;
    box-shadow: 0 6rpx 20rpx var(--theme-shadow-xs);
  }

  .tool-section-card__header {
    margin-bottom: 20rpx;
  }

  .tool-section-card__title-wrap {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .tool-section-card__title {
    font-size: 32rpx;
    font-weight: 700;
    color: var(--theme-text);
  }

  .tool-section-card__subtitle {
    font-size: 24rpx;
    line-height: 1.5;
    color: var(--theme-text-secondary);
  }

  .tool-section-card__body {
    min-width: 0;
  }
</style>
