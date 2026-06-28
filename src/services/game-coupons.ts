import type { GameCouponConfig } from '@/config/game-coupons'
import { getToken } from '@/utils/storage'

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
  // 以下字段在登录态接入后端托管时使用（本地游客模式可忽略）
  accountLabel?: string
  status?: string
  autoRedeemEnabled?: boolean
  isDefault?: boolean
  lastVerifiedAt?: string | null
  lastRedeemAt?: string | null
}

export interface GameCouponAccountsResponse {
  gameId?: string
  compendiumId?: string
  accounts: GameCouponAccount[]
}

export interface GameCouponRedeemRecord {
  id: string
  server: string
  couponCode?: string
  coupon_code?: string
  resultStatus?: GameCouponRedeemStatus
  result_status?: GameCouponRedeemStatus
  resultMessage?: string
  result_message?: string
  accountIdMasked?: string
  account_id_masked?: string
  redeemedAt?: string
  redeemed_at?: string
}

export interface GameCouponRedeemSummary {
  gameId?: string
  total: number
  success: number
  alreadyUsed: number
  failed: number
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

function request<T>(path: string, method: UniApp.RequestOptions['method'], data?: object, options?: { auth?: boolean }) {
  const baseUrl = getBaseUrl()

  if (!baseUrl) {
    return Promise.reject(new Error('未配置兑换券后端地址'))
  }

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // 账号托管等接口需要登录态：携带后端约定的鉴权头
  if (options?.auth) {
    const token = String(getToken() || '')
    if (!token) {
      return Promise.reject(new Error('请先登录后再管理托管账号'))
    }
    header.Authorization = `Bearer ${token}`
    header.Token = token
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${path}`,
      method,
      data,
      timeout: 120000,
      header,
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

/**
 * 手动录入券码（登录可选）。
 * 对应后端 POST /game-coupons/:gameId/codes/manual
 */
export function addGameCouponManualCode(config: GameCouponConfig, code: string, reward?: string) {
  return request<GameCouponCode>(getGamePath(config, '/codes/manual'), 'POST', {
    code,
    reward,
    source: 'manual',
  })
}

/* ------------------------------------------------------------------ */
/* 以下为「登录态后端托管」预留接口：字段与请求方法已与后端对齐，       */
/* 前端在接入用户体系（登录态）后即可直接调用，无需再改动服务层。       */
/* 对应后端路由前缀：/game-coupons/:gameId/accounts                     */
/* ------------------------------------------------------------------ */

export interface SaveGameCouponAccountPayload {
  server: string
  accountId: string
  accountLabel?: string
}

export interface UpdateGameCouponAccountPayload {
  server?: string
  accountId?: string
  accountLabel?: string
  autoRedeemEnabled?: boolean
  isDefault?: boolean
}

/** 拉取当前登录用户在该游戏下的托管账号列表 */
export function getGameCouponAccounts(config: GameCouponConfig) {
  return request<GameCouponAccountsResponse>(getGamePath(config, '/accounts'), 'GET', undefined, { auth: true })
}

/** 新增托管账号（Hive ID 在后端 AES-256 加密存储） */
export function saveGameCouponAccount(config: GameCouponConfig, payload: SaveGameCouponAccountPayload) {
  return request<GameCouponAccount>(getGamePath(config, '/accounts'), 'POST', {
    server: payload.server,
    account_id: payload.accountId,
    accountLabel: payload.accountLabel,
  }, { auth: true })
}

/** 更新托管账号（区服 / 标签 / 自动托管开关 / 默认账号） */
export function updateGameCouponAccount(config: GameCouponConfig, accountId: string, payload: UpdateGameCouponAccountPayload) {
  const body: Record<string, unknown> = {}
  if (payload.server !== undefined) body.server = payload.server
  if (payload.accountId !== undefined) body.account_id = payload.accountId
  if (payload.accountLabel !== undefined) body.accountLabel = payload.accountLabel
  if (payload.autoRedeemEnabled !== undefined) body.autoRedeemEnabled = payload.autoRedeemEnabled
  if (payload.isDefault !== undefined) body.isDefault = payload.isDefault
  return request<GameCouponAccount>(getGamePath(config, `/accounts/${encodeURIComponent(accountId)}`), 'PATCH', body, { auth: true })
}

/** 删除托管账号 */
export function deleteGameCouponAccount(config: GameCouponConfig, accountId: string) {
  return request<null>(getGamePath(config, `/accounts/${encodeURIComponent(accountId)}`), 'DELETE', undefined, { auth: true })
}

/** 重新校验 Hive ID 与区服是否有效 */
export function verifyGameCouponAccount(config: GameCouponConfig, accountId: string) {
  return request<GameCouponAccount>(getGamePath(config, `/accounts/${encodeURIComponent(accountId)}/verify`), 'POST', undefined, { auth: true })
}

/** 开启 / 关闭自动兑换托管 */
export function setGameCouponAutoRedeem(config: GameCouponConfig, accountId: string, enabled: boolean) {
  return request<GameCouponAccount>(getGamePath(config, `/accounts/${encodeURIComponent(accountId)}/auto-redeem`), 'POST', { enabled }, { auth: true })
}

/** 兑换记录列表 */
export function getGameCouponRedeemRecords(config: GameCouponConfig, params?: { resultStatus?: GameCouponRedeemStatus; couponCode?: string; page?: number; limit?: number }) {
  const parts: string[] = []
  if (params?.resultStatus) parts.push(`resultStatus=${encodeURIComponent(params.resultStatus)}`)
  if (params?.couponCode) parts.push(`couponCode=${encodeURIComponent(params.couponCode)}`)
  if (params?.page) parts.push(`page=${encodeURIComponent(String(params.page))}`)
  if (params?.limit) parts.push(`limit=${encodeURIComponent(String(params.limit))}`)
  const suffix = parts.length ? `?${parts.join('&')}` : ''
  return request<{ results: GameCouponRedeemRecord[]; page?: number; totalPages?: number; totalResults?: number }>(
    getGamePath(config, `/redeem-records${suffix}`),
    'GET',
    undefined,
    { auth: true },
  )
}

/** 兑换统计：成功 / 已使用 / 失败 */
export function getGameCouponRedeemSummary(config: GameCouponConfig) {
  return request<GameCouponRedeemSummary>(getGamePath(config, '/redeem-records/summary'), 'GET', undefined, { auth: true })
}
