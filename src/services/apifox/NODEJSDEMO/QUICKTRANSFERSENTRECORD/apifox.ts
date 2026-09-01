/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteQuickTransferSentRecordsSentRecordIdRes,
  getQuickTransferSentRecordsQuery,
  getQuickTransferSentRecordsRes,
  getQuickTransferSentRecordsSentRecordIdRes,
  postFilesFileIdAccessPathQuery,
  postFilesFileIdAccessRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description QuickTransferSentRecord/获取我发送的飞船列表
 * @url GET /quick-transfer-sent-records
 * @host https://app.apifox.com/link/project/7048425/apis/api-507311400
 */
export const getQuickTransferSentRecords = async (
  params: Expand<getQuickTransferSentRecordsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getQuickTransferSentRecordsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/quick-transfer-sent-records`, params, _config)
}

/**
 * @description QuickTransferSentRecord/获取我发送的飞船详情
 * @url GET /quick-transfer-sent-records/{sentRecordId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-507311401
 */
export const getQuickTransferSentRecordsSentRecordId = async (
  sentRecordId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getQuickTransferSentRecordsSentRecordIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/quick-transfer-sent-records/${sentRecordId}`, {}, _config)
}

/**
 * @description QuickTransferSentRecord/重新访问我发送的附件
 * @url POST /quick-transfer-sent-records/{sentRecordId}/files/{fileId}/access
 * @host https://app.apifox.com/link/project/7048425/apis/api-507311403
 */
export const postQuickTransferSentRecordsFilesAccess = async (
  pathParams: Expand<postFilesFileIdAccessPathQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postFilesFileIdAccessRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    `/quick-transfer-sent-records/${pathParams.sentRecordId}/files/${pathParams.fileId}/access`,
    {},
    _config,
  )
}

/**
 * @description QuickTransferSentRecord/删除我发送的飞船记录
 * @url DELETE /quick-transfer-sent-records/{sentRecordId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-507311402
 */
export const deleteQuickTransferSentRecordsSentRecordId = async (
  sentRecordId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteQuickTransferSentRecordsSentRecordIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(
    `/quick-transfer-sent-records/${sentRecordId}`,
    {},
    _config,
  )
}
