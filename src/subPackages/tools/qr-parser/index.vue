<template>
  <PageLayout title="二维码解析" nav-gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
    <view class="qr-parser-page">
      <view class="content">
        <QrParserPanel />
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import QrParserPanel from '@/components/toolkit/business/qr-parser-panel.vue'
  import { reportToolVisit } from '@/utils/tracker'

  onShow(() => {
    reportToolVisit('qr-parser')
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => ({
    title: '二维码解析 - 图片与扫码解析',
    path: '/subPackages/tools/qr-parser/index',
    imageUrl: '/static/logo.png',
  }))

  onShareTimeline(() => ({
    title: '二维码解析 - 图片与扫码解析',
    path: '/subPackages/tools/qr-parser/index',
    imageUrl: '/static/logo.png',
  }))
  // #endif
</script>

<style scoped lang="scss">
  .qr-parser-page {
    min-height: 100vh;
    background: var(--theme-bg);
  }

  .content {
    padding: calc(32rpx + var(--nav-height, 120rpx)) 32rpx 32rpx;
  }
</style>
