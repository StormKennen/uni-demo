/**
 * @description QuickTransferReceipt/获取已收飞船列表--接口请求Query参数
 * @url GET /quick-transfer-receipts
 */
export interface getQuickTransferReceiptsQuery {
  page?: number

  pageSize?: number
}

/**
 * @description QuickTransferReceipt/获取已收飞船列表--接口返回值
 * @url GET /quick-transfer-receipts
 */
export interface getQuickTransferReceiptsRes {
  items: getQuickTransferReceiptsResItems[]
  pagination: { [key: string]: any }
}

/** getQuickTransferReceiptsResItemsPreview */
export interface getQuickTransferReceiptsResItemsPreview {
  fileName?: string
  linkTitle?: string
  referenceTitle?: string
  text?: string
}

/** getQuickTransferReceiptsResItemsSummary */
export interface getQuickTransferReceiptsResItemsSummary {
  fileCount: number
  hasText: boolean
  /** MIME 类型以 image/ 开头的文件数量 */
  imageCount: number
  linkCount: number
  /** 非图片文件数量 */
  otherFileCount: number
  referenceCount: number
}

/** getQuickTransferReceiptsResItems */
export interface getQuickTransferReceiptsResItems {
  claimedAt: string
  displayTitle: string
  preview: getQuickTransferReceiptsResItemsPreview
  primaryType: 'text' | 'image' | 'file' | 'link' | 'reference' | 'mixed'
  receiptId: string
  summary: getQuickTransferReceiptsResItemsSummary
}

/**
 * @description QuickTransferReceipt/获取已收飞船详情--接口返回值
 * @url GET /quick-transfer-receipts/{receiptId}
 */
export interface getQuickTransferReceiptsReceiptIdRes {
  claimedAt: string
  content: getQuickTransferReceiptsReceiptIdResContent
  displayTitle: string
  receiptId: string
}

/** getQuickTransferReceiptsReceiptIdResContentFiles */
export interface getQuickTransferReceiptsReceiptIdResContentFiles {
  /** 当前根据 Transfer/OSS 状态判断的可用性 */
  available: boolean
  fileId: string
  mimeType: string
  name: string
  size: number
}

/** getQuickTransferReceiptsReceiptIdResContentLinks */
export interface getQuickTransferReceiptsReceiptIdResContentLinks {
  title?: string
  url: string
}

/** getQuickTransferReceiptsReceiptIdResContentReferences */
export interface getQuickTransferReceiptsReceiptIdResContentReferences {
  params?: { [key: string]: any }
  resourceId?: string
  subtitle?: string
  title: string
  type: string
}

/** getQuickTransferReceiptsReceiptIdResContent */
export interface getQuickTransferReceiptsReceiptIdResContent {
  /** 文件 Metadata 和当前可用性；不返回 OSS 凭据或访问地址。 */
  files: getQuickTransferReceiptsReceiptIdResContentFiles[]
  links: getQuickTransferReceiptsReceiptIdResContentLinks[]
  references: getQuickTransferReceiptsReceiptIdResContentReferences[]
  text: any
}

/**
 * @description QuickTransferReceipt/重新访问已收飞船附件--接口路径参数
 * @url POST /quick-transfer-receipts/{receiptId}/files/{fileId}/access
 */
export interface postFilesFileIdAccessPathQuery {
  receiptId: string

  fileId: string
}

/**
 * @description QuickTransferReceipt/重新访问已收飞船附件--接口返回值
 * @url POST /quick-transfer-receipts/{receiptId}/files/{fileId}/access
 */
export interface postFilesFileIdAccessRes {
  expiresAt: string
  url: string
}

/**
 * @description QuickTransferReceipt/删除已收飞船记录--接口返回值
 * @url DELETE /quick-transfer-receipts/{receiptId}
 */
export interface deleteQuickTransferReceiptsReceiptIdRes {
  deletedAt: string
  receiptId: string
}
