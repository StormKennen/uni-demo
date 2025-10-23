<script setup lang="ts">
interface IProps {
  text: string
  disabled: boolean
}
const props = defineProps<IProps>()
const emits = defineEmits<{
  click: []
}>()

const onClick = ()=>{
  if(props.disabled) return
  emits('click')
}
</script>
<template>
  <view class="footer-one-btn" :class="props.disabled ? 'disabled-footer': ''">
    <view @click="onClick" class="btn" :class="props.disabled ? 'disabled-btn': ''">{{ props.text }}</view>
  </view>
</template>



<style scoped lang="scss">
.footer-one-btn {
  width: 750rpx;
  height: 168rpx;
  background: #fff;
  position: fixed;
  bottom: 0;
  display: flex;
  padding: 16rpx 32rpx 72rpx 32rpx;
  justify-content: center;
  box-sizing: border-box;
  // align-items: center;
  border: none;
  .btn {
    width: 686rpx;
    height: 92rpx;
    background: $ga-brand-4;
    border-radius: 6rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 92rpx;
    text-align: center;
    &:active {
      opacity: 0.7;
    }
  }
  .disabled-btn {
    background: $ga-brand-3;
  }
}

.fixed-footer-btn {
  padding: 16rpx 32rpx 72rpx 32rpx;
  position: fixed;
  // bottom: 40rpx;
  bottom: 0;
  height: 168rpx;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  background: white;
  z-index: 1;

  button {
    height: 96rpx;
    line-height: 96rpx;
    background: #0046B4;
    border-radius: 6rpx;
    color: white;
    font-size: 32rpx;
    
    &[disabled][type='default'],
    &[disabled]:not([type]) {
      color: white;
      background-color: #B3C8E9;

      &::after {
        border: 0;
      }
    }
  }
}
</style>