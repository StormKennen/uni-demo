// stores/counter.js
import { GetSuperAppGoodsList } from '@/services/apifox/3903128/shangPinXiangGuan/yinHeZhenXuan/apifox';
import type { GetSuperAppGoodsListResListItem } from '@/services/apifox/3903128/shangPinXiangGuan/yinHeZhenXuan/interface';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useMallStore = defineStore('mall', () => {
  const goodsList = ref<GetSuperAppGoodsListResListItem[]>([])
  const total = ref<number>(0)
  const goodsListLoading = ref(false)
  const hasMore = ref(true)

  const params = ref({
    // goods_category_id: 6,
    page: 1,
    page_size: 20,
    sort_type: 0,
    show_scene: '101', // 100 app ; 101 小程序
  })

  const recommendGoodsOne = computed(() => {
    return goodsList.value?.find(item => item.id === import.meta.env.VITE_RECOMMEND_BUSINESS_GOODS_ID)
  })

  const getGoodsList = async (loadMore = false) => {
    console.log('getGoodsList......', loadMore, hasMore.value, goodsListLoading.value)
    try {
      if (goodsListLoading.value || (loadMore && !hasMore.value)) {
        return
      }
      goodsListLoading.value = true
      params.value.page = loadMore ? params.value.page : 1
      const res = await GetSuperAppGoodsList(params.value)
      console.log('🚀 ~ getGoodsList ~ res:', res)
      goodsList.value = loadMore ? [...goodsList.value, ...res.list] : res.list
      total.value = res.total
      params.value.page = params.value.page + 1
      hasMore.value = goodsList.value.length < res.total
    } catch (error) {
      console.warn('🚀 ~ getGoodsList ~ error:', error)
    }
    goodsListLoading.value = false
  }

  getGoodsList()

  return { hasMore, goodsList, total, getGoodsList, goodsListLoading, recommendGoodsOne }
});