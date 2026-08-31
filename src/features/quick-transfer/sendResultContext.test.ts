import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearQuickTransferSendResultContext,
  getQuickTransferSendResultContext,
  setQuickTransferSendResultContext,
} from './sendResultContext'
import type { QuickTransferSendResultContext } from './types'

const context: QuickTransferSendResultContext = {
  transferId: 'transfer-1',
  code: '583921',
  shareToken: 'share-1',
  expiresAt: '2026-08-27T12:00:00.000Z',
  claimCount: 0,
  maxClaims: 3,
  status: 'ready',
}

describe('quick transfer send result context', () => {
  beforeEach(() => clearQuickTransferSendResultContext())

  it('keeps the ticket context in memory and returns a copy', () => {
    setQuickTransferSendResultContext(context)
    const received = getQuickTransferSendResultContext()
    expect(received).toEqual(context)
    expect(received).not.toBe(context)

    if (received) received.code = '000000'
    expect(getQuickTransferSendResultContext()?.code).toBe('583921')
  })

  it('clears the context after the result page consumes it', () => {
    setQuickTransferSendResultContext(context)
    clearQuickTransferSendResultContext()
    expect(getQuickTransferSendResultContext()).toBeNull()
  })
})
