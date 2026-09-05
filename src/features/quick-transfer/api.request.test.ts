import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  postQuickTransfers: vi.fn(),
  postQuickTransfersShareInspect: vi.fn(),
  postQuickTransfersResolve: vi.fn(),
  getQuickTransfersTransferId: vi.fn(),
  deleteQuickTransfersTransferId: vi.fn(),
  postQuickTransfersFilesComplete: vi.fn(),
  postQuickTransfersFilesUploadPolicy: vi.fn(),
  postQuickTransfersFilesAccess: vi.fn(),
}))

vi.mock('@/services/apifox/NODEJSDEMO/QUICKTRANSFER/apifox', () => mocks)

import { accessQuickTransferFile, inspectQuickTransferShare, resolveQuickTransfer } from './api'

describe('quick transfer request identity policy', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps inspect anonymous while resolve and file access use the normal request chain', async () => {
    mocks.postQuickTransfersShareInspect.mockResolvedValue({
      expiresAt: '2026-08-26T11:00:00.000Z',
      remainingClaims: 1,
      summary: { hasText: true, linkCount: 0, fileCount: 0, imageCount: 0, otherFileCount: 0, referenceCount: 0 },
    })
    mocks.postQuickTransfersResolve.mockResolvedValue({
      transferId: 'transfer-1',
      claimId: 'claim-1',
      content: { text: 'hello', links: [], files: [], references: [] },
    })
    mocks.postQuickTransfersFilesAccess.mockResolvedValue({
      code: 200,
      status: 200,
      data: {
        url: 'https://signed.example/file',
        expiresAt: '2026-08-26T11:00:00.000Z',
      },
    })

    await inspectQuickTransferShare('share-1')
    await resolveQuickTransfer({ code: '123456', claimRequestId: 'qcr_request-1' })
    await accessQuickTransferFile('transfer-1', 'file-1', 'claim-1')

    expect(mocks.postQuickTransfersShareInspect).toHaveBeenCalledWith({ shareToken: 'share-1' }, { _skipGuestSession: true })
    expect(mocks.postQuickTransfersResolve).toHaveBeenCalledWith({ code: '123456', claimRequestId: 'qcr_request-1' })
    expect(mocks.postQuickTransfersFilesAccess).toHaveBeenCalledWith(
      { transferId: 'transfer-1', fileId: 'file-1' },
      { claimToken: 'claim-1', purpose: 'download' },
    )
  })

  it('uses the preview purpose when an image is opened for preview', async () => {
    mocks.postQuickTransfersFilesAccess.mockResolvedValue({
      data: { url: 'https://signed.example/image', expiresAt: '2026-08-26T11:00:00.000Z' },
    })

    await accessQuickTransferFile('transfer-2', 'image-1', 'claim-2', 'preview')

    expect(mocks.postQuickTransfersFilesAccess).toHaveBeenCalledWith(
      { transferId: 'transfer-2', fileId: 'image-1' },
      { claimToken: 'claim-2', purpose: 'preview' },
    )
  })
})
