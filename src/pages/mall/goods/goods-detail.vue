<script setup lang="ts">
  import { GetSuperAppGoodsPlaceByGoodsId } from '@/services/apifox/3903128/shangPinXiangGuan/shuang11HuoDong/apifox'
  import { tokenToParam } from '@/utils/common'
  import { getToken } from '@/utils/storage'
  import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import { stringify } from 'qs'
  import { ref } from 'vue'

  const webviewUrl = ref()
  const query = ref()
  const goodsDetail = ref()
  onLoad((options = {}) => {
    query.value = {
      id: options.id,
      param: tokenToParam(getToken()),
      from: 'business_wx',
    }
    webviewUrl.value = `${import.meta.env.VITE_HKLIFE_H5_HOST}/goods/sales-detail?${stringify(query.value)}`
  })
  onShow(() => {
    console.log('webview onShow')
    query.value.param = tokenToParam(getToken())
    webviewUrl.value = `${import.meta.env.VITE_HKLIFE_H5_HOST}/goods/sales-detail?${stringify(query.value)}`

    getGoodsDetail(query.value.id)
  })

  const getGoodsDetail = async (id: string) => {
    try {
      const data = await GetSuperAppGoodsPlaceByGoodsId({ id })
      goodsDetail.value = data
      console.log('🚀 ~ getGoodsDetail ~ goodsDetail:', data)
    } catch (error) {
      console.log('🚀 ~ getGoodsDetail ~ error:', error)
    }
  }

  onShareAppMessage(() => {
    console.log('goodsDetail.value......', goodsDetail.value)
    const imageUrl = goodsDetail.value.image || goodsDetail.value.banner?.[0]
    const title = goodsDetail.value.name || '商品详情'

    return {
      title,
      // path: `pages/mall/goods/goods-detail?id=${id}`, // 分享的页面路径
      imageUrl, // 分享的图片地址
      success: () => {
        console.log('分享成功')
        // 可以在这里进行分享成功后的操作，例如提示用户等
      },
      fail: () => {
        console.log('分享失败')
        // 分享失败后的操作，例如提示用户失败原因等
      },
    }
  })

  onShareTimeline(() => {
    const imageUrl = goodsDetail.value.image || goodsDetail.value.banner?.[0]
    const title = goodsDetail.value.name || '商品详情'
    return {
      title,
      // query: `id=${id}`,
      imageUrl,
    }
  })
</script>

<template>
  <view class="goods-detail">
    <web-view :src="webviewUrl" bindmessage=""></web-view>
  </view>
</template>

<style lang="scss" scoped></style>
