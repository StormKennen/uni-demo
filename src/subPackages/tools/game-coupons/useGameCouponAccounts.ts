import type { GameCouponConfig } from './config'

export type GameCouponAccountStatus = 'active' | 'invalid' | 'pending' | 'disabled'

export interface GameCouponAccount {
  /** 托管账号为后端 ObjectId，游客账号为本地临时 ID。 */
  id: string
  managed: boolean
  server: string
  /** 游客模式保存明文 Hive ID，托管模式可能只返回脱敏值。 */
  accountId: string
  accountIdMasked?: string
  accountLabel?: string
  isDefault?: boolean
  nickname?: string
  status?: GameCouponAccountStatus
}

interface StoredAccountValue {
  id?: unknown
  server?: unknown
  accountId?: unknown
  nickname?: unknown
  status?: unknown
}

export type LocalGameCouponAccount = Pick<GameCouponAccount, 'id' | 'server' | 'accountId' | 'nickname' | 'status' | 'managed'>

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object')

const toStoredAccountValue = (value: unknown): StoredAccountValue => (isRecord(value) ? value : {})

export function createLocalGameCouponAccountId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getGameCouponDefaultServer(config: GameCouponConfig) {
  return config.defaultServer || config.servers[0]?.value || 'global'
}

export function getGameCouponServerIndex(config: GameCouponConfig, server: string) {
  const index = config.servers.findIndex(item => item.value === server)
  return Math.max(0, index)
}

export function getGameCouponServerShortLabel(config: GameCouponConfig, server: string) {
  return config.servers[getGameCouponServerIndex(config, server)]?.shortLabel || server
}

export function maskGameCouponAccountId(accountId: string) {
  const value = accountId.trim()
  if (!value) return ''
  if (value.length <= 4) return `${value[0] || ''}***`
  return `${value.slice(0, 3)}****${value.slice(-3)}`
}

export function parseStoredGameCouponAccounts(config: GameCouponConfig): GameCouponAccount[] {
  try {
    const stored: unknown = uni.getStorageSync(config.storageKey)
    const list = Array.isArray(stored) ? stored : []
    return list.filter(isRecord).map(item => {
      const value = toStoredAccountValue(item)
      const server =
        typeof value.server === 'string' && config.servers.some(option => option.value === value.server)
          ? value.server
          : getGameCouponDefaultServer(config)
      const status =
        value.status === 'active' || value.status === 'invalid' || value.status === 'pending' || value.status === 'disabled'
          ? value.status
          : undefined
      return {
        id: typeof value.id === 'string' && value.id ? value.id : createLocalGameCouponAccountId(),
        managed: false,
        server,
        accountId: typeof value.accountId === 'string' ? value.accountId : '',
        nickname: typeof value.nickname === 'string' ? value.nickname : undefined,
        status,
      }
    })
  } catch {
    return []
  }
}

export function saveGameCouponLocalAccounts(config: GameCouponConfig, accounts: ReadonlyArray<LocalGameCouponAccount>) {
  try {
    uni.setStorageSync(
      config.storageKey,
      accounts
        .filter(account => !account.managed)
        .map(account => ({
          id: account.id,
          server: account.server,
          accountId: account.accountId,
          nickname: account.nickname,
          status: account.status,
        })),
    )
  } catch {
    /* 缓存失败不阻断领取流程 */
  }
}

export function persistGameCouponLocalAccount(config: GameCouponConfig, account: LocalGameCouponAccount) {
  if (account.managed) return
  try {
    const stored: unknown = uni.getStorageSync(config.storageKey)
    const list = Array.isArray(stored) ? stored : []
    const snapshot = {
      id: account.id,
      server: account.server,
      accountId: account.accountId,
      nickname: account.nickname,
      status: account.status,
    }
    const hasStoredAccount = list.some(item => isRecord(item) && item.id === account.id)
    uni.setStorageSync(
      config.storageKey,
      hasStoredAccount ? list.map(item => (isRecord(item) && item.id === account.id ? snapshot : item)) : [...list, snapshot],
    )
  } catch {
    /* 单个本地账号缓存失败不阻断 */
  }
}

export function getGameCouponAccountMatchKeys(account: Pick<GameCouponAccount, 'server' | 'accountId' | 'accountIdMasked'>) {
  const server = account.server.trim().toLowerCase()
  const accountId = account.accountId.trim().toLowerCase()
  const keys: string[] = []
  if (accountId) keys.push(`${server}:plain:${accountId}`, `${server}:masked:${maskGameCouponAccountId(accountId)}`)
  if (account.accountIdMasked?.trim()) keys.push(`${server}:masked:${account.accountIdMasked.trim()}`)
  return keys
}
