import type { QuickShipFileDraft, QuickTransferReceiveState, QuickTransferSendState, QuickTransferSummary } from './types'

export const QUICK_TRANSFER_COPY = {
  heroDescription: '留言、链接、文件和引用，一艘飞船一起送到。',
  sendTab: '送船',
  receiveTab: '收船',
  sendButton: '让飞船出发',
  receiveButton: '收船',
  receiveLoading: '正在收船…',
  receivedTitle: '船来了！',
  receivedDescription: '飞船已经到达，打开看看带来了什么。',
  openReceived: '打开飞船',
} as const

export const getQuickTransferSendButtonLabel = (state: QuickTransferSendState, uploadProgress: number | null): string => {
  if (state === 'creating') return '正在准备飞船…'
  if (state === 'uploading') return uploadProgress === null ? '正在装船…' : `正在装船 ${uploadProgress}%`
  if (state === 'completing') return '正在确认内容…'
  return QUICK_TRANSFER_COPY.sendButton
}

export const getQuickTransferSenderTitle = (state: QuickTransferSendState): string => {
  if (state === 'ready') return '飞船航行中'
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
  if (state === 'ready' && maxClaims > 1 && claimCount > 0) return `已收船 ${claimCount} / ${maxClaims} 次`
  return '等待对方收船'
}

export const formatQuickTransferSummary = (summary: QuickTransferSummary): string => {
  const items: string[] = []
  if (summary.hasText) items.push('留言')
  if (summary.linkCount) items.push(`${summary.linkCount} 个链接`)
  if (summary.fileCount) items.push(`${summary.fileCount} 个文件`)
  if (summary.referenceCount) items.push(`${summary.referenceCount} 个引用`)
  return items.join('、') || '内容'
}

export const getQuickTransferFileStateLabel = (file: QuickShipFileDraft): string => {
  if (file.uploadState === 'uploading') return file.progress === undefined ? '上传中…' : `上传中 ${file.progress}%`
  if (file.uploadState === 'uploaded') return '上传完成'
  if (file.uploadState === 'completing') return '校验中…'
  if (file.uploadState === 'ready') return '已完成 ✓'
  if (file.uploadState === 'error') return file.error || '上传失败'
  return '等待上传'
}

export const isQuickTransferReceivedContentVisible = (state: QuickTransferReceiveState, isOpened: boolean): boolean =>
  state === 'received' && isOpened
