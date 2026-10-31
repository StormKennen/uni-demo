import { QUICK_TRANSFER_RECEIVE_ROUTE, QUICK_TRANSFER_ROUTE } from './constants'
import { buildQuickTransferSharePath, normalizeQuickTransferTitle } from './helpers'
import type { QuickTransferMode, QuickTransferSendState } from './types'
import { QUICK_SHIP_TOOL_SHARE_COVER_URL, QUICK_SHIP_TRANSFER_SHARE_COVER_URL } from './visual'

export type QuickTransferShareKind = 'tool' | 'receiver' | 'transfer'

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
  | { kind: 'receiver' }
  | { kind: 'transfer'; shareToken: string; expiresAt: string; title?: string; now?: number }

export const QUICK_TRANSFER_TOOL_SHARE_TITLE = '飞船｜跨设备快速传递内容'
export const QUICK_TRANSFER_RECEIVE_SHARE_TITLE = '接收飞船｜使用飞船码领取内容'
export const QUICK_TRANSFER_TRANSFER_SHARE_TITLE = '飞船｜飞船'

export const getQuickTransferToolSharePayload = (): QuickTransferSharePayload => ({
  kind: 'tool',
  title: QUICK_TRANSFER_TOOL_SHARE_TITLE,
  path: QUICK_TRANSFER_ROUTE,
  imageUrl: QUICK_SHIP_TOOL_SHARE_COVER_URL,
})

export const getQuickTransferReceiveSharePayload = (): QuickTransferSharePayload => ({
  kind: 'receiver',
  title: QUICK_TRANSFER_RECEIVE_SHARE_TITLE,
  path: QUICK_TRANSFER_RECEIVE_ROUTE,
  imageUrl: QUICK_SHIP_TOOL_SHARE_COVER_URL,
})

export const getQuickTransferTransferSharePayload = (
  shareToken: string,
  expiresAt: string,
  titleOrNow: string | number = '',
  now = Date.now(),
): QuickTransferSharePayload => {
  const title = typeof titleOrNow === 'number' ? '' : normalizeQuickTransferTitle(titleOrNow)
  const currentTime = typeof titleOrNow === 'number' ? titleOrNow : now
  const isValid = Boolean(shareToken) && Number.isFinite(Date.parse(expiresAt)) && Date.parse(expiresAt) > currentTime
  if (!isValid) return getQuickTransferToolSharePayload()
  return {
    kind: 'transfer',
    title: title ? `飞船｜${title}` : QUICK_TRANSFER_TRANSFER_SHARE_TITLE,
    path: buildQuickTransferSharePath(shareToken),
    imageUrl: QUICK_SHIP_TRANSFER_SHARE_COVER_URL,
  }
}

export const getQuickTransferSharePayload = (input: QuickTransferShareInput): QuickTransferSharePayload => {
  if ('kind' in input) {
    if (input.kind === 'tool') return getQuickTransferToolSharePayload()
    if (input.kind === 'receiver') return getQuickTransferReceiveSharePayload()
    return getQuickTransferTransferSharePayload(input.shareToken, input.expiresAt, input.title || '', input.now)
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
