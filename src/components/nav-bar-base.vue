<script setup lang="ts">
import { getStatusBarHeight, getSystemInfo } from '@/utils/env';
import { defineProps } from 'vue';
import appDsBridge from '@/utilsH5/appDsBridge'
import { isYinheAppEnv } from '@/utilsH5/env';

interface Props {
  bgColor?: string;
  title?: string
  customStyle?: Record<string, any>
  customClass?: string
  navBack?: boolean
  customGoBack?: boolean
  // true 可以返回，false 不可以返回
  beforeBack?: () => boolean | Promise<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  bgColor: 'transparent',
  navBack: true,
  customGoBack: false,
})

const emit = defineEmits<{
  back: []
}>();


const sys = getSystemInfo()
const isWeChat = sys.hostName === 'WeChat'
// 小程序右上角胶囊那妞
const capsule = isWeChat ? uni.getMenuButtonBoundingClientRect() : {
  height: 32,
  top: 5,
}
const navHeight = capsule.top + capsule.height + 10

const onBack = () => {
  const res = props.beforeBack?.() ?? true
  if (!res) {
    return
  }
  if (props.customGoBack) {
    return emit('back')
  }
  const pages = getCurrentPages?.() ?? []
  // #ifdef WEB
  if (pages.length <= 1 && isYinheAppEnv()) {
    return appDsBridge.backToAppPreView()
  }
  // #endif

  console.log('返回上一页', pages)
  uni.navigateBack()
}

</script>

<template>
  <view class="nav-container" :style="{
    backgroundColor: props.bgColor,
    paddingTop: (getStatusBarHeight() || '0') + 'px', // 导航栏
    ...(props.customStyle || {})
  }">
    <view :style="{
      height: `${navHeight}px`,
      position: 'relative'
    }">
      <view class="nav-bar" :class="props.customClass" :style="{
        top: `${capsule.top}px`,
        height: `${capsule.height}px`,
      }">
        <view class="nav-back-icon" @click="onBack" v-if="navBack" />
        <view class="nav-title" v-if="!!props.title">{{ props.title }}</view>
        <slot v-if="!props.title" />
      </view>
    </view>
  </view>
</template>
<style scoped lang="scss">
.nav-container {
  width: 100%;
  z-index: 999;
  position: fixed;
  top: 0;
  transition: background-color 0.3s ease;

  .nav-bar {
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .nav-back-icon {
      background-image: url('@/static/image/nav-back.png');
      background-size: cover;
      width: 60rpx;
      height: 60rpx;
      position: absolute;
      left: 0;
    }

    .nav-title {
      color: $ga-gray-8;
      font-size: 34rpx;
      font-weight: 500;
    }

    &.light {
      .nav-back-icon {
        background-image: url('@/static/image/nav-back-white.png');
      }
    }
  }
}
</style>