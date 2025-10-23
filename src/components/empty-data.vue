<template>
  <view class="empty-data">
    <image class="empty-icon" :src="emptyImg" />
    <view class="empty-desc">{{ desc }}</view>
  </view>
</template>

<script setup lang="ts">
import emptyImg from '@/static/image/empty.svg'

withDefaults(defineProps<{
  desc?: string
}>(), {
  desc: '暂无数据'
})
</script>

<style scoped lang="scss">
.empty-data {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  width: 256rpx;
  height: 256rpx;
}

.empty-desc {
  color: #8993A2;
  text-align: center;
  font-size: 28rpx;
  font-weight: 400;
}
</style>