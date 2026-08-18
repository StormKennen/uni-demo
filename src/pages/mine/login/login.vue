<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import LoginHeaderText from '../components/login-header-text.vue'
  import ReadDialog from '../components/read-dialog.vue'
  import { postAuthLogin, postAuthRegister, postAuthWechatLogin } from '@/services/apifox/NODEJSDEMO/AUTH/apifox'
  import type { postAuthWechatLoginBody, postAuthWechatLoginRes } from '@/services/apifox/NODEJSDEMO/AUTH/interface'
  import {
    setIsGoChatCoze,
    setToken,
    setRefreshToken,
    setWxUserInfo,
    setUserInfo,
    setTokenExpiresAt,
    setRefreshTokenExpiresAt,
  } from '@/utils/storage'
  import { PrivacyPageUrl, ProtocolPageUrl, TabsRoutes } from '@/utils/const'
  import { autoLogin } from '@/utils/autoLogin'
  import { safeBack } from '@/utils/navigation'
  import http from '@/services/http'
  import { postMemosGuestMigrate } from '@/services/apifox/NODEJSDEMO/MEMOS/apifox'
  import { clearGuestToken, getGuestToken } from '@/utils/guest-session'

  type LoginType = 'mobile' | 'register'
  type AuthMode = 'wechat' | 'account'
  const isRead = ref(false)
  const readDialogRef = ref<any>(null)
  const loginType = ref<LoginType>('mobile')
  const authMode = ref<AuthMode>('account')
  const redirectUrl = ref('')
  const wechatLoginLoading = ref(false)
  const registerErrorMessage = ref('')
  const isMpWeixin = ref(false)
  const pendingAgreementAction = ref<'' | 'wechat'>('')

  // #ifdef MP-WEIXIN
  isMpWeixin.value = true
  authMode.value = 'wechat'
  // #endif

  const changeLoginType = (type: LoginType) => {
    loginType.value = type
    registerErrorMessage.value = ''
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

      // 登录页进入时尽早准备游客身份；失败不阻塞正式登录或自动登录。
      await http.prewarmGuestSession().catch(error => {
        console.warn('[memo-guest] 登录页预热失败:', error)
      })

      // 设置超时保护，避免一直loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auto login timeout')), 5000)
      })

      const autoLoginPromise = autoLogin()

      const { isLoggedIn, user } = (await Promise.race([autoLoginPromise, timeoutPromise])) as any

      uni.hideLoading()

      if (isLoggedIn && user) {
        console.log('🚀 ~ checkAutoLogin ~ 自动登录成功:', user)
        await migrateGuestMemoRelations()

        if (redirectUrl.value) {
          const targetUrl = decodeURIComponent(redirectUrl.value)
          const url = { url: targetUrl }
          console.log('Auto login redirect url:', url)
          if (TabsRoutes.includes(targetUrl)) {
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

  const migrateGuestMemoRelations = async (): Promise<void> => {
    const guestToken = getGuestToken()
    if (!guestToken) return

    try {
      await postMemosGuestMigrate()
      // 仅清理本次迁移使用的会话，避免并发流程覆盖更新后的 Guest Token。
      if (getGuestToken() === guestToken) {
        clearGuestToken()
      }
    } catch (error) {
      console.warn('[memo-guest] Guest 关系迁移失败，保留 Guest Token:', error)
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
        const expires = Date.now() + data.tokens.access.expiresIn * 1000
        setTokenExpiresAt(expires)
      }

      if (data.tokens.refresh.expires) {
        // 后端返回的是 ISO 日期字符串，需要转换为时间戳
        const expiresMs = new Date(data.tokens.refresh.expires).getTime()
        setRefreshTokenExpiresAt(expiresMs)
      } else if (data.tokens.refresh.expiresIn) {
        // 如果返回的是相对时间（秒），转换为绝对时间
        const expires = Date.now() + data.tokens.refresh.expiresIn * 1000
        setRefreshTokenExpiresAt(expires)
      }
    }

    // 处理用户信息
    if (data.user) {
      setUserInfo(data.user)
      setWxUserInfo(data.user) // 保持兼容性
    }

    await migrateGuestMemoRelations()

    uni.showToast({
      title: '登录成功',
      icon: 'success',
    })

    setTimeout(() => {
      if (redirectUrl.value) {
        const targetUrl = decodeURIComponent(redirectUrl.value)
        if (TabsRoutes.includes(targetUrl)) {
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
        url: '/pages/index/index',
      })
      // #endif

      // #ifdef H5
      uni.redirectTo({
        url: '/pages/index/index',
      })
      // #endif
    }, 1000)
  }

  const onConfirmRead = () => {
    isRead.value = true
    const action = pendingAgreementAction.value
    pendingAgreementAction.value = ''
    console.log('🚀 ~ onConfirmRead ~ isRead:', isRead.value)
    if (action === 'wechat') {
      wechatQuickLogin()
    }
  }

  const onCancelRead = () => {
    pendingAgreementAction.value = ''
  }

  const ensureAgreementConfirmed = (action: '' | 'wechat' = '') => {
    if (isRead.value) {
      return true
    }
    pendingAgreementAction.value = action
    readDialogRef.value?.open()
    return false
  }

  const mobileNumber = ref('')
  // const mobileNumberError = ref(true)
  const password = ref('')
  const confirmPassword = ref('')
  const passwordMismatch = computed(() => {
    return Boolean(password.value && confirmPassword.value) && password.value !== confirmPassword.value
  })
  interface ErrorRecord {
    code?: number | string
    message?: string
    msg?: string
    data?: {
      message?: string
      msg?: string
      errors?: string[]
    }
    error?: {
      message?: string
    }
  }

  const readErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === 'string' && error.trim()) return error.trim()
    if (!error || typeof error !== 'object') return fallback
    const detail = error as ErrorRecord
    const candidates = [
      detail.message,
      detail.msg,
      detail.data?.message,
      detail.data?.msg,
      detail.error?.message,
      ...(detail.data?.errors || []),
    ]
    return candidates.find(item => typeof item === 'string' && item.trim())?.trim() || fallback
  }
  const inputMobile = (val: string) => {
    mobileNumber.value = val
    registerErrorMessage.value = ''
  }
  const inputPassword = (val: string) => {
    password.value = val
    registerErrorMessage.value = ''
  }
  const inputConfirmPassword = (val: string) => {
    confirmPassword.value = val
    registerErrorMessage.value = ''
  }

  /** 手机号登录 */
  const mobileLogin = async () => {
    if (!isRead.value) {
      pendingAgreementAction.value = ''
      readDialogRef.value?.open()
      return
    }

    if (!mobileNumber.value || !password.value) {
      uni.showToast({
        title: '请输入手机号和密码！',
        icon: 'none',
      })
      return
    }
    try {
      uni.showLoading()

      const loginParams = {
        phone: mobileNumber.value,
        password: password.value,
      }
      console.log('🚀 ~ mobileLogin ~ loginParams:', loginParams)
      await http.prewarmGuestSession().catch(error => {
        console.warn('[memo-guest] 手机号登录前预热失败:', error)
      })
      const res = await postAuthLogin(loginParams as unknown as Parameters<typeof postAuthLogin>[0])
      console.log('🚀 ~ mobileLogin ~ res:', res)
      await loginSuccess(res)
      uni.hideLoading()
    } catch (error: unknown) {
      console.warn('🚀 ~ mobileLogin ~ error:', error)
      uni.hideLoading()

      const errorMessage = readErrorMessage(error, '登录失败，请稍后重试')

      uni.showToast({
        title: errorMessage,
        icon: 'none',
      })
    }
  }

  const getWechatLoginCode = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      let settled = false
      const timeout = setTimeout(() => {
        settled = true
        reject(new Error('获取微信登录凭证超时，请检查网络或重启微信'))
      }, 10000)

      const resolveOnce = (code: string) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        resolve(code)
      }

      const rejectOnce = (error: unknown) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        reject(new Error(readErrorMessage(error, '获取微信登录凭证失败')))
      }

      uni.login({
        provider: 'weixin',
        success: res => {
          if (res.code) {
            resolveOnce(res.code)
            return
          }
          rejectOnce(new Error('微信未返回登录凭证，请重试'))
        },
        fail: error => {
          rejectOnce(error)
        },
      })
    })
  }

  const logWechatStage = (message: string) => {
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.info(`[wechat-login] ${message}`)
    }
  }

  const wechatQuickLogin = async () => {
    if (!ensureAgreementConfirmed('wechat')) {
      return
    }

    if (wechatLoginLoading.value) {
      return
    }

    try {
      wechatLoginLoading.value = true
      logWechatStage('开始获取凭证')
      uni.showLoading({
        title: '微信登录中...',
        mask: true,
      })

      // 先完成游客会话预热，再单独获取正式微信登录 code，避免复用临时 code。
      await http.prewarmGuestSession().catch(error => {
        console.warn('[memo-guest] 微信登录前预热失败:', error)
      })
      const code = await getWechatLoginCode()
      logWechatStage('凭证获取成功')
      const payload: postAuthWechatLoginBody = {
        code,
        source: 'mp',
      }
      logWechatStage('开始请求后端')
      const res: postAuthWechatLoginRes = await postAuthWechatLogin(payload, { timeout: 15000 })
      logWechatStage('后端响应成功')

      if (!res?.tokens?.access?.token || !res?.user) {
        throw new Error('登录结果不完整，请稍后重试')
      }

      uni.hideLoading()
      await loginSuccess(res)
      logWechatStage('用户状态保存成功')
    } catch (error: unknown) {
      console.warn('🚀 ~ wechatQuickLogin ~ error:', error)

      const errorMessage = readErrorMessage(error, '微信登录失败，请稍后重试')
      uni.hideLoading()
      setTimeout(() => {
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000,
        })
      }, 100)
    } finally {
      wechatLoginLoading.value = false
    }
  }

  /** 用户注册 */
  const userRegister = async () => {
    registerErrorMessage.value = ''
    if (!mobileNumber.value || !password.value || !confirmPassword.value) {
      uni.showToast({
        title: '请填写完整信息！',
        icon: 'none',
      })
      return
    }
    if (passwordMismatch.value) {
      uni.showToast({
        title: '两次密码输入不一致！',
        icon: 'none',
      })
      return
    }
    if (!isRead.value) {
      pendingAgreementAction.value = ''
      readDialogRef.value?.open()
      return
    }
    try {
      uni.showLoading()

      await http.prewarmGuestSession().catch(error => {
        console.warn('[memo-guest] 注册前预热失败:', error)
      })

      // 使用标准注册API
      const registerParams = {
        phone: mobileNumber.value,
        name: '用户',
        password: password.value,
      }

      // 当前生成类型仍将 email 标记为必填，但后端手机号注册实际只接受 phone/name/password。
      const registerRes = await postAuthRegister(registerParams as unknown as Parameters<typeof postAuthRegister>[0])
      console.log('🚀 ~ userRegister ~ registerRes:', registerRes)

      // 注册成功后，调用登录API获取完整的用户信息和token
      const loginParams = {
        phone: mobileNumber.value,
        password: password.value,
      }

      const loginRes = await postAuthLogin(loginParams as unknown as Parameters<typeof postAuthLogin>[0])
      await loginSuccess(loginRes)
      uni.hideLoading()
    } catch (error: unknown) {
      console.warn('🚀 ~ userRegister ~ error:', error)
      uni.hideLoading()

      const errorMessage = readErrorMessage(error, '注册失败，请稍后重试')
      registerErrorMessage.value = errorMessage

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
  const onBack = () => {
    safeBack()
  }

  const handleLoginPasswordConfirm = () => {
    mobileLogin()
  }

  const handleRegisterPasswordConfirm = () => {
    userRegister()
  }
</script>

<template>
  <PageLayout title="登录" :show-nav="false">
    <view class="login">
      <uni-nav-bar @clickLeft="onBack" left-icon="left" backgroundColor="transparent" title="" statusBar :border="false" />
      <view class="login-body">
        <LoginHeaderText />
        <view class="auth-card">
          <view class="auth-card__content">
            <view v-if="!isMpWeixin || authMode === 'account'" class="auth-tabs">
              <view class="auth-tab" :class="{ active: loginType === 'mobile' }" @click="changeLoginType('mobile')"> 登录 </view>
              <view class="auth-tab" :class="{ active: loginType === 'register' }" @click="changeLoginType('register')"> 注册 </view>
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
                  placeholder="请输入11位手机号，例如：13800138000"
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
                  placeholder="请输入11位手机号，例如：13800138000"
                  @input="inputMobile"></uni-easyinput>
              </view>
              <view class="mobile-password">
                <uni-easyinput
                  :clearable="false"
                  type="password"
                  :inputBorder="false"
                  :styles="inputStyles"
                  v-model="password"
                  placeholder="密码至少8位，需包含字母和数字"
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
                  placeholder="请再次输入密码"
                  confirm-type="done"
                  @input="inputConfirmPassword"
                  @confirm="handleRegisterPasswordConfirm">
                </uni-easyinput>
              </view>
              <text v-if="passwordMismatch" class="auth-error">两次密码输入不一致！</text>
              <text v-else-if="registerErrorMessage" class="auth-error">{{ registerErrorMessage }}</text>
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
          <text @click="onPrivacy" class="protocol">《隐私政策》</text>和<text class="protocol" @click="onProtocol">《用户服务协议》</text>
        </view>
      </view>
      <view class="">
        <ReadDialog ref="readDialogRef" :confirm="onConfirmRead" :cancel="onCancelRead" />
      </view>
    </view>
  </PageLayout>
</template>

<style lang="scss" scoped>
  .login {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background: var(--theme-bg);
    padding-bottom: env(safe-area-inset-bottom);

    .btn {
      border-radius: 24rpx;
      font-size: 32rpx;
      font-weight: 600;
      height: 88rpx;
      line-height: 88rpx;
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
      border-radius: 24rpx;
      background: var(--theme-surface);
      border: 1rpx solid var(--theme-border);
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
      background: var(--theme-surface-2);
      border: 1rpx solid var(--theme-border);
    }

    .auth-tab {
      height: 72rpx;
      line-height: 72rpx;
      text-align: center;
      border-radius: 999rpx;
      color: var(--theme-text-secondary);
      font-size: 28rpx;
      font-weight: 600;
    }

    .auth-tab.active {
      background: var(--theme-surface);
      color: var(--theme-brand);
      box-shadow: none;
    }

    .mobile {
      padding: 0;
      .mobile-input {
        border: none;
        border-radius: 0;
      }

      :deep(.uni-input-input) {
        color: var(--theme-text);
        caret-color: var(--theme-brand);
      }

      :deep(.uni-easyinput) {
        width: 100%;
      }

      :deep(.uni-easyinput__content) {
        min-height: 96rpx;
        border-radius: 24rpx;
        background: transparent !important;
        color: var(--theme-text);
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
        border: 1rpx solid var(--theme-border);
        border-radius: 24rpx;
        background: var(--theme-surface-2);
        font-size: 28rpx;
      }

      .mobile-password {
        min-height: 96rpx;
        margin-bottom: 24rpx;
        padding: 0 24rpx;
        border: 1rpx solid var(--theme-border);
        border-radius: 24rpx;
        background: var(--theme-surface-2);
        font-size: 28rpx;
      }

      .mobile-confirm-password {
        min-height: 96rpx;
        padding: 0 24rpx;
        border: 1rpx solid var(--theme-border);
        border-radius: 24rpx;
        background: var(--theme-surface-2);
        font-size: 28rpx;
      }

      .change-register,
      .change-login {
        margin: 24rpx 0 32rpx;
        color: var(--theme-brand);
        font-size: 26rpx;
        text-align: center;
        cursor: pointer;
      }

      .auth-error {
        display: block;
        margin: 18rpx 4rpx -8rpx;
        color: #d14343;
        font-size: 24rpx;
        line-height: 1.5;
      }

      .login-btns {
        .btn-login,
        .btn-register {
          background: var(--theme-brand);
          color: #fff;
          box-shadow: none;
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
          background: var(--theme-border);
          transform: translateY(-50%);
        }
      }

      .quick-login-divider__text {
        position: relative;
        z-index: 1;
        display: inline-block;
        padding: 0 20rpx;
        color: var(--theme-text-tertiary);
        font-size: 24rpx;
        background: var(--theme-surface);
      }

      .btn-wechat {
        background: var(--theme-brand);
        color: #fff;
        box-shadow: none;
      }

      .quick-login-tip {
        display: block;
        margin-top: 16rpx;
        color: var(--theme-text-tertiary);
        font-size: 24rpx;
        line-height: 1.6;
        text-align: center;
      }

      .quick-login-link {
        color: var(--theme-brand);
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
      margin-top: 24rpx;
      background: var(--theme-brand);
      color: #fff;
      box-shadow: none;
      width: 100%;
    }

    .wechat-auth__footer {
      margin-top: 28rpx;
    }

    .wechat-auth__switch {
      color: var(--theme-brand);
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
    color: var(--theme-text-secondary);
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
      color: var(--theme-brand);
    }
  }
</style>
