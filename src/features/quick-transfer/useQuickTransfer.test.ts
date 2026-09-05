import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQuickShipDraft } from './helpers'
import type {
  QuickShipDraft,
  QuickTransferCreateResult,
  QuickTransferResolvedResult,
  QuickTransferSendResultContext,
  QuickTransferStatusResult,
} from './types'

const mocks = vi.hoisted(() => ({
  createQuickTransfer: vi.fn(),
  completeQuickTransferFile: vi.fn(),
  getQuickTransferStatus: vi.fn(),
  refreshQuickTransferUploadPolicy: vi.fn(),
  resolveQuickTransfer: vi.fn(),
  accessQuickTransferFile: vi.fn(),
  cancelQuickTransfer: vi.fn(),
  inspectQuickTransferShare: vi.fn(),
  uploadFileDirect: vi.fn(),
  downloadFileToLocal: vi.fn(),
  logFileOperationFailure: vi.fn(),
  previewLocalImage: vi.fn(),
  saveLocalFile: vi.fn(),
}))

vi.mock('./api', () => ({
  accessQuickTransferFile: mocks.accessQuickTransferFile,
  cancelQuickTransfer: mocks.cancelQuickTransfer,
  completeQuickTransferFile: mocks.completeQuickTransferFile,
  createQuickTransfer: mocks.createQuickTransfer,
  getQuickTransferStatus: mocks.getQuickTransferStatus,
  inspectQuickTransferShare: mocks.inspectQuickTransferShare,
  refreshQuickTransferUploadPolicy: mocks.refreshQuickTransferUploadPolicy,
  resolveQuickTransfer: mocks.resolveQuickTransfer,
}))

vi.mock(
  '@/platform/file',
  () => ({
    FileOperationError: class FileOperationError extends Error {},
    downloadFileToLocal: mocks.downloadFileToLocal,
    logFileOperationFailure: mocks.logFileOperationFailure,
    previewLocalImage: mocks.previewLocalImage,
    saveLocalFile: mocks.saveLocalFile,
    uploadFileDirect: mocks.uploadFileDirect,
  }),
  { virtual: true },
)

import { useQuickTransfer } from './useQuickTransfer'

const status = (transferId: string, statusValue: QuickTransferStatusResult['status']): QuickTransferStatusResult => ({
  transferId,
  status: statusValue,
  claimCount: 0,
  maxClaims: 1,
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
})

const createResult = (fileCount: number): QuickTransferCreateResult => ({
  title: '项目资料',
  code: '123456',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  shareToken: 'share-1',
  status: 'uploading',
  transferId: 'transfer-1',
  claimCount: 0,
  maxClaims: 1,
  uploads: Array.from({ length: fileCount }, (_, index) => ({
    clientFileId: `file-${index + 1}`,
    fileId: `server-file-${index + 1}`,
    method: 'POST' as const,
    url: `https://oss.example/${index + 1}`,
    fileField: 'file',
    fields: {},
    successStatus: 201,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  })),
})

const createDraft = (fileCount: number): QuickShipDraft => {
  const draft = createQuickShipDraft()
  draft.title = '项目资料'
  draft.text = 'hello'
  draft.files = Array.from({ length: fileCount }, (_, index) => ({
    clientFileId: `file-${index + 1}`,
    name: `file-${index + 1}.txt`,
    defaultDisplayName: `default-${index + 1}.txt`,
    displayName: `default-${index + 1}.txt`,
    size: 1,
    mimeType: 'text/plain',
    selectedFile: { name: `file-${index + 1}.txt`, path: `/tmp/file-${index + 1}.txt`, size: 1, type: 'text/plain' },
    uploadState: 'pending' as const,
  }))
  return draft
}

const uploadSuccess = () => ({
  promise: Promise.resolve({ statusCode: 201 }),
  abort: vi.fn(),
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('uni', { showToast: vi.fn() })
  mocks.completeQuickTransferFile.mockImplementation((transferId: string) => Promise.resolve(status(transferId, 'uploading')))
  mocks.getQuickTransferStatus.mockImplementation((transferId: string) => Promise.resolve(status(transferId, 'ready')))
  mocks.uploadFileDirect.mockImplementation(() => uploadSuccess())
  mocks.downloadFileToLocal.mockResolvedValue({
    path: '/tmp/received-file',
    isRemote: false,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  })
  mocks.previewLocalImage.mockResolvedValue(true)
  mocks.saveLocalFile.mockResolvedValue(true)
})

