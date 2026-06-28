<script setup lang="ts">
import { postAuthLogin, postAuthRegister, postAuthWechatLogin } from '@/services/apifox/NODEJSDEMO/AUTH/apifox';
import type { postAuthWechatLoginBody, postAuthWechatLoginRes } from '@/services/apifox/NODEJSDEMO/AUTH/interface';
import PrivacyPopup from '@/components/privacy-popup.vue'

  import { ref } from 'vue'
  import LoginHeaderText from '../components/login-header-text.vue'
  import ReadDialog from '../components/read-dialog.vue'
  import { setIsGoChatCoze, setToken, setRefreshToken, setWxUserInfo, setWxEncryptedData, setUserInfo, setTokenExpiresAt, setRefreshTokenExpiresAt } from '@/utils/storage'
  import { wxGetUserInfo } from '@/utils/wxLogin'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { PrivacyPageUrl, ProtocolPageUrl } from '@/utils/const'
  import { autoLogin } from '@/utils/autoLogin'

  type LoginType = 'mobile' | 'register'
  type AuthMode = 'wechat' | 'account'
  const isRead = ref(false)
  const readDialogRef = ref<any>(null)
  const loginType = ref<LoginType>('mobile')
  const authMode = ref<AuthMode>('account')
  const redirectUrl = ref('')
  const wechatLoginLoading = ref(false)
  const isMpWeixin = ref(false)

  // #ifdef MP-WEIXIN
  isMpWeixin.value = true
  authMode.value = 'wechat'
  // #endif

  const changeLoginType = (type: LoginType) => {
    loginType.value = type
  }

  const switchAuthMode = (mode: AuthMode) => {
    authMode.value = mode
    if (mode === 'account') {
      loginType.value = 'mobile'
    }
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
          const targetUrl = decodeURIComponent(redirectUrl.value)
          const url = { url: targetUrl }
          console.log('Auto login redirect url:', url)
          if (
            targetUrl === '/pages/index/index' ||
            targetUrl === '/pages/mine/mine'
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
      if (redirectUrl.value) {
        const targetUrl = decodeURIComponent(redirectUrl.value)
        if (
          targetUrl === '/pages/index/index' ||
          targetUrl === '/pages/mine/mine'
        ) {
          uni.switchTab({
            url: targetUrl,
          })
          return
        }

        uni.redirectTo({
          url: targetUrl,
        })
        return
      }

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

  const onConfirmRead = () => {
    isRead.value = true
    console.log('🚀 ~ onConfirmRead ~ isRead:', isRead.value)
  }

  const ensureAgreementConfirmed = () => {
    if (isRead.value) {
      return true
    }
    readDialogRef.value?.open()
    return false
  }

  const mobileNumber = ref()
  // const mobileNumberError = ref(true)
  const password = ref()
  const confirmPassword = ref()
  const inputMobile = (val: string) => {
    mobileNumber.value = val
  }
  const inputPassword = (val: string) => {
    password.value = val
  }
  const inputConfirmPassword = (val: string) => {
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

  const getWechatLoginCode = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => {
          if (res.code) {
            resolve(res.code)
            return
          }
          reject(new Error('未获取到微信登录凭证'))
        },
        fail: (error) => {
          reject(error)
        },
      })
    })
  }

  const wechatQuickLogin = async () => {
    if (!ensureAgreementConfirmed()) {
      return
    }

    if (wechatLoginLoading.value) {
      return
    }

    try {
      wechatLoginLoading.value = true
      uni.showLoading({
        title: '微信登录中...',
        mask: true,
      })

      const code = await getWechatLoginCode()
      const payload: postAuthWechatLoginBody = {
        code,
        source: 'mp',
      }
      const res: postAuthWechatLoginRes = await postAuthWechatLogin(payload)

      if (!res?.tokens?.access?.token || !res?.user) {
        throw new Error('登录结果不完整，请稍后重试')
      }

      await loginSuccess(res)
    } catch (error: any) {
      console.warn('🚀 ~ wechatQuickLogin ~ error:', error)

      let errorMessage = '微信登录失败，请稍后重试'
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      uni.showToast({
        title: errorMessage,
        icon: 'none',
      })
    } finally {
      wechatLoginLoading.value = false
      uni.hideLoading()
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

  const handleLoginPasswordConfirm = () => {
    mobileLogin()
  }

  const handleRegisterPasswordConfirm = () => {
    userRegister()
  }
</script>

<template>
  <view class="login">
    <uni-nav-bar
      @clickLeft="onBack"
      left-icon="left"
      backgroundColor="transparent"
      title=""
      statusBar
      :border="false" />
    <view class="login-body">
      <LoginHeaderText />
      <view class="auth-card">
        <view class="auth-card__content">
          <view v-if="!isMpWeixin || authMode === 'account'" class="auth-tabs">
            <view
              class="auth-tab"
              :class="{ active: loginType === 'mobile' }"
              @click="changeLoginType('mobile')">
              登录
            </view>
            <view
              class="auth-tab"
              :class="{ active: loginType === 'register' }"
              @click="changeLoginType('register')">
              注册
            </view>
          </view>

          <!-- #ifdef MP-WEIXIN -->
          <view v-if="authMode === 'wechat'" class="wechat-auth">
            <button class="btn btn-wechat wechat-auth__btn" :loading="wechatLoginLoading" @click="wechatQuickLogin">
              微信快捷登录
            </button>
            <view class="wechat-auth__footer">
              <text class="wechat-auth__switch" @click="switchAuthMode('account')">使用账号密码登录</text>
            </view>
          </view>
          <!-- #endif -->

          <!-- 登录界面 -->
          <view v-if="(!isMpWeixin || authMode === 'account') && loginType === 'mobile'" class="mobile">
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
                confirm-type="done"
                @input="inputPassword"
                @confirm="handleLoginPasswordConfirm">
              </uni-easyinput>
            </view>
            <view class="change-register" @click="changeLoginType('register')">没有账号，前往注册</view>
            <view class="login-btns">
              <button class="btn btn-login" @click="mobileLogin">登录</button>
            </view>

            <!-- #ifdef MP-WEIXIN -->
            <view class="quick-login quick-login--switch-only">
              <text class="quick-login-link" @click="switchAuthMode('wechat')">使用微信快捷登录</text>
            </view>
            <!-- #endif -->
          </view>

          <!-- 注册界面 -->
          <view v-else-if="(!isMpWeixin || authMode === 'account') && loginType === 'register'" class="mobile">
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
                confirm-type="done"
                @input="inputConfirmPassword"
                @confirm="handleRegisterPasswordConfirm">
              </uni-easyinput>
            </view>
            <view class="change-login" @click="changeLoginType('mobile')">已有账号，前往登录</view>
            <view class="login-btns">
              <button class="btn btn-register" @click="userRegister">注册</button>
            </view>

            <!-- #ifdef MP-WEIXIN -->
            <view class="quick-login quick-login--switch-only quick-login--register">
              <text class="quick-login-link" @click="switchAuthMode('wechat')">使用微信快捷登录</text>
            </view>
            <!-- #endif -->
          </view>
        </view>

      </view>
    </view>
    <view class="login-footer">
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
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<style lang="scss" scoped>
  .login {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background: linear-gradient(180deg, #d5dfff 0.06%, #eff3ff 26%, #fff 49%, #fff 100%);
    padding-bottom: env(safe-area-inset-bottom);

    .btn {
      border-radius: 24rpx;
      font-size: 32rpx;
      font-weight: 600;
      height: 96rpx;
      line-height: 96rpx;
      &::after {
        display: none;
      }
    }

    .login-body {
      flex: 1;
      padding: 0 28rpx 40rpx;
      box-sizing: border-box;
    }

    .auth-card {
      display: flex;
      flex-direction: column;
      margin-top: 20rpx;
      padding: 24rpx 24rpx 32rpx;
      // border-radius: 32rpx;
      // background: rgba(255, 255, 255, 0.94);
      // box-shadow: 0 20rpx 48rpx rgba(34, 60, 120, 0.12);
      // backdrop-filter: blur(12rpx);
    }

    .auth-card__content {
      flex: 1;
    }

    .auth-tabs {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12rpx;
      padding: 8rpx;
      margin-bottom: 28rpx;
      border-radius: 999rpx;
      background: #eef3ff;
    }

    .auth-tab {
      height: 72rpx;
      line-height: 72rpx;
      text-align: center;
      border-radius: 999rpx;
      color: $ga-gray-7;
      font-size: 28rpx;
      font-weight: 600;
    }

    .auth-tab.active {
      background: #fff;
      color: $ga-brand-4;
      box-shadow: 0 8rpx 20rpx rgba(0, 70, 180, 0.12);
    }

    .mobile {
      padding: 0;
      .mobile-input {
        border: none;
        border-radius: 0;
      }

      :deep(.uni-input-input) {
        caret-color: #0046b4;
      }

      :deep(.uni-easyinput) {
        width: 100%;
      }

      :deep(.uni-easyinput__content) {
        min-height: 96rpx;
        border-radius: 24rpx;
        background: transparent !important;
      }

      :deep(.uni-easyinput__content-input) {
        height: 96rpx;
        font-size: 30rpx;
      }

      .mobile-number {
        display: flex;
        align-items: center;
        min-height: 96rpx;
        margin-bottom: 24rpx;
        padding: 0 24rpx;
        border: 2rpx solid rgba(0, 70, 180, 0.08);
        border-radius: 24rpx;
        background: #f7f9ff;
        font-size: 28rpx;
      }

      .mobile-password {
        min-height: 96rpx;
        margin-bottom: 24rpx;
        padding: 0 24rpx;
        border: 2rpx solid rgba(0, 70, 180, 0.08);
        border-radius: 24rpx;
        background: #f7f9ff;
        font-size: 28rpx;
      }

      .mobile-confirm-password {
        min-height: 96rpx;
        padding: 0 24rpx;
        border: 2rpx solid rgba(0, 70, 180, 0.08);
        border-radius: 24rpx;
        background: #f7f9ff;
        font-size: 28rpx;
      }

      .change-register,
      .change-login {
        margin: 24rpx 0 32rpx;
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
          box-shadow: 0 16rpx 30rpx rgba(0, 70, 180, 0.18);
        }
      }

      .quick-login {
        margin-top: 28rpx;
        padding-top: 8rpx;

        &--register {
          margin-top: 32rpx;
        }

        &--switch-only {
          padding-top: 0;
          text-align: center;
        }
      }

      .quick-login-divider {
        position: relative;
        margin-bottom: 24rpx;
        text-align: center;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 2rpx;
          background: rgba(0, 70, 180, 0.08);
          transform: translateY(-50%);
        }
      }

      .quick-login-divider__text {
        position: relative;
        z-index: 1;
        display: inline-block;
        padding: 0 20rpx;
        color: $ga-gray-6;
        font-size: 24rpx;
        background: rgba(255, 255, 255, 0.94);
      }

      .btn-wechat {
        background: linear-gradient(135deg, #18b566 0%, #39c97b 100%);
        color: #fff;
        box-shadow: 0 16rpx 30rpx rgba(24, 181, 102, 0.18);
      }

      .quick-login-tip {
        display: block;
        margin-top: 16rpx;
        color: $ga-gray-6;
        font-size: 24rpx;
        line-height: 1.6;
        text-align: center;
      }

      .quick-login-link {
        color: $ga-brand-4;
        font-size: 26rpx;
        font-weight: 500;
      }
    }

    .wechat-auth {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: center;
      padding: 16rpx 8rpx 8rpx;
      text-align: center;
    }

    .wechat-auth__btn {
      margin-top: 120rpx;
      background: linear-gradient(135deg, #18b566 0%, #39c97b 100%);
      color: #fff;
      box-shadow: 0 16rpx 30rpx rgba(24, 181, 102, 0.18);
      width: 100%;
    }

    .wechat-auth__footer {
      margin-top: 28rpx;
    }

    .wechat-auth__switch {
      color: $ga-brand-4;
      font-size: 26rpx;
      font-weight: 500;
    }

  }

  .login-footer {
    padding: 24rpx 28rpx calc(env(safe-area-inset-bottom) + 24rpx);
    box-sizing: border-box;
  }

  .read-protocol {
    font-size: 24rpx;
    color: $ga-gray-6;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    row-gap: 8rpx;
    column-gap: 4rpx;

    .radio {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: nowrap;
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
