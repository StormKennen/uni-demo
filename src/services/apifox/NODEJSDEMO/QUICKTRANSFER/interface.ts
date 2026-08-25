/**
 * @description QuickTransfer/创建快船--接口请求Body参数
 * @url POST /quick-transfers
 */
export interface postQuickTransfersBody {
  content: postQuickTransfersBodyContent
  expiresIn?: number
  maxClaims?: number
}

/** postQuickTransfersBodyContentFiles */
export interface postQuickTransfersBodyContentFiles {
  clientFileId?: any
  mimeType: string
  name: string
  size: number
}

/** postQuickTransfersBodyContentLinks */
export interface postQuickTransfersBodyContentLinksItem {
  title?: string
  url: string
}

/** postQuickTransfersBodyContentReferences */
export interface postQuickTransfersBodyContentReferencesItem {
  params?: { [key: string]: any }
  resourceId?: string
  subtitle?: string
  title: string
  type: string
}

/** postQuickTransfersBodyContent */
export interface postQuickTransfersBodyContent {
  files?: postQuickTransfersBodyContentFiles[]
  links?: postQuickTransfersBodyContentLinksItem[]
  references?: postQuickTransfersBodyContentReferencesItem[]
  /** 纯文本，UTF-8 最大长度可配置 */
  text?: string
}

/**
 * @description QuickTransfer/创建快船--接口返回值
 * @url POST /quick-transfers
 */
export type postQuickTransfersRes = string

/**
 * @description QuickTransfer/通过 code 或 shareToken 收船--接口请求Body参数
 * @url POST /quick-transfers/resolve
 */
export type postQuickTransfersResolveBody = string

/**
 * @description QuickTransfer/通过 code 或 shareToken 收船--接口返回值
 * @url POST /quick-transfers/resolve
 */
export type postQuickTransfersResolveRes = string

/**
 * @description QuickTransfer/确认文件已直传 OSS--接口返回值
 * @url POST /quick-transfers/{transferId}/complete
 */
export type postQuickTransfersTransferIdCompleteRes = string

/**
 * @description QuickTransfer/检查分享快船是否可领取--接口请求Body参数
 * @url POST /quick-transfers/share/inspect
 */
export interface postQuickTransfersShareInspectBody {
  shareToken: string
}

/**
 * @description QuickTransfer/检查分享快船是否可领取--接口返回值
 * @url POST /quick-transfers/share/inspect
 */
export type postQuickTransfersShareInspectRes = string

/**
 * @description QuickTransfer/完成单个文件上传校验--接口路径参数
 * @url POST /quick-transfers/{transferId}/files/{fileId}/complete
 */
export interface postFilesFileIdCompletePathQuery {
  transferId: string

  fileId: string
}

/**
 * @description QuickTransfer/完成单个文件上传校验--接口返回值
 * @url POST /quick-transfers/{transferId}/files/{fileId}/complete
 */
export type postFilesFileIdCompleteRes = string

/**
 * @description QuickTransfer/Owner 查看快船状态--接口返回值
 * @url GET /quick-transfers/{transferId}
 */
export type getQuickTransfersTransferIdRes = string

/**
 * @description QuickTransfer/重新获取单文件 OSS 上传凭证--接口路径参数
 * @url POST /quick-transfers/{transferId}/files/{fileId}/upload-policy
 */
export interface postFilesFileIdUploadPolicyPathQuery {
  transferId: string

  fileId: string
}

/**
 * @description QuickTransfer/重新获取单文件 OSS 上传凭证--接口返回值
 * @url POST /quick-transfers/{transferId}/files/{fileId}/upload-policy
 */
export type postFilesFileIdUploadPolicyRes = string

/**
 * @description QuickTransfer/Owner 召回整艘快船--接口返回值
 * @url DELETE /quick-transfers/{transferId}
 */
export type deleteQuickTransfersTransferIdRes = string

/**
 * @description QuickTransfer/按需获取文件 Signed URL--接口路径参数
 * @url POST /quick-transfers/{transferId}/files/{fileId}/access
 */
export interface postFilesFileIdAccessPathQuery {
  transferId: string

  fileId: string
}

/**
 * @description QuickTransfer/按需获取文件 Signed URL--接口请求Body参数
 * @url POST /quick-transfers/{transferId}/files/{fileId}/access
 */
export interface postFilesFileIdAccessBody {
  claimToken: string
}

/**
 * @description QuickTransfer/按需获取文件 Signed URL--接口返回值
 * @url POST /quick-transfers/{transferId}/files/{fileId}/access
 */
export type postFilesFileIdAccessRes = string
