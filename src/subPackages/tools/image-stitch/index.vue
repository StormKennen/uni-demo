<template>
  <view class="legacy-route-message">
    <text>图片拼接页面已迁移，正在打开新版…</text>
  </view>
</template>

<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'

  onLoad(options => {
    const query = Object.entries(options || {})
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    const suffix = query ? `?${query}` : ''
    uni.redirectTo({ url: `/subPackages/media-tools/image-stitch/index${suffix}` })
  })
</script>
