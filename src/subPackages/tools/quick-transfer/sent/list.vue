<script setup lang="ts">
  import { onPullDownRefresh, onReachBottom, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import QuickShipSentRecordList from '../components/QuickShipSentRecordList.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { QUICK_TRANSFER_ROUTE } from '@/features/quick-transfer/constants'
  import { getQuickTransferToolSharePayload } from '@/features/quick-transfer/share'

  const refreshKey = ref(0)
  const listRef = ref<InstanceType<typeof QuickShipSentRecordList> | null>(null)
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
    title="我发送的"
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-image-url="sharePayload.imageUrl"
    :back-fallback="QUICK_TRANSFER_ROUTE"
    nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <QuickShipSentRecordList ref="listRef" :refresh-key="refreshKey" />
  </PageLayout>
</template>
