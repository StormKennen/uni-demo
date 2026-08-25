import { describe, expect, it } from 'vitest'
import { normalizeQuickTransferResolvedResult } from './response'

describe('quick transfer V2 response adapter', () => {
  it('normalizes the fixed content order and file MIME', () => {
    expect(
      normalizeQuickTransferResolvedResult({
        transferId: 'transfer-1',
        claimToken: 'claim-1',
        content: {
          text: 'hello',
          links: [{ title: 'Docs', url: 'https://example.com' }],
          files: [{ fileId: 'file-1', name: 'photo.jpg', size: 12, mimeType: 'image' }],
          references: [{ type: 'memoDetail', resourceId: 'memo-1', title: '旅行计划' }],
        },
      }),
    ).toEqual({
      transferId: 'transfer-1',
      claimToken: 'claim-1',
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
          claimToken: 'claim-2',
          content: { links: [], files: [], references: [] },
        },
      }),
    ).toEqual({
      transferId: 'transfer-2',
      claimToken: 'claim-2',
      content: { text: undefined, links: [], files: [], references: [] },
    })
  })
})
