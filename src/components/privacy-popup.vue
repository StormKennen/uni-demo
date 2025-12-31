<template>
  <!-- #ifdef MP-WEIXIN -->
  <view v-if="showPrivacy" class="privacy-mask">
    <view class="privacy-popup">
      <view class="privacy-title">用户隐私保护提示</view>
      <view class="privacy-content">
        <text>在使用当前小程序服务之前，请仔细阅读</text>
        <text class="privacy-link" @click="openPrivacyContract">{{ privacyContractName }}</text>
        <text>。如你同意{{ privacyContractName }}，请点击"同意"开始使用。</text>
      </view>
      <view class="privacy-btns">
        <button class="btn-disagree" @click="handleDisagree">拒绝</button>
        <button 
          class="btn-agree" 
          id="agree-btn" 
          open-type="agreePrivacyAuthorization" 
          @agreeprivacyauthorization="handleAgree"
        >
          同意
        </button>
      </view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showPrivacy = ref(false)
const privacyContractName = ref('用户隐私保护指引')
let resolvePrivacyAuthorization: ((value: { buttonId: string; event: string }) => void) | null = null

onMounted(() => {
  // #ifdef MP-WEIXIN
  if (wx.onNeedPrivacyAuthorization) {
    wx.onNeedPrivacyAuthorization((resolve) => {
      console.log('触发隐私授权弹窗')
      resolvePrivacyAuthorization = resolve
      showPrivacy.value = true
    })
  }
  
  // 获取隐私协议名称
  if (wx.getPrivacySetting) {
    wx.getPrivacySetting({
      success: (res) => {
        console.log('隐私设置:', res)
        if (res.privacyContractName) {
          privacyContractName.value = res.privacyContractName
        }
      }
    })
  }
  // #endif
})

// 打开隐私协议
const openPrivacyContract = () => {
  // #ifdef MP-WEIXIN
  if (wx.openPrivacyContract) {
    wx.openPrivacyContract({
      success: () => {
        console.log('打开隐私协议成功')
      },
      fail: (err) => {
        console.error('打开隐私协议失败', err)
      }
    })
  }
  // #endif
}

// 同意隐私协议
const handleAgree = () => {
  console.log('用户同意隐私协议')
  showPrivacy.value = false
  if (resolvePrivacyAuthorization) {
    resolvePrivacyAuthorization({ buttonId: 'agree-btn', event: 'agree' })
    resolvePrivacyAuthorization = null
  }
}

// 拒绝隐私协议
const handleDisagree = () => {
  console.log('用户拒绝隐私协议')
  showPrivacy.value = false
  if (resolvePrivacyAuthorization) {
    resolvePrivacyAuthorization({ buttonId: 'disagree-btn', event: 'disagree' })
    resolvePrivacyAuthorization = null
  }
  
  // 可选：提示用户拒绝后的影响
  uni.showToast({
    title: '您已拒绝隐私协议，部分功能可能无法使用',
    icon: 'none',
    duration: 2000
  })
}
</script>

<style lang="scss" scoped>
.privacy-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.privacy-popup {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  
  .privacy-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
    text-align: center;
    margin-bottom: 32rpx;
  }
  
  .privacy-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    text-align: justify;
    margin-bottom: 40rpx;
    
    .privacy-link {
      color: #0046B4;
      text-decoration: underline;
    }
  }
  
  .privacy-btns {
    display: flex;
    gap: 24rpx;
  }
  
  .btn-disagree,
  .btn-agree {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 30rpx;
    font-weight: 500;
    border: none;
    
    &::after {
      display: none;
    }
  }
  
  .btn-disagree {
    background: #f5f5f5;
    color: #666;
  }
  
  .btn-agree {
    background: #0046B4;
    color: #fff;
  }
}
</style>
