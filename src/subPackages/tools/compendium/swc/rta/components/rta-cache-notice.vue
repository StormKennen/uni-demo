<template>
  <view class="cache-notice">
    <uni-icons type="info" size="16" color="var(--theme-text-secondary)" />
    <text>数据源暂时繁忙，当前展示缓存数据</text>
  </view>
</template>

<style scoped lang="scss">
  .cache-notice {
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 18rpx 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.45;
  }
</style>
