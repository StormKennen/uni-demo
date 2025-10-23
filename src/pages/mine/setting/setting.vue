<script setup lang="ts">
  import MineListItem from '@/components/mine-list-item.vue'
  import { PrivacyPageUrl, ProtocolPageUrl } from '@/utils/const'
  import ConfirmDialog from '@/components/confirm-dialog.vue'
  import { ref } from 'vue'
  import { getToken, removeToken, removeWxUserInfo, setToken, setWxUserInfo } from '@/utils/storage'
  import { onShow } from '@dcloudio/uni-app'
  import { useOrderStore } from '@/stores/order'

  const isLogut = ref(!getToken())
  const appBaseInfo = uni.getAppBaseInfo()
  const list = ref([
    { icon: '/static/image/mine/protocol.svg', name: '用户条款', to: ProtocolPageUrl },
    { icon: '/static/image/mine/privacy.svg', name: '隐私协议', to: PrivacyPageUrl },
    { icon: '/static/image/mine/version.svg', name: `版本号${appBaseInfo.appVersion}` },
  ])
  const confirmDialogRef = ref(null)
  const orderStore = useOrderStore()
  const logout = () => {
    console.log('logout......')
    confirmDialogRef.value?.open()
  }
  const lougouConfirm = () => {
    console.log('tuichu denglu')
    removeToken()
    removeWxUserInfo()
    orderStore.clearOrderList()
    const token = getToken()
    if (token) {
      uni.showToast({
        title: '退出登录失败，请重试！',
        icon: 'none',
      })
    } else {
      isLogut.value = true
      uni.switchTab({
        url: '/pages/mine/mine',
      })
      uni.showToast({
        title: '已退出登录',
        icon: 'none',
      })
    }
  }

  onShow(() => {
    isLogut.value = !getToken()
  })
</script>

<template>
  <view class="setting">
    <view class="list" hover-class="none" hover-stop-propagation="false">
      <view v-for="item in list" :key="item.name" class="mine-list-content" hover-class="none" hover-stop-propagation="false">
        <MineListItem :data="item" />
      </view>
    </view>
    <view v-if="!isLogut" class="bottom" hover-class="none" hover-stop-propagation="false">
      <button class="btn" @click="logout">退出登录</button>
    </view>
    <ConfirmDialog ref="confirmDialogRef" title="确定要退出当前账号吗？" :confirm="lougouConfirm" />
  </view>
</template>

<style lang="scss" scoped>
  .setting {
    // padding: 0 42rpx 32rpx 32rpx;
    position: relative;
    height: 100%;
    width: 750rpx;
    box-sizing: border-box;
    background: #fff;
    .list {
      padding: 0 42rpx 32rpx 32rpx;
    }
    .bottom {
      position: absolute;
      bottom: 48rpx;
      padding: 0 40rpx 48rpx 40rpx;
    }
    .btn {
      border-radius: 6rpx;
      font-size: 32rpx;
      font-weight: 500;
      background: $ga-brand-4;
      color: $ga-gray-0;
      width: 670rpx;
      box-sizing: border-box;
      &::after {
        display: none;
      }
    }
  }
</style>