describe('useQuickTransfer upload recovery', () => {
  it('allows an empty title when content exists and omits it from the create payload', async () => {
    const draft = createDraft(0)
    const quickTransfer = useQuickTransfer()
    draft.title = '   '

    mocks.createQuickTransfer.mockResolvedValue(createResult(0))
    expect(await quickTransfer.send(draft)).toBe(true)
    expect(mocks.createQuickTransfer).toHaveBeenCalledWith(expect.not.objectContaining({ title: expect.anything() }))

    const titledDraft = createDraft(0)
    titledDraft.title = ' 项目交接资料 '
    const titledTransfer = useQuickTransfer()
    expect(await titledTransfer.send(titledDraft)).toBe(true)
    expect(mocks.createQuickTransfer).toHaveBeenCalledWith(
      expect.objectContaining({ title: '项目交接资料', content: expect.objectContaining({ text: 'hello' }) }),
    )
  })

  it('allows a title-only ship without content', async () => {
    const draft = createDraft(0)
    draft.text = ''
    mocks.createQuickTransfer.mockResolvedValue(createResult(0))

    const quickTransfer = useQuickTransfer()

    expect(await quickTransfer.send(draft)).toBe(true)
    expect(mocks.createQuickTransfer).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '项目资料',
        content: { text: undefined, links: [], files: [], references: [] },
      }),
    )
  })

  it('sends the editable display name while retaining original file metadata', async () => {
    const draft = createDraft(1)
    draft.title = ''
    draft.text = ''
    draft.files[0]!.name = 'tmp_a83f92.jpg'
    draft.files[0]!.defaultDisplayName = '20260901_194735_01.jpg'
    draft.files[0]!.displayName = '营业执照.jpg'
    mocks.createQuickTransfer.mockResolvedValue(createResult(1))

    const quickTransfer = useQuickTransfer()
    expect(await quickTransfer.send(draft)).toBe(true)
    expect(mocks.createQuickTransfer).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          files: [expect.objectContaining({ name: 'tmp_a83f92.jpg', displayName: '营业执照.jpg' })],
        }),
      }),
    )
    expect(mocks.createQuickTransfer.mock.calls.slice(-1)[0]?.[0]).not.toHaveProperty('title')
  })

  it('continues the queue after multiple files fail and retries only failed files', async () => {
    const draft = createDraft(4)
    mocks.createQuickTransfer.mockResolvedValue(createResult(4))
    mocks.uploadFileDirect.mockImplementationOnce(() => ({ promise: Promise.reject(new Error('A failed')), abort: vi.fn() }))
    mocks.uploadFileDirect.mockImplementationOnce(() => ({ promise: Promise.reject(new Error('B failed')), abort: vi.fn() }))

    const quickTransfer = useQuickTransfer()
    expect(await quickTransfer.send(draft)).toBe(false)
    expect(draft.files.map(file => file.uploadState)).toEqual(['error', 'error', 'ready', 'ready'])

    mocks.refreshQuickTransferUploadPolicy.mockResolvedValue(createResult(1).uploads[0])
    expect(await quickTransfer.retryUpload(draft)).toBe(true)
    expect(mocks.refreshQuickTransferUploadPolicy).toHaveBeenCalledTimes(2)
    expect(mocks.refreshQuickTransferUploadPolicy).toHaveBeenCalledWith('transfer-1', 'server-file-1', 'file-1')
    expect(mocks.refreshQuickTransferUploadPolicy).toHaveBeenCalledWith('transfer-1', 'server-file-2', 'file-2')
    expect(draft.files.every(file => file.uploadState === 'ready')).toBe(true)
  })

  it('does not complete a file that is still pending', async () => {
    const draft = createDraft(2)
    mocks.createQuickTransfer.mockResolvedValue(createResult(2))
    mocks.uploadFileDirect
      .mockImplementationOnce(() => uploadSuccess())
      .mockImplementationOnce(() => ({
        promise: Promise.reject(new Error('B failed')),
        abort: vi.fn(),
      }))

    const quickTransfer = useQuickTransfer()
    await quickTransfer.send(draft)
    draft.files[0].uploadState = 'pending'
    mocks.completeQuickTransferFile.mockClear()
    await quickTransfer.retryComplete(draft)

    expect(mocks.completeQuickTransferFile).not.toHaveBeenCalledWith('transfer-1', 'server-file-1', expect.any(String))
  })
})

