<script setup>
  import { ref, computed } from 'vue'
  import defaultAvator from '@/static/image/default_avator.svg'
  import rightArrow from '@/static/image/right_arrow.svg'
  import MineListItem from '@/components/mine-list-item.vue'
  import { getToken, getWxUserInfo, getUserInfo, clearLoginData } from '@/utils/storage'
  import { onShow } from '@dcloudio/uni-app'

  const token = ref()
  const avatar = ref()
  const userInfo = ref()

  onShow(() => {
    token.value = getToken()
    userInfo.value = getUserInfo() || getWxUserInfo()
    avatar.value = token.value ? (userInfo.value?.avatarUrl || userInfo.value?.avatar) : defaultAvator
  })

  const onLogin = () => {
		if(getToken()){
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
      success: (res) => {
        if (res.confirm) {
          // 清除用户数据
          clearLoginData()
          
          // 更新页面状态
          token.value = null
          userInfo.value = null
          avatar.value = defaultAvator
          
          uni.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
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
        needToken: true
      })
    }
    
    return baseList
  })

  // 处理列表项点击事件
  const handleItemClick = (item) => {
    if (item.action === 'logout') {
      onLogout()
    } else if (item.to) {
      // 原有的跳转逻辑
      uni.navigateTo({
        url: item.to
      })
    }
  }
</script>

<template>
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
          <text class="user-name-text">{{
            token ? (userInfo?.nickname || userInfo?.name || 'kai用户') : '请登录'
          }}</text>
          <image v-if="!token" class="user-name-right-arrow" :src="rightArrow" />
        </view>
      </view>
    </view>
    <view class="mine-list" hover-class="none" hover-stop-propagation="false">
      <view v-for="item in displayList" :key="item.name" class="mine-list-content" hover-class="none" hover-stop-propagation="false">
        <MineListItem :data="item" @click="handleItemClick(item)" />
      </view>
    </view>
  </view>
</template>

<style lang="scss">
  .mine {
    // width: 750rpx;
    background: none;
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
            color: #252525;
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
  }
</style>
