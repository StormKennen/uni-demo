import type { QuickTransferSendResultContext } from './types'

let currentContext: QuickTransferSendResultContext | null = null

export const setQuickTransferSendResultContext = (context: QuickTransferSendResultContext): void => {
  currentContext = { ...context }
}

export const getQuickTransferSendResultContext = (): QuickTransferSendResultContext | null =>
  currentContext ? { ...currentContext } : null

export const clearQuickTransferSendResultContext = (): void => {
  currentContext = null
}
