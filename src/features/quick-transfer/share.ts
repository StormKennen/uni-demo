import { QUICK_TRANSFER_ROUTE } from './constants'
import { buildQuickTransferSharePath } from './helpers'
import type { QuickTransferMode, QuickTransferSendState } from './types'

export type QuickTransferShareKind = 'tool' | 'transfer'

export interface QuickTransferSharePayload {
  kind: QuickTransferShareKind
  title: string
  path: string
}

export interface QuickTransferShareInput {
  mode: QuickTransferMode
  sendState: QuickTransferSendState
  shareToken: string
  expiresAt: string
  claimCount?: number
  maxClaims?: number
  now?: number
}

export const QUICK_TRANSFER_TOOL_SHARE_TITLE = '快船 - 文本、图片、文件跨设备传递'
export const QUICK_TRANSFER_TRANSFER_SHARE_TITLE = '给你送来了一艘快船'

export const getQuickTransferSharePayload = (input: QuickTransferShareInput): QuickTransferSharePayload => {
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
    }
  }

  return {
    kind: 'tool',
    title: QUICK_TRANSFER_TOOL_SHARE_TITLE,
    path: QUICK_TRANSFER_ROUTE,
  }
}
