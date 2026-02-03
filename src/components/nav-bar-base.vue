<script setup lang="ts">
import { getStatusBarHeight, getSystemInfo } from '@/utils/env';
import { defineProps } from 'vue';
import appDsBridge from '@/utilsH5/appDsBridge'
import { isYinheAppEnv } from '@/utilsH5/env';

interface Props {
  bgColor?: string;
  title?: string
  titleColor?: string
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
  titleColor: undefined,
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

const onBack = async () => {
  const res = props.beforeBack ? await props.beforeBack() : true
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
  <!-- 固定定位的导航栏 -->
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
        <view class="nav-title" :style="props.titleColor ? { color: props.titleColor } : {}">
          <slot name="title">
            <template v-if="!!props.title">{{ props.title }}</template>
          </slot>
        </view>
        <view class="nav-right">
          <slot name="right" />
        </view>
      </view>
    </view>
  </view>
  <!-- 占位块：撑开页面内容，防止被固定导航栏遮挡 -->
  <view class="nav-placeholder" :style="{ height: navHeight + (getStatusBarHeight() || 0) + 'px' }"></view>
</template>
<style scoped lang="scss">
.nav-container {
  width: 100%;
  z-index: 9999;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: background-color 0.3s ease;
  
  /* 定义导航栏高度CSS变量 */
  --nav-height: calc(var(--status-bar-height, 0px) + v-bind('navHeight + "px"'));

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
      font-size: 36rpx; // 统一标题字号
      font-weight: 600; // 统一标题字重
    }

    .nav-right {
      position: absolute;
      right: 0;
      display: flex;
      align-items: center;
      gap: 16rpx;
      height: 100%;
      padding-right: 8rpx;
    }

    &.light {
      .nav-back-icon {
        background-image: url('@/static/image/nav-back-white.png');
      }
      .nav-title {
        color: #ffffff; // 深色背景下标题为白色
      }
    }
    
    // 首页导航栏样式：内容居左
    &.home-navbar {
      justify-content: flex-start;
      padding-left: 32rpx;
      
      .nav-title {
        position: relative;
        left: auto;
        transform: none;
      }
    }
  }
}

// 占位块样式
.nav-placeholder {
  width: 100%;
  flex-shrink: 0;
}
</style>