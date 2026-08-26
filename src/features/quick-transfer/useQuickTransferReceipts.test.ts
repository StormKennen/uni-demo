import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { QuickTransferReceiptDetail, QuickTransferReceiptListResult } from './types'

const mocks = vi.hoisted(() => ({
  listQuickTransferReceipts: vi.fn(),
  getQuickTransferReceipt: vi.fn(),
  deleteQuickTransferReceipt: vi.fn(),
  accessQuickTransferReceiptFile: vi.fn(),
}))

vi.mock('./receiptApi', () => mocks)

import { useQuickTransferReceipts } from './useQuickTransferReceipts'

const listResult = (page: number, receiptId: string): QuickTransferReceiptListResult => ({
  items: [
    {
      receiptId,
      displayTitle: receiptId,
      claimedAt: '2026-08-26T10:00:00.000Z',
      summary: { hasText: false, linkCount: 0, fileCount: 1, referenceCount: 0 },
      preview: { fileName: `${receiptId}.pdf` },
    },
  ],
  pagination: { page, pageSize: 20, total: 2, totalPages: 2, hasNext: page === 1 },
})

describe('useQuickTransferReceipts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the first page and appends the next page', async () => {
    mocks.listQuickTransferReceipts.mockResolvedValueOnce(listResult(1, 'receipt-1')).mockResolvedValueOnce(listResult(2, 'receipt-2'))
    const receipts = useQuickTransferReceipts()

    expect(await receipts.loadReceipts()).toBe(true)
    expect(await receipts.loadMore()).toBe(true)
    expect(receipts.items.value.map(item => item.receiptId)).toEqual(['receipt-1', 'receipt-2'])
    expect(mocks.listQuickTransferReceipts).toHaveBeenNthCalledWith(1, 1, 20)
    expect(mocks.listQuickTransferReceipts).toHaveBeenNthCalledWith(2, 2, 20)
    expect(await receipts.loadMore()).toBe(false)
  })

  it('replaces on refresh and skips duplicate receipt ids while appending', async () => {
    const firstPage = listResult(1, 'receipt-1')
    const secondPage = listResult(2, 'receipt-1')
    secondPage.items.push({
      receiptId: 'receipt-2',
      displayTitle: 'receipt-2',
      claimedAt: '2026-08-26T10:00:00.000Z',
      summary: { hasText: false, linkCount: 0, fileCount: 1, referenceCount: 0 },
      preview: { fileName: 'receipt-2.pdf' },
    })
    mocks.listQuickTransferReceipts
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage)
      .mockResolvedValueOnce(listResult(1, 'receipt-3'))
    const receipts = useQuickTransferReceipts()

    await receipts.loadReceipts()
    await receipts.loadMore()
    expect(receipts.items.value.map(item => item.receiptId)).toEqual(['receipt-1', 'receipt-2'])
    await receipts.loadReceipts()
    expect(receipts.items.value.map(item => item.receiptId)).toEqual(['receipt-3'])
  })

  it('keeps existing items and exposes a retry when loading another page fails', async () => {
    mocks.listQuickTransferReceipts
      .mockResolvedValueOnce(listResult(1, 'receipt-1'))
      .mockRejectedValueOnce({ code: 'NETWORK_ERROR' })
      .mockResolvedValueOnce(listResult(2, 'receipt-2'))
    const receipts = useQuickTransferReceipts()

    await receipts.loadReceipts()
    expect(await receipts.loadMore()).toBe(false)
    expect(receipts.items.value.map(item => item.receiptId)).toEqual(['receipt-1'])
    expect(receipts.loadMoreError.value?.code).toBe('NETWORK_ERROR')
    expect(await receipts.loadMore()).toBe(true)
    expect(receipts.loadMoreError.value).toBeNull()
    expect(receipts.items.value.map(item => item.receiptId)).toEqual(['receipt-1', 'receipt-2'])
  })

  it('loads detail, accesses a receipt file, and removes a deleted item', async () => {
    const detail: QuickTransferReceiptDetail = {
      receiptId: 'receipt-1',
      displayTitle: 'report.pdf',
      claimedAt: '2026-08-26T10:00:00.000Z',
      content: {
        text: undefined,
        links: [],
        references: [],
        files: [{ fileId: 'file-1', name: 'report.pdf', size: 1, mimeType: 'application/pdf' }],
      },
    }
    mocks.getQuickTransferReceipt.mockResolvedValue(detail)
    mocks.accessQuickTransferReceiptFile.mockResolvedValue({ url: 'https://signed.example/file', expiresAt: '2026-08-26T11:00:00.000Z' })
    mocks.deleteQuickTransferReceipt.mockResolvedValue('receipt-1')
    const receipts = useQuickTransferReceipts()

    expect(await receipts.loadReceiptDetail('receipt-1')).toBe(true)
    await expect(receipts.accessReceiptFile('receipt-1', 'file-1')).resolves.toEqual({
      url: 'https://signed.example/file',
      expiresAt: '2026-08-26T11:00:00.000Z',
    })
    expect(await receipts.deleteReceipt('receipt-1')).toBe(true)
    expect(receipts.detail.value).toBeNull()
    expect(mocks.accessQuickTransferReceiptFile).toHaveBeenCalledWith('receipt-1', 'file-1')
  })

  it('does not access a file already marked unavailable', async () => {
    const receipts = useQuickTransferReceipts()
    mocks.getQuickTransferReceipt.mockResolvedValue({
      receiptId: 'receipt-4',
      displayTitle: 'expired.pdf',
      claimedAt: '2026-08-26T10:00:00.000Z',
      content: {
        text: undefined,
        links: [],
        references: [],
        files: [{ fileId: 'file-4', name: 'expired.pdf', size: 1, mimeType: 'application/pdf', available: false }],
      },
    })

    await receipts.loadReceiptDetail('receipt-4')
    await expect(receipts.accessReceiptFile('receipt-4', 'file-4')).resolves.toBeNull()
    expect(mocks.accessQuickTransferReceiptFile).not.toHaveBeenCalled()
  })

  it('marks a file unavailable only for permanent receipt access errors', async () => {
    const receipts = useQuickTransferReceipts()
    mocks.getQuickTransferReceipt.mockResolvedValue({
      receiptId: 'receipt-5',
      displayTitle: 'temporary.pdf',
      claimedAt: '2026-08-26T10:00:00.000Z',
      content: {
        text: undefined,
        links: [],
        references: [],
        files: [{ fileId: 'file-5', name: 'temporary.pdf', size: 1, mimeType: 'application/pdf', available: true }],
      },
    })
    mocks.accessQuickTransferReceiptFile.mockRejectedValueOnce({ data: { code: 'QUICK_TRANSFER_RECEIPT_FILE_NOT_AVAILABLE' } })

    await receipts.loadReceiptDetail('receipt-5')
    await expect(receipts.accessReceiptFile('receipt-5', 'file-5')).resolves.toBeNull()
    expect(receipts.detail.value?.content.files[0]?.available).toBe(true)
    receipts.markDetailFileUnavailable('file-5')
    await expect(receipts.accessReceiptFile('receipt-5', 'file-5')).resolves.toBeNull()
    expect(mocks.accessQuickTransferReceiptFile).toHaveBeenCalledTimes(1)
  })

  it('keeps a file retryable after a temporary receipt access error', async () => {
    const receipts = useQuickTransferReceipts()
    mocks.getQuickTransferReceipt.mockResolvedValue({
      receiptId: 'receipt-6',
      displayTitle: 'retry.pdf',
      claimedAt: '2026-08-26T10:00:00.000Z',
      content: {
        text: undefined,
        links: [],
        references: [],
        files: [{ fileId: 'file-6', name: 'retry.pdf', size: 1, mimeType: 'application/pdf', available: true }],
      },
    })
    mocks.accessQuickTransferReceiptFile
      .mockRejectedValueOnce({ data: { code: 'QUICK_TRANSFER_RECEIPT_FILE_ACCESS_TEMPORARILY_UNAVAILABLE' } })
      .mockResolvedValueOnce({ url: 'https://signed.example/retry', expiresAt: '2026-08-26T11:00:00.000Z' })

    await receipts.loadReceiptDetail('receipt-6')
    await expect(receipts.accessReceiptFile('receipt-6', 'file-6')).resolves.toBeNull()
    expect(receipts.detail.value?.content.files[0]?.available).toBe(true)
    await expect(receipts.accessReceiptFile('receipt-6', 'file-6')).resolves.toEqual({
      url: 'https://signed.example/retry',
      expiresAt: '2026-08-26T11:00:00.000Z',
    })
    expect(mocks.accessQuickTransferReceiptFile).toHaveBeenCalledTimes(2)
  })
})
