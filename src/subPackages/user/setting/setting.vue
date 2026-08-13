<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'

  onLoad(() => {
    uni.redirectTo({
      url: '/subPackages/user/setting/about',
    })
  })
</script>

<template>
  <PageLayout title="设置">
    <view />
  </PageLayout>
</template>
