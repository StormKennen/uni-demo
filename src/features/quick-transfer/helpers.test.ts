import { describe, expect, it } from 'vitest'
import {
  MAX_QUICK_TRANSFER_FILE_COUNT,
  MAX_QUICK_TRANSFER_FILE_SIZE,
  QUICK_TRANSFER_DEFAULT_MAX_CLAIMS,
  QUICK_TRANSFER_MAX_MAX_CLAIMS,
  QUICK_TRANSFER_MIN_MAX_CLAIMS,
  QUICK_TRANSFER_RECEIPTS_ROUTE,
  QUICK_TRANSFER_SENT_RECORDS_ROUTE,
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
  createQuickTransferDefaultDisplayName,
  extractQuickTransferCode,
  formatQuickTransferExpiry,
  getQuickTransferIndexRedirectRoute,
  getQuickTransferMimeType,
  getFileExtension,
  getFileNameBase,
  getFinalQuickTransferDisplayName,
  hasQuickShipContent,
  hasQuickShipPayload,
  isQuickTransferDownloadValid,
  isValidQuickTransferCode,
  isValidQuickTransferMaxClaims,
  isQuickTransferTerminalStatus,
  isValidQuickTransferTitle,
  isValidQuickTransferUrl,
  normalizeQuickTransferClaimCount,
  normalizeQuickTransferMaxClaims,
  normalizeQuickTransferCode,
  normalizeQuickTransferCodeInput,
  normalizeQuickTransferDisplayName,
  normalizeQuickTransferTitle,
  parseQuickTransferPageQuery,
  restoreQuickTransferDisplayName,
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

  it('normalizes and validates the optional ship title independently from its content', () => {
    expect(normalizeQuickTransferTitle(' 项目资料 ')).toBe('项目资料')
    expect(normalizeQuickTransferTitle('     ')).toBe('')
    expect(isValidQuickTransferTitle('项目资料')).toBe(true)
    expect(isValidQuickTransferTitle('     ')).toBe(true)
    expect(isValidQuickTransferTitle('a'.repeat(41))).toBe(false)
    const titleOnlyDraft = createQuickShipDraft()
    titleOnlyDraft.title = '只有标题'
    expect(hasQuickShipContent(titleOnlyDraft)).toBe(false)
    expect(hasQuickShipPayload(titleOnlyDraft)).toBe(true)
    expect(hasQuickShipPayload(createQuickShipDraft())).toBe(false)
  })

  it('extracts labeled or standalone codes without letting English labels win', () => {
    expect(normalizeQuickTransferCodeInput(' ab 12 cd ')).toBe('AB12CD')
    expect(normalizeQuickTransferCode(' 12 34a56 ')).toBe('1234A5')
    expect(normalizeQuickTransferCode('1234567')).toBe('123456')
    expect(extractQuickTransferCode('583921')).toBe('583921')
    expect(extractQuickTransferCode('飞船码：583921')).toBe('583921')
    expect(extractQuickTransferCode('飞船码: 583921')).toBe('583921')
    expect(extractQuickTransferCode('请使用飞船码 583921 领取')).toBe('583921')
    expect(extractQuickTransferCode('583 921')).toBe('583921')
    expect(extractQuickTransferCode('Quick Transfer Code: ab12cd')).toBe('AB12CD')
    expect(isValidQuickTransferCode('飞船码：583921')).toBe(true)
    expect(isValidQuickTransferCode('飞船码：AB12CD')).toBe(false)
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
    expect(draftFile.defaultDisplayName).toMatch(/^\d{8}_\d{6}_01\.txt$/)
    expect(draftFile.displayName).toBe(draftFile.defaultDisplayName)
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
    expect(isQuickTransferDownloadValid(new Date(10_000).toISOString(), 10_000)).toBe(false)
    expect(formatQuickTransferExpiry(new Date(10 * 60_000).toISOString(), 0)).toBe('10 分钟后返航')
    expect(formatQuickTransferExpiry(new Date(2 * 60 * 60_000 + 30 * 60_000).toISOString(), 0)).toBe('2 小时 30 分钟后返航')
    expect(parseQuickTransferPageQuery({ mode: 'receive', shareToken: ' token ' })).toEqual({ mode: 'receive', shareToken: 'token' })
    expect(getQuickTransferIndexRedirectRoute('sent')).toBe(QUICK_TRANSFER_SENT_RECORDS_ROUTE)
    expect(getQuickTransferIndexRedirectRoute('received')).toBe(QUICK_TRANSFER_RECEIPTS_ROUTE)
    expect(getQuickTransferIndexRedirectRoute('operation')).toBeUndefined()
    expect(buildQuickTransferSharePath('a/b')).toBe('/subPackages/tools/quick-transfer/receive/index?shareToken=a%2Fb')
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
    expect(
      formatQuickTransferSummary({ hasText: true, linkCount: 2, fileCount: 3, imageCount: 0, otherFileCount: 3, referenceCount: 1 }),
    ).toBe('留言、2 个链接、3 个文件、1 个引用')
    expect(toQuickTransferReceiveErrorInfo({ error: { data: { code: 'TRANSFER_NOT_AVAILABLE' } } })).toEqual({
      code: 'TRANSFER_NOT_AVAILABLE',
      message: '这艘飞船已经不在了',
    })
    expect(getQuickTransferSendButtonLabel('idle', null)).toBe('发送飞船')
    expect(getQuickTransferSendButtonLabel('uploading', 38)).toBe('正在装船 38%')
    expect(
      getQuickTransferFileStateLabel({
        clientFileId: 'f',
        name: 'a',
        defaultDisplayName: 'default.txt',
        displayName: 'default.txt',
        size: 1,
        mimeType: 'text/plain',
        uploadState: 'ready',
      }),
    ).toBe('已完成 ✓')
    expect(getQuickTransferErrorMessage({ data: { code: 'QUICK_TRANSFER_RECEIPT_FILE_NOT_AVAILABLE' } })).toBe('文件已经过期')
    expect(isQuickTransferClaimResultUnknown({ code: 'NETWORK_ERROR' })).toBe(true)
    expect(isQuickTransferClaimResultUnknown({ statusCode: 503 })).toBe(true)
    expect(isQuickTransferClaimResultUnknown({ statusCode: 400 })).toBe(false)
  })

  it('creates stable editable display names with locked extensions', () => {
    const selectedAt = new Date(2026, 8, 1, 19, 47, 35)
    expect(createQuickTransferDefaultDisplayName('tmp_a.jpg', 'image/jpeg', selectedAt, 1)).toBe('20260901_194735_01.jpg')
    expect(createQuickTransferDefaultDisplayName('tmp_b.pdf', 'application/pdf', selectedAt, 2)).toBe('20260901_194735_02.pdf')
    expect(getFileExtension('营业执照.JPG')).toBe('.jpg')
    expect(getFileNameBase('营业执照.JPG')).toBe('营业执照')
    expect(normalizeQuickTransferDisplayName(' 营业/执照.pdf ', '.jpg')).toBe('营业执照.jpg')
    expect(normalizeQuickTransferDisplayName('.jpg', '.jpg')).toBe('')
    const file = { defaultDisplayName: '20260901_194735_01.jpg', displayName: '.jpg' }
    expect(restoreQuickTransferDisplayName(file)).toBe(file.defaultDisplayName)
    expect(getFinalQuickTransferDisplayName({ name: 'tmp.jpg', ...file })).toBe(file.defaultDisplayName)
  })
})
