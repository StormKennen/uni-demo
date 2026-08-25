import type { SelectedFile } from '@/platform/file'

export type QuickTransferMode = 'send' | 'receive'
export type QuickTransferType = 'text' | 'url' | 'file'
export type QuickTransferTtl = 600 | 3600 | 86400

export type QuickTransferSendState =
  | 'idle'
  | 'creating'
  | 'uploading'
  | 'completing'
  | 'ready'
  | 'consumed'
  | 'expired'
  | 'cancelled'
  | 'error'

export type QuickTransferReceiveState = 'idle' | 'resolving' | 'received' | 'error'

export type QuickTransferStatus = 'uploading' | 'ready' | 'consumed' | 'expired' | 'cancelled' | 'deleting' | 'deleted'

export interface QuickTransferFileMetadata {
  name: string
  size: number
  mimeType: string
}

export interface QuickTransferUploadDescriptor {
  method: 'POST'
  url: string
  fileField: string
  fields: Record<string, string>
  successStatus: number
  expiresAt: string
}

export interface QuickTransferCreatePayload {
  type: QuickTransferType
  expiresIn: QuickTransferTtl
  maxClaims: number
  text?: string
  url?: string
  file?: QuickTransferFileMetadata
}

export interface QuickTransferCreateResult {
  code: string
  expiresAt: string
  shareToken: string
  status: 'uploading' | 'ready'
  transferId: string
  type: QuickTransferType
  claimCount: number
  maxClaims: number
  upload?: QuickTransferUploadDescriptor
}

export interface QuickTransferStatusResult {
  transferId: string
  type: QuickTransferType
  status: QuickTransferStatus
  claimCount: number
  maxClaims: number
  expiresAt: string
  file?: QuickTransferFileMetadata
  consumedAt?: string
  cancelledAt?: string
}

export interface QuickTransferDownloadDescriptor {
  url: string
  expiresAt: string
}

export interface QuickTransferResolvedResult {
  transferId: string
  type: QuickTransferType
  text?: string
  url?: string
  file?: QuickTransferFileMetadata
  download?: QuickTransferDownloadDescriptor
}

export interface QuickTransferPageQuery {
  mode?: string
  shareToken?: string
}

export interface QuickTransferSelectedFile extends SelectedFile {
  mimeType: string
}

export interface QuickTransferErrorInfo {
  code: string
  message: string
  canRetryComplete?: boolean
}
