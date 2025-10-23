<script setup lang="ts">
  import { ref } from 'vue'
  type Props = {
    confirm: () => void
  }
  const props = defineProps<Props>()
  const change = () => {
    console.log('change')
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
  const onPrivacy = () => {}
  const onProtocol = () => {}

  defineExpose({
    open,
  })
</script>

<template>
  <view class="read-dialog">
    <uni-popup ref="popup" background-color="#fff" border-radius="12rpx" @change="change">
      <view class="popup-content">
        <view class="top" hover-class="none" hover-stop-propagation="false">
          <text class="">
            请先阅读并同意<text @click="onPrivacy" class="protocol">《隐私政策》</text>
          </text>
          <br />
          <text class="">
            和<text class="protocol" @click="onProtocol">《用户协议》</text>
          </text>
        </view>
        <view class="bottom" hover-class="none" hover-stop-propagation="false">
          <button class="btn cancel-btn" @click="onCancel">返回</button>
          <button class="btn agree-btn" @click="onAgree">同意</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<style lang="scss" scoped>
  .read-dialog {
    .protocol {
      color: $ga-brand-4;
      font-size: 30rpx;
      font-weight: 500;
    }
    .popup-content {
      padding: 72rpx 32rpx 48rpx;
      width: 606rpx;
      height: 344rpx;
      box-sizing: border-box;
      .top {
        text-align: center;
        font-size: 30rpx;
      }
      .bottom {
        display: flex;
        margin-top: 48rpx;
        justify-content: space-between;
        .btn {
          width: 262rpx;
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
          background: $ga-gray-2;
          color: $ga-gray-8;
        }
        .agree-btn {
          background: $ga-brand-4;
          color: $ga-gray-0;
        }
      }
    }
  }
</style>
