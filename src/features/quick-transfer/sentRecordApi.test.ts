import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getQuickTransferSentRecords: vi.fn(),
  getQuickTransferSentRecordsSentRecordId: vi.fn(),
  deleteQuickTransferSentRecordsSentRecordId: vi.fn(),
  postQuickTransferSentRecordsFilesAccess: vi.fn(),
}))

vi.mock('@/services/apifox/NODEJSDEMO/QUICKTRANSFERSENTRECORD/apifox', () => mocks)

import {
  accessQuickTransferSentRecordFile,
  deleteQuickTransferSentRecord,
  getQuickTransferSentRecord,
  isValidQuickTransferSentRecordId,
  listQuickTransferSentRecords,
} from './sentRecordApi'

describe('quick transfer sent record API adapter', () => {
  beforeEach(() => vi.clearAllMocks())

  it('accepts safe sent record ids and rejects empty or path-like values', () => {
    expect(isValidQuickTransferSentRecordId('sent-record-1')).toBe(true)
    expect(isValidQuickTransferSentRecordId('')).toBe(false)
    expect(isValidQuickTransferSentRecordId('../sent-record-1')).toBe(false)
  })

  it('normalizes a sent record list with status, progress, summary, preview and pagination', async () => {
    mocks.getQuickTransferSentRecords.mockResolvedValue({
      items: [
        {
          sentRecordId: 'sent-1',
          transferId: 'transfer-1',
          displayTitle: '旅行攻略',
          sentAt: '2026-08-27T10:00:00.000Z',
          status: 'ready',
          claimCount: 1,
          maxClaims: 3,
          expiresAt: '2026-08-27T11:00:00.000Z',
          canRecall: true,
          summary: { hasText: true, linkCount: 2, fileCount: 1, imageCount: 0, otherFileCount: 1, referenceCount: 0 },
          preview: { text: '先看这份攻略' },
        },
      ],
      pagination: { page: 1, pageSize: 20, total: 21, totalPages: 2, hasNext: true },
    })

    await expect(listQuickTransferSentRecords()).resolves.toEqual({
      items: [
        {
          sentRecordId: 'sent-1',
          transferId: 'transfer-1',
          displayTitle: '旅行攻略',
          sentAt: '2026-08-27T10:00:00.000Z',
          status: 'ready',
          claimCount: 1,
          maxClaims: 3,
          expiresAt: '2026-08-27T11:00:00.000Z',
          canRecall: true,
          primaryType: 'mixed',
          summary: { hasText: true, linkCount: 2, fileCount: 1, imageCount: 0, otherFileCount: 1, referenceCount: 0 },
          preview: { text: '先看这份攻略', referenceTitle: undefined, linkTitle: undefined, fileName: undefined },
        },
      ],
      pagination: { page: 1, pageSize: 20, total: 21, totalPages: 2, hasNext: true },
    })
    expect(mocks.getQuickTransferSentRecords).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
  })

  it('consumes mixed image and file presentation metadata', async () => {
    mocks.getQuickTransferSentRecords.mockResolvedValue({
      items: [
        {
          sentRecordId: 'sent-mixed',
          transferId: 'transfer-mixed',
          displayTitle: '2 张图片 · 1 个文件',
          sentAt: '2026-08-27T10:00:00.000Z',
          status: 'ready',
          claimCount: 0,
          maxClaims: 1,
          canRecall: true,
          primaryType: 'mixed',
          summary: { hasText: false, linkCount: 0, fileCount: 3, imageCount: 2, otherFileCount: 1, referenceCount: 0 },
          preview: { fileName: 'random.jpeg' },
        },
      ],
      pagination: { page: 1, pageSize: 20, hasNext: false },
    })

    await expect(listQuickTransferSentRecords()).resolves.toMatchObject({
      items: [
        {
          primaryType: 'mixed',
          summary: { fileCount: 3, imageCount: 2, otherFileCount: 1 },
        },
      ],
    })
  })

  it('normalizes sent detail content and preserves file availability', async () => {
    mocks.getQuickTransferSentRecordsSentRecordId.mockResolvedValue({
      sentRecordId: 'sent-2',
      transferId: 'transfer-2',
      displayTitle: 'report.pdf',
      sentAt: '2026-08-27T10:00:00.000Z',
      status: 'consumed',
      claimCount: 3,
      maxClaims: 3,
      readyAt: '2026-08-27T10:01:00.000Z',
      consumedAt: '2026-08-27T10:02:00.000Z',
      canRecall: false,
      content: {
        text: '请查收',
        links: [{ title: '文档', url: 'https://example.com/report' }],
        references: [],
        files: [{ fileId: 'file-2', name: 'report.pdf', size: 1024, mimeType: 'application/pdf', available: false }],
      },
    })

    await expect(getQuickTransferSentRecord('sent-2')).resolves.toEqual({
      sentRecordId: 'sent-2',
      transferId: 'transfer-2',
      displayTitle: 'report.pdf',
      sentAt: '2026-08-27T10:00:00.000Z',
      status: 'consumed',
      claimCount: 3,
      maxClaims: 3,
      expiresAt: undefined,
      readyAt: '2026-08-27T10:01:00.000Z',
      consumedAt: '2026-08-27T10:02:00.000Z',
      cancelledAt: undefined,
      canRecall: false,
      content: {
        text: '请查收',
        links: [{ title: '文档', url: 'https://example.com/report' }],
        references: [],
        files: [{ fileId: 'file-2', name: 'report.pdf', size: 1024, mimeType: 'application/pdf', available: false }],
      },
    })
  })

  it('uses only sent-record access and delete endpoints', async () => {
    mocks.postQuickTransferSentRecordsFilesAccess.mockResolvedValue({
      url: 'https://signed.example/file',
      expiresAt: '2026-08-27T11:00:00.000Z',
    })
    mocks.deleteQuickTransferSentRecordsSentRecordId.mockResolvedValue({
      sentRecordId: 'sent-3',
      deletedAt: '2026-08-27T11:00:00.000Z',
    })

    await expect(accessQuickTransferSentRecordFile('sent-3', 'file-3')).resolves.toEqual({
      url: 'https://signed.example/file',
      expiresAt: '2026-08-27T11:00:00.000Z',
    })
    await expect(deleteQuickTransferSentRecord('sent-3')).resolves.toBe('sent-3')
    expect(mocks.postQuickTransferSentRecordsFilesAccess).toHaveBeenCalledWith({ sentRecordId: 'sent-3', fileId: 'file-3' })
    expect(mocks.deleteQuickTransferSentRecordsSentRecordId).toHaveBeenCalledWith('sent-3')
  })
})
