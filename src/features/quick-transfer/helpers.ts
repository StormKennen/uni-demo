import mime from 'mime'
import { MAX_QUICK_TRANSFER_FILE_SIZE, QUICK_TRANSFER_SEND_TRANSITIONS, QUICK_TRANSFER_TERMINAL_STATUSES } from './constants'
import type {
  QuickTransferFileMetadata,
  QuickTransferPageQuery,
  QuickTransferSendState,
  QuickTransferStatus,
  QuickTransferType,
} from './types'

export const normalizeQuickTransferCode = (value: string): string => value.replace(/\s+/g, '').replace(/\D/g, '').slice(0, 6)

export const isValidQuickTransferCode = (value: string): boolean => /^\d{6}$/.test(normalizeQuickTransferCode(value))

export const isValidQuickTransferUrl = (value: string): boolean => {
  const trimmed = value.trim()
  return /^https?:\/\/[^\s]+$/i.test(trimmed)
}

export const getQuickTransferMimeType = (fileName: string, selectedType?: string): string => {
  const type = selectedType?.trim()
  return type || mime.getType(fileName) || 'application/octet-stream'
}

export const validateQuickTransferFile = (size: number | undefined): string | null => {
  if (size === undefined || !Number.isFinite(size) || size < 0) return '无法读取文件大小，请重新选择'
  return size <= MAX_QUICK_TRANSFER_FILE_SIZE ? null : '文件不能超过 50 MiB'
}

export const createQuickTransferFileMetadata = (
  name: string,
  size: number | undefined,
  selectedType?: string,
): QuickTransferFileMetadata => ({
  name: name.trim() || '未命名文件',
  size: size ?? 0,
  mimeType: getQuickTransferMimeType(name, selectedType),
})

export const formatQuickTransferFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export const formatQuickTransferCountdown = (expiresAt: string, now = Date.now()): string => {
  const remaining = Math.max(0, Date.parse(expiresAt) - now)
  const totalSeconds = Math.ceil(remaining / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const isQuickTransferDownloadValid = (expiresAt: string, now = Date.now()): boolean => {
  const timestamp = Date.parse(expiresAt)
  return Number.isFinite(timestamp) && timestamp > now
}

export const isQuickTransferTerminalStatus = (status: QuickTransferStatus): boolean => QUICK_TRANSFER_TERMINAL_STATUSES.includes(status)

export const canTransitionQuickTransferSendState = (from: QuickTransferSendState, to: QuickTransferSendState): boolean =>
  QUICK_TRANSFER_SEND_TRANSITIONS[from].includes(to)

export const canSendQuickTransfer = (isMiniProgram: boolean, isLoggedIn: boolean): boolean => isMiniProgram || isLoggedIn

const getQueryValue = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] || '' : value || '')

export const parseQuickTransferPageQuery = (query: QuickTransferPageQuery): { mode: 'send' | 'receive'; shareToken: string } => {
  const shareToken = getQueryValue(query.shareToken).trim()
  return {
    mode: query.mode === 'receive' || shareToken ? 'receive' : 'send',
    shareToken,
  }
}

export const getQuickTransferTypeLabel = (type: QuickTransferType): string => {
  if (type === 'text') return '文本'
  if (type === 'url') return '链接'
  return '文件'
}

export const buildQuickTransferSharePath = (shareToken: string): string =>
  `/subPackages/tools/quick-transfer/index?mode=receive&shareToken=${encodeURIComponent(shareToken)}`
