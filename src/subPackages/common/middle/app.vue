<script setup lang="ts">
  import { onShareAppMessage } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  // 跳转kaiAPP中转页
  // const webviewSrc = ref('https://hklife.galaxy-immi.com/superApp/loadPage')
  // const webviewSrc = ref('https://yinheapp.drcn.agconnect.link/BEdd')

  const src = ref(`${import.meta.env.VITE_APP_CDN_OSS_BUSINESS}/middle/download_app_bg.png`)
</script>

<template>
  <!-- <web-view :src="webviewSrc" bindmessage=""></web-view> -->
  <view>
    <img :src="src" alt="" class="app-image">
  </view>
</template>

<style lang="scss" scoped>
.app-image{
  width: 100vw;
  height: 100vh;
}
</style>
