<script setup lang="ts">
  import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import QuickShipSentRecordList from '../components/QuickShipSentRecordList.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { QUICK_TRANSFER_ROUTE } from '@/features/quick-transfer/constants'

  const refreshKey = ref(0)
  const listRef = ref<InstanceType<typeof QuickShipSentRecordList> | null>(null)

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
  <PageLayout title="我发送的" :back-fallback="`${QUICK_TRANSFER_ROUTE}?tab=sent`" nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <QuickShipSentRecordList ref="listRef" :refresh-key="refreshKey" />
  </PageLayout>
</template>
