import { describe, expect, it } from 'vitest'
import {
  MAX_QUICK_TRANSFER_FILE_COUNT,
  MAX_QUICK_TRANSFER_FILE_SIZE,
  QUICK_TRANSFER_DEFAULT_MAX_CLAIMS,
  QUICK_TRANSFER_MAX_MAX_CLAIMS,
  QUICK_TRANSFER_MIN_MAX_CLAIMS,
  QUICK_TRANSFER_TTL_OPTIONS,
} from './constants'
import { getQuickTransferErrorMessage, isQuickTransferClaimResultUnknown, toQuickTransferReceiveErrorInfo } from './errors'
import { formatQuickTransferSummary, getQuickTransferFileStateLabel, getQuickTransferSendButtonLabel } from './presentation'
import {
  buildQuickTransferSharePath,
  canSendQuickTransfer,
  canTransitionQuickTransferSendState,
  createQuickShipDraft,
  createQuickShipFileDraft,
  formatQuickTransferExpiry,
  getQuickTransferMimeType,
  hasQuickShipContent,
  isQuickTransferDownloadValid,
  isValidQuickTransferMaxClaims,
  isQuickTransferTerminalStatus,
  isValidQuickTransferUrl,
  normalizeQuickTransferClaimCount,
  normalizeQuickTransferMaxClaims,
  normalizeQuickTransferCode,
  parseQuickTransferPageQuery,
  validateQuickTransferFile,
  validateQuickTransferFiles,
} from './helpers'

describe('quick transfer V2 helpers', () => {
  it('keeps the fixed TTL and content draft model', () => {
    expect(QUICK_TRANSFER_TTL_OPTIONS.map(option => option.value)).toEqual([600, 3600, 86400])
    const draft = createQuickShipDraft()
    expect(hasQuickShipContent(draft)).toBe(false)
    draft.text = 'hello'
    expect(hasQuickShipContent(draft)).toBe(true)
  })

  it('normalizes codes and accepts only http/https links', () => {
    expect(normalizeQuickTransferCode(' 12 34a56 ')).toBe('123456')
    expect(normalizeQuickTransferCode('1234567')).toBe('123456')
    expect(isValidQuickTransferUrl(' https://example.com/a ')).toBe(true)
    expect(isValidQuickTransferUrl('ftp://example.com')).toBe(false)
  })

  it('normalizes MIME and validates individual and aggregate files', () => {
    expect(validateQuickTransferFile(MAX_QUICK_TRANSFER_FILE_SIZE)).toBeNull()
    expect(validateQuickTransferFile(0)).toContain('不能为空')
    expect(getQuickTransferMimeType('photo.jpg', 'image')).toBe('image/jpeg')
    expect(getQuickTransferMimeType('photo.webp', 'image')).toBe('image/webp')
    expect(getQuickTransferMimeType('unknown.qtf')).toBe('application/octet-stream')
    const draftFile = createQuickShipFileDraft({ name: 'a.txt', path: '/tmp/a.txt', size: 12, type: 'file' })
    expect(draftFile.clientFileId).toContain('quick-file-')
    expect(validateQuickTransferFiles([draftFile])).toBeNull()
    expect(validateQuickTransferFiles(Array.from({ length: MAX_QUICK_TRANSFER_FILE_COUNT + 1 }, () => draftFile))).toContain('最多')
  })

  it('normalizes claim limits and send permissions', () => {
    expect(QUICK_TRANSFER_DEFAULT_MAX_CLAIMS).toBe(1)
    expect(QUICK_TRANSFER_MIN_MAX_CLAIMS).toBe(1)
    expect(QUICK_TRANSFER_MAX_MAX_CLAIMS).toBe(10)
    expect(isValidQuickTransferMaxClaims(1)).toBe(true)
    expect(isValidQuickTransferMaxClaims(11)).toBe(false)
    expect(normalizeQuickTransferMaxClaims('3')).toBe(3)
    expect(normalizeQuickTransferClaimCount('2')).toBe(2)
    expect(canSendQuickTransfer(false, false)).toBe(false)
    expect(canSendQuickTransfer(true, false)).toBe(true)
  })

  it('covers state transitions, expiry and share parsing', () => {
    expect(canTransitionQuickTransferSendState('uploading', 'completing')).toBe(true)
    expect(isQuickTransferTerminalStatus('consumed')).toBe(true)
    expect(isQuickTransferDownloadValid(new Date(10_000).toISOString(), 9_000)).toBe(true)
    expect(formatQuickTransferExpiry(new Date(10 * 60_000).toISOString(), 0)).toBe('10 分钟后返航')
    expect(formatQuickTransferExpiry(new Date(2 * 60 * 60_000 + 30 * 60_000).toISOString(), 0)).toBe('2 小时 30 分钟后返航')
    expect(parseQuickTransferPageQuery({ mode: 'receive', shareToken: ' token ' })).toEqual({ mode: 'receive', shareToken: 'token' })
    expect(buildQuickTransferSharePath('a/b')).toContain('shareToken=a%2Fb')
  })

  it('keeps V2 error fields and file progress copy independent', () => {
    expect(getQuickTransferErrorMessage({ data: { reason: 'UPLOAD_PROBE_TEMPORARILY_UNAVAILABLE' } })).toBe('文件校验暂时失败，请重新校验')
    expect(
      getQuickTransferErrorMessage({
        code: 503,
        statusCode: 503,
        data: { code: 503, data: { reason: 'QUICK_TRANSFER_NOT_CONFIGURED' } },
      }),
    ).toBe('飞船服务尚未完成配置，请联系管理员')
    expect(formatQuickTransferSummary({ hasText: true, linkCount: 2, fileCount: 3, referenceCount: 1 })).toBe(
      '留言、2 个链接、3 个文件、1 个引用',
    )
    expect(toQuickTransferReceiveErrorInfo({ error: { data: { code: 'TRANSFER_NOT_AVAILABLE' } } })).toEqual({
      code: 'TRANSFER_NOT_AVAILABLE',
      message: '这艘飞船已经不在了',
    })
    expect(getQuickTransferSendButtonLabel('uploading', 38)).toBe('正在装船 38%')
    expect(getQuickTransferFileStateLabel({ clientFileId: 'f', name: 'a', size: 1, mimeType: 'text/plain', uploadState: 'ready' })).toBe(
      '已完成 ✓',
    )
    expect(getQuickTransferErrorMessage({ data: { code: 'QUICK_TRANSFER_RECEIPT_FILE_NOT_AVAILABLE' } })).toBe('文件已经过期')
    expect(isQuickTransferClaimResultUnknown({ code: 'NETWORK_ERROR' })).toBe(true)
    expect(isQuickTransferClaimResultUnknown({ statusCode: 503 })).toBe(true)
    expect(isQuickTransferClaimResultUnknown({ statusCode: 400 })).toBe(false)
  })
})
