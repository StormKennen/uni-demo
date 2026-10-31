import type { QuickTransferHistoryPrimaryType, QuickTransferSummary } from './types'

const QUICK_TRANSFER_HISTORY_PRIMARY_TYPES: ReadonlyArray<QuickTransferHistoryPrimaryType> = [
  'text',
  'image',
  'file',
  'link',
  'reference',
  'mixed',
]

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export const normalizeQuickTransferHistoryTitle = (value: unknown): string => {
  if (typeof value !== 'string') return '飞船'
  return value.trim() || '飞船'
}

export const getQuickTransferHistoryTitle = (record: Record<string, unknown>): string => {
  const title = typeof record.title === 'string' ? record.title.trim() : ''
  return title || normalizeQuickTransferHistoryTitle(record.displayTitle)
}

const readCount = (record: Record<string, unknown>, key: string, fallbackKey?: string): number | undefined => {
  const rawValue = record[key] ?? (fallbackKey ? record[fallbackKey] : undefined)
  if (rawValue === undefined || rawValue === null || rawValue === '') return undefined
  const value = Number(rawValue)
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined
}

const normalizeHasText = (record: Record<string, unknown>): boolean => {
  if (typeof record.hasText === 'boolean') return record.hasText
  if (typeof record.text === 'string') return Boolean(record.text.trim())
  return Boolean(record.text)
}

export const normalizeQuickTransferHistorySummary = (value: unknown): QuickTransferSummary => {
  const record = asRecord(value) || {}
  const fileCountValue = readCount(record, 'fileCount', 'files') ?? 0
  const imageCount = readCount(record, 'imageCount') ?? 0
  const otherFileCount = readCount(record, 'otherFileCount') ?? Math.max(fileCountValue - imageCount, 0)
  const fileCount = Math.max(fileCountValue, imageCount + otherFileCount)
  return {
    hasText: normalizeHasText(record),
    linkCount: readCount(record, 'linkCount', 'links') ?? 0,
    fileCount,
    imageCount,
    otherFileCount,
    referenceCount: readCount(record, 'referenceCount', 'references') ?? 0,
  }
}

const isQuickTransferHistoryPrimaryType = (value: unknown): value is QuickTransferHistoryPrimaryType =>
  typeof value === 'string' && QUICK_TRANSFER_HISTORY_PRIMARY_TYPES.includes(value as QuickTransferHistoryPrimaryType)

export const inferQuickTransferHistoryPrimaryType = (summary: QuickTransferSummary): QuickTransferHistoryPrimaryType => {
  const kinds: QuickTransferHistoryPrimaryType[] = []
  if (summary.hasText) kinds.push('text')
  if (summary.linkCount > 0) kinds.push('link')
  if (summary.imageCount > 0 && summary.otherFileCount === 0) kinds.push('image')
  if (summary.otherFileCount > 0 || (summary.fileCount > 0 && summary.imageCount === 0)) kinds.push('file')
  if (summary.referenceCount > 0) kinds.push('reference')
  return kinds.length === 1 ? kinds[0] : 'mixed'
}

export interface QuickTransferHistoryMetadata {
  primaryType: QuickTransferHistoryPrimaryType
  summary: QuickTransferSummary
}

export const normalizeQuickTransferHistoryMetadata = (value: unknown): QuickTransferHistoryMetadata => {
  const record = asRecord(value) || {}
  let summary = normalizeQuickTransferHistorySummary(record.summary)
  const primaryType = isQuickTransferHistoryPrimaryType(record.primaryType)
    ? record.primaryType
    : inferQuickTransferHistoryPrimaryType(summary)

  // 老接口没有图片拆分字段；若新接口已给出 primaryType=image，则可以安全补齐数量，仍不读取文件名猜类型。
  if (primaryType === 'image' && summary.fileCount > 0 && summary.imageCount === 0) {
    summary = { ...summary, imageCount: summary.fileCount, otherFileCount: 0 }
  }

  return { primaryType, summary }
}
