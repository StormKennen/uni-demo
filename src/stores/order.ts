// stores/counter.js
import { GetSuperAppPresaleAppAssociatedOrderBusiness } from '@/services/apifox/3903128/shangPinXiangGuan/guanLianDingDan/apifox';
import type { GetSuperAppPresaleAppAssociatedOrderBusinessRes } from '@/services/apifox/3903128/shangPinXiangGuan/guanLianDingDan/interface';
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrderStore = defineStore('order', () => {
  // 订单数量
  const currentOrder = ref<GetSuperAppPresaleAppAssociatedOrderBusinessRes>()
  const getOrderList = async () => {
    try {
      const res = await GetSuperAppPresaleAppAssociatedOrderBusiness()
      console.log('🚀 ~ getOrderList ~ res:', res)
      currentOrder.value = res
    } catch (error) {
      currentOrder.value =  undefined
    }
  }

  const clearOrderList = () => {
     currentOrder.value = undefined
  }

  getOrderList()

  return { currentOrder, getOrderList, clearOrderList }
});