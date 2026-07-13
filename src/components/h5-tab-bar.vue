<template>
  <!-- #ifdef H5 -->
  <view class="h5-tab-bar">
    <view class="tab-item" :class="{ active: currentTab === 'index' }" @click="switchTab('index')">
      <image class="tab-icon" :src="currentTab === 'index' ? '/static/image/index_on.png' : '/static/image/index.png'" />
      <text class="tab-text">首页</text>
    </view>
    <view class="tab-item" :class="{ active: currentTab === 'tools' }" @click="switchTab('tools')">
      <image class="tab-icon" :src="currentTab === 'tools' ? '/static/image/mall_on.png' : '/static/image/mall.png'" />
      <text class="tab-text">工具</text>
    </view>
    <view class="tab-item" :class="{ active: currentTab === 'settings' }" @click="switchTab('settings')">
      <image class="tab-icon" :src="currentTab === 'settings' ? '/static/image/mine_on.png' : '/static/image/mine.png'" />
      <text class="tab-text">设置</text>
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
      if (route.includes('pages/tools/')) {
        currentTab.value = 'tools'
      } else if (route.includes('pages/mine/')) {
        currentTab.value = 'settings'
      } else if (route.includes('index')) {
        currentTab.value = 'index'
      }
    }
  })

  const switchTab = (tab: string) => {
    if (currentTab.value === tab) return

    currentTab.value = tab
    if (tab === 'index') {
      uni.switchTab({
        url: '/pages/index/index',
      })
    } else if (tab === 'tools') {
      uni.switchTab({
        url: '/pages/tools/index',
      })
    } else if (tab === 'settings') {
      uni.switchTab({
        url: '/pages/mine/mine',
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
    background: var(--theme-surface);
    display: flex;
    align-items: center;
    justify-content: space-around;
    box-shadow: 0 -2rpx 10rpx var(--theme-shadow-xs);
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
        color: var(--theme-text-tertiary);
      }

      &.active {
        .tab-text {
          color: var(--theme-text);
          font-weight: 500;
        }
      }
    }
  }
</style>
