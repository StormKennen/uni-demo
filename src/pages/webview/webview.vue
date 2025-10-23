<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'
  import { ref } from 'vue'

  type Option = {
    title?: string
    url: string
    decodeUrl?: string
  }
  // const webviewSrc = ref('https://cdn-public.galaxy-immi.com/business/test_pdf.pdf')
  const webviewSrc = ref()
  onLoad((option) => {
    console.log('🚀 ~ webview onLoad ~ option:', option)
    const _option = option || {} as Option
    uni.setNavigationBarTitle({
      title: _option.title || '',
    })
    webviewSrc.value = _option.decodeUrl ? decodeURIComponent(_option.url) : _option.url
  })
</script>

<template>
  <view class="webview">
    <web-view :src="webviewSrc" bindmessage=""></web-view>
  </view>
</template>

<style lang="scss" scoped></style>
