import mime from 'mime'
import {
  MAX_QUICK_TRANSFER_FILE_COUNT,
  MAX_QUICK_TRANSFER_FILE_SIZE,
  MAX_QUICK_TRANSFER_TOTAL_FILE_SIZE,
  QUICK_TRANSFER_DEFAULT_MAX_CLAIMS,
  QUICK_TRANSFER_MAX_MAX_CLAIMS,
  QUICK_TRANSFER_MIN_MAX_CLAIMS,
  QUICK_TRANSFER_RECEIPTS_ROUTE,
  QUICK_TRANSFER_SENT_RECORDS_ROUTE,
  QUICK_TRANSFER_SEND_TRANSITIONS,
  QUICK_TRANSFER_TERMINAL_STATUSES,
} from './constants'
import type {
  QuickShipDraft,
  QuickShipFileDraft,
  QuickShipReferenceDraft,
  QuickTransferFileMetadata,
  QuickTransferPageQuery,
  QuickTransferSendState,
  QuickTransferStatus,
  QuickTransferTtl,
} from './types'
import type { SelectedFile } from '@/platform/file'

let clientFileSequence = 0

export const QUICK_TRANSFER_TITLE_MAX_LENGTH = 40
const QUICK_TRANSFER_CODE_LENGTH = 6
const QUICK_TRANSFER_CODE_CHARACTERS = /^[A-Z0-9]+$/
const QUICK_TRANSFER_LABELED_CODE_PATTERN = /飞船码\s*[:：]?\s*([A-Za-z0-9](?:[\s-]*[A-Za-z0-9]){5})(?![A-Za-z0-9])/i
const QUICK_TRANSFER_STANDALONE_CODE_PATTERN = /(?:^|[^A-Za-z0-9])([A-Za-z0-9]{6})(?![A-Za-z0-9])/g

export const normalizeQuickTransferCodeInput = (value: string): string =>
  value
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, QUICK_TRANSFER_CODE_LENGTH)

export const extractQuickTransferCode = (value: string): string => {
  const labeledMatch = QUICK_TRANSFER_LABELED_CODE_PATTERN.exec(value)
  if (labeledMatch?.[1]) return normalizeQuickTransferCodeInput(labeledMatch[1])

  const standaloneMatch = QUICK_TRANSFER_STANDALONE_CODE_PATTERN.exec(value)
  QUICK_TRANSFER_STANDALONE_CODE_PATTERN.lastIndex = 0
  if (standaloneMatch?.[1]) return standaloneMatch[1].toUpperCase()

  return normalizeQuickTransferCodeInput(value)
}

export const normalizeQuickTransferCode = normalizeQuickTransferCodeInput

export const normalizeQuickTransferTitle = (value: string): string => value.trim()

export const isValidQuickTransferTitle = (value: string): boolean => {
  const normalized = normalizeQuickTransferTitle(value)
  return Array.from(normalized).length <= QUICK_TRANSFER_TITLE_MAX_LENGTH
}

export const isValidQuickTransferCode = (value: string): boolean => {
  const normalized = extractQuickTransferCode(value)
  return normalized.length === QUICK_TRANSFER_CODE_LENGTH && QUICK_TRANSFER_CODE_CHARACTERS.test(normalized) && /^\d{6}$/.test(normalized)
}

export const isValidQuickTransferUrl = (value: string): boolean => /^https?:\/\/[^\s]+$/i.test(value.trim())

export const getQuickTransferMimeType = (fileName: string, selectedType?: string): string => {
  const type = selectedType?.trim().toLowerCase() || ''
  return /^[^/\s]+\/[^/\s]+$/.test(type) ? type : mime.getType(fileName) || 'application/octet-stream'
}

export const validateQuickTransferFile = (size: number | undefined): string | null => {
  if (size === undefined || !Number.isFinite(size) || size <= 0) return '文件不能为空，请重新选择'
  return size <= MAX_QUICK_TRANSFER_FILE_SIZE ? null : '文件不能超过 50 MiB'
}

