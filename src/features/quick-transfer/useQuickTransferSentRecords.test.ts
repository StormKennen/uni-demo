import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { QuickTransferSentRecordDetail, QuickTransferSentRecordListResult } from './types'

const apiMocks = vi.hoisted(() => ({
  listQuickTransferSentRecords: vi.fn(),
  getQuickTransferSentRecord: vi.fn(),
  deleteQuickTransferSentRecord: vi.fn(),
  accessQuickTransferSentRecordFile: vi.fn(),
}))

const sessionMocks = vi.hoisted(() => ({ cancelQuickTransfer: vi.fn() }))

vi.mock('./sentRecordApi', () => apiMocks)
vi.mock('./api', () => sessionMocks)

import { useQuickTransferSentRecords } from './useQuickTransferSentRecords'

const listResult = (page: number, sentRecordId: string): QuickTransferSentRecordListResult => ({
  items: [
    {
      sentRecordId,
      transferId: `transfer-${sentRecordId}`,
      displayTitle: sentRecordId,
      sentAt: '2026-08-27T10:00:00.000Z',
      status: 'ready',
      claimCount: 1,
      maxClaims: 3,
      expiresAt: '2026-08-27T11:00:00.000Z',
      canRecall: true,
      primaryType: 'file',
      summary: { hasText: false, linkCount: 0, fileCount: 1, imageCount: 0, otherFileCount: 1, referenceCount: 0 },
      preview: { fileName: `${sentRecordId}.pdf` },
    },
  ],
  pagination: { page, pageSize: 20, total: 2, totalPages: 2, hasNext: page === 1 },
})

