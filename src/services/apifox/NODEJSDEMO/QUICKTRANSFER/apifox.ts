/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteQuickTransfersTransferIdRes,
  getQuickTransfersTransferIdRes,
  postFilesFileIdAccessBody,
  postFilesFileIdAccessPathQuery,
  postFilesFileIdAccessRes,
  postFilesFileIdCompletePathQuery,
  postFilesFileIdCompleteRes,
  postFilesFileIdUploadPolicyPathQuery,
  postFilesFileIdUploadPolicyRes,
  postQuickTransfersBody,
  postQuickTransfersRes,
  postQuickTransfersResolveBody,
  postQuickTransfersResolveRes,
  postQuickTransfersShareInspectBody,
  postQuickTransfersShareInspectRes,
  postQuickTransfersTransferIdCompleteRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description QuickTransfer/创建快船
 * @url POST /quick-transfers
 * @host https://app.apifox.com/link/project/7048425/apis/api-505270929
 */
export const postQuickTransfers = async (
  data: Expand<postQuickTransfersBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postQuickTransfersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/quick-transfers`, data, _config)
}

/**
 * @description QuickTransfer/通过 code 或 shareToken 收船
 * @url POST /quick-transfers/resolve
 * @host https://app.apifox.com/link/project/7048425/apis/api-505270930
 */
export const postQuickTransfersResolve = async (
  data: Expand<postQuickTransfersResolveBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postQuickTransfersResolveRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/quick-transfers/resolve`, data, _config)
}

/**
 * @description QuickTransfer/确认文件已直传 OSS
 * @url POST /quick-transfers/{transferId}/complete
 * @host https://app.apifox.com/link/project/7048425/apis/api-505270931
 */
export const postQuickTransfersTransferIdComplete = async (
  transferId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postQuickTransfersTransferIdCompleteRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/quick-transfers/${transferId}/complete`, {}, _config)
}

/**
 * @description QuickTransfer/检查分享快船是否可领取
 * @url POST /quick-transfers/share/inspect
 * @host https://app.apifox.com/link/project/7048425/apis/api-506511449
 */
export const postQuickTransfersShareInspect = async (
  data: Expand<postQuickTransfersShareInspectBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postQuickTransfersShareInspectRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/quick-transfers/share/inspect`, data, _config)
}

/**
 * @description QuickTransfer/完成单个文件上传校验
 * @url POST /quick-transfers/{transferId}/files/{fileId}/complete
 * @host https://app.apifox.com/link/project/7048425/apis/api-506511450
 */
export const postQuickTransfersFilesComplete = async (
  pathParams: Expand<postFilesFileIdCompletePathQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postFilesFileIdCompleteRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    `/quick-transfers/${pathParams.transferId}/files/${pathParams.fileId}/complete`,
    {},
    _config,
  )
}

/**
 * @description QuickTransfer/Owner 查看快船状态
 * @url GET /quick-transfers/{transferId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-505270932
 */
export const getQuickTransfersTransferId = async (
  transferId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getQuickTransfersTransferIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/quick-transfers/${transferId}`, {}, _config)
}

/**
 * @description QuickTransfer/重新获取单文件 OSS 上传凭证
 * @url POST /quick-transfers/{transferId}/files/{fileId}/upload-policy
 * @host https://app.apifox.com/link/project/7048425/apis/api-506511451
 */
export const postQuickTransfersFilesUploadPolicy = async (
  pathParams: Expand<postFilesFileIdUploadPolicyPathQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postFilesFileIdUploadPolicyRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    `/quick-transfers/${pathParams.transferId}/files/${pathParams.fileId}/upload-policy`,
    {},
    _config,
  )
}

/**
 * @description QuickTransfer/Owner 召回整艘快船
 * @url DELETE /quick-transfers/{transferId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-505270933
 */
export const deleteQuickTransfersTransferId = async (
  transferId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteQuickTransfersTransferIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(`/quick-transfers/${transferId}`, {}, _config)
}

/**
 * @description QuickTransfer/按需获取文件 Signed URL
 * @url POST /quick-transfers/{transferId}/files/{fileId}/access
 * @host https://app.apifox.com/link/project/7048425/apis/api-506511452
 */
export const postQuickTransfersFilesAccess = async (
  pathParams: Expand<postFilesFileIdAccessPathQuery>,
  data: Expand<postFilesFileIdAccessBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postFilesFileIdAccessRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    `/quick-transfers/${pathParams.transferId}/files/${pathParams.fileId}/access`,
    data,
    _config,
  )
}
