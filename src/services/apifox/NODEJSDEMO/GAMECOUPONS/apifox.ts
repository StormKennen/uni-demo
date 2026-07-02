/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteGameIdAccountsAccountIdPathQuery,
  deleteGameIdAccountsAccountIdRes,
  getGameCouponsGameIdAccountsQuery,
  getGameCouponsGameIdAccountsRes,
  getGameCouponsGameIdCodesQuery,
  getGameCouponsGameIdCodesRes,
  getGameCouponsGameIdProfileQuery,
  getGameCouponsGameIdProfileRes,
  getGameCouponsGameIdRedeemRecordsQuery,
  getGameCouponsGameIdRedeemRecordsRes,
  getGameIdAccountsAccountIdPathQuery,
  getGameIdAccountsAccountIdRes,
  getGameIdRedeemRecordsSummaryQuery,
  getGameIdRedeemRecordsSummaryRes,
  patchGameIdAccountsAccountIdBody,
  patchGameIdAccountsAccountIdPathQuery,
  patchGameIdAccountsAccountIdRes,
  postAccountsAccountIdAutoRedeemBody,
  postAccountsAccountIdAutoRedeemPathQuery,
  postAccountsAccountIdAutoRedeemRes,
  postAccountsAccountIdVerifyPathQuery,
  postAccountsAccountIdVerifyRes,
  postGameCouponsGameIdAccountsBody,
  postGameCouponsGameIdAccountsQuery,
  postGameCouponsGameIdAccountsRes,
  postGameCouponsGameIdRedeemBody,
  postGameCouponsGameIdRedeemQuery,
  postGameCouponsGameIdRedeemRes,
  postGameIdCodesManualBody,
  postGameIdCodesManualQuery,
  postGameIdCodesManualRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description GameCoupons/获取当前可用券码列表
 * @url GET /game-coupons/{gameId}/codes
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831023
 */
export const getGameCouponsGameIdCodes = async (
  gameId: string,
  params: Expand<getGameCouponsGameIdCodesQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGameCouponsGameIdCodesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/game-coupons/$${gameId}/codes`, params, _config)
}

/**
 * 自定义函数：usegetGameCouponsGameIdCodes
 * @description GameCoupons/获取当前可用券码列表
 * @url GET /game-coupons/{gameId}/codes
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831023
 */

export const useGetGameCouponsGameIdCodes = (
  gameId: string,
  params: Expand<getGameCouponsGameIdCodesQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/game-coupons/${gameId}/codes`, params, fetchOptions],
    queryFn: () => getGameCouponsGameIdCodes(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetGameCouponsGameIdCodes = (
  gameId: string,
  params: Expand<getGameCouponsGameIdCodesQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/game-coupons/${gameId}/codes`, params, fetchOptions],
    queryFn: () => getGameCouponsGameIdCodes(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/手动添加券码
 * @url POST /game-coupons/{gameId}/codes/manual
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831024
 */
export const postGameIdCodesManual = async (
  gameId: string,
  params: Expand<postGameIdCodesManualQuery>,
  data: Expand<postGameIdCodesManualBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postGameIdCodesManualRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/game-coupons/$${gameId}/codes/manual`, data, _config)
}

/**
 * 自定义函数：usepostGameIdCodesManual
 * @description GameCoupons/手动添加券码
 * @url POST /game-coupons/{gameId}/codes/manual
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831024
 */

export const usePostGameIdCodesManual = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postGameIdCodesManual, ..._queryOptions })
}

/**
 * @description GameCoupons/查询账号资料（昵称验证）
 * @url GET /game-coupons/{gameId}/profile
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831025
 */
export const getGameCouponsGameIdProfile = async (
  gameId: string,
  params: Expand<getGameCouponsGameIdProfileQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGameCouponsGameIdProfileRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/game-coupons/$${gameId}/profile`, params, _config)
}

/**
 * 自定义函数：usegetGameCouponsGameIdProfile
 * @description GameCoupons/查询账号资料（昵称验证）
 * @url GET /game-coupons/{gameId}/profile
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831025
 */

export const useGetGameCouponsGameIdProfile = (
  gameId: string,
  params: Expand<getGameCouponsGameIdProfileQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/game-coupons/${gameId}/profile`, params, fetchOptions],
    queryFn: () => getGameCouponsGameIdProfile(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetGameCouponsGameIdProfile = (
  gameId: string,
  params: Expand<getGameCouponsGameIdProfileQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/game-coupons/${gameId}/profile`, params, fetchOptions],
    queryFn: () => getGameCouponsGameIdProfile(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/执行兑换（支持多账号多券码批量）
 * @url POST /game-coupons/{gameId}/redeem
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831026
 */
export const postGameCouponsGameIdRedeem = async (
  gameId: string,
  params: Expand<postGameCouponsGameIdRedeemQuery>,
  data: Expand<postGameCouponsGameIdRedeemBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postGameCouponsGameIdRedeemRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/game-coupons/$${gameId}/redeem`, data, _config)
}

