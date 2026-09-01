/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteQuickTransferReceiptsReceiptIdRes,
  getQuickTransferReceiptsQuery,
  getQuickTransferReceiptsReceiptIdRes,
  getQuickTransferReceiptsRes,
  postFilesFileIdAccessPathQuery,
  postFilesFileIdAccessRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description QuickTransferReceipt/获取已收飞船列表
 * @url GET /quick-transfer-receipts
 * @host https://app.apifox.com/link/project/7048425/apis/api-507052093
 */
export const getQuickTransferReceipts = async (
  params: Expand<getQuickTransferReceiptsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getQuickTransferReceiptsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/quick-transfer-receipts`, params, _config)
}

/**
 * @description QuickTransferReceipt/获取已收飞船详情
 * @url GET /quick-transfer-receipts/{receiptId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-507052094
 */
export const getQuickTransferReceiptsReceiptId = async (
  receiptId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getQuickTransferReceiptsReceiptIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/quick-transfer-receipts/${receiptId}`, {}, _config)
}

/**
 * @description QuickTransferReceipt/重新访问已收飞船附件
 * @url POST /quick-transfer-receipts/{receiptId}/files/{fileId}/access
 * @host https://app.apifox.com/link/project/7048425/apis/api-507052096
 */
export const postQuickTransferReceiptsFilesAccess = async (
  pathParams: Expand<postFilesFileIdAccessPathQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postFilesFileIdAccessRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    `/quick-transfer-receipts/${pathParams.receiptId}/files/${pathParams.fileId}/access`,
    {},
    _config,
  )
}

/**
 * @description QuickTransferReceipt/删除已收飞船记录
 * @url DELETE /quick-transfer-receipts/{receiptId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-507052095
 */
export const deleteQuickTransferReceiptsReceiptId = async (
  receiptId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteQuickTransferReceiptsReceiptIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(`/quick-transfer-receipts/${receiptId}`, {}, _config)
}
