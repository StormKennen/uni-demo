// request.js

// lodash 合并函数，也可以自己实现
import { getToken, getWxUserInfo, clearLoginData } from '@/utils/storage'
import { refreshAccessToken } from '@/utils/autoLogin'
import { merge } from 'lodash-es'
import type { Options, ParticalUniAppRequestOptions } from './interface'
import { getAppTokenFromQuery } from '@/utilsH5/env'
import { getAppOsByPlatform, getYhIdByPlatform } from '@/utils/env'
import { getCookie } from '@/utilsH5/cookie'
import { getAnonymousId } from '@/utils/anonymous-id'
import {
  clearGuestToken,
  ensureGuestSession,
  getGuestToken,
  isGuestTokenValid,
  refreshGuestSession,
  type GuestSessionResponse,
} from '@/utils/guest-session'

type RequestIdentity = 'normal' | 'guest' | 'auth-transition' | 'guest-migration'

type Methods = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'

interface InternalRequestConfig extends ParticalUniAppRequestOptions {
  _guestRetryAfterRefresh?: number
  _guestToken?: string
  _isAuthRequest?: boolean
  _isGuestMigration?: boolean
  _skipGuestSession?: boolean
  _usedGuestToken?: boolean
}

enum RES_CODE {
  Success = 200,
  InvalidToken = 20003,
  Unauthorized = 401,
}

const getTokenByPlatform = () => {
  let token = ''
  // #ifdef WEB
  // H5环境：优先从storage获取登录token，如果没有再从URL query获取
  token = getToken() || getAppTokenFromQuery() || ''
  // #endif
  // #ifndef WEB
  token = getToken() || ''
  // #endif
  return token
}

// 默认配置
const DEFAULT_CONFIG: Options = {
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  url: '',
  data: {},
  header: {
    app_platform: 'h5',
    CreateSource: 3, // 2 APP; 3 小程序
    Token: getTokenByPlatform(),
    Userid: getYhIdByPlatform(),
    'App-Os': getAppOsByPlatform(),
    'App-Version': getCookie('App_Version'),
  },
  method: 'GET',
  timeout: 150000,
  dataType: 'json',
  responseType: 'text',
  sslVerify: true,
  withCredentials: false,
  firstIpv4: false,
}

export class Request {
  config: Options
  // 防止重复刷新与无限重试
  private refreshInFlight: Promise<any> | null = null
  private maxRetryAfterRefresh = 1
  // 防止重复弹出登录弹窗
  private isShowingLoginDialog = false
  constructor(options = {}) {
    // 合并用户自定义配置
    this.config = merge({}, DEFAULT_CONFIG, options)
    const token = getTokenByPlatform()
    this.config.header.Token = token

    // 设置Authorization header（新API标准）
    if (token) {
      this.config.header.Authorization = `Bearer ${token}`
    }
  }
  // 请求拦截 主要是合并url，合并接口特定配置，可以根据自己情况进行扩展
  requestInterceptor(url: string, data: object, config: InternalRequestConfig, method: Methods, guestToken = '') {
    const { baseURL } = this.config
    // 拼接Url
    url = config.baseURL ? config.baseURL + url : baseURL + url

    // 深拷贝 header 避免引用问题
    const _config = {
      ...this.config,
      ...config,
      header: {
        ...this.config.header,
        ...(config.header || {}),
      },
    }

    // 更新Token字段（兼容旧API）
    const token = getTokenByPlatform()
    _config.header.Token = token

    // 更新Authorization header（新API标准）
    if (token) {
      _config.header.Authorization = `Bearer ${token}`
    } else {
      delete _config.header.Authorization
    }

    _config.header['X-Anonymous-Id'] = getAnonymousId()
    const identity = this.getRequestIdentity(url)
    const shouldSendGuestToken = Boolean(
      guestToken && (identity === 'guest' || identity === 'auth-transition' || identity === 'guest-migration'),
    )
    if (shouldSendGuestToken) {
      _config.header['X-Guest-Token'] = guestToken
    } else {
      delete _config.header['X-Guest-Token']
    }

    if (!this.config.header.Userid) {
      _config.header.Userid = getYhIdByPlatform()
    }
    const configs = {
      ..._config,
      url,
      data,
      method,
      // 添加标记，用于在响应拦截器中识别登录相关接口
      _isAuthRequest: this.isAuthRequest(url),
      _isGuestMigration: identity === 'guest-migration',
      _usedGuestToken: Boolean(identity === 'guest' && guestToken),
      _guestToken: shouldSendGuestToken ? guestToken : '',
    }
    // 返回组装的配置
    return configs
  }