export const validateQuickTransferFiles = (files: ReadonlyArray<Pick<QuickShipFileDraft, 'size'>>): string | null => {
  if (files.length > MAX_QUICK_TRANSFER_FILE_COUNT) return `最多添加 ${MAX_QUICK_TRANSFER_FILE_COUNT} 个文件`
  const invalidFile = files.find(file => validateQuickTransferFile(file.size))
  if (invalidFile) return validateQuickTransferFile(invalidFile.size)
  const totalSize = files.reduce((total, file) => total + file.size, 0)
  return totalSize > MAX_QUICK_TRANSFER_TOTAL_FILE_SIZE ? '所有文件合计不能超过 500 MiB' : null
}

export const isValidQuickTransferMaxClaims = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= QUICK_TRANSFER_MIN_MAX_CLAIMS && value <= QUICK_TRANSFER_MAX_MAX_CLAIMS

export const normalizeQuickTransferMaxClaims = (value: unknown, fallback = QUICK_TRANSFER_DEFAULT_MAX_CLAIMS): number => {
  const candidate = typeof value === 'string' && value.trim() ? Number(value) : value
  return isValidQuickTransferMaxClaims(candidate) ? candidate : fallback
}

export const normalizeQuickTransferClaimCount = (value: unknown, fallback = 0): number => {
  const candidate = typeof value === 'string' && value.trim() ? Number(value) : value
  return typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 0 ? candidate : fallback
}

export const createQuickTransferFileMetadata = (
  name: string,
  size: number | undefined,
  selectedType?: string,
): QuickTransferFileMetadata => {
  const normalizedName = name.trim() || '未命名文件'
  return {
    name: normalizedName,
    displayName: normalizedName,
    size: size ?? 0,
    mimeType: getQuickTransferMimeType(name, selectedType),
  }
}

export const createQuickTransferClientFileId = (): string => {
  clientFileSequence += 1
  return `quick-file-${Date.now()}-${clientFileSequence}`
}

const QUICK_TRANSFER_DISPLAY_NAME_MAX_LENGTH = 120
let lastDefaultDisplayTimestamp = ''
let nextDefaultDisplaySequence = 0

const padDatePart = (value: number): string => String(value).padStart(2, '0')

const formatQuickTransferDisplayTimestamp = (date: Date): string =>
  `${date.getFullYear()}${padDatePart(date.getMonth() + 1)}${padDatePart(date.getDate())}_${padDatePart(date.getHours())}${padDatePart(
    date.getMinutes(),
  )}${padDatePart(date.getSeconds())}`

