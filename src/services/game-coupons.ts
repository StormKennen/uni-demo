import type { GameCouponConfig } from '@/config/game-coupons'

export interface GameCouponCode {
  code: string
  reward?: string
  source?: string
}

export interface GameCouponAccount {
  id: string
  server: string
  accountId: string
  nickname?: string
  avatarUrl?: string
  profileAvailable?: boolean
}

export interface GameCouponProfile {
  gameId: string
  compendiumId: string
  accountId: string
  server: string
  nickname?: string
  avatarUrl?: string
  available: boolean
  message?: string
}

export interface GameCouponCodesResponse {
  gameId?: string
  compendiumId?: string
  codes: GameCouponCode[]
  cached?: boolean
  cacheTime?: string
  updatedAt?: string
}

export type GameCouponRedeemStatus = 'pending' | 'redeeming' | 'success' | 'already_used' | 'invalid_coupon' | 'invalid_id' | 'failed'

export interface GameCouponRedeemResultItem {
  code: string
  reward?: string
  status: GameCouponRedeemStatus
  message?: string
}

export interface GameCouponRedeemAccountResult {
  account: GameCouponAccount
  success: number
  alreadyUsed: number
  failed: number
  results: GameCouponRedeemResultItem[]
}

export interface GameCouponRedeemResponse {
  gameId?: string
  compendiumId?: string
  total: number
  success: number
  alreadyUsed: number
  failed: number
  accountResults: GameCouponRedeemAccountResult[]
}

interface ApiEnvelope<T> {
  code?: number
  message?: string
  msg?: string
  data?: T
}

const API_PREFIX = '/game-coupons'

function getBaseUrl() {
  return String(
    import.meta.env.VITE_APP_GAME_COUPON_BASE_URL || import.meta.env.VITE_APP_SW_COUPON_BASE_URL || import.meta.env.VITE_APP_BASE_URL || '',
  ).replace(/\/$/, '')
}

export function hasGameCouponBackend() {
  return getBaseUrl().length > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function unwrapResponse<T>(payload: unknown): T {
  if (!isRecord(payload) || typeof payload.code !== 'number') {
    return payload as T
  }

  const envelope = payload as ApiEnvelope<T>
  if (envelope.code === 0 || envelope.code === 200) {
    return envelope.data as T
  }

  throw new Error(envelope.message || envelope.msg || '请求失败')
}

function getGamePath(config: GameCouponConfig, path: string) {
  const gamePath = `${API_PREFIX}/${encodeURIComponent(config.gameId)}${path}`
  const separator = gamePath.includes('?') ? '&' : '?'
  return `${gamePath}${separator}compendium_id=${encodeURIComponent(config.compendiumId)}`
}

function request<T>(path: string, method: UniApp.RequestOptions['method'], data?: object) {
  const baseUrl = getBaseUrl()

  if (!baseUrl) {
    return Promise.reject(new Error('未配置兑换券后端地址'))
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${path}`,
      method,
      data,
      timeout: 120000,
      header: {
        'Content-Type': 'application/json',
      },
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(unwrapResponse<T>(res.data))
          } catch (err) {
            reject(err)
          }
          return
        }

        const dataRecord = isRecord(res.data) ? res.data : {}
        reject(new Error(String(dataRecord.message || dataRecord.msg || `请求失败（${res.statusCode}）`)))
      },
      fail: err => reject(new Error(err.errMsg || '网络请求失败')),
    })
  })
}

export function getGameCouponCodes(config: GameCouponConfig) {
  return request<GameCouponCodesResponse>(getGamePath(config, '/codes'), 'GET')
}

export function getGameCouponProfile(config: GameCouponConfig, accountId: string, server: string) {
  const query = `/profile?account_id=${encodeURIComponent(accountId)}&server=${encodeURIComponent(server)}`
  return request<GameCouponProfile>(getGamePath(config, query), 'GET')
}

export function redeemGameCoupons(config: GameCouponConfig, accounts: GameCouponAccount[], codes: GameCouponCode[]) {
  return request<GameCouponRedeemResponse>(getGamePath(config, '/redeem'), 'POST', {
    game_id: config.gameId,
    compendium_id: config.compendiumId,
    accounts: accounts.map(account => ({
      id: account.id,
      server: account.server,
      account_id: account.accountId,
    })),
    codes,
  })
}
