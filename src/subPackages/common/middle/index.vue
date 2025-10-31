/** * @description e签宝人脸识别中间页 * @param e */

<script setup lang="ts">
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { ref } from 'vue'

  const bizToken = ref('')
  const redirectUrl = ref('')
  const goFaceDone = ref(false) // 是否已跳转至公证签做人脸

  // 跳到e签小程序页面
  const goFaceAuth = () => {
    uni.navigateToMiniProgram({
      appId: 'wx1cf2708c2de46337', // 公证签小程序APPID
      path: `/pages/face/index?bizToken=${bizToken.value}`, // 刷脸页面地址
      // extraData: {
      //   // 没办法知道id
      //   path: `/pages/webview/h5?path=/order/detail&id=${id}&title=待付款`,
      //   from: 'esign',
      // },
      success(res) {
        goFaceDone.value = true
      },
    })
  }

  onLoad(options => {
    console.log('🚀 ~ onLoad ~ options:', options)

    bizToken.value = options?.bizToken
    redirectUrl.value = decodeURIComponent(options?.redirectUrl)
    goFaceAuth()
  })

  onShow(() => {
    // 防止从实名/意愿页进入后直接返回
    if (!goFaceDone.value) return

    // 如果已经跳转过，重置
    goFaceDone.value = false

    // getEnterOptionsSync 方法从基础库 2.9.4 开始支持，低版本需做兼容处理
    const options = uni.getEnterOptionsSync()
    console.log('---options公签回调参数：', options)
    console.log('---options公签回调参数： redirectUrl', redirectUrl.value)
    // 从公证签小程序返回
    if (options.scene === 1038 && options.referrerInfo.extraData && options.referrerInfo.extraData.faceResult) {
      const pages = getCurrentPages()
      console.log("🚀 ~ onShow ~ pages:", pages)
      const pre = pages[pages.length - 2]
      console.log('pre', pre)
      // 重新加载实名页面
      if (pre.reloadPage && typeof pre.reloadPage === 'function') {
        console.log('pre.reloadPage', typeof pre.reloadPage)
        pre.reloadPage(redirectUrl + `&timeStamp=${new Date().getTime()}`)
        uni.navigateBack({
          delta: 1,
        })
      }
    }
  })
</script>

<template>
  <view class="middle">
    <view class="middle-img">
      <image class="img" src="/static/image/order/pic_01.png" mode="widthFix" />
    </view>
    <view class="middle-text">请点击下方按钮，跳转至认证页面</view>
    <button class="middle-btn" @click="goFaceAuth">立即跳转</button>
  </view>
</template>

<style lang="scss" scoped>
  .middle {
    width: 100%;
    height: 100vh;

    .middle-text {
      color: #222;
      text-align: center;
      font-size: 28rpx;
      font-style: normal;
      font-weight: 400;
    }

    .middle-img {
      text-align: center;
      margin: 152rpx 0 30rpx;
    }

    .middle-img .img {
      width: 225rpx;
    }

    .middle-btn {
      width: 510rpx;
      height: 96rpx;
      border-radius: 16rpx;
      background: linear-gradient(272deg, #4e88f1 1.48%, #325ff3 98.08%);
      color: #fff;
      font-size: 32rpx;
      line-height: 96rpx;
      font-weight: 500;
      margin-top: 128rpx;
    }
  }
</style>
