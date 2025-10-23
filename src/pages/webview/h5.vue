<script setup lang="ts">
  import { tokenToParam } from '@/utils/common'
  import { getToken } from '@/utils/storage'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { stringify } from 'qs'
  import { computed, ref } from 'vue'

  type Options = {
    path: string // h5的path
    title: string | undefined
    [key: string]: string | undefined
  }
  const webviewUrl = ref()
  const path = ref()
  const query = ref()
  onLoad((options = {}) => {
    console.log("🚀 ~ onLoad ~ options:", options)
    const { path: _path, title, ...rest } = options as Options
    query.value = {
      ...rest,
      param: tokenToParam(getToken()),
      from: 'business_wx',
    }
    path.value = _path
    uni.setNavigationBarTitle({
      title: title || '',
    })
    webviewUrl.value = `${import.meta.env.VITE_HKLIFE_H5_HOST}${options.path}?${stringify(query.value)}`
  })
  onShow(() => {
    console.log('webview h5 onShow')
    query.value.param = tokenToParam(getToken())
    webviewUrl.value = `${import.meta.env.VITE_HKLIFE_H5_HOST}${path.value}?${stringify(query.value)}`

  })
</script>

<template>
  <view class="h5">
    <web-view :src="webviewUrl" bindmessage=""></web-view>
  </view>
</template>

<style lang="scss" scoped></style>
