/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteMemosMemoIdPermanentRes,
  deleteMemosMemoIdRes,
  getAdminMemosMemoIdRes,
  getAdminMemosQuery,
  getAdminMemosRes,
  getMemosMemoIdPublicRes,
  getMemosMemoIdRes,
  getMemosPublicDetailQuery,
  getMemosPublicDetailRes,
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
  return http.post(`/memos`, data, _config)
}

/**
 * 自定义函数：usepostMemos
 * @description Memos/Create a memo
 * @url POST /memos
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070033
 */

export const usePostMemos = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postMemos, ..._queryOptions })
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
  return http.get(`/memos`, params, _config)
}

/**
 * 自定义函数：usegetMemos
 * @description Memos/Get all memos
 * @url GET /memos
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070034
 */

export const useGetMemos = (
  params: Expand<getMemosQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/memos`, params, fetchOptions],
    queryFn: () => getMemos(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetMemos = (
  params: Expand<getMemosQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/memos`, params, fetchOptions],
    queryFn: () => getMemos(params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.get(`/memos/tags`, {}, _config)
}

/**
 * 自定义函数：usegetMemosTags
 * @description Memos/Get all tags
 * @url GET /memos/tags
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070035
 */

export const useGetMemosTags = (
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/memos/tags`, fetchOptions],
    queryFn: () => getMemosTags(fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetMemosTags = (
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/memos/tags`, fetchOptions],
    queryFn: () => getMemosTags(fetchOptions),
    ..._queryOptions,
  })
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
  return http.get(`/memos/stats`, {}, _config)
}

/**
 * 自定义函数：usegetMemosStats
 * @description Memos/Get memo statistics
 * @url GET /memos/stats
 * @host https://app.apifox.com/link/project/7048425/apis/api-392744883
 */

export const useGetMemosStats = (
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/memos/stats`, fetchOptions],
    queryFn: () => getMemosStats(fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetMemosStats = (
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/memos/stats`, fetchOptions],
    queryFn: () => getMemosStats(fetchOptions),
    ..._queryOptions,
  })
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
  return http.patch(`/memos/batch`, data, _config)
}

/**
 * 自定义函数：usepatchMemosBatch
 * @description Memos/Batch update memos
 * @url PATCH /memos/batch
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070036
 */

export const usePatchMemosBatch = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: patchMemosBatch, ..._queryOptions })
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
  return http.get(`/memos/${memoId}`, {}, _config)
}

/**
 * 自定义函数：usegetMemosMemoId
 * @description Memos/Get a memo
 * @url GET /memos/{memoId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070037
 */

export const useGetMemosMemoId = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/memos/${memoId}`, fetchOptions],
    queryFn: () => getMemosMemoId(memoId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetMemosMemoId = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/memos/${memoId}`, fetchOptions],
    queryFn: () => getMemosMemoId(memoId, fetchOptions),
    ..._queryOptions,
  })
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
  return http.patch(`/memos/${memoId}`, data, _config)
}

/**
 * 自定义函数：usepatchMemosMemoId
 * @description Memos/Update a memo
 * @url PATCH /memos/{memoId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070038
 */

export const usePatchMemosMemoId = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: patchMemosMemoId, ..._queryOptions })
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
  return http.delete(`/memos/${memoId}`, {}, _config)
}

/**
 * 自定义函数：usedeleteMemosMemoId
 * @description Memos/Delete a memo
 * @url DELETE /memos/{memoId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070039
 */

