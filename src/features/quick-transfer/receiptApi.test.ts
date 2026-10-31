import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getQuickTransferReceipts: vi.fn(),
  getQuickTransferReceiptsReceiptId: vi.fn(),
  deleteQuickTransferReceiptsReceiptId: vi.fn(),
  postQuickTransferReceiptsFilesAccess: vi.fn(),
}))

vi.mock('@/services/apifox/NODEJSDEMO/QUICKTRANSFERRECEIPT/apifox', () => mocks)

import {
  accessQuickTransferReceiptFile,
  deleteQuickTransferReceipt,
  getQuickTransferReceipt,
  isValidQuickTransferReceiptId,
  listQuickTransferReceipts,
} from './receiptApi'

describe('quick transfer receipt API adapter', () => {
  beforeEach(() => vi.clearAllMocks())

  it('accepts safe receipt ids and rejects empty or path-like values', () => {
    expect(isValidQuickTransferReceiptId('receipt-1')).toBe(true)
    expect(isValidQuickTransferReceiptId('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(isValidQuickTransferReceiptId('')).toBe(false)
    expect(isValidQuickTransferReceiptId('../receipt-1')).toBe(false)
  })

  it('normalizes a paginated receipt list', async () => {
    mocks.getQuickTransferReceipts.mockResolvedValue({
      items: [
        {
          receiptId: 'receipt-1',
          displayTitle: '旅行攻略',
          claimedAt: '2026-08-26T10:00:00.000Z',
          summary: { hasText: true, linkCount: 2, fileCount: 1, imageCount: 0, otherFileCount: 1, referenceCount: 0 },
          preview: { text: '先看这份攻略' },
        },
      ],
      pagination: { page: 1, pageSize: 20, total: 21, totalPages: 2, hasNext: true },
    })

    await expect(listQuickTransferReceipts()).resolves.toEqual({
      items: [
        {
          receiptId: 'receipt-1',
          displayTitle: '旅行攻略',
          claimedAt: '2026-08-26T10:00:00.000Z',
          primaryType: 'mixed',
          summary: { hasText: true, linkCount: 2, fileCount: 1, imageCount: 0, otherFileCount: 1, referenceCount: 0 },
          preview: { text: '先看这份攻略', referenceTitle: undefined, linkTitle: undefined, fileName: undefined },
        },
      ],
      pagination: { page: 1, pageSize: 20, total: 21, totalPages: 2, hasNext: true },
    })
    expect(mocks.getQuickTransferReceipts).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
  })

  it('consumes image presentation metadata without inspecting the filename', async () => {
    mocks.getQuickTransferReceipts.mockResolvedValue({
      items: [
        {
          receiptId: 'receipt-image',
          displayTitle: '3 张图片',
          claimedAt: '2026-08-26T10:00:00.000Z',
          primaryType: 'image',
          summary: { hasText: false, linkCount: 0, fileCount: 3, imageCount: 3, otherFileCount: 0, referenceCount: 0 },
          preview: { fileName: '294A9B3D0CB782C8.jpeg' },
        },
      ],
      pagination: { page: 1, pageSize: 20, hasNext: false },
    })

    await expect(listQuickTransferReceipts()).resolves.toMatchObject({
      items: [
        {
          primaryType: 'image',
          summary: { fileCount: 3, imageCount: 3, otherFileCount: 0 },
          preview: { fileName: '294A9B3D0CB782C8.jpeg' },
        },
      ],
    })
  })

  it('normalizes receipt detail and preserves unavailable file metadata', async () => {
    mocks.getQuickTransferReceiptsReceiptId.mockResolvedValue({
      receiptId: 'receipt-2',
      displayTitle: 'report.pdf',
      claimedAt: '2026-08-26T10:00:00.000Z',
      content: {
        text: null,
        links: [],
        references: [],
        files: [
          { fileId: 'file-2', name: 'report.pdf', displayName: 'report.pdf', size: 1024, mimeType: 'application/pdf', available: false },
        ],
      },
    })

    await expect(getQuickTransferReceipt('receipt-2')).resolves.toEqual({
      receiptId: 'receipt-2',
      displayTitle: 'report.pdf',
      claimedAt: '2026-08-26T10:00:00.000Z',
      content: {
        text: undefined,
        links: [],
        references: [],
        files: [
          { fileId: 'file-2', name: 'report.pdf', displayName: 'report.pdf', size: 1024, mimeType: 'application/pdf', available: false },
        ],
      },
    })
  })

  it('uses receipt file access and delete endpoints without resolving again', async () => {
    mocks.postQuickTransferReceiptsFilesAccess.mockResolvedValue({
      data: {
        url: 'https://signed.example/file',
        expiresAt: '2026-08-26T11:00:00.000Z',
      },
    })
    mocks.deleteQuickTransferReceiptsReceiptId.mockResolvedValue({ receiptId: 'receipt-3', deletedAt: '2026-08-26T11:00:00.000Z' })

    await expect(accessQuickTransferReceiptFile('receipt-3', 'file-3')).resolves.toEqual({
      url: 'https://signed.example/file',
      expiresAt: '2026-08-26T11:00:00.000Z',
    })
    await expect(deleteQuickTransferReceipt('receipt-3')).resolves.toBe('receipt-3')
    expect(mocks.postQuickTransferReceiptsFilesAccess).toHaveBeenCalledWith({ receiptId: 'receipt-3', fileId: 'file-3' })
    expect(mocks.deleteQuickTransferReceiptsReceiptId).toHaveBeenCalledWith('receipt-3')
  })
})
