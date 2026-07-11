<template>
  <view class="tool-action-row" :class="{ 'tool-action-row--stacked': stacked }">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      stacked?: boolean
    }>(),
    {
      stacked: false,
    },
  )
</script>

<style scoped lang="scss">
  .tool-action-row {
    display: flex;
    gap: 16rpx;
    flex-wrap: wrap;
  }

  .tool-action-row--stacked {
    flex-direction: column;
  }
</style>
