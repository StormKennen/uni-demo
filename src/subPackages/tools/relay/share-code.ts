import { getStorageSync, setStorageSync } from '@/utils/storage'

const RELAY_SHARE_CODES_KEY = 'relayShareCodes'

const readShareCodes = (): Record<string, string> => {
  const stored = getStorageSync(RELAY_SHARE_CODES_KEY)
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {}
  return Object.entries(stored as Record<string, unknown>).reduce<Record<string, string>>((result, [relayId, shareCode]) => {
    if (typeof shareCode === 'string' && shareCode) result[relayId] = shareCode
    return result
  }, {})
}

export const getRelayShareCode = (relayId: string): string => (relayId ? readShareCodes()[relayId] || '' : '')

export const setRelayShareCode = (relayId: string, shareCode: string): void => {
  if (!relayId || !shareCode) return
  setStorageSync(RELAY_SHARE_CODES_KEY, { ...readShareCodes(), [relayId]: shareCode })
}
