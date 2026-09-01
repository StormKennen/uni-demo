import type { SelectedFile } from '@/platform/file'

export type QuickTransferMode = 'send' | 'receive'
export type QuickTransferTtl = 600 | 3600 | 86400
export type QuickTransferHistoryPrimaryType = 'text' | 'image' | 'file' | 'link' | 'reference' | 'mixed'

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
  available?: boolean
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
  errorCode?: string
}

export interface QuickShipDraft {
  title: string
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
  title: string
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
  linkCount: number
  fileCount: number
  imageCount: number
  otherFileCount: number
  referenceCount: number
}

export type QuickTransferReceiptSummary = QuickTransferSummary

export interface QuickTransferHistoryPreview {
  text?: string
  referenceTitle?: string
  linkTitle?: string
  fileName?: string
}

export type QuickTransferReceiptPreview = QuickTransferHistoryPreview

export interface QuickTransferReceiptListItem {
  receiptId: string
  displayTitle: string
  claimedAt: string
  primaryType: QuickTransferHistoryPrimaryType
  summary: QuickTransferReceiptSummary
  preview: QuickTransferReceiptPreview
}

export interface QuickTransferReceiptPagination {
  page: number
  pageSize: number
  total?: number
  totalPages?: number
  hasNext: boolean
}

export interface QuickTransferReceiptListResult {
  items: QuickTransferReceiptListItem[]
  pagination: QuickTransferReceiptPagination
}

export interface QuickTransferReceiptDetail {
  receiptId: string
  displayTitle: string
  claimedAt: string
  content: QuickTransferContent
}

export type QuickTransferSentRecordSummary = QuickTransferSummary

export type QuickTransferSentRecordPreview = QuickTransferHistoryPreview

export interface QuickTransferSentRecordListItem {
  sentRecordId: string
  transferId: string
  displayTitle: string
  sentAt: string
  status: QuickTransferStatus
  claimCount: number
  maxClaims: number
  expiresAt?: string
  canRecall: boolean
  primaryType: QuickTransferHistoryPrimaryType
  summary: QuickTransferSentRecordSummary
  preview: QuickTransferSentRecordPreview
}

export interface QuickTransferSentRecordListResult {
  items: QuickTransferSentRecordListItem[]
  pagination: QuickTransferReceiptPagination
}

export interface QuickTransferSentRecordDetail {
  sentRecordId: string
  transferId: string
  displayTitle: string
  sentAt: string
  status: QuickTransferStatus
  claimCount: number
  maxClaims: number
  expiresAt?: string
  readyAt?: string
  consumedAt?: string
  cancelledAt?: string
  canRecall: boolean
  content: QuickTransferContent
}

export interface QuickTransferReceiveInput {
  code?: string
  shareToken?: string
  claimRequestId?: string
}

export interface QuickTransferInspectResult {
  title: string
  transferId?: string
  expiresAt: string
  remainingClaims: number
  summary: QuickTransferSummary
}

export interface QuickTransferResolvedResult {
  title: string
  transferId: string
  claimId: string
  receiptId?: string
  claimToken?: string
  expiresAt?: string
  content: QuickTransferContent
}

export interface QuickTransferFileAccessResult {
  url: string
  expiresAt: string
}

export interface QuickTransferPageQuery {
  mode?: string
  tab?: string
  shareToken?: string
}

export interface QuickTransferSendResultContext {
  title: string
  transferId: string
  code: string
  shareToken: string
  expiresAt: string
  claimCount: number
  maxClaims: number
  status: QuickTransferStatus
}

export interface QuickTransferErrorInfo {
  code: string
  message: string
  canRetryComplete?: boolean
  canRetryUpload?: boolean
}
