/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteFilesIdRes,
  deleteFilesIdShareRes,
  getFilesIdRes,
  getFilesQuery,
  getFilesRes,
  postFilesBody,
  postFilesRes,
  putFilesIdBody,
  putFilesIdRes,
  putFilesIdShareBody,
  putFilesIdShareRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Files/获取文件列表
 * @url GET /files
 * @host https://app.apifox.com/link/project/7048425/apis/api-378526266
 */
export const getFiles = async (
  params: Expand<getFilesQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getFilesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/files', params, _config)
}

/**
 * @description Files/创建文件记录
 * @url POST /files
 * @host https://app.apifox.com/link/project/7048425/apis/api-378526267
 */
export const postFiles = async (
  data: Expand<postFilesBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postFilesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/files', data, _config)
}

/**
 * @description Files/获取文件详情
 * @url GET /files/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-378526268
 */
export const getFilesId = async (
  id: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getFilesIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/files/${id}', {}, _config)
}

/**
 * @description Files/更新文件记录
 * @url PUT /files/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-378526269
 */
export const putFilesId = async (
  id: string,
  data: Expand<putFilesIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<putFilesIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.put('/files/${id}', data, _config)
}

/**
 * @description Files/软删除文件记录
 * @url DELETE /files/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-378526270
 */
export const deleteFilesId = async (
  id: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteFilesIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/files/${id}', {}, _config)
}

/**
 * @description Files/文件白名单分享
 * @url PUT /files/{id}/share
 * @host https://app.apifox.com/link/project/7048425/apis/api-378526271
 */
export const putFilesIdShare = async (
  id: string,
  data: Expand<putFilesIdShareBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<putFilesIdShareRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.put('/files/${id}/share', data, _config)
}

/**
 * @description Files/取消文件白名单分享
 * @url DELETE /files/{id}/share
 * @host https://app.apifox.com/link/project/7048425/apis/api-378526272
 */
export const deleteFilesIdShare = async (
  id: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteFilesIdShareRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/files/${id}/share', {}, _config)
}