  private getRequestIdentity(url: string): RequestIdentity {
    if (url.includes('/memos/guest/migrate')) return 'guest-migration'
    if (url.includes('/auth/guest-session')) return 'guest'
    if (['/auth/login', '/auth/register', '/auth/wechat-login'].some(endpoint => url.includes(endpoint))) {
      return 'auth-transition'
    }
    if (['/auth/refresh-tokens', '/auth/forgot-password', '/auth/reset-password'].some(endpoint => url.includes(endpoint))) {
      return 'normal'
    }
    if (url.includes('/auth/')) return 'normal'
    return 'guest'
  }

  // 认证接口不自动触发 Guest Session，也不触发正式登录弹窗。
  private isAuthRequest(url: string): boolean {
    return this.getRequestIdentity(url) === 'auth-transition' || url.includes('/auth/guest-session')
  }

  private async createGuestSession(code: string): Promise<GuestSessionResponse> {
    return this.request('/auth/guest-session', { code }, { _skipGuestSession: true }, 'POST') as Promise<GuestSessionResponse>
  }

  async prewarmGuestSession(): Promise<void> {
    if (getTokenByPlatform()) {
      return
    }

    // #ifdef MP-WEIXIN
    await ensureGuestSession(code => this.createGuestSession(code))
    // #endif
  }

  private async prepareGuestToken(url: string, config: InternalRequestConfig): Promise<string> {
    if (config._skipGuestSession) {
      return ''
    }

    const identity = this.getRequestIdentity(url)
    if (identity === 'auth-transition' || identity === 'guest-migration') {
      return isGuestTokenValid() ? getGuestToken() : ''
    }
    if (getTokenByPlatform()) return ''

    let guestToken = ''
    // #ifdef MP-WEIXIN
    guestToken = await ensureGuestSession(code => this.createGuestSession(code))
    // #endif
    return guestToken
  }

  private async handleGuestSessionRefreshAndRetry(
    originalUrl: string,
    originalData: any,
    originalConfig: InternalRequestConfig,
    originalMethod: Methods,
  ): Promise<any> {
    const currentRetry = originalConfig._guestRetryAfterRefresh || 0
    if (currentRetry >= 1) {
      clearGuestToken()
      return Promise.reject({ code: 401, message: '游客会话无效或已过期' })
    }

    try {
      await refreshGuestSession(code => this.createGuestSession(code), originalConfig._guestToken)
      return this.request(
        originalUrl,
        originalData,
        {
          ...originalConfig,
          _guestRetryAfterRefresh: currentRetry + 1,
        },
        originalMethod,
      )
    } catch (error) {
      return Promise.reject({ code: 401, message: '游客会话恢复失败', error })
    }
  }

  /**
   * 静默刷新token并重试请求
   */
  private async handleTokenRefreshAndRetry(
    originalUrl: string,
    originalData: any,
    originalConfig: ParticalUniAppRequestOptions,
    originalMethod: Methods,
  ): Promise<any> {
    // 防止无限重试：每个请求最多重试一次
    const currentRetry = (originalConfig as any)?._retryAfterRefresh || 0
    if (currentRetry >= this.maxRetryAfterRefresh) {
      console.log('已达到最大重试次数，停止自动登录重试')
      await this.showLoginDialog()
      return Promise.reject({ code: 401, message: '登录已过期，请重新登录' })
    }

    try {
      console.log('尝试静默刷新token...')
      // 刷新操作去重：有刷新进行中则复用同一个Promise
      if (!this.refreshInFlight) {
        this.refreshInFlight = refreshAccessToken().finally(() => {
          this.refreshInFlight = null
        })
      }
      const refreshResult = await this.refreshInFlight

      if (refreshResult?.success) {
        console.log('Token刷新成功，重试原请求')
        // 更新请求头中的token和Authorization
        const newConfig: any = { ...originalConfig }
        newConfig._retryAfterRefresh = currentRetry + 1
        if (newConfig.header) {
          newConfig.header.Token = getToken()
          if (this.config.header.Authorization) {
            newConfig.header.Authorization = this.config.header.Authorization
          }
        }
        // 重试原请求（仅一次）
        return this.request(originalUrl, originalData, newConfig, originalMethod)
      } else {
        console.log('Token刷新失败，提示登录')
        await this.showLoginDialog()
        return Promise.reject({ code: 401, message: '登录已过期' })
      }
    } catch (error) {
      console.log('静默刷新token失败:', error)
      await this.showLoginDialog()
      return Promise.reject({ code: 401, message: '登录已过期' })
    }
  }

