<template>
  <view class="legacy-route-message">
    <text>族谱页面升级中，正在打开新版…</text>
  </view>
</template>

<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'

  onLoad(options => {
    const query = Object.entries(options || {})
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    const suffix = query ? `?${query}` : ''
    uni.redirectTo({ url: `/subPackages/record-tools/family-tree/index${suffix}` })
  })
</script>
