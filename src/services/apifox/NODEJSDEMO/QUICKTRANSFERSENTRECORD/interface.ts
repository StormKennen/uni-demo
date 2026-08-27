/**
 * @description QuickTransferSentRecord/获取我发送的飞船列表--接口请求Query参数
 * @url GET /quick-transfer-sent-records
 */
export interface getQuickTransferSentRecordsQuery {
  page?: number

  pageSize?: number
}

/**
 * @description QuickTransferSentRecord/获取我发送的飞船列表--接口返回值
 * @url GET /quick-transfer-sent-records
 */
export interface getQuickTransferSentRecordsRes {
  items: getQuickTransferSentRecordsResItems[]
  pagination: { [key: string]: any }
}

/** getQuickTransferSentRecordsResItemsPreview */
export interface getQuickTransferSentRecordsResItemsPreview {
  fileName?: string
  referenceTitle?: string
  text?: string
}

/** getQuickTransferSentRecordsResItemsSummary */
export interface getQuickTransferSentRecordsResItemsSummary {
  fileCount: number
  hasText: boolean
  linkCount: number
  referenceCount: number
}

/** getQuickTransferSentRecordsResItems */
export interface getQuickTransferSentRecordsResItems {
  canRecall: boolean
  claimCount: number
  displayTitle: string
  expiresAt: any
  maxClaims: number
  preview: getQuickTransferSentRecordsResItemsPreview
  sentAt: string
  sentRecordId: string
  status:
    | 'uploading'
    | 'ready'
    | 'consumed'
    | 'expired'
    | 'cancelled'
    | 'deleting'
    | 'deleted'
  summary: getQuickTransferSentRecordsResItemsSummary
  transferId: string
}

/**
 * @description QuickTransferSentRecord/获取我发送的飞船详情--接口返回值
 * @url GET /quick-transfer-sent-records/{sentRecordId}
 */
export interface getQuickTransferSentRecordsSentRecordIdRes {
  canRecall: boolean
  cancelledAt: any
  claimCount: number
  consumedAt: any
  content: getQuickTransferSentRecordsSentRecordIdResContent
  displayTitle: string
  expiresAt: any
  maxClaims: number
  readyAt: any
  sentAt: string
  sentRecordId: string
  status:
    | 'uploading'
    | 'ready'
    | 'consumed'
    | 'expired'
    | 'cancelled'
    | 'deleting'
    | 'deleted'
  transferId: string
}

/** getQuickTransferSentRecordsSentRecordIdResContentFiles */
export interface getQuickTransferSentRecordsSentRecordIdResContentFiles {
  /** 当前根据 Transfer 文件状态判断的可用性 */
  available: boolean
  fileId: string
  mimeType: string
  name: string
  size: number
}

/** getQuickTransferSentRecordsSentRecordIdResContentLinks */
export interface getQuickTransferSentRecordsSentRecordIdResContentLinksItem {
  title?: string
  url?: string
}

/** getQuickTransferSentRecordsSentRecordIdResContentReferences */
export interface getQuickTransferSentRecordsSentRecordIdResContentReferencesItem {
  params?: { [key: string]: any }
  resourceId?: string
  subtitle?: string
  title: string
  type: string
}

/** getQuickTransferSentRecordsSentRecordIdResContent */
export interface getQuickTransferSentRecordsSentRecordIdResContent {
  /** 文件历史 Metadata 和当前可用性；不返回 OSS key 或凭据。 */
  files: getQuickTransferSentRecordsSentRecordIdResContentFiles[]
  links: getQuickTransferSentRecordsSentRecordIdResContentLinksItem[]
  references: getQuickTransferSentRecordsSentRecordIdResContentReferencesItem[]
  text: any
}

/**
 * @description QuickTransferSentRecord/删除我发送的飞船记录--接口返回值
 * @url DELETE /quick-transfer-sent-records/{sentRecordId}
 */
export interface deleteQuickTransferSentRecordsSentRecordIdRes {
  deletedAt: string
  sentRecordId: string
}

/**
 * @description QuickTransferSentRecord/重新访问我发送的附件--接口路径参数
 * @url POST /quick-transfer-sent-records/{sentRecordId}/files/{fileId}/access
 */
export interface postFilesFileIdAccessPathQuery {
  sentRecordId: string

  fileId: string
}

/**
 * @description QuickTransferSentRecord/重新访问我发送的附件--接口返回值
 * @url POST /quick-transfer-sent-records/{sentRecordId}/files/{fileId}/access
 */
export interface postFilesFileIdAccessRes {
  expiresAt: string
  url: string
}
