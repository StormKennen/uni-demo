<script setup lang="ts">
import { postAuthLogin, postAuthRegister } from '@/services/apifox/NODEJSDEMO/AUTH/apifox';

  import { nextTick, ref, watch } from 'vue'
  import LoginHeaderText from '../components/login-header-text.vue'
  import ReadDialog from '../components/read-dialog.vue'
  import { PostBizUserLogin, PostBizUserSendSmsCode } from '@/services/apifox/3903128/shangWuXiaoChengXu/apifox'
  import { getStorageSync, getWxSession, setIsGoChatCoze, setStorageSync, setToken, setRefreshToken, setWxUserInfo, setWxEncryptedData, setUserInfo, clearLoginData, setTokenExpiresAt, setRefreshTokenExpiresAt } from '@/utils/storage'
  import { wxCode2Session, wxGetUserInfo, wxLogin } from '@/utils/wxLogin'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { PrivacyPageUrl, ProtocolPageUrl } from '@/utils/const'
  import { autoLogin } from '@/utils/autoLogin'

  type LoginType = 'mobile' | 'register'
  const isRead = ref(false)
  const readDialogRef = ref(null)
  const loginType = ref<LoginType>('mobile')
  const redirectUrl = ref()

  const changeLoginType = (type: LoginType) => {
    loginType.value = type
  }

  onLoad(async (option: any) => {
    console.log('🚀 ~ onLoad ~ option:', option)
    redirectUrl.value = option.redirectUrl
    
    // 尝试自动登录
    await checkAutoLogin()
  })
  
  /** 检查自动登录 */
  const checkAutoLogin = async () => {
    try {
      uni.showLoading({ title: '检查登录状态...', mask: true })
      
      // 设置超时保护，避免一直loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auto login timeout')), 5000)
      })
      
      const autoLoginPromise = autoLogin()
      
      const { isLoggedIn, user, needManualLogin } = await Promise.race([
        autoLoginPromise,
        timeoutPromise
      ]) as any
      
      uni.hideLoading()
      
      if (isLoggedIn && user) {
        console.log('🚀 ~ checkAutoLogin ~ 自动登录成功:', user)
        
        if (redirectUrl.value) {
          const url = { url: redirectUrl.value }
          console.log('Auto login redirect url:', url)
          if (
            redirectUrl.value === '/pages/index/index' ||
            redirectUrl.value === '/pages/mine/mine'
          ) {
            return uni.switchTab(url)
          } else {
            return uni.redirectTo(url)
          }
        } else {
          return uni.navigateBack()
        }
      } else {
        console.log('🚀 ~ checkAutoLogin ~ 需要手动登录')
        // 继续显示登录页面
      }
    } catch (error) {
      console.warn('🚀 ~ checkAutoLogin ~ error:', error)
      uni.hideLoading()
      // 出错时继续显示登录页面
    }
  }



  const loginSuccess = async (data: any) => {
    console.log('🚀 ~ loginSuccess ~ data:', data)
    // 处理token - 支持新旧两种数据结构
    if (data?.tokens?.access) {
      // 新的token结构：{ tokens: { access: { token: "...", expires: "..." }, refresh: { token: "...", expires: "..." } } }
      setToken(data.tokens.access.token)
      setRefreshToken(data.tokens.refresh.token)
      
      // 保存token过期时间（转换为时间戳毫秒数）
      if (data.tokens.access.expires) {
        // 后端返回的是 ISO 日期字符串，需要转换为时间戳
        const expiresMs = new Date(data.tokens.access.expires).getTime()
        setTokenExpiresAt(expiresMs)
      } else if (data.tokens.access.expiresIn) {
        // 如果返回的是相对时间（秒），转换为绝对时间
        const expires = Date.now() + (data.tokens.access.expiresIn * 1000)
        setTokenExpiresAt(expires)
      }
      
      if (data.tokens.refresh.expires) {
        // 后端返回的是 ISO 日期字符串，需要转换为时间戳
        const expiresMs = new Date(data.tokens.refresh.expires).getTime()
        setRefreshTokenExpiresAt(expiresMs)
      } else if (data.tokens.refresh.expiresIn) {
        // 如果返回的是相对时间（秒），转换为绝对时间
        const expires = Date.now() + (data.tokens.refresh.expiresIn * 1000)
        setRefreshTokenExpiresAt(expires)
      }
    }
    
    // 处理用户信息
    if (data.user) {
      setUserInfo(data.user)
      setWxUserInfo(data.user) // 保持兼容性
    }
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      // #ifdef MP-WEIXIN
      uni.switchTab({
        url: '/pages/index/index'
      })
      // #endif
      
      // #ifdef H5
      uni.redirectTo({
        url: '/pages/index/index'
      })
      // #endif
    }, 1000)
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
  const password = ref()
  const confirmPassword = ref()
  const inputMobile = (val: string) => {
    console.log('🚀 ~ inputMobile ~ val:', val)
    mobileNumber.value = val
  }
  const inputPassword = (val: string) => {
    console.log('🚀 ~ inputPassword ~ val:', val)
    password.value = val
  }
  const inputConfirmPassword = (val: string) => {
    console.log('🚀 ~ inputConfirmPassword ~ val:', val)
    confirmPassword.value = val
  }

  /** 手机号登录 */
  const mobileLogin = async () => {
    if (!mobileNumber.value || !password.value) {
      uni.showToast({
        title: '请输入手机号和密码！',
        icon: 'none',
      })
      return
    }
    try {
      uni.showLoading()
      
      // #ifdef MP-WEIXIN
      // 尝试获取微信用户信息，但不阻塞登录流程
      try {
        const wxUserInfo = await wxGetUserInfo()
        console.log('🚀 ~ mobileLogin ~ userInfo:', wxUserInfo)
      } catch (e) {
        console.log('获取微信用户信息失败，继续登录流程')
      }
      // #endif
      
      const loginParams = {
        phone: mobileNumber.value,
        password: password.value,
      }
      console.log('🚀 ~ mobileLogin ~ loginParams:', loginParams)
      const res = await postAuthLogin(loginParams)
      console.log('🚀 ~ mobileLogin ~ res:', res)
      loginSuccess(res)
      uni.hideLoading()
    } catch (error) {
      console.warn('🚀 ~ mobileLogin ~ error:', error)
      uni.hideLoading()
      
      // 处理不同类型的错误
      let errorMessage = '登录失败，请稍后重试'
      
      if (error?.code === 401) {
        errorMessage = '手机号或密码错误'
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
      })
    }
  }

  /** 用户注册 */
  const userRegister = async () => {
    if (!isRead.value) {
      readDialogRef.value?.open()
      return
    }
    if (!mobileNumber.value || !password.value || !confirmPassword.value) {
      uni.showToast({
        title: '请填写完整信息！',
        icon: 'none',
      })
      return
    }
    if (password.value !== confirmPassword.value) {
      uni.showToast({
        title: '两次密码输入不一致！',
        icon: 'none',
      })
      return
    }
    try {
      uni.showLoading()
      
      let userName = '用户'
      
      // #ifdef MP-WEIXIN
      // 获取微信用户信息
      const wxUserInfo = await wxGetUserInfo()
      console.log('🚀 ~ userRegister ~ wxUserInfo:', wxUserInfo)
      
      // 存储微信加密数据到本地，便于后续使用
      if (wxUserInfo.iv) {
        setWxEncryptedData({
          cloudID: wxUserInfo.cloudID,
          encryptedData: wxUserInfo.encryptedData,
          iv: wxUserInfo.iv,
          signature: wxUserInfo.signature,
          rawData: wxUserInfo.rawData,
          userInfo: wxUserInfo.userInfo || {},
        })
      }
      userName = wxUserInfo.userInfo?.nickName || '用户'
      // #endif
      
      // 使用标准注册API
      const registerParams = {
        phone: mobileNumber.value,
        name: userName,
        password: password.value,
      }
      
      const registerRes = await postAuthRegister(registerParams)
      console.log('🚀 ~ userRegister ~ registerRes:', registerRes)
      
      // 注册成功后，调用登录API获取完整的用户信息和token
      const loginParams = {
        phone: mobileNumber.value,
        password: password.value,
      }
      
      const loginRes = await postAuthLogin(loginParams)
      loginSuccess(loginRes)
      uni.hideLoading()
    } catch (error) {
      console.warn('🚀 ~ userRegister ~ error:', error)
      uni.hideLoading()
      
      // 处理不同类型的错误
      let errorMessage = '注册失败，请稍后重试'
      
      if (error?.code === 401) {
        errorMessage = '注册信息验证失败'
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      uni.showToast({
        title: errorMessage,
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
    <!-- 登录界面 -->
    <view v-if="loginType === 'mobile'" class="mobile">
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
      <view class="mobile-password">
        <uni-easyinput
          :clearable="false"
          type="password"
          :inputBorder="false"
          :styles="inputStyles"
          v-model="password"
          placeholder="请输入密码"
          @input="inputPassword">
        </uni-easyinput>
      </view>
      <view class="change-register" @click="changeLoginType('register')">没有账号，前往注册</view>
      <view class="login-btns">
        <button class="btn btn-login" @click="mobileLogin">登录</button>
      </view>
    </view>
    <!-- 注册界面 -->
    <view v-else-if="loginType === 'register'" class="mobile">
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
      <view class="mobile-password">
        <uni-easyinput
          :clearable="false"
          type="password"
          :inputBorder="false"
          :styles="inputStyles"
          v-model="password"
          placeholder="请输入密码"
          @input="inputPassword">
        </uni-easyinput>
      </view>
      <view class="mobile-confirm-password">
        <uni-easyinput
          :clearable="false"
          type="password"
          :inputBorder="false"
          :styles="inputStyles"
          v-model="confirmPassword"
          placeholder="请确认密码"
          @input="inputConfirmPassword">
        </uni-easyinput>
      </view>
      <view class="change-login" @click="changeLoginType('mobile')">已有账号，前往登录</view>
      <view class="login-btns">
        <button class="btn btn-register" @click="userRegister">注册</button>
      </view>
    </view>
    <!-- 协议确认只在注册时显示 -->
    <view v-if="loginType === 'register'" class="read-protocol">
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
      .mobile-password {
        height: 92rpx;
        line-height: 92rpx;
        margin-bottom: 24rpx;
        background: $ga-gray-2;
        font-size: 26rpx;
      }
      .mobile-confirm-password {
        height: 92rpx;
        line-height: 92rpx;
        background: $ga-gray-2;
        font-size: 26rpx;
      }
      .change-register,
      .change-login {
        margin: 32rpx 0;
        color: $ga-brand-4;
        font-size: 26rpx;
        text-align: center;
        cursor: pointer;
      }
      .login-btns {
        .btn-login,
        .btn-register {
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
