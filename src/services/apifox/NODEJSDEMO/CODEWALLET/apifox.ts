/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteCodeWalletItemsItemIdRes,
  getCodeWalletItemsItemIdRes,
  getCodeWalletItemsQuery,
  getCodeWalletItemsRes,
  patchCodeWalletItemsItemIdBody,
  patchCodeWalletItemsItemIdRes,
  postCodeWalletItemsBody,
  postCodeWalletItemsRes,
  postCodeWalletItemsSyncBody,
  postCodeWalletItemsSyncRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description CodeWallet/获取码包列表
 * @url GET /code-wallet/items
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256859
 */
export const getCodeWalletItems = async (
  params: Expand<getCodeWalletItemsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCodeWalletItemsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/code-wallet/items`, params, _config)
}

/**
 * 自定义函数：usegetCodeWalletItems
 * @description CodeWallet/获取码包列表
 * @url GET /code-wallet/items
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256859
 */

export const useGetCodeWalletItems = (
  params: Expand<getCodeWalletItemsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/code-wallet/items`, params, fetchOptions],
    queryFn: () => getCodeWalletItems(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCodeWalletItems = (
  params: Expand<getCodeWalletItemsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/code-wallet/items`, params, fetchOptions],
    queryFn: () => getCodeWalletItems(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CodeWallet/创建码包条目
 * @url POST /code-wallet/items
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256860
 */
export const postCodeWalletItems = async (
  data: Expand<postCodeWalletItemsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postCodeWalletItemsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/code-wallet/items`, data, _config)
}

/**
 * 自定义函数：usepostCodeWalletItems
 * @description CodeWallet/创建码包条目
 * @url POST /code-wallet/items
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256860
 */

export const usePostCodeWalletItems = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postCodeWalletItems, ..._queryOptions })
}

/**
 * @description CodeWallet/本地码包同步到云端
 * @url POST /code-wallet/items/sync
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256861
 */
export const postCodeWalletItemsSync = async (
  data: Expand<postCodeWalletItemsSyncBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postCodeWalletItemsSyncRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/code-wallet/items/sync`, data, _config)
}

/**
 * 自定义函数：usepostCodeWalletItemsSync
 * @description CodeWallet/本地码包同步到云端
 * @url POST /code-wallet/items/sync
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256861
 */

export const usePostCodeWalletItemsSync = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postCodeWalletItemsSync, ..._queryOptions })
}

/**
 * @description CodeWallet/获取码包详情
 * @url GET /code-wallet/items/{itemId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256862
 */
export const getCodeWalletItemsItemId = async (
  itemId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCodeWalletItemsItemIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/code-wallet/items/${itemId}`, {}, _config)
}

/**
 * 自定义函数：usegetCodeWalletItemsItemId
 * @description CodeWallet/获取码包详情
 * @url GET /code-wallet/items/{itemId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256862
 */

export const useGetCodeWalletItemsItemId = (
  itemId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/code-wallet/items/${itemId}`, fetchOptions],
    queryFn: () => getCodeWalletItemsItemId(itemId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCodeWalletItemsItemId = (
  itemId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/code-wallet/items/${itemId}`, fetchOptions],
    queryFn: () => getCodeWalletItemsItemId(itemId, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CodeWallet/更新码包条目
 * @url PATCH /code-wallet/items/{itemId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256863
 */
export const patchCodeWalletItemsItemId = async (
  itemId: string,
  data: Expand<patchCodeWalletItemsItemIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchCodeWalletItemsItemIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/code-wallet/items/${itemId}`, data, _config)
}

/**
 * 自定义函数：usepatchCodeWalletItemsItemId
 * @description CodeWallet/更新码包条目
 * @url PATCH /code-wallet/items/{itemId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256863
 */

export const usePatchCodeWalletItemsItemId = (_queryOptions?: object = {}) => {
  return useMutation({
    mutationFn: patchCodeWalletItemsItemId,
    ..._queryOptions,
  })
}

/**
 * @description CodeWallet/删除码包条目（软删除）
 * @url DELETE /code-wallet/items/{itemId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256864
 */
export const deleteCodeWalletItemsItemId = async (
  itemId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteCodeWalletItemsItemIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(`/code-wallet/items/${itemId}`, {}, _config)
}

/**
 * 自定义函数：usedeleteCodeWalletItemsItemId
 * @description CodeWallet/删除码包条目（软删除）
 * @url DELETE /code-wallet/items/{itemId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256864
 */

export const useDeleteCodeWalletItemsItemId = (
  itemId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/code-wallet/items/${itemId}`, fetchOptions],
    queryFn: () => deleteCodeWalletItemsItemId(itemId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionDeleteCodeWalletItemsItemId = (
  itemId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/code-wallet/items/${itemId}`, fetchOptions],
    queryFn: () => deleteCodeWalletItemsItemId(itemId, fetchOptions),
    ..._queryOptions,
  })
}
