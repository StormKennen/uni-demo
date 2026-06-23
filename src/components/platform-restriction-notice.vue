<template>
  <view class="restriction-card">
    <text class="restriction-title">{{ title }}</text>
    <text class="restriction-desc">{{ description }}</text>
    <button v-if="actionText" class="restriction-btn" @click="$emit('action')">{{ actionText }}</button>
  </view>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    title?: string
    description: string
    actionText?: string
  }>(), {
    title: '当前平台暂不提供该功能',
    actionText: '',
  })

  defineEmits<{
    (event: 'action'): void
  }>()
</script>

<style scoped lang="scss">
  .restriction-card {
    margin: 32rpx;
    padding: 40rpx 32rpx;
    border-radius: 24rpx;
    background: #fff;
    box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
    text-align: center;
  }

  .restriction-title {
    display: block;
    color: #111827;
    font-size: 34rpx;
    font-weight: 700;
  }

  .restriction-desc {
    display: block;
    margin-top: 16rpx;
    color: #667085;
    font-size: 26rpx;
    line-height: 1.7;
  }

  .restriction-btn {
    margin-top: 28rpx;
    border-radius: 999rpx;
    background: #667eea;
    color: #fff;
    font-size: 26rpx;
    font-weight: 700;
  }
</style>
