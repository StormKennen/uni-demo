<script setup lang="ts">
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { ref } from 'vue'

  const op = ref()

  const isLoad = ref(false)

  const toPay = ()=>{
    const options = op.value
    const path = `pages/pay/pay?code=${options.code}&orderId=${options.orderId}&merchId=${options.merchId}&payTypeList=${options.payTypeList}&source=education-mini-app`
    uni.navigateToMiniProgram({
      appId: 'wx1e454d4b43f3c7fd',
      path,
      envVersion: import.meta.env.VITE_APP_ENV === 'production' ? 'release' : 'trial',
      fail: error => {
        console.log('pay show navigateToMiniProgram error', error)
        // uni.navigateBack()
        isLoad.value = false
      },
      success: () => {
        isLoad.value = false
      },
    })
  }

  onLoad((options: any) => {
    isLoad.value = true
    console.log('🚀 ~ middle pay onLoad ~ options:', options)
    op.value = options
    toPay()
  })

  onShow(() => {
    const options = op.value
    console.log('🚀 ~ middle pay onShow ~ options:', options)
    if (!isLoad.value) {
      uni.navigateBack()
    }
  })

  const img = ref(`${import.meta.env.VITE_APP_CDN_OSS_BUSINESS}/middle/middle_pay_bg.png`)
</script>

<template>
  <view class="pay">
    <image
      class="pay-image"
      :src="img"
      mode="scaleToFill"
    />
    <view class="pay-desc">请点击下方按钮，跳转至支付页面</view>
     <view @click="toPay" class="pay-button">去支付</view>
  </view>
</template>

<style lang="scss" scoped>
  .pay {
    padding: 163rpx 130rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .pay-image{
      width: 186rpx;
      height: 186rpx;
    }
    .pay-desc {
      margin-top: 32rpx;
      color: $ga-gray-8;
      font-size: 28rpx;
    }
    .pay-button {
      margin: 144rpx auto;
      width: 490rpx;
      height: 92rpx;
      background: $ga-brand-4;
      color: $ga-gray-0;
      font-size: 32rpx;
      font-weight: 500;
      line-height: 92rpx;
      text-align: center;
    }
  }
</style>
