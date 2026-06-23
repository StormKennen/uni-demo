<template>
  <view class="sticky-action-bar" :class="{ fixed }" :style="barStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(defineProps<{
    fixed?: boolean
    horizontalPadding?: number
    topPadding?: number
    bottomPadding?: number
    background?: string
  }>(), {
    fixed: true,
    horizontalPadding: 24,
    topPadding: 20,
    bottomPadding: 24,
    background: 'rgba(246, 247, 251, 0.96)',
  })

  const barStyle = computed(() => ({
    padding: `${props.topPadding}rpx ${props.horizontalPadding}rpx calc(${props.bottomPadding}rpx + env(safe-area-inset-bottom))`,
    background: props.background,
  }))
</script>

<style scoped lang="scss">
  .sticky-action-bar {
    display: flex;
    flex-shrink: 0;
    gap: 20rpx;
    z-index: 20;
    box-shadow: 0 -8rpx 24rpx rgba(15, 23, 42, 0.06);
    backdrop-filter: blur(12rpx);
  }

  .sticky-action-bar.fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
