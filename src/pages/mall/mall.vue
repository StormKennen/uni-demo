<template>
  <view class="mall">
    <view v-if="!goodsListLoading && goodsList.length > 0">
      <view v-for="(item, index) in goodsList" :key="item.id" class="mall-item">
        <GoodsListCard :data="item" :index="index" :no-need-line="index === getGoodsList.length - 1" />
      </view>
      <NoMore v-if="!hasMore" />
    </view>
    <view v-else-if="!goodsListLoading" class="empty">
      <EmptyData  :desc="'暂无产品'"></EmptyData>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { GetSuperAppGoodsList } from '@/services/apifox/3903128/shangPinXiangGuan/yinHeZhenXuan/apifox'
  import { ref } from 'vue'
  import GoodsListCard from '@/components/goods-list-card.vue'
  import { useMallStore } from '@/stores/mall'
  import { storeToRefs } from 'pinia'
  import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
  import NoMore from '@/components/no-more.vue'
  import EmptyData from '@/components/empty-data.vue'
  import { useShare } from '@/utils/share'

  const mallStore = useMallStore()
  const { hasMore, goodsList, goodsListLoading } = storeToRefs(mallStore)
  const { getGoodsList } = mallStore
  console.log('🚀 ~ goodsList:', goodsList)

  onReachBottom(() => {
    console.log('onReachBottom')
    getGoodsList(true)
  })
  console.log('onPullDownRefresh', onPullDownRefresh)
  onPullDownRefresh(async () => {
    console.log('onPullDownRefresh....')
    await getGoodsList()
    uni.stopPullDownRefresh()
  })

  // 分享功能
  const { onShareAppMessage, onShareTimeline } = useShare('mall')

  // 导出分享方法供微信小程序调用
  defineExpose({
    onShareAppMessage,
    onShareTimeline
  })
</script>

<style lang="scss">
  .mall {
    padding: 0 32rpx;
    background: $ga-gray-0;
    .empty {
      width: 686rpx;
      height: 100vh;
      padding-top: 40vh;
    }
  }
</style>
