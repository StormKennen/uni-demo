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
})
