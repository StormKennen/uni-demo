<script setup>
  import defaultAvator from '@/static/image/default_avator.svg'
  import rightArrow from '@/static/image/right_arrow.svg'
  import MineListItem from '@/components/mine-list-item.vue'
  import { getToken, getWxUserInfo } from '@/utils/storage'
  import { onShow } from '@dcloudio/uni-app'

  const wxUserInfo = getWxUserInfo()

  const token = ref()
  const avatar = ref()

  onShow(() => {
    token.value = getToken()
    avatar.value = token.value ? wxUserInfo.avatarUrl : defaultAvator
  })

  const onLogin = () => {
		if(getToken()){
			return
		}
    uni.navigateTo({
      url: '/pages/mine/login/login',
    })
  }

  const list = ref([
    { icon: '/static/image/mine/order.svg', name: '我的订单', to: '/pages/mine/order/order', needToken: true },
    { icon: '/static/image/mine/setting.svg', name: '设置', to: '/pages/mine/setting/setting', needToken: true },
  ])
</script>

<template>
  <view class="mine">
		<view class="bg" />
    <view class="mine-top" hover-class="none" hover-stop-propagation="false">
      <uni-nav-bar backgroundColor="none" title="" statusBar :border="false"></uni-nav-bar>
      <view class="mine-user" hover-class="none" hover-stop-propagation="false">
        <view class="mine-user-avator" hover-class="none" hover-stop-propagation="false">
          <image
            :class="`${token && wxUserInfo.avatarUrl ? 'border avator-image' : 'avator-image'}`"
            :src="avatar || defaultAvator"></image>
        </view>
        <view class="mine-user-name" @click="onLogin" hover-class="none" hover-stop-propagation="false">
          <text class="user-name-text">{{
            token ? wxUserInfo?.nickname || 'kai用户' : '请登录'
          }}</text>
          <image v-if="!token" class="user-name-right-arrow" :src="rightArrow" />
        </view>
      </view>
    </view>
    <view class="mine-list" hover-class="none" hover-stop-propagation="false">
      <view v-for="item in list" :key="item.name" class="mine-list-content" hover-class="none" hover-stop-propagation="false">
        <MineListItem :data="item" />
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
