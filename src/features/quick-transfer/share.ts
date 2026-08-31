import { QUICK_TRANSFER_ROUTE } from './constants'
import { buildQuickTransferSharePath } from './helpers'
import type { QuickTransferMode, QuickTransferSendState } from './types'
import { QUICK_SHIP_TOOL_SHARE_COVER_URL, QUICK_SHIP_TRANSFER_SHARE_COVER_URL } from './visual'

export type QuickTransferShareKind = 'tool' | 'transfer'

export interface QuickTransferSharePayload {
  kind: QuickTransferShareKind
  title: string
  path: string
  imageUrl: string
}

export interface LegacyQuickTransferShareInput {
  mode: QuickTransferMode
  sendState: QuickTransferSendState
  shareToken: string
  expiresAt: string
  claimCount?: number
  maxClaims?: number
  now?: number
}

export type QuickTransferShareInput =
  | LegacyQuickTransferShareInput
  | { kind: 'tool' }
  | { kind: 'transfer'; shareToken: string; expiresAt: string; now?: number }

export const QUICK_TRANSFER_TOOL_SHARE_TITLE = '飞船｜跨设备快速传递内容'
export const QUICK_TRANSFER_TRANSFER_SHARE_TITLE = '给你送来一艘飞船，点击接收'

export const getQuickTransferToolSharePayload = (): QuickTransferSharePayload => ({
  kind: 'tool',
  title: QUICK_TRANSFER_TOOL_SHARE_TITLE,
  path: QUICK_TRANSFER_ROUTE,
  imageUrl: QUICK_SHIP_TOOL_SHARE_COVER_URL,
})

export const getQuickTransferTransferSharePayload = (
  shareToken: string,
  expiresAt: string,
  now = Date.now(),
): QuickTransferSharePayload => {
  const isValid = Boolean(shareToken) && Number.isFinite(Date.parse(expiresAt)) && Date.parse(expiresAt) > now
  if (!isValid) return getQuickTransferToolSharePayload()
  return {
    kind: 'transfer',
    title: QUICK_TRANSFER_TRANSFER_SHARE_TITLE,
    path: buildQuickTransferSharePath(shareToken),
    imageUrl: QUICK_SHIP_TRANSFER_SHARE_COVER_URL,
  }
}

export const getQuickTransferSharePayload = (input: QuickTransferShareInput): QuickTransferSharePayload => {
  if ('kind' in input) {
    if (input.kind === 'tool') return getQuickTransferToolSharePayload()
    return getQuickTransferTransferSharePayload(input.shareToken, input.expiresAt, input.now)
  }

  const isTransferShare =
    input.mode === 'send' &&
    input.sendState === 'ready' &&
    Boolean(input.shareToken) &&
    Number.isFinite(Date.parse(input.expiresAt)) &&
    Date.parse(input.expiresAt) > (input.now ?? Date.now())

  if (isTransferShare) {
    return {
      kind: 'transfer',
      title: QUICK_TRANSFER_TRANSFER_SHARE_TITLE,
      path: buildQuickTransferSharePath(input.shareToken),
      imageUrl: QUICK_SHIP_TRANSFER_SHARE_COVER_URL,
    }
  }

  return {
    kind: 'tool',
    title: QUICK_TRANSFER_TOOL_SHARE_TITLE,
    path: QUICK_TRANSFER_ROUTE,
    imageUrl: QUICK_SHIP_TOOL_SHARE_COVER_URL,
  }
}
