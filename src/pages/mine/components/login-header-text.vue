<template>
  <view class="login-header">
    <view class="welcome" hover-class="none" hover-stop-propagation="false">
      <text class="welcome-text">欢迎使用</text>
    </view>
    <view class="service" hover-class="none" hover-stop-propagation="false">
      <text class="service-text">登录后可享受优质服务</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
  .login-header {
    padding: 40rpx 8rpx 12rpx;
    box-sizing: border-box;
  }

  .welcome-text {
    font-size: 52rpx;
    font-weight: 700;
    line-height: 1.25;
    color: var(--theme-text);
    font-family: 'Alibaba PuHuiTi 3.0';
  }

  .service {
    margin-top: 12rpx;
  }

  .service-text {
    font-size: 26rpx;
    font-weight: 400;
    line-height: 1.5;
    color: var(--theme-text-secondary);
    font-family: 'Alibaba PuHuiTi 3.0';
  }
</style>
