/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteMemosMemoIdPermanentRes,
  deleteMemosMemoIdRes,
  getMemosMemoIdRes,
  getMemosQuery,
  getMemosRes,
  getMemosStatsRes,
  getMemosTagsRes,
  patchMemosBatchBody,
  patchMemosBatchRes,
  patchMemosMemoIdBody,
  patchMemosMemoIdRes,
  postMemosBody,
  postMemosMemoIdArchiveRes,
  postMemosMemoIdFavoriteRes,
  postMemosMemoIdMoveBody,
  postMemosMemoIdMoveRes,
  postMemosMemoIdPinRes,
  postMemosMemoIdRestoreRes,
  postMemosRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Memos/Create a memo
 * @url POST /memos
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070033
 */
export const postMemos = async (
  data: Expand<postMemosBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/memos', data, _config)
}

/**
 * @description Memos/Get all memos
 * @url GET /memos
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070034
 */
export const getMemos = async (
  params: Expand<getMemosQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemosRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/memos', params, _config)
}

/**
 * @description Memos/Get all tags
 * @url GET /memos/tags
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070035
 */
export const getMemosTags = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemosTagsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/memos/tags', {}, _config)
}

/**
 * @description Memos/Batch update memos
 * @url PATCH /memos/batch
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070036
 */
export const patchMemosBatch = async (
  data: Expand<patchMemosBatchBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchMemosBatchRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch('/memos/batch', data, _config)
}

/**
 * @description Memos/Get a memo
 * @url GET /memos/{memoId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070037
 */
export const getMemosMemoId = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemosMemoIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/memos/${memoId}', {}, _config)
}

/**
 * @description Memos/Update a memo
 * @url PATCH /memos/{memoId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070038
 */
export const patchMemosMemoId = async (
  memoId: string,
  data: Expand<patchMemosMemoIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchMemosMemoIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch('/memos/${memoId}', data, _config)
}

/**
 * @description Memos/Delete a memo
 * @url DELETE /memos/{memoId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070039
 */
export const deleteMemosMemoId = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteMemosMemoIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/memos/${memoId}', {}, _config)
}

/**
 * @description Memos/Archive a memo
 * @url POST /memos/{memoId}/archive
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070040
 */
export const postMemosMemoIdArchive = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdArchiveRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/memos/${memoId}/archive', {}, _config)
}

/**
 * @description Memos/Restore a memo
 * @url POST /memos/{memoId}/restore
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070041
 */
export const postMemosMemoIdRestore = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdRestoreRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/memos/${memoId}/restore', {}, _config)
}

/**
 * @description Memos/Toggle pin status
 * @url POST /memos/{memoId}/pin
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070042
 */
export const postMemosMemoIdPin = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdPinRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/memos/${memoId}/pin', {}, _config)
}

/**
 * @description Memos/Toggle favorite status
 * @url POST /memos/{memoId}/favorite
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070043
 */
export const postMemosMemoIdFavorite = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdFavoriteRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/memos/${memoId}/favorite', {}, _config)
}

/**
 * @description Memos/Move memo to folder
 * @url POST /memos/{memoId}/move
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070044
 */
export const postMemosMemoIdMove = async (
  memoId: string,
  data: Expand<postMemosMemoIdMoveBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdMoveRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/memos/${memoId}/move', data, _config)
}

/**
 * @description Memos/Permanently delete a memo
 * @url DELETE /memos/{memoId}/permanent
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070045
 */
export const deleteMemosMemoIdPermanent = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteMemosMemoIdPermanentRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/memos/${memoId}/permanent', {}, _config)
}

/**
 * @description Memos/Get memo statistics
 * @url GET /memos/stats
 * @host https://app.apifox.com/link/project/7048425/apis/api-392744883
 */
export const getMemosStats = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemosStatsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/memos/stats', {}, _config)
}
