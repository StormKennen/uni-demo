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
  linkTitle?: string
  referenceTitle?: string
  text?: string
}

/** getQuickTransferSentRecordsResItemsSummary */
export interface getQuickTransferSentRecordsResItemsSummary {
  fileCount: number
  hasText: boolean
  /** MIME 类型以 image/ 开头的文件数量 */
  imageCount: number
  linkCount: number
  /** 非图片文件数量 */
  otherFileCount: number
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
  primaryType: 'text' | 'image' | 'file' | 'link' | 'reference' | 'mixed'
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
  /** 飞船标题；旧记录由 displayTitle 兼容回退 */
  title: string
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
  /** 飞船标题；旧记录由 displayTitle 兼容回退 */
  title: string
  transferId: string
}

/** getQuickTransferSentRecordsSentRecordIdResContentFiles */
export interface getQuickTransferSentRecordsSentRecordIdResContentFiles {
  /** 当前根据 Transfer 文件状态判断的可用性 */
  available: boolean
  /** 对用户展示及下载使用的文件名 */
  displayName: string
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
