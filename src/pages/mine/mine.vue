<script setup>
  import { ref, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import defaultAvator from '@/static/image/default_avator.svg'
  import rightArrow from '@/static/image/right_arrow.svg'
  import MineListItem from '@/components/mine-list-item.vue'
  import { getToken, getWxUserInfo, getUserInfo, clearLoginData } from '@/utils/storage'
  import { onShow } from '@dcloudio/uni-app'
  import { useShare } from '@/utils/share'
  import H5TabBar from '@/components/h5-tab-bar.vue'
  import { useThemeStore } from '@/stores/theme'

  const themeStore = useThemeStore()
  const { isDark } = storeToRefs(themeStore)

  const token = ref()
  const avatar = ref()
  const userInfo = ref()
  const themeIcon = '/static/image/mine/setting.svg'

  onShow(() => {
    token.value = getToken()
    userInfo.value = getUserInfo() || getWxUserInfo()
    avatar.value = token.value ? userInfo.value?.avatarUrl || userInfo.value?.avatar : defaultAvator
  })

  const onLogin = () => {
    if (getToken()) {
      return
    }
    uni.navigateTo({
      url: '/pages/mine/login/login',
    })
  }

  const onLogout = () => {
    uni.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          // 清除用户数据
          clearLoginData()

          // 更新页面状态
          token.value = null
          userInfo.value = null
          avatar.value = defaultAvator

          uni.showToast({
            title: '已退出登录',
            icon: 'success',
          })
        }
      },
    })
  }

  const list = ref([
    // { icon: '/static/image/mine/order.svg', name: '我的订单', to: '/pages/mine/order/order', needToken: true },
    { icon: '/static/image/mine/setting.svg', name: '设置', to: '/subPackages/user/setting/setting', needToken: true },
  ])

  // 动态计算显示的列表项
  const displayList = computed(() => {
    const baseList = [...list.value]

    // 如果已登录，添加登出选项
    if (token.value) {
      baseList.push({
        icon: '/static/image/mine/logout.svg',
        name: '退出登录',
        action: 'logout',
        needToken: true,
      })
    }

    return baseList
  })

  // 处理列表项点击事件
  const handleItemClick = item => {
    if (item.action === 'logout') {
      onLogout()
    } else if (item.to) {
      // 原有的跳转逻辑
      uni.navigateTo({
        url: item.to,
      })
    }
  }

  // 分享功能
  const { onShareAppMessage, onShareTimeline } = useShare('mine')

  // 导出分享方法供微信小程序调用
  defineExpose({
    onShareAppMessage,
    onShareTimeline,
  })

  const handleThemeChange = event => {
    themeStore.setMode(event.detail.value ? 'dark' : 'light')
  }
</script>

<template>
  <PageLayout title="我的" :show-nav="false" :nav-back="false">
    <view class="mine">
      <view class="bg" />
      <view class="mine-top" hover-class="none" hover-stop-propagation="false">
        <uni-nav-bar backgroundColor="none" title="" statusBar :border="false"></uni-nav-bar>
        <view class="mine-user" hover-class="none" hover-stop-propagation="false">
          <view class="mine-user-avator" hover-class="none" hover-stop-propagation="false">
            <image
              :class="`${token && (userInfo?.avatarUrl || userInfo?.avatar) ? 'border avator-image' : 'avator-image'}`"
              :src="avatar || defaultAvator"></image>
          </view>
          <view class="mine-user-name" @click="onLogin" hover-class="none" hover-stop-propagation="false">
            <text class="user-name-text">{{ token ? userInfo?.nickname || userInfo?.name || 'kai用户' : '请登录' }}</text>
            <image v-if="!token" class="user-name-right-arrow" :src="rightArrow" />
          </view>
        </view>
      </view>
      <view class="mine-list" hover-class="none" hover-stop-propagation="false">
        <view v-for="item in displayList" :key="item.name" class="mine-list-content" hover-class="none" hover-stop-propagation="false">
          <MineListItem :data="item" @click="handleItemClick(item)" />
        </view>
        <view class="mine-list-content mine-theme-row" hover-class="none" hover-stop-propagation="false">
          <view class="mine-list-item" hover-class="none" hover-stop-propagation="false">
            <view class="left" hover-class="none" hover-stop-propagation="false">
              <image class="left-image" :src="themeIcon"> </image>
            </view>
            <view class="center" hover-class="none" hover-stop-propagation="false">
              <text class="center-text">夜间模式</text>
            </view>
            <view class="right theme-switch-wrap" hover-class="none" hover-stop-propagation="false">
              <switch :checked="isDark" color="#0046b4" @change="handleThemeChange" />
            </view>
          </view>
        </view>
      </view>

      <!-- H5 底部导航 -->
      <!-- #ifdef H5 -->
      <H5TabBar current="mine" />
      <!-- #endif -->
    </view>
  </PageLayout>
</template>

<style lang="scss">
  .mine {
    // width: 750rpx;
    background: none;

    /* #ifdef H5 */
    padding-bottom: 120rpx; // 为底部导航留出空间
    /* #endif */
    .bg {
      position: absolute;
      z-index: -1;
      width: 750rpx;
      height: 400rpx;
      background: linear-gradient(180deg, #cce3ff 0%, rgba(204, 227, 255, 0) 100%);
    }
    .mine-top {
      height: 400rpx;
      width: 750rpx;
      padding: 0 32rpx;
      box-sizing: border-box;
      .mine-user {
        display: flex;
        flex-direction: row;
        align-items: center;
        .mine-user-avator {
          width: 120rpx;
          height: 120rpx;
          margin-right: 32rpx;
          .avator-image {
            width: 120rpx;
            height: 120rpx;
            border-radius: 50%;
          }
          .border {
            border: solid 2rpx $ga-gray-0;
          }
        }
        .mine-user-name {
          .user-name-text {
            font-size: 42rpx;
            font-weight: 500;
            color: var(--theme-text);
          }
          .user-name-right-arrow {
            width: 32rpx;
            height: 32rpx;
            color: #f00;
          }
        }
      }
    }
    .mine-list {
      padding: 0 42rpx 0 32rpx;
      box-sizing: border-box;
    }
    .mine-theme-row {
      .mine-list-item {
        display: flex;
        flex-direction: row;
        height: 106rpx;
        align-items: center;
        width: 100%;
        box-sizing: border-box;
      }
      .left {
        width: 42rpx;
        height: 42rpx;
        margin-right: 30rpx;
      }
      .left-image {
        width: 42rpx;
        height: 42rpx;
      }
      .center {
        flex: 1;
      }
      .center-text {
        font-size: 30rpx;
        color: var(--theme-text);
      }
      .right {
        width: auto;
        height: auto;
        padding: 0;
      }
      .theme-switch-wrap {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
      .theme-switch-wrap switch {
        transform: scale(0.86);
        transform-origin: right center;
      }
    }
  }
</style>
