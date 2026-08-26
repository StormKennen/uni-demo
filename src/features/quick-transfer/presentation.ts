import type { QuickShipFileDraft, QuickTransferReceiveState, QuickTransferSendState, QuickTransferSummary } from './types'

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

export const getQuickTransferSendButtonLabel = (state: QuickTransferSendState, uploadProgress: number | null): string => {
  if (state === 'creating') return '正在准备飞船…'
  if (state === 'uploading') return uploadProgress === null ? '正在装船…' : `正在装船 ${uploadProgress}%`
  if (state === 'completing') return '正在确认内容…'
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
