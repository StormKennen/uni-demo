<template>
  <view class="legacy-route-message">
    <text>族谱成员页升级中，正在打开新版…</text>
  </view>
</template>

<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'

  onLoad(options => {
    const id = options?.id ? `?id=${encodeURIComponent(String(options.id))}` : ''
    uni.redirectTo({ url: `/subPackages/record-tools/family-tree/detail${id}` })
  })
</script>
