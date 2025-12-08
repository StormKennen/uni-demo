<template>
  <!-- #ifdef H5 -->
  <view class="h5-tab-bar">
    <view 
      class="tab-item" 
      :class="{ active: currentTab === 'index' }"
      @click="switchTab('index')"
    >
      <image 
        class="tab-icon" 
        :src="currentTab === 'index' ? '/static/image/index_on.png' : '/static/image/index.png'" 
      />
      <text class="tab-text">首页</text>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: currentTab === 'mine' }"
      @click="switchTab('mine')"
    >
      <image 
        class="tab-icon" 
        :src="currentTab === 'mine' ? '/static/image/mine_on.png' : '/static/image/mine.png'" 
      />
      <text class="tab-text">我的</text>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  current?: string
}>()

const currentTab = ref(props.current || 'index')

onMounted(() => {
  // 根据当前页面路径设置激活状态
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    const route = currentPage.route || ''
    if (route.includes('mine')) {
      currentTab.value = 'mine'
    } else if (route.includes('index')) {
      currentTab.value = 'index'
    }
  }
})

const switchTab = (tab: string) => {
  if (currentTab.value === tab) return
  
  currentTab.value = tab
  if (tab === 'index') {
    uni.redirectTo({
      url: '/pages/index/index'
    })
  } else if (tab === 'mine') {
    uni.redirectTo({
      url: '/pages/mine/mine'
    })
  }
}
</script>

<style lang="scss" scoped>
.h5-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
  
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    
    .tab-icon {
      width: 44rpx;
      height: 44rpx;
      margin-bottom: 4rpx;
    }
    
    .tab-text {
      font-size: 22rpx;
      color: #999;
    }
    
    &.active {
      .tab-text {
        color: #121A26;
        font-weight: 500;
      }
    }
  }
}
</style>
