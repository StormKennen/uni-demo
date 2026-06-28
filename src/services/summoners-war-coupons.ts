export type SummonersWarServer = 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'

export interface SummonersWarServerOption {
  value: SummonersWarServer
  label: string
  shortLabel: string
}

export interface SwCouponCode {
  code: string
  reward?: string
  source?: string
}

export interface SwCouponAccount {
  id: string
  server: SummonersWarServer
  hiveId: string
  nickname?: string
  avatarUrl?: string
  profileAvailable?: boolean
}

export interface SwCouponProfile {
  hiveId: string
  server: SummonersWarServer
  nickname?: string
  avatarUrl?: string
  available: boolean
  message?: string
}

export interface SwCouponCodesResponse {
  codes: SwCouponCode[]
  cached?: boolean
  cacheTime?: string
  updatedAt?: string
}

export type SwCouponRedeemStatus = 'pending' | 'redeeming' | 'success' | 'already_used' | 'invalid_coupon' | 'invalid_id' | 'failed'

export interface SwCouponRedeemResultItem {
  code: string
  reward?: string
  status: SwCouponRedeemStatus
  message?: string
}

export interface SwCouponRedeemAccountResult {
  account: SwCouponAccount
  success: number
  alreadyUsed: number
  failed: number
  results: SwCouponRedeemResultItem[]
}

export interface SwCouponRedeemResponse {
  total: number
  success: number
  alreadyUsed: number
  failed: number
  accountResults: SwCouponRedeemAccountResult[]
}

interface ApiEnvelope<T> {
  code?: number
  message?: string
  msg?: string
  data?: T
}

const API_PREFIX = '/summoners-war/coupons'

export const SUMMONERS_WAR_SERVERS: SummonersWarServerOption[] = [
  { value: 'global', label: '国际服 Global', shortLabel: 'Global' },
  { value: 'korea', label: '韩服 Korea', shortLabel: 'Korea' },
  { value: 'japan', label: '日服 Japan', shortLabel: 'Japan' },
  { value: 'china', label: '国服 China', shortLabel: 'China' },
  { value: 'asia', label: '亚服 Asia', shortLabel: 'Asia' },
  { value: 'europe', label: '欧服 Europe', shortLabel: 'Europe' },
]

function getBaseUrl() {
  return String(import.meta.env.VITE_APP_SW_COUPON_BASE_URL || import.meta.env.VITE_APP_BASE_URL || '').replace(/\/$/, '')
}

export function hasSummonersWarCouponBackend() {
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

function request<T>(path: string, method: UniApp.RequestOptions['method'], data?: object) {
  const baseUrl = getBaseUrl()

  if (!baseUrl) {
    return Promise.reject(new Error('未配置兑换券后端地址'))
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${API_PREFIX}${path}`,
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

export function getSummonersWarCouponCodes() {
  return request<SwCouponCodesResponse>('/codes', 'GET')
}

export function getSummonersWarProfile(hiveId: string, server: SummonersWarServer) {
  const query = `?hive_id=${encodeURIComponent(hiveId)}&server=${encodeURIComponent(server)}`
  return request<SwCouponProfile>(`/profile${query}`, 'GET')
}

export function redeemSummonersWarCoupons(accounts: SwCouponAccount[], codes: SwCouponCode[]) {
  return request<SwCouponRedeemResponse>('/redeem', 'POST', {
    accounts: accounts.map(account => ({
      id: account.id,
      server: account.server,
      hive_id: account.hiveId,
    })),
    codes,
  })
}
