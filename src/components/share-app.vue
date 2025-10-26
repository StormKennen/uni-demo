<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'
import { useRoute } from 'vue-router'

const CDN_URL  = 'https://cdn-public.galaxy-immi.com/business'

const props = withDefaults(defineProps<{
  hideWrap?: boolean
  headerBtnText?: string
  headerBtnUrl?: string
  hideHeaderBtn?: boolean
  goDefault?: boolean
}>(), {
  hideWrap: false,
  hideHeaderBtn: false,
  headerBtnText: '打开APP',
  headerBtnUrl: '',
  goDefault: false,
})

const route = useRoute()

function openApp() {
  const default_url = 'https://yinheapp.drcn.agconnect.link/BEdd'
  // base64的url
  try {
    const appDeepLink = route.query?.appDeepLink
    if (appDeepLink && !props.goDefault) {
        window.open(window.atob(appDeepLink as string))
    }
    else {
      window.open(default_url, '_self')
    }
  }
  catch (error) {
    console.error(error)
    window.open(default_url)
  }
}

const onClickHeaderBtn = () => {
  if (props.headerBtnUrl) {
    window.open(props.headerBtnUrl)
  }
  else {
    openApp()
  }
}
</script>

<template>
  <view class="share-wrap">
    <view class="left-wrap">
      <img :src="`${CDN_URL}/yinhe.png`" class="logo">
      <view class="title-wrap">
        <view>kai港生活</view>
        <view class="sub-title">
          美好新生活从这里开始
        </view>
      </view>
    </view>
    <view class="right-wrap">
      <view
        v-if="hideHeaderBtn === false"
        class="right-btn"
        @click="onClickHeaderBtn"
      >
        {{ props.headerBtnText }}
      </view>
    </view>
  </view>
  <view v-if="!hideWrap" class="go-app-wrap">
    <view
      class="go-app-btn"
      @click="openApp"
    >
      打开APP
    </view>
  </view>
</template>

<style lang="scss" scoped>
.share-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  z-index: 99;
  padding: 22rpx 40rpx;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  box-sizing: border-box;
  .left-wrap {
    display: flex;
    align-items: center;
    .logo {
      width: 92rpx;
      border-radius: 16rpx;
      margin-right: 20rpx;
    }
    .title-wrap {
      font-size: 32rpx;
      font-weight: 600;
      line-height: 46rpx;
      color: #121a26;
      .sub-title {
        color: #121a2680;
        font-size: 26rpx;
        font-weight: 400;
        line-height: 36rpx;
      }
    }
  }

  .right-btn {
    padding: 14rpx 18rpx;
    border-radius: 6rpx;
    background: #0046b4;
    color: white;
    font-size: 26rpx;
    line-height: 40rpx;
    font-weight: 500;
  }
}
.go-app-wrap {
  position: fixed;
  bottom: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  z-index: 99;
  .go-app-btn {
    width: 400rpx;
    height: 96rpx;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: 500;
    color: white;
    background: #0046b4;
  }
}
</style>
