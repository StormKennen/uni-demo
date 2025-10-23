<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue'
  import LoginHeaderText from '../components/login-header-text.vue'
  import ReadDialog from '../components/read-dialog.vue'
  import { PostBizUserLogin, PostBizUserSendSmsCode } from '@/services/apifox/3903128/shangWuXiaoChengXu/apifox'
  import { getStorageSync, getWxSession, setIsGoChatCoze, setStorageSync, setToken, setWxUserInfo } from '@/utils/storage'
  import { wxCode2Session, wxGetUserInfo } from '@/utils/wxLogin'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { PrivacyPageUrl, ProtocolPageUrl } from '@/utils/const'
  import { useOrderStore } from '@/stores/order'

  type LoginType = 'weixin' | 'mobile'
  const isRead = ref(false)
  const readDialogRef = ref(null)
  const loginType = ref<LoginType>('weixin')
  const redirectUrl = ref()

  const orderStore = useOrderStore()

  const changeLoginType = (type: LoginType) => {
    loginType.value = type
  }

  onLoad((option: any) => {
    console.log('🚀 ~ onLoad ~ option:', option)
    redirectUrl.value = option.redirectUrl
  })

  const weixinLogin = async () => {
    changeLoginType('weixin')

    if (!isRead.value) {
      console.log('tanchuang')
      readDialogRef.value?.open()
      return
    }
  }

  const loginSuccess = async res => {
    console.log('🚀 ~ getphonenumber ~ res:', res)
    const { token, ...rest } = res
    setIsGoChatCoze(true)
    setToken(token)
    setWxUserInfo(rest)
    // await app.initData()
    // app.globalData.isLoginOut = true

    orderStore.getOrderList()

    if (redirectUrl.value) {
      const url = { url: redirectUrl.value }
      console.log('url', url)
      if (
        redirectUrl.value === '/pages/index/index' ||
        redirectUrl.value === '/pages/chat/chat' ||
        redirectUrl.value === '/pages/mall/mall' ||
        redirectUrl.value === '/pages/mine/mine'
      ) {
        return uni.switchTab(url)
      } else {
        return uni.redirectTo(url)
      }
    } else {
      return uni.navigateBack()
    }
  }

  const getphonenumber = async (e: any) => {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      try {
        uni.showLoading()
        const wxUserInfo = await wxGetUserInfo()
        // 用户切换手机号码，需要获取最新信息 wxCode2Session
        await wxCode2Session()
        console.log('🚀 ~ getphonenumber ~ userInfo:', wxUserInfo)
        const userInfo = wxUserInfo.userInfo
        const wxSession = getWxSession()
        const params = {
          mobile_js_code: e.target?.code as string,
          unionid: wxSession.unionid as string,
          avatar_url: userInfo.avatarUrl,
          nickname: userInfo.nickName,
          gender: `${userInfo.gender}`,
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country,
        }
        console.log('🚀 ~ getphonenumber ~ params:', params)
        const res = await PostBizUserLogin(params)
        loginSuccess(res)
        uni.hideLoading()
      } catch (error) {
        console.log('error', error)
        uni.hideLoading()
        uni.showToast({
          title: '登录失败，请稍后重试！',
          icon: 'none',
        })
      }
    } else {
      console.log('getPhoneNumber error', e)
      uni.showToast({
        title: '登录失败，请稍后重试！',
        icon: 'none',
      })
    }
  }

  const popup = ref(null)
  const change = (val: any) => {
    console.log('change', val)
  }

  const onConfirmRead = () => {
    isRead.value = true
    console.log('🚀 ~ onConfirmRead ~ isRead:', isRead.value)
  }

  const mobileNumber = ref()
  // const mobileNumberError = ref(true)
  const code = ref()
  const count = ref(0)
  const inputMobile = (val: string) => {
    console.log('🚀 ~ inputMobile ~ val:', val)
  }
  const inputCode = (val: string) => {
    console.log('🚀 ~ inputCode ~ val:', val)
  }

  const getCode = async () => {
    console.log('getCode ', isRead.value)

    if (!isRead.value) {
      readDialogRef.value?.open()
      return
    }
    if (!mobileNumber.value) {
      uni.showToast({
        title: '请输入手机号！',
        icon: 'none',
      })
      return
    }
    uni.showLoading()
    try {
      const res = await PostBizUserSendSmsCode({
        mobile: mobileNumber.value,
        code: '+86',
      })
      console.log('res', res)
      count.value = 60
      countDown()
      uni.hideLoading()
    } catch (error: any) {
      console.log('🚀 ~ getCode ~ error:', error)
      if (error?.indexOf('频繁') > 0) {
        count.value = 60
        countDown()
      } else {
        count.value = 0
      }
      uni.hideLoading()
      uni.showToast({
        title: typeof error === 'string' ? error : '发送验证码失败，请稍后再试！',
        icon: 'none',
      })
    }
  }

  const countDown = () => {
    if (count.value < 1) {
      count.value = 0
      return
    }
    setTimeout(() => {
      count.value--
      countDown()
    }, 1000)
  }

  /** 手机号登录 */
  const mobileLogin = async () => {
    if (!isRead.value) {
      readDialogRef.value?.open()
      return
    }
    if (!mobileNumber.value || !code.value) {
      uni.showToast({
        title: '请输入手机号和验证码！',
        icon: 'none',
      })
      return
    }
    try {
      uni.showLoading()
      const wxUserInfo = await wxGetUserInfo()
      console.log('🚀 ~ getphonenumber ~ userInfo:', userInfo)
      const userInfo = wxUserInfo.userInfo
      const wxSession = getWxSession()
      const params = {
        unionid: wxSession.unionid as string,
        avatar_url: userInfo.avatarUrl,
        nickname: userInfo.nickName,
        gender: `${userInfo.gender}`,
        city: userInfo.city,
        province: userInfo.province,
        country: userInfo.country,
        mobile: mobileNumber.value,
        sms_code: code.value,
      }
      const res = await PostBizUserLogin(params)
      loginSuccess(res)
      uni.hideLoading()
    } catch (error) {
      console.warn('🚀 ~ mobileLogin ~ error:', error)
      uni.hideLoading()
      uni.showToast({
        title: '验证码错误',
        icon: 'none',
      })
    }
  }

  const inputStyles = ref({
    // borderRadius: 0,
    // padding: '22px'
    // padding: '28rpx 32rpx',
    // fontSize: '26rpx',
    // outerHeight: '92rpx'
  })

  onShow(() => {
    setIsGoChatCoze(false)
  })

  /** 阅读协议 */
  const onPrivacy = () => {
    console.log('🚀 ~ onPrivacy ~ onPrivacy:')
    uni.navigateTo({
      url: PrivacyPageUrl,
    })
  }
  const onProtocol = () => {
    uni.navigateTo({
      url: ProtocolPageUrl,
    })
  }
  const onRead = () => {
    isRead.value = true
  }
  const onBack = ()=>{
    uni.navigateBack()
  }