  /**
   * 显示友好的登录提示对话框（防止重复弹窗）
   */
  private showLoginDialog(): Promise<boolean> {
    // 如果已经在显示登录弹窗，直接返回
    if (this.isShowingLoginDialog) {
      return Promise.resolve(false)
    }

    // 如果当前页面已经是登录页，不再弹窗（防止密码错误时重复提示）
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage?.route?.includes('login')) {
      return Promise.resolve(false)
    }

    this.isShowingLoginDialog = true

    return new Promise(resolve => {
      uni.showModal({
        title: '登录状态已过期',
        content: '为了继续使用，请重新登录',
        confirmText: '去登录',
        cancelText: '稍后再说',
        success: res => {
          this.isShowingLoginDialog = false
          if (res.confirm) {
            // 获取当前页面路径作为重定向URL
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            const redirectUrl = currentPage ? `/${currentPage.route}` : ''

            uni.navigateTo({
              url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(redirectUrl)}`,
            })
            resolve(true)
          } else {
            resolve(false)
          }
        },
        fail: () => {
          this.isShowingLoginDialog = false
          resolve(false)
        },
      })
    })
  }

  // 响应拦截，这里只是做了示例，可以根据自己情况进行扩展
  async responseInterceptor(res: any, requestConfig?: InternalRequestConfig & { url?: string; data?: any; method?: Methods }) {
    const { data: _data, statusCode } = res
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.log('[http] response', { url: requestConfig?.url, statusCode })
    }

    if (statusCode === 429) {
      const message = _data?.message || '请求过于频繁，请稍后再试'
      const retryAfter = res.header?.['Retry-After'] || res.header?.['retry-after']
      this.handleError('请求过于频繁，请稍后再试')
      return Promise.reject({ code: 429, message, retryAfter, data: _data })
    }

    if (statusCode === 404 && requestConfig?.url === '/auth/guest-session') {
      return Promise.reject({ code: 404, statusCode, message: _data?.message || 'Guest Session 尚未部署', data: _data })
    }

    // 处理HTTP状态码401 - 未授权
    if (statusCode === RES_CODE.Unauthorized) {
      // 如果是认证相关接口的401错误，不自动跳转登录页，让调用方处理
      if (requestConfig?._isAuthRequest || requestConfig?._isGuestMigration) {
        console.log('认证接口返回401，不自动跳转，由调用方处理')
        return Promise.reject({
          code: 401,
          message: _data?.message || _data?.msg || '认证失败',
          data: _data,
        })
      }

      if (requestConfig?._usedGuestToken) {
        return this.handleGuestSessionRefreshAndRetry(
          requestConfig.url || '',
          requestConfig.data,
          requestConfig,
          requestConfig.method || 'GET',
        )
      }

      // 非认证接口的401错误 - 尝试自动刷新token并重试
      console.log('非认证接口401错误，尝试刷新token')
      return this.handleTokenRefreshAndRetry(
        requestConfig?.url || '',
        requestConfig?.data,
        requestConfig || {},
        requestConfig?.method || 'GET',
      )
    }

    const { code, msg, message, data } = _data || {}

    // 处理业务层面的token失效 - 尝试静默刷新token
    if (code === RES_CODE.InvalidToken) {
      console.log('业务层面Token失效，禁用自动登录，直接提示登录')
      await this.showLoginDialog()
      return Promise.reject({
        code: RES_CODE.InvalidToken,
        message: 'Token失效',
        data: _data,
      })
    }

    if (code !== RES_CODE.Success) {
      const errorMessage = message || msg || data?.message || data?.msg || '请求失败，请稍后重试'
      return Promise.reject({
        code: code ?? statusCode,
        statusCode,
        message: errorMessage,
        data: _data,
      })
    }
    return data
  }
  // 请求方法，做了Promise封装，返回Promise
  /**
   * @param {String} url 接口
   * @param {Object} data 参数
   * @param {Object} config 某个接口自定义配置
   * @param {String} method 请求方法，只实现post和get，这么做了原因是 只有这两个没有兼容问题
   * @returns
   */
  async request(url: string, data: any, config: InternalRequestConfig, method: Methods) {
    // 显示loading
    // uni.showLoading();
    const guestToken = await this.prepareGuestToken(url, config)
    // 请求拦截，返回处理过的结果配置
    const _config = this.requestInterceptor(url, data, config, method, guestToken)

    // 保存原始请求参数，用于重试
    const requestParams = {
      url,
      data,
      method,
      ...config,
      _isAuthRequest: _config._isAuthRequest,
      _isGuestMigration: _config._isGuestMigration,
      _usedGuestToken: _config._usedGuestToken,
      _guestToken: _config._guestToken,
    }
    const { _guestToken, _isAuthRequest, _isGuestMigration, _skipGuestSession, _usedGuestToken, _guestRetryAfterRefresh, ...uniRequestConfig } = _config

    // Promise 封装
    return new Promise((resolve, reject) => {
      uni.request({
        ...uniRequestConfig,
        success: res => {
          this.responseInterceptor(res, requestParams).then(resolve).catch(reject)
          // this.responseInterceptor(res).then(res => {
          //   resolve(res)
          // }).catch(err => {
          //   reject(err)
          // });
        },
        fail: (err: any) => {
          // 提示错误
          console.log('fail', err)
          reject({
            code: -1,
            message: err.errMsg || '网络请求失败',
            error: err,
          })
        },
        complete: () => {
          // 关闭Loading
          // uni.hideLoading();
        },
      })
    })
  }
  // 只实现post和get，这么做了原因是 只有这两个没有兼容问题
  // 需要其他方式，可以以同样的方式自行扩展

  /**
   * get请求
   * @param {String} url 接口
   * @param {Object} data 请求参数 可选
   * @param {Object} config 接口自定义配置 可选
   * @returns
   */
  get(url: string, data = {}, config: ParticalUniAppRequestOptions = {}) {
    // 兼容部分新版 Apifox 生成方法：GET 已将查询参数拼入 URL，第二参数实际传入 fetchOptions。
    if (Object.keys(config).length === 0 && data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'projectId')) {
      return this.request(url, {}, data as ParticalUniAppRequestOptions, 'GET')
    }
    return this.request(url, data, config, 'GET')
  }
  /**
   * post请求
   * @param {String} url 接口
   * @param {Object} data 请求参数 可选
   * @param {Object} config 接口自定义配置 可选
   * @returns
   */
  post(url: string, data = {}, config: ParticalUniAppRequestOptions = {}) {
    return this.request(url, data, config, 'POST')
  }
  /**
   * post请求
   * @param {String} url 接口
   * @param {Object} data 请求参数 可选
   * @param {Object} config 接口自定义配置 可选
   * @returns
   */
  put(url: string, data = {}, config: ParticalUniAppRequestOptions = {}) {
    return this.request(url, data, config, 'PUT')
  }
  /**
   * delete请求
   * @param {String} url 接口
   * @param {Object} data 请求参数 可选
   * @param {Object} config 接口自定义配置 可选
   * @returns
   */
  delete(url: string, data = {}, config: ParticalUniAppRequestOptions = {}) {
    return this.request(url, data, config, 'DELETE')
  }
  /**
   * patch请求
   * @param {String} url 接口
   * @param {Object} data 请求参数 可选
   * @param {Object} config 接口自定义配置 可选
   * @returns
   */
  patch(url: string, data = {}, config: ParticalUniAppRequestOptions = {}) {
    return this.request(url, data, config, 'PATCH' as Methods)
  }
  // 错误提示
  handleError(title: string) {
    uni.showToast({
      title,
      icon: 'none',
    })
  }
}

const http = new Request()

export default http
