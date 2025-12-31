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
    
    path.value = _path
    uni.setNavigationBarTitle({
      title: title || '',
    })
    
    // 检查是否是完整的URL（包含http://或https://）
    if (_path && (_path.startsWith('http://') || _path.startsWith('https://'))) {
      // 外部链接，直接使用
      webviewUrl.value = _path
    } else {
      // 内部路径，添加token参数和host
      query.value = {
        ...rest,
        param: tokenToParam(getToken()),
        from: 'business_wx',
      }
      webviewUrl.value = `${import.meta.env.VITE_PUBLIC_THIS_H5_URL}${_path}?${stringify(query.value)}`
    }
  })
  onShow(() => {
    console.log('webview h5 onShow')
    
    // 检查是否是完整的URL（包含http://或https://）
    if (path.value && (path.value.startsWith('http://') || path.value.startsWith('https://'))) {
      // 外部链接，直接使用，不需要更新token
      webviewUrl.value = path.value
    } else if (query.value) {
      // 内部路径，更新token参数
      query.value.param = tokenToParam(getToken())
      webviewUrl.value = `${import.meta.env.VITE_PUBLIC_THIS_H5_URL}${path.value}?${stringify(query.value)}`
    }
  })
</script>

<template>
  <view class="h5">
    <web-view :src="webviewUrl" bindmessage=""></web-view>
  </view>
</template>

<style lang="scss" scoped></style>
