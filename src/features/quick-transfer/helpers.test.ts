import { describe, expect, it } from 'vitest'
import {
  QUICK_TRANSFER_DEFAULT_MAX_CLAIMS,
  QUICK_TRANSFER_MAX_MAX_CLAIMS,
  QUICK_TRANSFER_MIN_MAX_CLAIMS,
  QUICK_TRANSFER_TTL_OPTIONS,
} from './constants'
import { getQuickTransferErrorMessage } from './errors'
import { getQuickTransferSharePayload } from './share'
import {
  buildQuickTransferSharePath,
  canSendQuickTransfer,
  canTransitionQuickTransferSendState,
  createQuickTransferFileMetadata,
  getQuickTransferMimeType,
  isQuickTransferDownloadValid,
  isValidQuickTransferMaxClaims,
  isQuickTransferTerminalStatus,
  isValidQuickTransferUrl,
  normalizeQuickTransferClaimCount,
  normalizeQuickTransferMaxClaims,
  normalizeQuickTransferCode,
  parseQuickTransferPageQuery,
  validateQuickTransferFile,
} from './helpers'

describe('quick transfer helpers', () => {
  it('exposes only the supported TTL options', () => {
    expect(QUICK_TRANSFER_TTL_OPTIONS.map(option => option.value)).toEqual([600, 3600, 86400])
  })

  it('normalizes a six digit code without auto-submitting', () => {
    expect(normalizeQuickTransferCode(' 12 34a56 ')).toBe('123456')
    expect(normalizeQuickTransferCode('1234567')).toBe('123456')
  })

  it('accepts only http and https URLs', () => {
    expect(isValidQuickTransferUrl(' https://example.com/a ')).toBe(true)
    expect(isValidQuickTransferUrl('ftp://example.com')).toBe(false)
    expect(isValidQuickTransferUrl('example.com')).toBe(false)
  })

  it('enforces the 50 MiB file limit and keeps MIME fallback local', () => {
    expect(validateQuickTransferFile(50 * 1024 * 1024)).toBeNull()
    expect(validateQuickTransferFile(50 * 1024 * 1024 + 1)).toContain('50 MiB')
    expect(getQuickTransferMimeType('report.pdf')).toBe('application/pdf')
    expect(getQuickTransferMimeType('unknown.qtf')).toBe('application/octet-stream')
    expect(createQuickTransferFileMetadata('report.pdf', 12)).toMatchObject({ name: 'report.pdf', size: 12, mimeType: 'application/pdf' })
  })

  it('normalizes the 1 to 10 claim limit and non-negative claim count', () => {
    expect(QUICK_TRANSFER_DEFAULT_MAX_CLAIMS).toBe(1)
    expect(QUICK_TRANSFER_MIN_MAX_CLAIMS).toBe(1)
    expect(QUICK_TRANSFER_MAX_MAX_CLAIMS).toBe(10)
    expect(isValidQuickTransferMaxClaims(1)).toBe(true)
    expect(isValidQuickTransferMaxClaims(10)).toBe(true)
    expect(isValidQuickTransferMaxClaims(0)).toBe(false)
    expect(isValidQuickTransferMaxClaims(-1)).toBe(false)
    expect(isValidQuickTransferMaxClaims(11)).toBe(false)
    expect(isValidQuickTransferMaxClaims(1.5)).toBe(false)
    expect(isValidQuickTransferMaxClaims(Number.NaN)).toBe(false)
    expect(isValidQuickTransferMaxClaims(Number.POSITIVE_INFINITY)).toBe(false)
    expect(normalizeQuickTransferMaxClaims('3')).toBe(3)
    expect(normalizeQuickTransferMaxClaims('')).toBe(1)
    expect(normalizeQuickTransferClaimCount('2')).toBe(2)
    expect(normalizeQuickTransferClaimCount(-1)).toBe(0)
  })

  it('covers send state transitions and terminal sender states', () => {
    expect(canTransitionQuickTransferSendState('idle', 'creating')).toBe(true)
    expect(canTransitionQuickTransferSendState('uploading', 'ready')).toBe(false)
    expect(isQuickTransferTerminalStatus('consumed')).toBe(true)
    expect(isQuickTransferTerminalStatus('ready')).toBe(false)
  })

  it('keeps H5 anonymous sending disabled while MP anonymous sending is enabled', () => {
    expect(canSendQuickTransfer(false, false)).toBe(false)
    expect(canSendQuickTransfer(false, true)).toBe(true)
    expect(canSendQuickTransfer(true, false)).toBe(true)
  })

  it('parses receive share links without consuming them', () => {
    expect(parseQuickTransferPageQuery({ mode: 'receive', shareToken: ' token ' })).toEqual({ mode: 'receive', shareToken: 'token' })
    expect(parseQuickTransferPageQuery({})).toEqual({ mode: 'send', shareToken: '' })
    expect(buildQuickTransferSharePath('token')).toContain('shareToken=token')
  })

  it('checks signed download URL expiry and maps backend errors', () => {
    expect(isQuickTransferDownloadValid(new Date(10_000).toISOString(), 9_000)).toBe(true)
    expect(isQuickTransferDownloadValid(new Date(10_000).toISOString(), 10_000)).toBe(false)
    expect(getQuickTransferErrorMessage({ code: 'UPLOAD_PROBE_TEMPORARILY_UNAVAILABLE' })).toBe('文件校验暂时失败，请重试')
    expect(getQuickTransferErrorMessage({ code: 400, data: { code: 'TRANSFER_NOT_AVAILABLE' } })).toBe('提取码无效或内容已失效')
    expect(getQuickTransferErrorMessage({ code: 404, message: 'Not Found' })).toBe('快传服务暂不可用')
    expect(getQuickTransferErrorMessage({ code: -1, message: 'request failed' })).toBe('网络连接失败，请检查网络后重试')
  })

  it('shares only a live sender transfer and otherwise shares the tool', () => {
    const expiresAt = new Date(20_000).toISOString()
    const transfer = getQuickTransferSharePayload({
      mode: 'send',
      sendState: 'ready',
      shareToken: 'a/b',
      expiresAt,
      claimCount: 0,
      maxClaims: 3,
      now: 10_000,
    })
    expect(transfer.kind).toBe('transfer')
    expect(transfer.title).toBe('给你发了一个临时快传')
    expect(transfer.path).toContain('mode=receive')
    expect(transfer.path).toContain('shareToken=a%2Fb')
    expect(transfer.path).not.toContain('mode=send')
    expect(transfer.path).not.toContain('transferId')

    const partiallyClaimedTransfer = getQuickTransferSharePayload({
      mode: 'send',
      sendState: 'ready',
      shareToken: 'token-2',
      expiresAt,
      claimCount: 2,
      maxClaims: 3,
      now: 10_000,
    })
    expect(partiallyClaimedTransfer.kind).toBe('transfer')

    const states = ['idle', 'creating', 'uploading', 'completing', 'consumed', 'expired', 'cancelled'] as const
    states.forEach(sendState => {
      const tool = getQuickTransferSharePayload({ mode: 'send', sendState, shareToken: 'token', expiresAt, now: 10_000 })
      expect(tool.kind).toBe('tool')
      expect(tool.path).toBe('/subPackages/tools/quick-transfer/index')
      expect(tool.path).not.toContain('shareToken')
    })
    expect(getQuickTransferSharePayload({ mode: 'send', sendState: 'ready', shareToken: '', expiresAt, now: 10_000 }).kind).toBe('tool')
    const receiverTool = getQuickTransferSharePayload({ mode: 'receive', sendState: 'ready', shareToken: 'token', expiresAt, now: 10_000 })
    expect(receiverTool.kind).toBe('tool')
    expect(receiverTool.path).toBe('/subPackages/tools/quick-transfer/index')
    expect(receiverTool.path).not.toContain('shareToken')
    expect(getQuickTransferSharePayload({ mode: 'send', sendState: 'ready', shareToken: 'token', expiresAt, now: 30_000 }).kind).toBe(
      'tool',
    )
  })
})
