<template>
  <view class="guide-box">
    <view class="guide-title">
      <image class="guide-icon" :src="guideIcon">
      </image>
      <text class="guide-title-text">{{ title }}</text>
    </view>
    <view class="guide-list">
      <view class="guide-item" v-for="item in list" :key="item">
        <view class="guide-item-icon"></view>
        <text>{{item}}</text>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">

withDefaults(defineProps<{
  title?: string
  list: string[]
}>(), {
  title: '温馨提示'
})

const guideIcon = import.meta.env.VITE_APP_CDN_OSS_BUSINESS + '/friendly-reminder.svg'

</script>

<style scoped lang="scss">
.guide-box {
  box-sizing: border-box;
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  background-image: url('https://cdn-public.galaxy-immi.com/business/common/guide-icon.png');
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 100% 200rpx;
}

.guide-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 24rpx;

}

.guide-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
}

.guide-title-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #0046B4;
}

.guide-list {
  .guide-item {
    font-size: 24rpx;
    color: #435163;
    line-height: 40rpx;
    font-weight: 400;
    margin-bottom: 16rpx;
    display: flex;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.guide-item-icon {
  width: 10rpx;
  height: 10rpx;
  border-radius: 5rpx;
  background-color: #ccdbff;
  margin-right: 10rpx;
  flex-shrink: 0;
  margin-top: 15rpx;
}
</style>