<script setup lang="ts">
type Props = {}
const props = defineProps<Props>()
</script>

<template>
  <view class="login-header">
    <view class="hello" hover-class="none" hover-stop-propagation="false">
      <text class="hello-text">Hello!</text>
    </view>
    <view class="welcome" hover-class="none" hover-stop-propagation="false">
      <text class="welcome-text">欢迎使用kai通</text>
    </view>
    <view class="service" hover-class="none" hover-stop-propagation="false">
      <text class="service-text">登录后可享受优质服务</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-header{
  padding: 168rpx 72rpx 92rpx 72rpx;
  .hello {
    .hello-text{
      font-size: 48rpx;
      font-weight: 700;
      line-height: 150%;
      color: $ga-brand-4;
      font-family: 'Alibaba PuHuiTi 3.0';
    }
  }
  .welcome {
    .welcome-text{
      font-size: 64rpx;
      font-weight: 700;
      line-height: 150%;
      color: $ga-gray-8;
      font-family: 'Alibaba PuHuiTi 3.0';
    }
  }
  .service {
    margin-top: 8rpx;
    .service-text{
      font-size: 32rpx;
      font-weight: 300;
      line-height: 150%;
      color: $ga-gray-7;
      font-family: 'Alibaba PuHuiTi 3.0';
    }
  }
}
</style>
