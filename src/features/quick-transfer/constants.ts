import type { QuickTransferSendState, QuickTransferStatus, QuickTransferTtl } from './types'

export const QUICK_TRANSFER_ROUTE = '/subPackages/tools/quick-transfer/index'
export const QUICK_TRANSFER_TITLE = '跨设备快传'
export const MAX_QUICK_TRANSFER_FILE_SIZE = 50 * 1024 * 1024
export const QUICK_TRANSFER_POLL_INTERVAL = 3000
export const QUICK_TRANSFER_TTL_OPTIONS: ReadonlyArray<{ label: string; value: QuickTransferTtl }> = [
  { label: '10 分钟', value: 600 },
  { label: '1 小时', value: 3600 },
  { label: '24 小时', value: 86400 },
]

export const QUICK_TRANSFER_SEND_TRANSITIONS: Record<QuickTransferSendState, ReadonlyArray<QuickTransferSendState>> = {
  idle: ['creating', 'cancelled'],
  creating: ['uploading', 'ready', 'error', 'cancelled'],
  uploading: ['completing', 'error', 'cancelled'],
  completing: ['ready', 'error', 'cancelled'],
  ready: ['consumed', 'expired', 'cancelled', 'error'],
  consumed: [],
  expired: [],
  cancelled: [],
  error: ['creating', 'completing', 'cancelled'],
}

export const QUICK_TRANSFER_TERMINAL_STATUSES: ReadonlyArray<QuickTransferStatus> = ['consumed', 'expired', 'cancelled', 'deleted']
