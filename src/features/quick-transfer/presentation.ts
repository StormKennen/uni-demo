import type {
  QuickShipFileDraft,
  QuickTransferHistoryPrimaryType,
  QuickTransferHistoryPreview,
  QuickTransferReceiveState,
  QuickTransferSendState,
  QuickTransferSentRecordSummary,
  QuickTransferStatus,
  QuickTransferSummary,
} from './types'

export const QUICK_TRANSFER_COPY = {
  heroDescription: '跨设备快速传递内容',
  sendTab: '发送',
  receiveTab: '接收',
  sendButton: '发送',
  receiveButton: '接收',
  receiveLoading: '正在接收…',
  receivedTitle: '飞船已到达',
  receivedDescription: '内容已经安全送达，打开查看本次传输。',
  openReceived: '查看内容',
} as const

export const getQuickTransferSendButtonLabel = (
  state: QuickTransferSendState,
  uploadProgress: number | null,
  disabledReason = '',
): string => {
  if (state === 'creating') return '正在准备飞船…'
  if (state === 'uploading') return uploadProgress === null ? '正在装船…' : `正在装船 ${uploadProgress}%`
  if (state === 'completing') return '正在确认内容…'
  if (disabledReason) return disabledReason
  return QUICK_TRANSFER_COPY.sendButton
}

export const getQuickTransferSenderTitle = (state: QuickTransferSendState): string => {
  if (state === 'ready') return '飞船已出发'
  if (state === 'consumed') return '飞船任务完成 ✓'
  if (state === 'expired') return '飞船已返航'
  if (state === 'cancelled') return '飞船已召回'
  return ''
}

export const getQuickTransferSenderDescription = (state: QuickTransferSendState): string => {
  if (state === 'ready') return '等待对方收船'
  if (state === 'consumed') return '本次飞船已完成全部领取。'
  if (state === 'expired') return '本次内容已经过期。'
  if (state === 'cancelled') return '本次收船码已经失效。'
  return ''
}

export const getQuickTransferSenderClaimLabel = (state: QuickTransferSendState, claimCount: number, maxClaims: number): string => {
  if (state === 'consumed') return maxClaims > 1 ? '飞船任务完成 ✓' : '对方已收船 ✓'
  if (state === 'ready') return `已领取 ${claimCount} / ${maxClaims}`
  return '等待对方领取'
}

export const formatQuickTransferSummary = (summary: QuickTransferSummary): string => {
  const items: string[] = []
  if (summary.hasText) items.push('留言')
  if (summary.linkCount) items.push(`${summary.linkCount} 个链接`)
  if (summary.fileCount) items.push(`${summary.fileCount} 个文件`)
  if (summary.referenceCount) items.push(`${summary.referenceCount} 个引用`)
  return items.join('、') || '内容'
}

export const formatQuickTransferReceiptSummary = (summary: QuickTransferSummary): string => {
  const items: string[] = []
  if (summary.hasText) items.push('留言')
  if (summary.linkCount) items.push(`${summary.linkCount} 个链接`)
  if (summary.fileCount) items.push(`${summary.fileCount} 个文件`)
  if (summary.referenceCount) items.push(`${summary.referenceCount} 个引用`)
  return items.join(' · ') || '内容'
}

export const getQuickTransferSentStatusLabel = (status: QuickTransferStatus): string => {
  if (status === 'uploading') return '上传未完成'
  if (status === 'ready') return '可领取'
  if (status === 'consumed') return '已领完'
  if (status === 'expired') return '已过期'
  if (status === 'cancelled') return '已召回'
  return '已结束'
}

export const getQuickTransferSentClaimLabel = (claimCount: number, maxClaims: number): string => `已领取 ${claimCount} / ${maxClaims}`

export const formatQuickTransferSentRecordSummary = (summary: QuickTransferSentRecordSummary): string =>
  formatQuickTransferReceiptSummary(summary)

const QUICK_TRANSFER_HISTORY_TYPE_LABELS: Record<QuickTransferHistoryPrimaryType, string> = {
  text: '文字',
  image: '图片',
  file: '文件',
  link: '链接',
  reference: '引用',
  mixed: '混合内容',
}

export const getQuickTransferHistoryTypeLabel = (primaryType: QuickTransferHistoryPrimaryType): string =>
  QUICK_TRANSFER_HISTORY_TYPE_LABELS[primaryType] || '内容'

export type QuickTransferHistoryIconType = 'compose' | 'image' | 'paperclip' | 'link' | 'flag' | 'list'

export const getQuickTransferHistoryIconType = (primaryType: QuickTransferHistoryPrimaryType): QuickTransferHistoryIconType => {
  if (primaryType === 'text') return 'compose'
  if (primaryType === 'image') return 'image'
  if (primaryType === 'file') return 'paperclip'
  if (primaryType === 'link') return 'link'
  if (primaryType === 'reference') return 'flag'
  return 'list'
}