export const useDeleteMemosMemoId = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/memos/${memoId}`, fetchOptions],
    queryFn: () => deleteMemosMemoId(memoId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionDeleteMemosMemoId = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/memos/${memoId}`, fetchOptions],
    queryFn: () => deleteMemosMemoId(memoId, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description Memos/Get a public memo (no auth required)
 * @url GET /memos/public/detail
 * @host https://app.apifox.com/link/project/7048425/apis/api-396224787
 */
export const getMemosPublicDetail = async (
  params: Expand<getMemosPublicDetailQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemosPublicDetailRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/memos/public/detail`, params, _config)
}

/**
 * 自定义函数：usegetMemosPublicDetail
 * @description Memos/Get a public memo (no auth required)
 * @url GET /memos/public/detail
 * @host https://app.apifox.com/link/project/7048425/apis/api-396224787
 */

export const useGetMemosPublicDetail = (
  params: Expand<getMemosPublicDetailQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/memos/public/detail`, params, fetchOptions],
    queryFn: () => getMemosPublicDetail(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetMemosPublicDetail = (
  params: Expand<getMemosPublicDetailQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/memos/public/detail`, params, fetchOptions],
    queryFn: () => getMemosPublicDetail(params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.post(`/memos/${memoId}/archive`, {}, _config)
}

/**
 * 自定义函数：usepostMemosMemoIdArchive
 * @description Memos/Archive a memo
 * @url POST /memos/{memoId}/archive
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070040
 */

export const usePostMemosMemoIdArchive = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postMemosMemoIdArchive, ..._queryOptions })
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
  return http.post(`/memos/${memoId}/restore`, {}, _config)
}

/**
 * 自定义函数：usepostMemosMemoIdRestore
 * @description Memos/Restore a memo
 * @url POST /memos/{memoId}/restore
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070041
 */

export const usePostMemosMemoIdRestore = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postMemosMemoIdRestore, ..._queryOptions })
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
  return http.post(`/memos/${memoId}/pin`, {}, _config)
}

/**
 * 自定义函数：usepostMemosMemoIdPin
 * @description Memos/Toggle pin status
 * @url POST /memos/{memoId}/pin
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070042
 */

export const usePostMemosMemoIdPin = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postMemosMemoIdPin, ..._queryOptions })
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
  return http.post(`/memos/${memoId}/favorite`, {}, _config)
}

/**
 * 自定义函数：usepostMemosMemoIdFavorite
 * @description Memos/Toggle favorite status
 * @url POST /memos/{memoId}/favorite
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070043
 */

export const usePostMemosMemoIdFavorite = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postMemosMemoIdFavorite, ..._queryOptions })
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
  return http.post(`/memos/${memoId}/move`, data, _config)
}

/**
 * 自定义函数：usepostMemosMemoIdMove
 * @description Memos/Move memo to folder
 * @url POST /memos/{memoId}/move
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070044
 */

export const usePostMemosMemoIdMove = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postMemosMemoIdMove, ..._queryOptions })
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
  return http.delete(`/memos/${memoId}/permanent`, {}, _config)
}

/**
 * 自定义函数：usedeleteMemosMemoIdPermanent
 * @description Memos/Permanently delete a memo
 * @url DELETE /memos/{memoId}/permanent
 * @host https://app.apifox.com/link/project/7048425/apis/api-390070045
 */

export const useDeleteMemosMemoIdPermanent = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/memos/${memoId}/permanent`, fetchOptions],
    queryFn: () => deleteMemosMemoIdPermanent(memoId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionDeleteMemosMemoIdPermanent = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/memos/${memoId}/permanent`, fetchOptions],
    queryFn: () => deleteMemosMemoIdPermanent(memoId, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description Memos/Get a public memo (no auth required)
 * @url GET /memos/{memoId}/public
 * @host https://app.apifox.com/link/project/7048425/apis/api-395917382
 */
export const getMemosMemoIdPublic = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemosMemoIdPublicRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/memos/${memoId}/public`, {}, _config)
}

/**
 * 自定义函数：usegetMemosMemoIdPublic
 * @description Memos/Get a public memo (no auth required)
 * @url GET /memos/{memoId}/public
 * @host https://app.apifox.com/link/project/7048425/apis/api-395917382
 */

export const useGetMemosMemoIdPublic = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/memos/${memoId}/public`, fetchOptions],
    queryFn: () => getMemosMemoIdPublic(memoId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetMemosMemoIdPublic = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/memos/${memoId}/public`, fetchOptions],
    queryFn: () => getMemosMemoIdPublic(memoId, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description Memos/[Admin] Get all memos (read-only)
 * @url GET /admin/memos
 * @host https://app.apifox.com/link/project/7048425/apis/api-487059697
 */
export const getAdminMemos = async (
  params: Expand<getAdminMemosQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminMemosRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/admin/memos`, params, _config)
}

/**
 * 自定义函数：usegetAdminMemos
 * @description Memos/[Admin] Get all memos (read-only)
 * @url GET /admin/memos
 * @host https://app.apifox.com/link/project/7048425/apis/api-487059697
 */

export const useGetAdminMemos = (
  params: Expand<getAdminMemosQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/memos`, params, fetchOptions],
    queryFn: () => getAdminMemos(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetAdminMemos = (
  params: Expand<getAdminMemosQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/memos`, params, fetchOptions],
    queryFn: () => getAdminMemos(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description Memos/[Admin] Get any memo (read-only)
 * @url GET /admin/memos/{memoId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-487059698
 */
export const getAdminMemosMemoId = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminMemosMemoIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/admin/memos/${memoId}`, {}, _config)
}

/**
 * 自定义函数：usegetAdminMemosMemoId
 * @description Memos/[Admin] Get any memo (read-only)
 * @url GET /admin/memos/{memoId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-487059698
 */

export const useGetAdminMemosMemoId = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/memos/${memoId}`, fetchOptions],
    queryFn: () => getAdminMemosMemoId(memoId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetAdminMemosMemoId = (
  memoId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/memos/${memoId}`, fetchOptions],
    queryFn: () => getAdminMemosMemoId(memoId, fetchOptions),
    ..._queryOptions,
  })
}
