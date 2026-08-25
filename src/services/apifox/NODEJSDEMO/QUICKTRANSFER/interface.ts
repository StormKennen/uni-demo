/**
 * @description QuickTransfer/创建跨设备快传--接口请求Body参数
 * @url POST /quick-transfers
 */
export type postQuickTransfersBody = string

/**
 * @description QuickTransfer/创建跨设备快传--接口返回值
 * @url POST /quick-transfers
 */
export interface postQuickTransfersRes {
  claimCount: number
  code: string
  expiresAt: string
  maxClaims: number
  shareToken: string
  status: 'uploading' | 'ready'
  transferId: string
  type: 'text' | 'url' | 'file'
  upload?: postQuickTransfersResUpload
}

/** postQuickTransfersResUpload */
export interface postQuickTransfersResUpload {
  expiresAt: string
  /** 原样提交给 OSS 的 POST 表单字段，包括 key、policy、OSSAccessKeyId、Signature、x-oss-content-type、success_action_status、x-oss-object-acl 和 x-oss-forbid-overwrite；禁止过滤或改写字段 */
  fields: { [key: string]: any }
  /** multipart 文件字段名；文件字段应在所有 formData 字段之后提交 */
  fileField: 'file'
  method: 'POST'
  successStatus: number
  /** wx/uni.uploadFile 或 H5 FormData 直接 POST 的私有 OSS 地址 */
  url: string
}

/**
 * @description QuickTransfer/通过提取码或 shareToken 领取--接口请求Body参数
 * @url POST /quick-transfers/resolve
 */
export type postQuickTransfersResolveBody = string

/**
 * @description QuickTransfer/通过提取码或 shareToken 领取--接口返回值
 * @url POST /quick-transfers/resolve
 */
export type postQuickTransfersResolveRes = string

/**
 * @description QuickTransfer/确认文件已直传 OSS--接口返回值
 * @url POST /quick-transfers/{transferId}/complete
 */
export interface postQuickTransfersTransferIdCompleteRes {
  cancelledAt?: any
  claimCount: number
  consumedAt?: any
  createdAt: string
  expiresAt: string
  file?: any
  maxClaims: number
  readyAt?: any
  status:
    | 'uploading'
    | 'ready'
    | 'consumed'
    | 'expired'
    | 'cancelled'
    | 'deleting'
    | 'deleted'
  transferId: string
  type: 'text' | 'url' | 'file'
  uploadExpiresAt?: any
}

/**
 * @description QuickTransfer/Owner 查看快传状态--接口返回值
 * @url GET /quick-transfers/{transferId}
 */
export interface getQuickTransfersTransferIdRes {
  cancelledAt?: any
  claimCount: number
  consumedAt?: any
  createdAt: string
  expiresAt: string
  file?: any
  maxClaims: number
  readyAt?: any
  status:
    | 'uploading'
    | 'ready'
    | 'consumed'
    | 'expired'
    | 'cancelled'
    | 'deleting'
    | 'deleted'
  transferId: string
  type: 'text' | 'url' | 'file'
  uploadExpiresAt?: any
}

/**
 * @description QuickTransfer/Owner 幂等取消快传--接口返回值
 * @url DELETE /quick-transfers/{transferId}
 */
export interface deleteQuickTransfersTransferIdRes {
  cancelledAt?: any
  claimCount: number
  consumedAt?: any
  createdAt: string
  expiresAt: string
  file?: any
  maxClaims: number
  readyAt?: any
  status:
    | 'uploading'
    | 'ready'
    | 'consumed'
    | 'expired'
    | 'cancelled'
    | 'deleting'
    | 'deleted'
  transferId: string
  type: 'text' | 'url' | 'file'
  uploadExpiresAt?: any
}
