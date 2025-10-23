<script setup lang="ts">
  import { PrivacyPageUrl, ProtocolPageUrl } from '@/utils/const';
import { ref } from 'vue'
  type Props = {}
  const props = defineProps<Props>()
  const model = defineModel()
  const onPrivacy = () => {
    console.log('🚀 ~ onPrivacy ~ onPrivacy:')
    uni.navigateTo({
      url: PrivacyPageUrl
    })
  }
  const onProtocol = () => {
    uni.navigateTo({
      url: ProtocolPageUrl
    })
  }
  const onRead = () => {
    model.value = true
    console.log('onRead model.value', model.value)
  }
</script>

<template>
  <view class="read-protocol">
    <label class="radio">
      <radio class="radio-radio" @click="onRead" :value="model" :checked="model" color="#0046B4" />
      <text class="radio-text">我已阅读并同意
      </text>
    </label>
    <text @click="onPrivacy" class="protocol">《隐私政策》</text>和<text class="protocol" @click="onProtocol">《用户协议》</text>
  </view>
</template>

<style lang="scss" scoped>
  .read-protocol {
    font-size: 24rpx;
    color: $ga-gray-6;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    .radio {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .radio-radio {
      transform: scale(0.6);
      font-size: 24rpx;
    }
    .radio-text{
      margin-left: -4rpx;
    }
    .protocol {
      color: $ga-brand-4;
    }
  }
</style>
