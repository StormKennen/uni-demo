<template>
  <view class="legacy-memo-route">
    <text>备忘录页面已迁移，正在打开新版…</text>
  </view>
</template>

<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'

  onLoad(options => {
    const query = Object.entries(options || {})
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    const suffix = query ? `?${query}` : ''
    uni.redirectTo({ url: `/subPackages/record-tools/memo/detail${suffix}` })
  })
</script>
