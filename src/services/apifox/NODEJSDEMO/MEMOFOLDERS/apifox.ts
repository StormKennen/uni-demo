/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteMemoFoldersFolderIdRes,
  getMemoFoldersFolderIdRes,
  getMemoFoldersQuery,
  getMemoFoldersRes,
  getMemoFoldersStatsRes,
  patchMemoFoldersFolderIdBody,
  patchMemoFoldersFolderIdRes,
  postMemoFoldersBody,
  postMemoFoldersRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description MemoFolders/Create a folder
 * @url POST /memo-folders
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070046
 */
export const postMemoFolders = async (
  data: Expand<postMemoFoldersBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemoFoldersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/memo-folders', data, _config)
}

/**
 * @description MemoFolders/Get all folders
 * @url GET /memo-folders
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070047
 */
export const getMemoFolders = async (
  params: Expand<getMemoFoldersQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemoFoldersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/memo-folders', params, _config)
}

/**
 * @description MemoFolders/Get folder statistics
 * @url GET /memo-folders/stats
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070048
 */
export const getMemoFoldersStats = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemoFoldersStatsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/memo-folders/stats', {}, _config)
}

/**
 * @description MemoFolders/Get a folder
 * @url GET /memo-folders/{folderId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070049
 */
export const getMemoFoldersFolderId = async (
  folderId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemoFoldersFolderIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/memo-folders/${folderId}', {}, _config)
}

/**
 * @description MemoFolders/Update a folder
 * @url PATCH /memo-folders/{folderId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070050
 */
export const patchMemoFoldersFolderId = async (
  folderId: string,
  data: Expand<patchMemoFoldersFolderIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchMemoFoldersFolderIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch('/memo-folders/${folderId}', data, _config)
}

/**
 * @description MemoFolders/Delete a folder
 * @url DELETE /memo-folders/{folderId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070051
 */
export const deleteMemoFoldersFolderId = async (
  folderId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteMemoFoldersFolderIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/memo-folders/${folderId}', {}, _config)
}
