<script setup lang="ts">
import { ref } from 'vue'

type Props = {
  title: string
  showTitle?: boolean
  cancelText?: string
  confirmText?: string
  placeholder?: string
}

const emit = defineEmits(['confirm'])

const props = defineProps({
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
  placeholder: {
    type: String,
    default: '请输入'
  }
})

const inputText = ref('')
const showError = ref(false)
const popup = ref(null)

const open = () => {
  showError.value = false
  inputText.value = ''
  popup.value?.open('center')
}

const onAgree = () => {
  if (!inputText.value.trim()) {
    showError.value = true
    return
  }
  emit('confirm', inputText.value)
  popup.value?.close()
}

const onCancel = () => {
  popup.value?.close()
}

const onBlur = () => {
  if (!inputText.value.trim()) {
    showError.value = true
  }else{
    showError.value = false
  }
}

defineExpose({
  open,
})
</script>

<template>
  <view class="confirm-popup">
    <uni-popup ref="popup" background-color="#fff" border-radius="12rpx" type="bottom">
      <view class="popup-content">
        <view class="top bottom-line">
          <text>{{ title }}</text>
          <image src="@/static/image/close.png" mode="aspectFit" class="close-icon" @click="onCancel" />
        </view>
        <view class="content">
          <uni-easyinput 
          v-model="inputText" 
          class="input-box"
          :clearable="false"
          :focus="true"
          :input-border="false"
          @blur="onBlur"
          :styles="{borderColor:'none'}" 
          :placeholder="placeholder" />
          <text v-if="showError" class="error-tip">请输入内容</text>
        </view>
        <view class="bottom">
          <button class="btn cancel-btn" style="margin-right: 24rpx;" @click="onCancel">{{ cancelText }}</button>
          <button class="btn agree-btn" @click="onAgree">{{ confirmText }}</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<style lang="scss" scoped>
.confirm-popup {
  .popup-content {
    box-sizing: border-box;
    width:750rpx;

    .top {
        text-align: center;
        position: relative;
        padding:32rpx 42rpx;
        font-size:34rpx;
        font-weight:500;
        color:$ga-gray-8;
        .close-icon {
          position: absolute;
          right:42rpx;
          top:32rpx;
          width: 48rpx;
          height: 48rpx;
        }
    }
    .bottom-line {
      &::after {
        content: '';
        display: block;
        width: 100%;
        height: 1rpx;
        background-color: $ga-gray-2;
        position: absolute;
        bottom: 0;
        left: 0;
      }
    }

    .content {

      padding:42rpx;
      .input-box {
        height: 80rpx;
        width:666rpx;
        border-radius: 6rpx;
        font-size: 28rpx;
        padding:12rpx 0rpx;
        background-color: $ga-gray-1;
      }

      .error-tip {
        font-size: 24rpx;
        color: #ff4d4f;
        margin-top: 8rpx;
        display: block;
      }
    }

    .bottom {
      display: flex;
      justify-content: space-between;
      padding: 0 42rpx 42rpx 42rpx;
      .btn {
        width: 320rpx;
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
