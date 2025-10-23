<script setup lang="ts">
  import { tokenToParam } from '@/utils/common'
import { getToken } from '@/utils/storage'
  import QueryString from 'qs'
  import { ref } from 'vue'
  const token = getToken()
  const query = {
    param: tokenToParam(token),
    from: 'business_wx',
  }
  const webviewUrl = ref(`${import.meta.env.VITE_HKLIFE_H5_HOST}/order/my?${QueryString.stringify(query)}`)
  console.log('🚀 ~ webviewUrl:', webviewUrl)
</script>

<template>
  <view class="order">
    <web-view :src="webviewUrl" bindmessage=""></web-view>
  </view>
</template>

<style lang="scss" scoped></style>
