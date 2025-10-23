<script setup lang="ts">
  import { ref } from 'vue'
  type Props = {
    confirm: () => void
    title: string
    showTitle?: boolean
    cancelText?: string
    confirmText?: string
  }

  const props = defineProps({
    showTitle: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    title: {
      type: String,
      default: ''
    },
    confirm: {
      type: Function,
      default: () => {}
    }
  })

  const change = () => {
    // console.log('change')
  }
  const popup = ref(null)
  const open = () => {
    popup.value?.open('center')
  }
  const onAgree = () => {
    props.confirm()
    popup.value?.close()
  }
  const onCancel = () => {
    popup.value?.close()
  }

  defineExpose({
    open,
  })
</script>

<template>
  <view class="read-dialog">
    <uni-popup ref="popup" background-color="#fff" border-radius="12rpx" @change="change">
      <view class="popup-content">
        <view class="top" hover-class="none" hover-stop-propagation="false">
          <text v-if="title" class="">
            {{ title }}
          </text>
        </view>
        <view class="content">
          <slot></slot>
        </view>
        <view class="bottom" hover-class="none" hover-stop-propagation="false">
          <button class="btn cancel-btn" @click="onCancel">{{ cancelText || '返回' }}</button>
          <button class="btn agree-btn" @click="onAgree">{{ confirmText || '确定' }}</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<style lang="scss" scoped>
  .read-dialog {
    .popup-content {
      padding: 92rpx 32rpx 48rpx;
      width: 606rpx;
      height: 344rpx;
      box-sizing: border-box;
      .top {
        text-align: center;
        font-size: 30rpx;
        color: #222;
        padding: 0 4rpx;
      }
      .bottom {
        display: flex;
        margin-top: 70rpx;
        justify-content: space-between;
        .btn {
          width: 256rpx;
          height: 92rpx;
          line-height: 92rpx;
          text-align: center;
          border-radius: 6rpx;
          font-size: 32rpx;
          font-weight: 500;
          &::after {
            display: none;
          }
        }
        .cancel-btn {
          color: $ga-brand-4;
          border:1rpx solid $ga-brand-4;
        }
        .agree-btn {
          background: $ga-brand-4;
          color: $ga-gray-0;
        }
      }
    }
  }
</style>
