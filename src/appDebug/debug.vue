<template>
  <LayoutPage title="App调试页面">
    <br>
    <button @click="openCamera">打开相机</button>
    {{ camera }}
    <br>
    <button @click="openAlbum">打开相册</button>
    {{ album }}
    <br>
    <button @click="openFile">打开文件</button>
    {{ fileRes }}
    <br>

    <button @click="openImageFile">打开图片文件</button>
    {{ fileImage }}
  </LayoutPage>
</template>

<script setup lang="ts">
import LayoutPage from '@/components/layout-page.vue'
import { shallowRef } from 'vue'
import {  onShow } from '@dcloudio/uni-app'
import appDsBridge from '@/utilsH5/appDsBridge'


const camera = shallowRef()
const openCamera = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['camera'],
    success: (res) => {
      // console.log(res)
      camera.value = JSON.stringify(res)
    }
  })

}
const album = shallowRef()
const openAlbum = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album'],
    success: (res) => {
      album.value = JSON.stringify(res)
    }
  })

}

const fileRes = shallowRef()
const openFile = () => {
  uni.chooseFile({
    success: function (res) {
      fileRes.value = JSON.stringify(res)

    }
  });
}

const fileImage = shallowRef()
const openImageFile = () => {
  uni.chooseFile({
    type: 'image',
    success(res) {
      fileImage.value = JSON.stringify(res)

    }
  })
}

onShow(() => {
  // #ifdef WEB
  appDsBridge.hideNavigationBarSyn('1')
  console.log(window.location.href)
  // #endif

})

</script>
