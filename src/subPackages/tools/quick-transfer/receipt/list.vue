<script setup lang="ts">
  import { onPullDownRefresh, onReachBottom, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import QuickShipReceiptList from '../components/QuickShipReceiptList.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { QUICK_TRANSFER_ROUTE } from '@/features/quick-transfer/constants'
  import { getQuickTransferToolSharePayload } from '@/features/quick-transfer/share'

  const refreshKey = ref(0)
  const listRef = ref<InstanceType<typeof QuickShipReceiptList> | null>(null)
  const sharePayload = getQuickTransferToolSharePayload()

  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  onShareAppMessage(() => ({
    title: sharePayload.title,
    path: sharePayload.path,
    imageUrl: sharePayload.imageUrl,
  }))

  onShareTimeline(() => ({ title: sharePayload.title, query: '', imageUrl: sharePayload.imageUrl }))
  // #endif

  onShow(() => {
    refreshKey.value += 1
  })

  onPullDownRefresh(async () => {
    await listRef.value?.refresh()
    uni.stopPullDownRefresh()
  })

  onReachBottom(() => {
    void listRef.value?.loadMore()
  })
</script>

<template>
  <PageLayout
    title="已收飞船"
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-image-url="sharePayload.imageUrl"
    :back-fallback="QUICK_TRANSFER_ROUTE"
    nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <!-- #ifdef MP-WEIXIN -->
    <template #nav-right>
      <button class="nav-share-button" hover-class="nav-share-button--hover" open-type="share">分享</button>
    </template>
    <!-- #endif -->
    <QuickShipReceiptList ref="listRef" :refresh-key="refreshKey" />
  </PageLayout>
</template>

<style lang="scss">
  .nav-share-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 88rpx;
    height: 58rpx;
    margin: 0;
    padding: 0 16rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.68);
    border-radius: 999rpx;
    color: #fff;
    background: rgba(7, 20, 38, 0.28);
    font-size: 22rpx;
    line-height: 1;
  }

  .nav-share-button::after {
    border: 0;
  }

  .nav-share-button--hover {
    opacity: 0.78;
  }
</style>
