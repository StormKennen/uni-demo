<script setup lang="ts">
  type Props = {
    text?: string
  }
  const props = defineProps<Props>()
  
</script>

<template>
  <view class="no-more">
    <text>{{text || '没有更多啦～'}}</text>
  </view>
</template>

<style lang="scss" scoped>
  .no-more {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24rpx;
    color: $ga-gray-4;
    padding: 32rpx 0;
  }
</style>