</script>

<template>
  <view class="login">
    <uni-nav-bar @clickLeft="onBack" left-icon="left" backgroundColor="none" title="" statusBar :border="false"></uni-nav-bar>
    <LoginHeaderText />
    <view v-if="loginType === 'weixin'" class="btns">
      <button v-if="isRead" class="btn btn-weixin" open-type="getPhoneNumber" @getphonenumber="getphonenumber">快捷登录</button>
      <button v-else class="btn btn-weixin" @click="weixinLogin">快捷登录</button>
      <button class="btn btn-mobile" @click="changeLoginType('mobile')">手机验证码登录</button>
    </view>
    <view v-else class="mobile">
      <view class="mobile-number">
        <uni-easyinput
          :clearable="false"
          type="number"
          :inputBorder="false"
          :styles="inputStyles"
          v-model="mobileNumber"
          placeholder="请输入手机号"
          @input="inputMobile"></uni-easyinput>
      </view>
      <view class="mobile-code">
        <uni-easyinput
          :clearable="false"
          type="number"
          :inputBorder="false"
          :styles="inputStyles"
          v-model="code"
          placeholder="验证码"
          @input="inputCode">
          <template #right>
            <view v-if="count === 0" @click="getCode" class="code-right">获取验证码</view>
            <view v-else class="code-right">{{ count }}s</view>
          </template>
        </uni-easyinput>
      </view>
      <view class="change-weixin" @click="changeLoginType('weixin')">切换微信一键登录</view>
      <view class="login-btns">
        <button class="btn btn-login" @click="mobileLogin">登录</button>
      </view>
    </view>
    <view class="read-protocol">
      <!-- <ReadProtocol v-model="isRead" /> -->
      <view class="read-protocol">
        <label class="radio" @click="onConfirmRead">
          <radio class="radio-radio" @click="onRead" :checked="isRead" color="#0046B4" />
          <text class="radio-text">我已阅读并同意</text>
        </label>
        <text @click="onPrivacy" class="protocol">《隐私政策》</text>和<text class="protocol" @click="onProtocol">《用户协议》</text>
      </view>
    </view>
    <view class="">
      <ReadDialog ref="readDialogRef" :confirm="onConfirmRead" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  .login {
    position: relative;
    height: 100%;
    width: 100%;
    background: linear-gradient(180deg, #d5dfff 0.06%, #eff3ff 26%, #fff 49%, #fff 100%);
    .btn {
      border-radius: 6rpx;
      font-size: 32rpx;
      font-weight: 500;
      height: 92rpx;
      line-height: 92rpx;
      &::after {
        display: none;
      }
    }
    .btns {
      padding: 0 48rpx 48rpx;
      .btn-weixin {
        background: $ga-brand-4;
        color: $ga-gray-0;
      }
      .btn-mobile {
        margin-top: 32rpx;
        background: #f4f8ff;
        color: $ga-brand-4;
      }
    }
    .mobile {
      padding: 0 48rpx 48rpx 48rpx;
      .mobile-input {
        border: none;
        border-radius: 0;
      }
      :deep(.uni-input-input){
        caret-color: #0046b4;
      }
      .mobile-number {
        display: flex;
        align-items: center;
        height: 92rpx;
        line-height: 92rpx;
        margin-bottom: 24rpx;
        background: $ga-gray-2;
        font-size: 26rpx;
      }
      .mobile-code {
        height: 92rpx;
        line-height: 92rpx;
        background: $ga-gray-2;
        font-size: 26rpx;
        .code-right {
          width: 194rpx;
          // padding: 28rpx;
          text-align: center;
          color: $ga-brand-4;
          font-size: 26rpx;
        }
      }
      .change-weixin {
        margin: 32rpx 0;
        color: $ga-brand-4;
        font-size: 26rpx;
      }
      .login-btns {
        .btn-login {
          background: $ga-brand-4;
          color: $ga-gray-0;
        }
      }
    }
    .read-protocol {
      text-align: center;
    }
  }
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
    .radio-text {
      margin-left: -4rpx;
    }
    .protocol {
      color: $ga-brand-4;
    }
  }
</style>
