import { getStorageSync, removeStorageSync, setStorageSync } from './storage'

const GUEST_TOKEN_KEY = 'auth:guestToken'
const GUEST_TOKEN_EXPIRES_AT_KEY = 'auth:guestTokenExpiresAt'
const EXPIRY_BUFFER_MS = 2 * 60 * 1000
const GUEST_SESSION_UNAVAILABLE_BACKOFF_MS = 5 * 60 * 1000

export interface GuestSessionResponse {
  token: string
  expires: string
  header: 'X-Guest-Token'
  platform: 'wechat_mp'
}

export type GuestSessionBootstrap = (code: string) => Promise<GuestSessionResponse>

let guestSessionInFlight: Promise<string> | null = null
let guestSessionUnavailableUntil = 0

const isGuestSessionNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false
  }
  const responseError = error as { code?: unknown; statusCode?: unknown }
  return responseError.code === 404 || responseError.statusCode === 404
}

export const isGuestSessionSupported = (): boolean => {
  let supported = false
  // #ifdef MP-WEIXIN
  supported = true
  // #endif
  return supported
}

export const getGuestToken = (): string => {
  const token = getStorageSync(GUEST_TOKEN_KEY)
  return typeof token === 'string' ? token : ''
}

export const getGuestTokenExpiresAt = (): number => {
  const expiresAt = getStorageSync(GUEST_TOKEN_EXPIRES_AT_KEY)
  return typeof expiresAt === 'number' && Number.isFinite(expiresAt) ? expiresAt : 0
}

export const setGuestToken = (token: string, expiresAt: number): void => {
  setStorageSync(GUEST_TOKEN_KEY, token)
  setStorageSync(GUEST_TOKEN_EXPIRES_AT_KEY, expiresAt)
  guestSessionUnavailableUntil = 0
}

export const clearGuestToken = (): void => {
  removeStorageSync(GUEST_TOKEN_KEY)
  removeStorageSync(GUEST_TOKEN_EXPIRES_AT_KEY)
}

export const isGuestTokenValid = (bufferMs: number = EXPIRY_BUFFER_MS): boolean => {
  const token = getGuestToken()
  const expiresAt = getGuestTokenExpiresAt()
  return Boolean(token && expiresAt && Date.now() < expiresAt - bufferMs)
}

const getWeChatLoginCode = async (): Promise<string> => {
  let loginRequest: Promise<string> | null = null

  // #ifdef MP-WEIXIN
  loginRequest = new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: result => {
        if (result.code) {
          resolve(result.code)
          return
        }
        reject(new Error('微信登录未返回临时 code'))
      },
      fail: reject,
    })
  })
  // #endif

  if (!loginRequest) {
    throw new Error('Guest Session 仅支持微信小程序')
  }
  return loginRequest
}

const createGuestSession = async (bootstrap: GuestSessionBootstrap): Promise<string> => {
  const code = await getWeChatLoginCode()
  const session = await bootstrap(code)
  const expiresAt = Date.parse(session.expires)

  if (
    !session.token ||
    session.header !== 'X-Guest-Token' ||
    session.platform !== 'wechat_mp' ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    throw new Error('Guest Session 响应无效')
  }

  setGuestToken(session.token, expiresAt)
  return session.token
}

const runGuestSessionRefresh = (bootstrap: GuestSessionBootstrap): Promise<string> => {
  if (!guestSessionInFlight) {
    clearGuestToken()
    guestSessionInFlight = createGuestSession(bootstrap)
      .catch(error => {
        if (isGuestSessionNotFoundError(error)) {
          guestSessionUnavailableUntil = Date.now() + GUEST_SESSION_UNAVAILABLE_BACKOFF_MS
          return ''
        }
        throw error
      })
      .finally(() => {
        guestSessionInFlight = null
      })
  }
  return guestSessionInFlight
}

export const ensureGuestSession = async (bootstrap: GuestSessionBootstrap): Promise<string> => {
  if (!isGuestSessionSupported()) {
    return ''
  }

  if (isGuestTokenValid()) {
    return getGuestToken()
  }
  if (Date.now() < guestSessionUnavailableUntil) {
    return ''
  }
  return runGuestSessionRefresh(bootstrap)
}

export const refreshGuestSession = async (bootstrap: GuestSessionBootstrap, failedToken = ''): Promise<string> => {
  if (!isGuestSessionSupported()) {
    return ''
  }

  const currentToken = getGuestToken()
  if (failedToken && currentToken && currentToken !== failedToken && isGuestTokenValid()) {
    return currentToken
  }
  if (Date.now() < guestSessionUnavailableUntil) {
    return ''
  }
  return runGuestSessionRefresh(bootstrap)
}
