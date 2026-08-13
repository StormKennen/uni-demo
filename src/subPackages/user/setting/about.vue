<script setup lang="ts">
  import MineListItem from '@/components/mine-list-item.vue'
  import { PrivacyPageUrl, ProtocolPageUrl } from '@/utils/const'

  const appBaseInfo = uni.getAppBaseInfo()
  const aboutItems = [
    { icon: '/static/image/mine/protocol.svg', name: '用户服务协议', to: ProtocolPageUrl },
    { icon: '/static/image/mine/privacy.svg', name: '隐私政策', to: PrivacyPageUrl },
    { icon: '/static/image/mine/version.svg', name: `版本号 ${appBaseInfo.appVersion}` },
  ]
</script>

<template>
  <PageLayout title="关于">
    <view class="about-page">
      <view class="about-list">
        <view v-for="item in aboutItems" :key="item.name" class="about-list-item">
          <MineListItem :data="item" />
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<style lang="scss" scoped>
  .about-page {
    min-height: 100vh;
    padding: 20rpx 32rpx calc(40rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .about-list {
    padding: 0 28rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    background: var(--theme-surface);
  }

  .about-list-item + .about-list-item {
    border-top: 1rpx solid var(--theme-border);
  }
</style>