const formatHistoryCount = (count: number, unit: string): string => `${count} ${unit}`

export const formatQuickTransferHistorySummary = (summary: QuickTransferSummary): string => {
  const items: string[] = []
  const imageCount = Math.max(0, summary.imageCount)
  const otherFileCount = Math.max(0, summary.otherFileCount || summary.fileCount - imageCount)
  if (summary.hasText) items.push('留言')
  if (imageCount) items.push(formatHistoryCount(imageCount, '张图片'))
  if (otherFileCount) items.push(formatHistoryCount(otherFileCount, '个文件'))
  if (summary.linkCount) items.push(formatHistoryCount(summary.linkCount, '个链接'))
  if (summary.referenceCount) items.push(formatHistoryCount(summary.referenceCount, '个引用'))
  return items.join(' · ') || '内容'
}

const formatQuickTransferTime = (date: Date): string => {
  const pad = (part: number): string => String(part).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const formatQuickTransferCalendarDate = (date: Date, withYear: boolean): string => {
  const pad = (part: number): string => String(part).padStart(2, '0')
  const datePart = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return withYear ? `${date.getFullYear()}-${datePart}` : datePart
}

export const formatQuickTransferHistoryDate = (value: string, now = new Date()): string => {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value
  const current = new Date(now)
  if (!Number.isFinite(current.getTime())) return formatQuickTransferReceiptDate(value)

  const sameDay = (left: Date, right: Date): boolean =>
    left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
  if (sameDay(date, current)) return formatQuickTransferTime(date)

  const yesterday = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1)
  if (sameDay(date, yesterday)) return `昨天 ${formatQuickTransferTime(date)}`
  if (date.getFullYear() === current.getFullYear())
    return `${formatQuickTransferCalendarDate(date, false)} ${formatQuickTransferTime(date)}`
  return formatQuickTransferCalendarDate(date, true)
}

export const getQuickTransferHistoryPreview = (
  primaryType: QuickTransferHistoryPrimaryType,
  preview: QuickTransferHistoryPreview = {},
): string => {
  if (primaryType === 'image') return ''
  if (primaryType === 'file') return preview.fileName?.trim() || ''
  if (primaryType === 'mixed') return preview.text?.trim() || preview.referenceTitle?.trim() || preview.linkTitle?.trim() || ''
  if (primaryType === 'link') return preview.linkTitle?.trim() || preview.text?.trim() || ''
  if (primaryType === 'reference') return preview.referenceTitle?.trim() || preview.text?.trim() || ''
  return preview.text?.trim() || ''
}

export const shouldShowQuickTransferHistoryPreview = (
  primaryType: QuickTransferHistoryPrimaryType,
  title: string,
  preview?: QuickTransferHistoryPreview,
): boolean => {
  const previewText = getQuickTransferHistoryPreview(primaryType, preview)
  return Boolean(previewText && previewText !== title.trim())
}

export const shouldShowQuickTransferHistorySummary = (
  primaryType: QuickTransferHistoryPrimaryType,
  title: string,
  summary: QuickTransferSummary,
): boolean => {
  const summaryLabel = formatQuickTransferHistorySummary(summary)
  const normalizedTitle = title.trim()
  if (!normalizedTitle || summaryLabel === '内容' || summaryLabel === normalizedTitle) return false
  if (primaryType === 'text' || primaryType === 'image') return false
  if (primaryType === 'file' && normalizedTitle.endsWith('文件')) return false
  if (primaryType === 'link' && normalizedTitle.endsWith('链接')) return false
  if (primaryType === 'reference' && normalizedTitle.endsWith('引用')) return false
  return true
}

export const formatQuickTransferReceiptDate = (value: string): string => {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value
  const pad = (part: number): string => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const getQuickTransferFileStateLabel = (file: QuickShipFileDraft): string => {
  if (file.uploadState === 'uploading') return file.progress === undefined ? '上传中…' : `上传中 ${file.progress}%`
  if (file.uploadState === 'uploaded') return '上传完成'
  if (file.uploadState === 'completing') return '校验中…'
  if (file.uploadState === 'ready') return '已完成 ✓'
  if (file.uploadState === 'error') return file.error || '上传失败'
  return '等待上传'
}

export const getQuickTransferFileTypeLabel = (mimeType: string): string => {
  const normalized = mimeType.trim().toLowerCase()
  const knownTypes: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'application/zip': 'ZIP',
    'text/plain': 'TXT',
  }
  if (knownTypes[normalized]) return knownTypes[normalized]
  if (normalized.startsWith('image/')) return normalized.slice('image/'.length).toUpperCase()
  if (normalized.startsWith('video/')) return normalized.slice('video/'.length).toUpperCase()
  if (normalized.startsWith('audio/')) return normalized.slice('audio/'.length).toUpperCase()
  return '文件'
}

export const isQuickTransferReceivedContentVisible = (state: QuickTransferReceiveState, isOpened: boolean): boolean =>
  state === 'received' && isOpened