export const getFileExtension = (fileName: string, mimeType?: string): string => {
  const cleanName = fileName.trim().split(/[?#]/, 1)[0]
  const name = cleanName.split('/').filter(Boolean).pop() || ''
  const match = name.match(/(\.[^./\\\s]+)$/)
  if (match?.[1]) return match[1].toLowerCase()
  const extension = mimeType ? mime.getExtension(mimeType.trim().toLowerCase()) : undefined
  return extension ? `.${extension.toLowerCase()}` : ''
}

export const getFileNameBase = (fileName: string): string => {
  const extension = getFileExtension(fileName)
  const normalized = fileName.trim()
  if (!extension) return normalized
  return normalized.slice(0, -extension.length).trim()
}

const sanitizeQuickTransferFileNameBase = (value: string): string =>
  Array.from(value.trim())
    .filter(character => {
      const code = character.charCodeAt(0)
      return code >= 32 && code !== 127
    })
    .join('')
    .replace(/[\\/:*?"<>|]/g, '')
    .slice(0, QUICK_TRANSFER_DISPLAY_NAME_MAX_LENGTH)

export const createQuickTransferDefaultDisplayName = (
  fileName: string,
  mimeType?: string,
  selectedAt = new Date(),
  sequence?: number,
): string => {
  const timestamp = formatQuickTransferDisplayTimestamp(selectedAt)
  if (timestamp !== lastDefaultDisplayTimestamp) {
    lastDefaultDisplayTimestamp = timestamp
    nextDefaultDisplaySequence = 0
  }
  const resolvedSequence = sequence && sequence > 0 ? Math.floor(sequence) : nextDefaultDisplaySequence + 1
  nextDefaultDisplaySequence = Math.max(nextDefaultDisplaySequence, resolvedSequence)
  const extension = getFileExtension(fileName, mimeType)
  return `${timestamp}_${String(resolvedSequence).padStart(2, '0')}${extension}`
}

export const normalizeQuickTransferDisplayName = (value: string, extension = getFileExtension(value)): string => {
  const normalizedExtension = extension.toLowerCase()
  const rawBase =
    normalizedExtension && value.trim().toLowerCase().endsWith(normalizedExtension)
      ? value.trim().slice(0, -normalizedExtension.length)
      : getFileNameBase(value)
  const base = sanitizeQuickTransferFileNameBase(rawBase)
  return base ? `${base}${normalizedExtension}` : ''
}

export const restoreQuickTransferDisplayName = (file: Pick<QuickShipFileDraft, 'defaultDisplayName' | 'displayName'>): string => {
  const extension = getFileExtension(file.defaultDisplayName)
  return normalizeQuickTransferDisplayName(file.defaultDisplayName, extension) || file.defaultDisplayName
}

export const getFinalQuickTransferDisplayName = (file: Pick<QuickShipFileDraft, 'name' | 'defaultDisplayName' | 'displayName'>): string => {
  const defaultDisplayName = file.defaultDisplayName || file.name || '未命名文件'
  const extension = getFileExtension(defaultDisplayName)
  return (
    normalizeQuickTransferDisplayName(file.displayName || '', extension) ||
    normalizeQuickTransferDisplayName(defaultDisplayName, extension) ||
    '文件'
  )
}

export const createQuickShipFileDraft = (file: SelectedFile, selectedAt = new Date(), sequence?: number): QuickShipFileDraft => {
  const name = file.name || '未命名文件'
  const mimeType = getQuickTransferMimeType(name, file.type)
  const defaultDisplayName = createQuickTransferDefaultDisplayName(name, mimeType, selectedAt, sequence)
  return {
    clientFileId: createQuickTransferClientFileId(),
    name,
    defaultDisplayName,
    displayName: defaultDisplayName,
    size: file.size ?? 0,
    mimeType,
    localPath: file.path || undefined,
    rawFile: file.raw,
    selectedFile: file,
    uploadState: 'pending',
  }
}

export const createQuickShipDraft = (expiresIn: QuickTransferTtl = 600, maxClaims = QUICK_TRANSFER_DEFAULT_MAX_CLAIMS): QuickShipDraft => ({
  title: '',
  text: '',
  links: [],
  files: [],
  references: [],
  expiresIn,
  maxClaims,
})

export const hasQuickShipContent = (draft: Pick<QuickShipDraft, 'text' | 'links' | 'files' | 'references'>): boolean =>
  Boolean(draft.text.trim() || draft.links.length || draft.files.length || draft.references.length)

export const hasQuickShipPayload = (draft: Pick<QuickShipDraft, 'title' | 'text' | 'links' | 'files' | 'references'>): boolean =>
  Boolean(normalizeQuickTransferTitle(draft.title) || hasQuickShipContent(draft))

export const normalizeQuickShipReference = (reference: QuickShipReferenceDraft): QuickShipReferenceDraft => ({
  ...reference,
  title: reference.title.trim() || '未命名引用',
  subtitle: reference.subtitle?.trim() || undefined,
  resourceId: reference.resourceId?.trim() || undefined,
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

export const formatQuickTransferExpiry = (expiresAt: string, now = Date.now()): string => {
  const remaining = Math.max(0, Date.parse(expiresAt) - now)
  if (!remaining) return '已返航'
  const totalMinutes = Math.ceil(remaining / 60000)
  if (totalMinutes < 60) return `${totalMinutes} 分钟后返航`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes ? `${hours} 小时 ${minutes} 分钟后返航` : `${hours} 小时后返航`
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

export const getQuickTransferIndexRedirectRoute = (tab?: string): string | undefined => {
  if (tab === 'sent') return QUICK_TRANSFER_SENT_RECORDS_ROUTE
  if (tab === 'received') return QUICK_TRANSFER_RECEIPTS_ROUTE
  return undefined
}

export const buildQuickTransferSharePath = (shareToken: string): string =>
  `/subPackages/tools/quick-transfer/receive/index?shareToken=${encodeURIComponent(shareToken)}`
