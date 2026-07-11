<template>
  <PageLayout title="图片打乱" nav-gradient="linear-gradient(135deg, #f6d365 0%, #fda085 100%)">
    <view class="image-cipher-page">
      <view class="content">
        <ImageShufflePanel mode="page" :initial-image="initialImage" :auto-run="autoRun" />
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import ImageShufflePanel from '@/components/toolkit/business/image-shuffle-panel.vue'
  import type { ToolImagePayload } from '@/components/toolkit/types'
  import { reportToolVisit } from '@/utils/tracker'

  const initialImage = ref<ToolImagePayload | null>(null)
  const autoRun = ref(false)

  onLoad((options: Record<string, string | undefined>) => {
    const image = typeof options?.image === 'string' ? decodeURIComponent(options.image) : ''
    if (!image) return
    initialImage.value = { uri: image }
    autoRun.value = options?.autoRun === '1'
  })

  onShow(() => {
    reportToolVisit('image-cipher')
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => ({
    title: '图片打乱 · 凉白开工具箱',
    path: '/subPackages/tools/image-cipher/index',
  }))

  onShareTimeline(() => ({
    title: '图片打乱 · 凉白开工具箱',
    query: '',
  }))
  // #endif
</script>

<style scoped lang="scss">
  .image-cipher-page {
    min-height: 100vh;
    background: #fff7ec;
  }

  .content {
    padding: calc(32rpx + var(--nav-height, 120rpx)) 32rpx 32rpx;
  }
</style>
