<template>
  <view class="business-card-section" :style="styles?.container">
    <view class="business-card-header" v-if="slots.header" :style="styles?.header">
      <slot name="header"></slot>
    </view>
    <slot></slot>
  </view>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue';

defineProps<{
  styles?: {
    container?: string | Record<string, string | number>,
    header?: string | Record<string, string | number>,
  },
}>()

const slots = useSlots()
</script>
<style lang="scss" scoped>
.business-card-section {
  background-color: #fff;
  border-radius: 12rpx;
}

.business-card-header {
  color: #121a26;
  position: relative;
  padding: 32rpx 36rpx 24rpx 36rpx;
  font-size: 34rpx;
  font-weight: 500;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background-color: #e9ecf0;
    transform: scaleY(0.5);
    transform-origin: 0 100%;
  }
}
</style>