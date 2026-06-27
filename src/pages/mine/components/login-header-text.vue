<script setup lang="ts">
type Props = {}
const props = defineProps<Props>()
</script>

<template>
  <view class="login-header">
    <!-- <view class="hello" hover-class="none" hover-stop-propagation="false">
      <text class="hello-text">Hello!</text>
    </view> -->
    <view class="welcome" hover-class="none" hover-stop-propagation="false">
      <text class="welcome-text">欢迎使用</text>
    </view>
    <view class="service" hover-class="none" hover-stop-propagation="false">
      <text class="service-text">登录后可享受优质服务</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-header{
  padding: 40rpx 8rpx 12rpx;
  box-sizing: border-box;
  .hello {
    .hello-text{
      font-size: 36rpx;
      font-weight: 700;
      line-height: 150%;
      color: $ga-brand-4;
      font-family: 'Alibaba PuHuiTi 3.0';
    }
  }
  .welcome {
    .welcome-text{
      font-size: 52rpx;
      font-weight: 700;
      line-height: 1.25;
      color: $ga-gray-8;
      font-family: 'Alibaba PuHuiTi 3.0';
    }
  }
  .service {
    margin-top: 12rpx;
    .service-text{
      font-size: 26rpx;
      font-weight: 400;
      line-height: 1.5;
      color: $ga-gray-7;
      font-family: 'Alibaba PuHuiTi 3.0';
    }
  }
}
</style>
