/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteQuickTransfersTransferIdRes,
  getQuickTransfersTransferIdRes,
  postQuickTransfersBody,
  postQuickTransfersRes,
  postQuickTransfersResolveBody,
  postQuickTransfersResolveRes,
  postQuickTransfersTransferIdCompleteRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description QuickTransfer/创建跨设备快传
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
 * @description QuickTransfer/通过提取码或 shareToken 领取
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
 * @description QuickTransfer/Owner 查看快传状态
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
 * @description QuickTransfer/Owner 幂等取消快传
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
