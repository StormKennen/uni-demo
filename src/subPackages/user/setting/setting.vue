<script setup lang="ts">
  import { ref } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import MineListItem from '@/components/mine-list-item.vue'
  import { PrivacyPageUrl, ProtocolPageUrl } from '@/utils/const'
  import ConfirmDialog from '@/components/confirm-dialog.vue'
  import { getToken, removeToken, removeWxUserInfo } from '@/utils/storage'

  interface SettingListItem {
    icon: string
    name: string
    to?: string
    needToken?: boolean
  }

  const isLogut = ref(!getToken())
  const appBaseInfo = uni.getAppBaseInfo()
  const accountList = ref<SettingListItem[]>([
    {
      icon: '/static/image/mine/setting.svg',
      name: '我的资料',
      to: '/subPackages/user/setting/profile',
      needToken: true,
    },
    {
      icon: '/static/image/mine/order.svg',
      name: '账号与安全',
      to: '/subPackages/user/setting/account-security',
      needToken: true,
    },
  ])
  const infoList = ref<SettingListItem[]>([
    { icon: '/static/image/mine/protocol.svg', name: '用户服务协议', to: ProtocolPageUrl },
    { icon: '/static/image/mine/privacy.svg', name: '隐私政策', to: PrivacyPageUrl },
    { icon: '/static/image/mine/version.svg', name: `版本号${appBaseInfo.appVersion}` },
  ])
  const confirmDialogRef = ref(null)
  const logout = () => {
    console.log('logout......')
    confirmDialogRef.value?.open()
  }
  const lougouConfirm = () => {
    console.log('tuichu denglu')
    removeToken()
    removeWxUserInfo()
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
  <PageLayout title="设置">
    <view class="setting">
      <view class="list" hover-class="none" :hover-stop-propagation="false">
        <view v-for="item in accountList" :key="item.name" class="mine-list-content" hover-class="none" :hover-stop-propagation="false">
          <MineListItem :data="item" />
        </view>
      </view>
      <view class="list list--secondary" hover-class="none" :hover-stop-propagation="false">
        <view v-for="item in infoList" :key="item.name" class="mine-list-content" hover-class="none" :hover-stop-propagation="false">
          <MineListItem :data="item" />
        </view>
      </view>
      <view v-if="!isLogut" class="bottom" hover-class="none" :hover-stop-propagation="false">
        <button class="btn" @click="logout">退出登录</button>
      </view>
      <ConfirmDialog ref="confirmDialogRef" title="确定要退出当前账号吗？" :confirm="lougouConfirm" />
    </view>
  </PageLayout>
</template>

<style lang="scss" scoped>
  .setting {
    position: relative;
    min-height: 100vh;
    width: 100%;
    box-sizing: border-box;
    background: var(--theme-bg);
    .list {
      padding: 20rpx 32rpx 32rpx;
    }
    .list--secondary {
      margin-top: 12rpx;
      padding-top: 0;
    }
    .bottom {
      position: absolute;
      bottom: 48rpx;
      left: 0;
      right: 0;
      padding: 0 40rpx 48rpx;
    }
    .btn {
      border-radius: 16rpx;
      font-size: 32rpx;
      font-weight: 500;
      background: var(--theme-brand);
      color: #fff;
      width: 670rpx;
      box-sizing: border-box;
      &::after {
        display: none;
      }
    }
  }
</style>
