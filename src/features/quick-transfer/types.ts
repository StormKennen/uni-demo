import type { SelectedFile } from '@/platform/file'

export type QuickTransferMode = 'send' | 'receive'
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

export type QuickTransferReceiveState = 'idle' | 'inspecting' | 'resolving' | 'received' | 'error'

export type QuickTransferStatus = 'uploading' | 'ready' | 'consumed' | 'expired' | 'cancelled' | 'deleting' | 'deleted'

export type QuickShipFileUploadState = 'pending' | 'uploading' | 'uploaded' | 'completing' | 'ready' | 'error'

export interface QuickTransferFileMetadata {
  fileId?: string
  name: string
  size: number
  mimeType: string
}

export interface QuickShipLinkDraft {
  localId: string
  title: string
  url: string
}

export interface QuickShipReferenceDraft {
  localId: string
  type: string
  resourceId?: string
  params?: Record<string, unknown>
  title: string
  subtitle?: string
}

export interface QuickShipFileDraft {
  clientFileId: string
  name: string
  size: number
  mimeType: string
  localPath?: string
  rawFile?: SelectedFile['raw']
  selectedFile?: SelectedFile
  uploadState: QuickShipFileUploadState
  progress?: number
  serverFileId?: string
  error?: string
}

export interface QuickShipDraft {
  text: string
  links: QuickShipLinkDraft[]
  files: QuickShipFileDraft[]
  references: QuickShipReferenceDraft[]
  expiresIn: QuickTransferTtl
  maxClaims: number
}

export interface QuickTransferUploadDescriptor {
  clientFileId: string
  fileId: string
  method: 'POST'
  url: string
  fileField: string
  fields: Record<string, string>
  successStatus: number
  expiresAt: string
}

export interface QuickTransferCreateFileMetadata {
  clientFileId: string
  name: string
  size: number
  mimeType: string
}

export interface QuickTransferReferencePayload {
  type: string
  resourceId?: string
  params?: Record<string, unknown>
  title: string
  subtitle?: string
}

export interface QuickTransferCreatePayload {
  content: {
    text?: string
    links: Array<{ title?: string; url: string }>
    files: QuickTransferCreateFileMetadata[]
    references: QuickTransferReferencePayload[]
  }
  expiresIn: QuickTransferTtl
  maxClaims: number
}

export interface QuickTransferCreateResult {
  code: string
  expiresAt: string
  shareToken: string
  status: 'uploading' | 'ready'
  transferId: string
  claimCount: number
  maxClaims: number
  uploads: QuickTransferUploadDescriptor[]
}

export interface QuickTransferStatusResult {
  transferId: string
  status: QuickTransferStatus
  claimCount: number
  maxClaims: number
  expiresAt: string
  consumedAt?: string
  cancelledAt?: string
}

export interface QuickTransferContentLink {
  title?: string
  url: string
}

export interface QuickTransferContentReference {
  type: string
  resourceId?: string
  params?: Record<string, unknown>
  title: string
  subtitle?: string
}

export interface QuickTransferContent {
  text?: string
  links: QuickTransferContentLink[]
  files: QuickTransferFileMetadata[]
  references: QuickTransferContentReference[]
}

export interface QuickTransferSummary {
  hasText: boolean
  links: number
  files: number
  references: number
}

export interface QuickTransferInspectResult {
  transferId?: string
  expiresAt: string
  remainingClaims: number
  summary: QuickTransferSummary
}

export interface QuickTransferResolvedResult {
  transferId: string
  claimToken: string
  content: QuickTransferContent
}

export interface QuickTransferFileAccessResult {
  url: string
  expiresAt: string
}

export interface QuickTransferPageQuery {
  mode?: string
  shareToken?: string
}

export interface QuickTransferErrorInfo {
  code: string
  message: string
  canRetryComplete?: boolean
  canRetryUpload?: boolean
}
