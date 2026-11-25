<template>
  <view class="legacy-route-message">
    <text>族谱页面升级中，正在打开新版…</text>
  </view>
</template>

<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'

  onLoad(() => {
    uni.redirectTo({ url: '/subPackages/record-tools/family-tree/demo' })
  })
</script>
