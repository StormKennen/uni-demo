import { describe, expect, it } from 'vitest'
import { normalizeQuickTransferInspectResult, normalizeQuickTransferResolvedResult } from './response'

describe('quick transfer V2 response adapter', () => {
  it('normalizes the fixed content order and file MIME', () => {
    expect(
      normalizeQuickTransferResolvedResult({
        transferId: 'transfer-1',
        claimId: 'claim-id-1',
        receiptId: 'receipt-1',
        claimToken: 'claim-1',
        expiresAt: undefined,
        content: {
          text: 'hello',
          links: [{ title: 'Docs', url: 'https://example.com' }],
          files: [{ fileId: 'file-1', name: 'photo.jpg', size: 12, mimeType: 'image' }],
          references: [{ type: 'memoDetail', resourceId: 'memo-1', title: '旅行计划' }],
        },
      }),
    ).toEqual({
      transferId: 'transfer-1',
      claimId: 'claim-id-1',
      receiptId: 'receipt-1',
      claimToken: 'claim-1',
      expiresAt: undefined,
      content: {
        text: 'hello',
        links: [{ title: 'Docs', url: 'https://example.com' }],
        files: [{ fileId: 'file-1', name: 'photo.jpg', size: 12, mimeType: 'image/jpeg' }],
        references: [{ type: 'memoDetail', resourceId: 'memo-1', title: '旅行计划', subtitle: undefined, params: undefined }],
      },
    })
  })

  it('unwraps the generated response data envelope', () => {
    expect(
      normalizeQuickTransferResolvedResult({
        data: {
          transferId: 'transfer-2',
          claimId: 'claim-id-2',
          receiptId: undefined,
          claimToken: 'claim-2',
          expiresAt: undefined,
          content: { links: [], files: [], references: [] },
        },
      }),
    ).toEqual({
      transferId: 'transfer-2',
      claimId: 'claim-id-2',
      receiptId: undefined,
      claimToken: 'claim-2',
      expiresAt: undefined,
      content: { text: undefined, links: [], files: [], references: [] },
    })
  })

  it('allows a claim without a token when there are no files', () => {
    expect(
      normalizeQuickTransferResolvedResult({
        transferId: 'transfer-text',
        claimId: 'claim-id-text',
        content: { text: 'hello', links: [], files: [], references: [] },
      }),
    ).toEqual({
      transferId: 'transfer-text',
      claimId: 'claim-id-text',
      receiptId: undefined,
      claimToken: undefined,
      expiresAt: undefined,
      content: { text: 'hello', links: [], files: [], references: [] },
    })
  })

  it('rejects a file claim without a claim token', () => {
    expect(() =>
      normalizeQuickTransferResolvedResult({
        transferId: 'transfer-file',
        claimId: 'claim-id-file',
        content: { links: [], files: [{ fileId: 'file-1', name: 'a.txt', size: 1 }], references: [] },
      }),
    ).toThrow('claimToken')
  })

  it('normalizes the V2 inspect summary field names', () => {
    expect(
      normalizeQuickTransferInspectResult({
        data: {
          expiresAt: '2026-08-26T02:00:00.000Z',
          remainingClaims: 2,
          summary: { hasText: true, linkCount: 2, fileCount: 3, imageCount: 2, otherFileCount: 1, referenceCount: 1 },
        },
      }),
    ).toEqual({
      transferId: undefined,
      expiresAt: '2026-08-26T02:00:00.000Z',
      remainingClaims: 2,
      summary: { hasText: true, linkCount: 2, fileCount: 3, imageCount: 2, otherFileCount: 1, referenceCount: 1 },
    })
  })

  it('accepts legacy inspect summary aliases as a fallback', () => {
    expect(
      normalizeQuickTransferInspectResult({
        expiresAt: '2026-08-26T02:00:00.000Z',
        summary: { hasText: false, links: 1, files: 2, references: 0 },
      }).summary,
    ).toEqual({ hasText: false, linkCount: 1, fileCount: 2, imageCount: 0, otherFileCount: 2, referenceCount: 0 })
  })

  it('preserves receipt metadata and optional expiry', () => {
    expect(
      normalizeQuickTransferResolvedResult({
        transferId: 'transfer-3',
        claimId: 'claim-id-3',
        receiptId: 'receipt-3',
        expiresAt: '2026-08-26T03:00:00.000Z',
        content: { links: [], files: [], references: [] },
      }),
    ).toMatchObject({
      transferId: 'transfer-3',
      claimId: 'claim-id-3',
      receiptId: 'receipt-3',
      expiresAt: '2026-08-26T03:00:00.000Z',
    })
  })
})