describe('useQuickTransfer receiver recovery', () => {
  it('hydrates a live sender ticket without persisting its credentials', () => {
    const context: QuickTransferSendResultContext = {
      title: '项目资料',
      transferId: 'transfer-1',
      code: '123456',
      shareToken: 'share-1',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      claimCount: 1,
      maxClaims: 3,
      status: 'ready',
    }
    const quickTransfer = useQuickTransfer()

    quickTransfer.initializeSendResult(context)
    expect(quickTransfer.sendState.value).toBe('ready')
    expect(quickTransfer.transferId.value).toBe(context.transferId)
    expect(quickTransfer.code.value).toBe(context.code)
    expect(quickTransfer.shareToken.value).toBe(context.shareToken)
    expect(quickTransfer.senderStatus.value?.claimCount).toBe(1)
    quickTransfer.pauseTimers()
  })

  it('does not resolve again automatically after a claim token expires', async () => {
    const result: QuickTransferResolvedResult = {
      title: '附件资料',
      transferId: 'transfer-1',
      claimId: 'claim-id-1',
      receiptId: 'receipt-1',
      claimToken: 'claim-1',
      content: {
        text: undefined,
        links: [],
        files: [{ fileId: 'file-1', name: 'a.txt', displayName: 'a.txt', size: 1, mimeType: 'text/plain' }],
        references: [],
      },
    }
    mocks.resolveQuickTransfer.mockResolvedValue(result)
    mocks.accessQuickTransferFile.mockRejectedValue({ data: { code: 'CLAIM_TOKEN_EXPIRED' } })
    const quickTransfer = useQuickTransfer()

    expect(await quickTransfer.receive({ code: '123456' })).toBe(true)
    expect(await quickTransfer.downloadReceivedFile('file-1')).toBe(false)
    expect(mocks.resolveQuickTransfer).toHaveBeenCalledTimes(1)
    expect(quickTransfer.receiveError.value).toEqual({ code: 'CLAIM_TOKEN_EXPIRED', message: '文件访问凭证已失效' })
  })

  it('uses separate preview and download chains for preview and save actions', async () => {
    const result: QuickTransferResolvedResult = {
      title: '图片资料',
      transferId: 'transfer-1',
      claimId: 'claim-id-1',
      claimToken: 'claim-1',
      content: {
        text: undefined,
        links: [],
        files: [{ fileId: 'image-1', name: 'photo.jpg', displayName: '产品截图.jpg', size: 1, mimeType: 'image/jpeg' }],
        references: [],
      },
    }
    mocks.resolveQuickTransfer.mockResolvedValue(result)
    mocks.accessQuickTransferFile.mockResolvedValue({
      url: 'https://signed.example/image',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    })
    const quickTransfer = useQuickTransfer()

    expect(await quickTransfer.receive({ code: '123456' })).toBe(true)
    expect(await quickTransfer.previewReceivedFile('image-1')).toBe('/tmp/received-file')
    expect(await quickTransfer.previewReceivedFile('image-1')).toBe('/tmp/received-file')
    expect(await quickTransfer.downloadReceivedFile('image-1')).toBe(true)
    expect(mocks.accessQuickTransferFile).toHaveBeenCalledTimes(2)
    expect(mocks.accessQuickTransferFile).toHaveBeenNthCalledWith(1, 'transfer-1', 'image-1', 'claim-1', 'preview')
    expect(mocks.accessQuickTransferFile).toHaveBeenNthCalledWith(2, 'transfer-1', 'image-1', 'claim-1', 'download')
    expect(mocks.downloadFileToLocal).toHaveBeenCalledTimes(2)
    expect(mocks.saveLocalFile).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/tmp/received-file' }),
      expect.objectContaining({ fileName: '产品截图.jpg', mimeType: 'image/jpeg' }),
    )
  })

  it('clears an inspect result when the last receive is taken first', async () => {
    mocks.inspectQuickTransferShare.mockResolvedValue({
      transferId: 'transfer-1',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      remainingClaims: 1,
      summary: { hasText: true, linkCount: 0, fileCount: 0, imageCount: 0, otherFileCount: 0, referenceCount: 0 },
    })
    mocks.resolveQuickTransfer.mockRejectedValue({ error: { data: { code: 'TRANSFER_NOT_AVAILABLE' } } })
    const quickTransfer = useQuickTransfer()

    expect(await quickTransfer.inspectShare('share-1')).toBe(true)
    expect(quickTransfer.inspectResult.value).not.toBeNull()
    expect(await quickTransfer.receive({ shareToken: 'share-1' })).toBe(false)
    expect(quickTransfer.inspectResult.value).toBeNull()
    expect(quickTransfer.receiveError.value?.code).toBe('TRANSFER_NOT_AVAILABLE')
  })

  it('reuses the claim request id after an unknown resolve result', async () => {
    const result: QuickTransferResolvedResult = {
      title: '文本资料',
      transferId: 'transfer-1',
      claimId: 'claim-id-1',
      content: { text: 'hello', links: [], files: [], references: [] },
    }
    mocks.resolveQuickTransfer.mockRejectedValueOnce({ code: 'NETWORK_ERROR' }).mockResolvedValueOnce(result)
    const quickTransfer = useQuickTransfer()

    expect(await quickTransfer.receive({ code: '123456' })).toBe(false)
    const firstRequest = mocks.resolveQuickTransfer.mock.calls[0]?.[0]
    expect(firstRequest.claimRequestId).toMatch(/^qcr_[0-9a-f-]{36}$/)
    expect(await quickTransfer.receive({ code: '123456' })).toBe(true)
    expect(mocks.resolveQuickTransfer.mock.calls[1]?.[0].claimRequestId).toBe(firstRequest.claimRequestId)
    expect(quickTransfer.activeClaimRequestId.value).toBeNull()
  })

  it('keeps the same request id when resetReceive is used after an unknown result', async () => {
    const result: QuickTransferResolvedResult = {
      title: '文本资料',
      transferId: 'transfer-1',
      claimId: 'claim-id-1',
      content: { text: 'hello', links: [], files: [], references: [] },
    }
    mocks.resolveQuickTransfer.mockRejectedValueOnce({ code: 'NETWORK_ERROR' }).mockResolvedValueOnce(result).mockResolvedValueOnce(result)
    const quickTransfer = useQuickTransfer()

    expect(await quickTransfer.receive({ code: '123456' })).toBe(false)
    const firstRequestId = quickTransfer.activeClaimRequestId.value
    quickTransfer.resetReceive()
    expect(quickTransfer.activeClaimRequestId.value).toBe(firstRequestId)
    expect(await quickTransfer.receive({ code: '123456' })).toBe(true)
    expect(mocks.resolveQuickTransfer.mock.calls[1]?.[0].claimRequestId).toBe(firstRequestId)
    expect(quickTransfer.activeClaimRequestId.value).toBeNull()

    quickTransfer.resetReceive()
    expect(await quickTransfer.receive({ code: '123456' })).toBe(true)
    expect(mocks.resolveQuickTransfer.mock.calls[2]?.[0].claimRequestId).not.toBe(firstRequestId)
  })

  it('reuses the request id after HTTP 408 and 5xx responses', async () => {
    for (const statusCode of [408, 500, 502, 503, 504]) {
      const result: QuickTransferResolvedResult = {
        title: '文本资料',
        transferId: 'transfer-1',
        claimId: 'claim-id-1',
        content: { text: 'hello', links: [], files: [], references: [] },
      }
      mocks.resolveQuickTransfer.mockReset()
      mocks.resolveQuickTransfer.mockRejectedValueOnce({ code: statusCode, statusCode }).mockResolvedValueOnce(result)
      const quickTransfer = useQuickTransfer()

      expect(await quickTransfer.receive({ code: '123456' })).toBe(false)
      const firstRequestId = quickTransfer.activeClaimRequestId.value
      quickTransfer.resetReceive()
      expect(await quickTransfer.receive({ code: '123456' })).toBe(true)
      expect(mocks.resolveQuickTransfer.mock.calls[1]?.[0].claimRequestId).toBe(firstRequestId)
    }
  })

  it('creates a new request id when a share token changes after an unknown result', async () => {
    const result: QuickTransferResolvedResult = {
      title: '文本资料',
      transferId: 'transfer-2',
      claimId: 'claim-id-2',
      content: { text: 'hello', links: [], files: [], references: [] },
    }
    mocks.resolveQuickTransfer.mockRejectedValueOnce({ code: 'TIMEOUT' }).mockResolvedValueOnce(result)
    const quickTransfer = useQuickTransfer()

    expect(await quickTransfer.receive({ shareToken: 'share-a' })).toBe(false)
    const firstRequestId = quickTransfer.activeClaimRequestId.value
    expect(await quickTransfer.receive({ shareToken: 'share-b' })).toBe(true)
    expect(mocks.resolveQuickTransfer.mock.calls[1]?.[0].claimRequestId).not.toBe(firstRequestId)
  })

  it('creates a new claim request id after a definite failure or for a new code', async () => {
    mocks.resolveQuickTransfer
      .mockRejectedValueOnce({ error: { data: { code: 'TRANSFER_NOT_AVAILABLE' } } })
      .mockRejectedValueOnce({ error: { data: { code: 'TRANSFER_NOT_AVAILABLE' } } })
    const quickTransfer = useQuickTransfer()

    expect(await quickTransfer.receive({ code: '123456' })).toBe(false)
    expect(await quickTransfer.receive({ code: '654321' })).toBe(false)
    const firstRequest = mocks.resolveQuickTransfer.mock.calls[0]?.[0]
    const secondRequest = mocks.resolveQuickTransfer.mock.calls[1]?.[0]
    expect(firstRequest.claimRequestId).not.toBe(secondRequest.claimRequestId)
  })
})
