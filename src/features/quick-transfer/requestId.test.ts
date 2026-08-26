import { describe, expect, it } from 'vitest'
import { createQuickTransferClaimRequestId } from './requestId'

describe('quick transfer claim request id', () => {
  it('creates a non-persistent operation id with a qcr prefix', () => {
    const first = createQuickTransferClaimRequestId()
    const second = createQuickTransferClaimRequestId()
    expect(first).toMatch(/^qcr_[0-9a-f-]{36}$/)
    expect(second).toMatch(/^qcr_[0-9a-f-]{36}$/)
    expect(second).not.toBe(first)
  })
})
