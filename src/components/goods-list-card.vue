<template>
  <view class="goods-list-card" @click="onClick">
    <view class="card-left">
      <image class="card-left-image" :src="data?.image || defaultImage" lazy-load="true"></image>
      <view v-if="data?.catAttr === 2" class="card-left-tag">
        <text class="card-left-tag-text">套餐</text>
      </view>
    </view>
    <view :class="`card-right ${!noNeedLine ? 'card-line' : undefined}`">
      <view class="card-right-top-wrapper">
        <view class="card-right-top">
          <text class="card-right-top-text">{{ data?.name || '--' }}</text>
        </view>
        <view class="card-right-center">
          <view
            class="card-tag"
            v-for="icon in data?.icons"
            :key="icon.description"
            :style="`border-color: ${opacityColor(icon.color, 0.3)}; color: ${icon.color} ;`">
            <text class="card-tag-text">{{ icon.description }}</text>
          </view>
        </view>
      </view>

      <view class="card-right-bottom">
        <text class="card-right-bottom-text1">¥</text>
        <text class="card-right-bottom-text2">{{ getPriceInt(data?.linePrice) }}</text>
        <text v-if="data?.linePrice !== data?.price" class="card-right-bottom-text3">¥{{ getPriceInt(data?.price) }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import { getPriceInt, opacityColor } from '@/utils/common'
  import { computed } from 'vue'
  import defaultImage from '@/static/image/default_image.svg'
  import appDsBridge from '@/utilsH5/appDsBridge'
  import { isYinheAppEnv } from '@/utilsH5/env'
  import { customizeTrack } from '@/utils/sensors'
  console.log('🚀 ~ defaultImage:', defaultImage)
  type Props = {
    data: any
    noNeedLine?: boolean
    index?: number
  }
  const props = defineProps<Props>()
  const onClick = () => {
    customizeTrack('Business_HomePage_ProductList', '商务_首页商品列表', {
      product_name: props.data.name,
      product_url: `${import.meta.env.VITE_HKLIFE_H5_HOST}/goods/sales-detail?id=${props.data.id}`,
      product_price: props.data.linePrice,
      product_sort: props.index
    })
    // #ifdef WEB
    if (isYinheAppEnv()) {
      appDsBridge.goH5UISyn({
        url: `${import.meta.env.VITE_HKLIFE_H5_HOST}/goods/sales-detail?id=${props.data.id}`,
        isFullScreen: 1,
      })
    }
    // #endif
    // #ifndef WEB
    uni.navigateTo({
      url: `/pages/mall/goods/goods-detail?id=${props.data.id}`,
    })
    // #endif
  }
</script>

<style lang="scss">
  .goods-list-card {
    display: flex;
    flex-direction: row;

    align-items: flex-start;
    height: 200rpx;
    box-sizing: border-box;
    .card-left {
      width: 136rpx;
      height: 136rpx;
      margin-right: 20rpx;
      position: relative;
      margin: 32rpx 20rpx 32rpx 0;
      box-sizing: border-box;
      .card-left-image {
        width: 136rpx;
        height: 136rpx;
      }
      .card-left-tag {
        position: absolute;
        top: 0;
        left: 0;
        width: 56rpx;
        height: 32rpx;
        background-color: $ga-brand-4;
        box-sizing: border-box;
        text-align: center;
        font-size: 20rpx;
        color: $ga-gray-0;
        display: flex;
        justify-content: center;
        align-items: center;
        .card-left-tag-text {
          line-height: 32rpx;
          font-size: 20rpx;
          color: $ga-gray-0;
        }
      }
    }
    .card-line {
      border-bottom: solid 2rpx $ga-gray-3;
    }
    .card-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 200rpx;
      box-sizing: border-box;
      padding: 32rpx 0;
      .card-right-top {
        // height: 40rpx;
        width: 466rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .card-right-top-text {
          font-family: 'PingFang SC';
          width: 466rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: $ga-gray-8;
          font-size: 28rpx;
          font-weight: 500;
          line-height: 40rpx;
        }
      }
      .card-right-center {
        overflow: hidden;
        display: flex;
        flex-direction: row;
        margin-top: 2rpx;
        align-items: center;
        .card-tag {
          box-sizing: border-box;
          margin-right: 8rpx;
          border-radius: 0;
          background-color: #fff;
          font-size: 20rpx;
          padding: 0 10rpx;
          border: solid 1rpx;
          line-height: 30rpx;
          height: 30rpx;
          display: flex;
          align-items: center;
          .card-tag-text {
            font-family: 'PingFang SC';
          }
        }
      }
      .card-right-bottom {
        height: 40rpx;
        .card-right-bottom-text1 {
          font-size: 28rpx;
          font-weight: 500;
          font-family: D-DIN-PRO-500;
          line-height: 40rpx;
        }
        .card-right-bottom-text2 {
          font-size: 40rpx;
          font-weight: 700;
          font-family: D-DIN-PRO-700;
          line-height: 40rpx;
        }
        .card-right-bottom-text3 {
          margin-left: 8rpx;
          font-size: 28rpx;
          color: $ga-gray-5;
          font-weight: 500;
          font-family: D-DIN-PRO-500;
          text-decoration-line: line-through;
          line-height: 40rpx;
        }
      }
    }
  }
</style>