/**
 * 自定义函数：usepostGameCouponsGameIdRedeem
 * @description GameCoupons/执行兑换（支持多账号多券码批量）
 * @url POST /game-coupons/{gameId}/redeem
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831026
 */

export const usePostGameCouponsGameIdRedeem = (_queryOptions?: object = {}) => {
  return useMutation({
    mutationFn: postGameCouponsGameIdRedeem,
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/获取当前用户托管账号列表
 * @url GET /game-coupons/{gameId}/accounts
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831027
 */
export const getGameCouponsGameIdAccounts = async (
  gameId: string,
  params: Expand<getGameCouponsGameIdAccountsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGameCouponsGameIdAccountsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/game-coupons/$${gameId}/accounts`, params, _config)
}

/**
 * 自定义函数：usegetGameCouponsGameIdAccounts
 * @description GameCoupons/获取当前用户托管账号列表
 * @url GET /game-coupons/{gameId}/accounts
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831027
 */

export const useGetGameCouponsGameIdAccounts = (
  gameId: string,
  params: Expand<getGameCouponsGameIdAccountsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/game-coupons/${gameId}/accounts`, params, fetchOptions],
    queryFn: () => getGameCouponsGameIdAccounts(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetGameCouponsGameIdAccounts = (
  gameId: string,
  params: Expand<getGameCouponsGameIdAccountsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/game-coupons/${gameId}/accounts`, params, fetchOptions],
    queryFn: () => getGameCouponsGameIdAccounts(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/添加托管账号
 * @url POST /game-coupons/{gameId}/accounts
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831028
 */
export const postGameCouponsGameIdAccounts = async (
  gameId: string,
  params: Expand<postGameCouponsGameIdAccountsQuery>,
  data: Expand<postGameCouponsGameIdAccountsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postGameCouponsGameIdAccountsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/game-coupons/$${gameId}/accounts`, data, _config)
}

/**
 * 自定义函数：usepostGameCouponsGameIdAccounts
 * @description GameCoupons/添加托管账号
 * @url POST /game-coupons/{gameId}/accounts
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831028
 */

export const usePostGameCouponsGameIdAccounts = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: postGameCouponsGameIdAccounts,
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/获取单个托管账号详情
 * @url GET /game-coupons/{gameId}/accounts/{accountId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831029
 */
export const getGameIdAccountsAccountId = async (
  pathParams: Expand<getGameIdAccountsAccountIdPathQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGameIdAccountsAccountIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    `/game-coupons/${pathParams.gameId}/accounts/${pathParams.accountId}`,
    {},
    _config,
  )
}

/**
 * 自定义函数：usegetGameIdAccountsAccountId
 * @description GameCoupons/获取单个托管账号详情
 * @url GET /game-coupons/{gameId}/accounts/{accountId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831029
 */

export const useGetGameIdAccountsAccountId = (
  pathParams: Expand<getGameIdAccountsAccountIdPathQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [
      `/game-coupons/${pathParams.gameId}/accounts/${pathParams.accountId}`,
      fetchOptions,
    ],
    queryFn: () => getGameIdAccountsAccountId(gameId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetGameIdAccountsAccountId = (
  pathParams: Expand<getGameIdAccountsAccountIdPathQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [
      `/game-coupons/${pathParams.gameId}/accounts/${pathParams.accountId}`,
      fetchOptions,
    ],
    queryFn: () => getGameIdAccountsAccountId(gameId, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/更新托管账号信息
 * @url PATCH /game-coupons/{gameId}/accounts/{accountId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831030
 */
export const patchGameIdAccountsAccountId = async (
  pathParams: Expand<patchGameIdAccountsAccountIdPathQuery>,
  data: Expand<patchGameIdAccountsAccountIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchGameIdAccountsAccountIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(
    `/game-coupons/${pathParams.gameId}/accounts/${pathParams.accountId}`,
    data,
    _config,
  )
}

/**
 * 自定义函数：usepatchGameIdAccountsAccountId
 * @description GameCoupons/更新托管账号信息
 * @url PATCH /game-coupons/{gameId}/accounts/{accountId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831030
 */

export const usePatchGameIdAccountsAccountId = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: patchGameIdAccountsAccountId,
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/删除托管账号
 * @url DELETE /game-coupons/{gameId}/accounts/{accountId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831031
 */
export const deleteGameIdAccountsAccountId = async (
  pathParams: Expand<deleteGameIdAccountsAccountIdPathQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteGameIdAccountsAccountIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(
    `/game-coupons/${pathParams.gameId}/accounts/${pathParams.accountId}`,
    {},
    _config,
  )
}

/**
 * 自定义函数：usedeleteGameIdAccountsAccountId
 * @description GameCoupons/删除托管账号
 * @url DELETE /game-coupons/{gameId}/accounts/{accountId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831031
 */

export const useDeleteGameIdAccountsAccountId = (
  pathParams: Expand<deleteGameIdAccountsAccountIdPathQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [
      `/game-coupons/${pathParams.gameId}/accounts/${pathParams.accountId}`,
      fetchOptions,
    ],
    queryFn: () => deleteGameIdAccountsAccountId(gameId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionDeleteGameIdAccountsAccountId = (
  pathParams: Expand<deleteGameIdAccountsAccountIdPathQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [
      `/game-coupons/${pathParams.gameId}/accounts/${pathParams.accountId}`,
      fetchOptions,
    ],
    queryFn: () => deleteGameIdAccountsAccountId(gameId, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/验证托管账号有效性
 * @url POST /game-coupons/{gameId}/accounts/{accountId}/verify
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831032
 */
export const postAccountsAccountIdVerify = async (
  pathParams: Expand<postAccountsAccountIdVerifyPathQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAccountsAccountIdVerifyRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    `/game-coupons/${pathParams.gameId}/accounts/${pathParams.accountId}/verify`,
    {},
    _config,
  )
}

/**
 * 自定义函数：usepostAccountsAccountIdVerify
 * @description GameCoupons/验证托管账号有效性
 * @url POST /game-coupons/{gameId}/accounts/{accountId}/verify
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831032
 */

export const usePostAccountsAccountIdVerify = (_queryOptions?: object = {}) => {
  return useMutation({
    mutationFn: postAccountsAccountIdVerify,
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/设置自动兑换开关
 * @url POST /game-coupons/{gameId}/accounts/{accountId}/auto-redeem
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831033
 */
export const postAccountsAccountIdAutoRedeem = async (
  pathParams: Expand<postAccountsAccountIdAutoRedeemPathQuery>,
  data: Expand<postAccountsAccountIdAutoRedeemBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAccountsAccountIdAutoRedeemRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    `/game-coupons/${pathParams.gameId}/accounts/${pathParams.accountId}/auto-redeem`,
    data,
    _config,
  )
}

/**
 * 自定义函数：usepostAccountsAccountIdAutoRedeem
 * @description GameCoupons/设置自动兑换开关
 * @url POST /game-coupons/{gameId}/accounts/{accountId}/auto-redeem
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831033
 */

export const usePostAccountsAccountIdAutoRedeem = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: postAccountsAccountIdAutoRedeem,
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/获取兑换记录列表
 * @url GET /game-coupons/{gameId}/redeem-records
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831034
 */
export const getGameCouponsGameIdRedeemRecords = async (
  gameId: string,
  params: Expand<getGameCouponsGameIdRedeemRecordsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGameCouponsGameIdRedeemRecordsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/game-coupons/$${gameId}/redeem-records`, params, _config)
}

/**
 * 自定义函数：usegetGameCouponsGameIdRedeemRecords
 * @description GameCoupons/获取兑换记录列表
 * @url GET /game-coupons/{gameId}/redeem-records
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831034
 */

export const useGetGameCouponsGameIdRedeemRecords = (
  gameId: string,
  params: Expand<getGameCouponsGameIdRedeemRecordsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/game-coupons/${gameId}/redeem-records`, params, fetchOptions],
    queryFn: () =>
      getGameCouponsGameIdRedeemRecords(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetGameCouponsGameIdRedeemRecords = (
  gameId: string,
  params: Expand<getGameCouponsGameIdRedeemRecordsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/game-coupons/${gameId}/redeem-records`, params, fetchOptions],
    queryFn: () =>
      getGameCouponsGameIdRedeemRecords(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description GameCoupons/获取兑换统计
 * @url GET /game-coupons/{gameId}/redeem-records/summary
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831035
 */
export const getGameIdRedeemRecordsSummary = async (
  gameId: string,
  params: Expand<getGameIdRedeemRecordsSummaryQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGameIdRedeemRecordsSummaryRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    `/game-coupons/$${gameId}/redeem-records/summary`,
    params,
    _config,
  )
}

/**
 * 自定义函数：usegetGameIdRedeemRecordsSummary
 * @description GameCoupons/获取兑换统计
 * @url GET /game-coupons/{gameId}/redeem-records/summary
 * @host https://app.apifox.com/link/project/7048425/apis/api-479831035
 */

export const useGetGameIdRedeemRecordsSummary = (
  gameId: string,
  params: Expand<getGameIdRedeemRecordsSummaryQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [
      `/game-coupons/${gameId}/redeem-records/summary`,
      params,
      fetchOptions,
    ],
    queryFn: () => getGameIdRedeemRecordsSummary(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetGameIdRedeemRecordsSummary = (
  gameId: string,
  params: Expand<getGameIdRedeemRecordsSummaryQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [
      `/game-coupons/${gameId}/redeem-records/summary`,
      params,
      fetchOptions,
    ],
    queryFn: () => getGameIdRedeemRecordsSummary(gameId, params, fetchOptions),
    ..._queryOptions,
  })
}