describe('useQuickTransferSentRecords', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the first page, appends the next page and deduplicates sent record ids', async () => {
    const secondPage = listResult(2, 'sent-1')
    secondPage.items.push({ ...listResult(2, 'sent-2').items[0] })
    apiMocks.listQuickTransferSentRecords.mockResolvedValueOnce(listResult(1, 'sent-1')).mockResolvedValueOnce(secondPage)
    const sentRecords = useQuickTransferSentRecords()

    expect(await sentRecords.loadSentRecords()).toBe(true)
    expect(await sentRecords.loadMore()).toBe(true)
    expect(sentRecords.items.value.map(item => item.sentRecordId)).toEqual(['sent-1', 'sent-2'])
    expect(apiMocks.listQuickTransferSentRecords).toHaveBeenNthCalledWith(1, 1, 20)
    expect(apiMocks.listQuickTransferSentRecords).toHaveBeenNthCalledWith(2, 2, 20)
    expect(await sentRecords.loadMore()).toBe(false)
  })

  it('keeps existing items when loading more fails and allows retry', async () => {
    apiMocks.listQuickTransferSentRecords
      .mockResolvedValueOnce(listResult(1, 'sent-1'))
      .mockRejectedValueOnce({ code: 'NETWORK_ERROR' })
      .mockResolvedValueOnce(listResult(2, 'sent-2'))
    const sentRecords = useQuickTransferSentRecords()

    await sentRecords.loadSentRecords()
    expect(await sentRecords.loadMore()).toBe(false)
    expect(sentRecords.items.value.map(item => item.sentRecordId)).toEqual(['sent-1'])
    expect(sentRecords.loadMoreError.value?.code).toBe('NETWORK_ERROR')
    expect(await sentRecords.loadMore()).toBe(true)
    expect(sentRecords.loadMoreError.value).toBeNull()
    expect(sentRecords.items.value.map(item => item.sentRecordId)).toEqual(['sent-1', 'sent-2'])
  })

  it('keeps delete and recall isolated while using the transfer cancel API for recall', async () => {
    const detail: QuickTransferSentRecordDetail = {
      sentRecordId: 'sent-1',
      transferId: 'transfer-1',
      displayTitle: '攻略',
      sentAt: '2026-08-27T10:00:00.000Z',
      status: 'ready',
      claimCount: 1,
      maxClaims: 3,
      canRecall: true,
      content: { text: undefined, links: [], references: [], files: [] },
    }
    apiMocks.getQuickTransferSentRecord.mockResolvedValue(detail)
    sessionMocks.cancelQuickTransfer.mockResolvedValue({})
    apiMocks.deleteQuickTransferSentRecord.mockResolvedValue('sent-1')
    const sentRecords = useQuickTransferSentRecords()

    await sentRecords.loadSentRecordDetail('sent-1')
    expect(await sentRecords.recallSentRecord()).toBe(true)
    expect(sessionMocks.cancelQuickTransfer).toHaveBeenCalledWith('transfer-1', 3)
    expect(apiMocks.deleteQuickTransferSentRecord).not.toHaveBeenCalled()
    expect(await sentRecords.deleteSentRecord('sent-1')).toBe(true)
    expect(apiMocks.deleteQuickTransferSentRecord).toHaveBeenCalledWith('sent-1')
    expect(sessionMocks.cancelQuickTransfer).toHaveBeenCalledTimes(1)
  })

  it('tracks deletion by record id and keeps a failed record visible', async () => {
    apiMocks.listQuickTransferSentRecords.mockResolvedValue(listResult(1, 'sent-3'))
    apiMocks.deleteQuickTransferSentRecord.mockRejectedValueOnce({ code: 'NETWORK_ERROR' })
    const sentRecords = useQuickTransferSentRecords()

    await sentRecords.loadSentRecords()
    expect(await sentRecords.deleteSentRecord('sent-3')).toBe(false)
    expect(sentRecords.isDeletingRecord('sent-3')).toBe(false)
    expect(sentRecords.items.value.map(item => item.sentRecordId)).toEqual(['sent-3'])
  })

  it('accesses sent files without resolving and marks only unavailable files', async () => {
    apiMocks.getQuickTransferSentRecord.mockResolvedValue({
      sentRecordId: 'sent-2',
      transferId: 'transfer-2',
      displayTitle: '附件',
      sentAt: '2026-08-27T10:00:00.000Z',
      status: 'ready',
      claimCount: 0,
      maxClaims: 1,
      canRecall: true,
      content: {
        text: undefined,
        links: [],
        references: [],
        files: [{ fileId: 'file-2', name: 'report.pdf', size: 1, mimeType: 'application/pdf', available: true }],
      },
    })
    apiMocks.accessQuickTransferSentRecordFile.mockRejectedValueOnce({ data: { code: 'QUICK_TRANSFER_SENT_FILE_NOT_AVAILABLE' } })
    const sentRecords = useQuickTransferSentRecords()

    await sentRecords.loadSentRecordDetail('sent-2')
    await expect(sentRecords.accessSentRecordFile('sent-2', 'file-2')).resolves.toBeNull()
    expect(sentRecords.detail.value?.content.files[0]?.available).toBe(true)
    sentRecords.markFileUnavailable('file-2')
    await expect(sentRecords.accessSentRecordFile('sent-2', 'file-2')).resolves.toBeNull()
    expect(apiMocks.accessQuickTransferSentRecordFile).toHaveBeenCalledTimes(1)
  })

  it('refreshes sent record detail without clearing the current page', async () => {
    const first: QuickTransferSentRecordDetail = {
      sentRecordId: 'sent-4',
      transferId: 'transfer-4',
      displayTitle: '进度',
      sentAt: '2026-08-27T10:00:00.000Z',
      status: 'ready',
      claimCount: 1,
      maxClaims: 3,
      canRecall: true,
      content: { text: undefined, links: [], references: [], files: [] },
    }
    const sentRecords = useQuickTransferSentRecords()
    apiMocks.getQuickTransferSentRecord.mockResolvedValueOnce(first).mockImplementationOnce(async () => {
      expect(sentRecords.detail.value).toEqual(first)
      expect(sentRecords.isLoading.value).toBe(false)
      return { ...first, claimCount: 2 }
    })

    expect(await sentRecords.loadSentRecordDetail('sent-4')).toBe(true)
    expect(sentRecords.detail.value?.claimCount).toBe(1)
    expect(await sentRecords.refreshSentRecordDetail()).toBe(true)
    expect(sentRecords.detail.value?.claimCount).toBe(2)
    expect(sentRecords.isLoading.value).toBe(false)
    expect(apiMocks.getQuickTransferSentRecord).toHaveBeenCalledTimes(2)
  })
})
