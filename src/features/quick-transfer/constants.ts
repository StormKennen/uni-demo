import type { QuickTransferSendState, QuickTransferStatus, QuickTransferTtl } from './types'

export const QUICK_TRANSFER_ROUTE = '/subPackages/tools/quick-transfer/index'
export const QUICK_TRANSFER_TITLE = '飞船'
export const MAX_QUICK_TRANSFER_FILE_SIZE = 50 * 1024 * 1024
export const MAX_QUICK_TRANSFER_FILE_COUNT = 10
export const MAX_QUICK_TRANSFER_TOTAL_FILE_SIZE = MAX_QUICK_TRANSFER_FILE_SIZE * MAX_QUICK_TRANSFER_FILE_COUNT
export const QUICK_TRANSFER_UPLOAD_CONCURRENCY = 2
export const QUICK_TRANSFER_DEFAULT_MAX_CLAIMS = 1
export const QUICK_TRANSFER_MIN_MAX_CLAIMS = 1
export const QUICK_TRANSFER_MAX_MAX_CLAIMS = 10
export const QUICK_TRANSFER_POLL_INTERVAL = 3000
export const QUICK_TRANSFER_TTL_OPTIONS: ReadonlyArray<{ label: string; value: QuickTransferTtl }> = [
  { label: '10 分钟', value: 600 },
  { label: '1 小时', value: 3600 },
  { label: '24 小时', value: 86400 },
]

export const QUICK_TRANSFER_SEND_TRANSITIONS: Record<QuickTransferSendState, ReadonlyArray<QuickTransferSendState>> = {
  idle: ['creating', 'cancelled'],
  creating: ['uploading', 'ready', 'error', 'cancelled'],
  uploading: ['uploading', 'completing', 'error', 'cancelled'],
  completing: ['completing', 'ready', 'error', 'cancelled'],
  ready: ['consumed', 'expired', 'cancelled', 'error'],
  consumed: [],
  expired: [],
  cancelled: [],
  error: ['uploading', 'completing', 'creating', 'cancelled'],
}

export const QUICK_TRANSFER_TERMINAL_STATUSES: ReadonlyArray<QuickTransferStatus> = ['consumed', 'expired', 'cancelled', 'deleted']
