<script setup lang="ts">
  import { ref } from 'vue'
  import { PrivacyPageUrl, ProtocolPageUrl } from '@/utils/const'
  type Props = {
    confirm: () => void
    cancel?: () => void
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
    props.cancel?.()
    popup.value?.close()
  }
  const onPrivacy = () => {
    uni.navigateTo({
      url: PrivacyPageUrl,
    })
  }
  const onProtocol = () => {
    uni.navigateTo({
      url: ProtocolPageUrl,
    })
  }

  defineExpose({
    open,
  })
</script>

<template>
  <view class="read-dialog">
    <uni-popup ref="popup" background-color="transparent" border-radius="24rpx" @change="change">
      <view class="popup-content">
        <view class="top" hover-class="none" hover-stop-propagation="false">
          <text class="dialog-title">阅读并同意协议</text>
          <text class="dialog-description">使用服务前，请阅读并同意</text>
          <view class="protocol-line">
            <text @click="onPrivacy" class="protocol">《隐私政策》</text>
            <text class="dialog-conjunction">与</text>
            <text class="protocol" @click="onProtocol">《用户服务协议》</text>
          </view>
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
      color: var(--theme-brand);
      font-size: 30rpx;
      font-weight: 500;
    }
    .popup-content {
      padding: 48rpx 32rpx 32rpx;
      width: 606rpx;
      min-height: 344rpx;
      box-sizing: border-box;
      border: 1rpx solid var(--theme-border);
      border-radius: 24rpx;
      background: var(--theme-elevated);
      .top {
        text-align: center;
        color: var(--theme-text);
      }
      .dialog-title,
      .dialog-description,
      .protocol-line {
        display: block;
      }
      .dialog-title {
        font-size: 32rpx;
        font-weight: 700;
      }
      .dialog-description {
        margin-top: 20rpx;
        color: var(--theme-text-secondary);
        font-size: 26rpx;
        line-height: 1.5;
      }
      .protocol-line {
        margin-top: 8rpx;
        font-size: 28rpx;
        line-height: 1.5;
      }
      .dialog-conjunction {
        margin: 0 6rpx;
        color: var(--theme-text-secondary);
      }
      .bottom {
        display: flex;
        margin-top: 36rpx;
        justify-content: space-between;
        .btn {
          width: 262rpx;
          height: 88rpx;
          line-height: 88rpx;
          text-align: center;
          border-radius: 24rpx;
          font-size: 32rpx;
          font-weight: 600;
          &::after {
            display: none;
          }
        }
        .cancel-btn {
          background: var(--theme-surface-2);
          color: var(--theme-text-secondary);
        }
        .agree-btn {
          background: var(--theme-brand);
          color: #fff;
        }
        .btn:active {
          opacity: 0.86;
        }
      }
    }
  }
</style>
