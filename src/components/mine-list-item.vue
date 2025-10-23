<template>
  <view @click="onClick" class="mine-list-item" hover-class="none" hover-stop-propagation="false">
    <view class="left" hover-class="none" hover-stop-propagation="false">
      <image class="left-image" :src="data.icon"> </image>
    </view>
    <view class="center" hover-class="none" hover-stop-propagation="false">
      <text class="center-text">
        {{ data.name }}
      </text>
    </view>
    <view v-if="data.to" class="right" hover-class="none" hover-stop-propagation="false">
      <image class="right-image" :src="rightArrow1" />
    </view>
  </view>
</template>

<script setup lang="ts">
  import rightArrow1 from '@/static/image/mine/arrow_right_1.svg'
import { customizeTrack } from '@/utils/sensors'
  import { checkLoginBeforeNavigator } from '@/utils/wxLogin'
  type Data = {
    icon: string
    name: string
    to?: string
    needToken?: boolean
  }
  type Props = {
    data: Data
  }
  const props = defineProps<Props>()
  const onClick = () => {
    const { data } = props
    if(data.to==='/pages/mine/order/order'){
      customizeTrack('Business_MyOrders', '商务_我的订单')
    }
    if (data.to) {
      if (data.needToken) {
        checkLoginBeforeNavigator(data.to)
      } else {
        uni.navigateTo({
          url: data.to,
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .mine-list-item {
    display: flex;
    flex-direction: row;
    height: 106rpx;
    align-items: center;
    .left {
      width: 42rpx;
      height: 42rpx;
      margin-right: 30rpx;
      .left-image {
        width: 42rpx;
        height: 42rpx;
      }
    }
    .center {
      flex: 1;
      .center-text {
        font-size: 30rpx;
        color: $ga-gray-8;
      }
    }
    .right {
      width: 32rpx;
      height: 42rpx;
      padding: 5rpx 0;
      .right-image {
        width: 32rpx;
        height: 42rpx;
      }
    }
  }
</style>
