/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteQuickTransfersTransferIdRes,
  getQuickTransfersTransferIdRes,
  postQuickTransfersRes,
  postQuickTransfersResolveRes,
  postQuickTransfersTransferIdCompleteRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description undefined/undefined
 * @url undefined undefined
 * @host https://app.apifox.com/link/project/undefined/apis/api-undefined
 */
export const postQuickTransfers = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postQuickTransfersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(``, {}, _config)
}

/**
 * @description undefined/undefined
 * @url undefined undefined
 * @host https://app.apifox.com/link/project/undefined/apis/api-undefined
 */
export const postQuickTransfersResolve = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postQuickTransfersResolveRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(``, {}, _config)
}

/**
 * @description undefined/undefined
 * @url undefined undefined
 * @host https://app.apifox.com/link/project/undefined/apis/api-undefined
 */
export const postQuickTransfersTransferIdComplete = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postQuickTransfersTransferIdCompleteRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(``, {}, _config)
}

/**
 * @description undefined/undefined
 * @url undefined undefined
 * @host https://app.apifox.com/link/project/undefined/apis/api-undefined
 */
export const getQuickTransfersTransferId = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getQuickTransfersTransferIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(``, {}, _config)
}

/**
 * @description undefined/undefined
 * @url undefined undefined
 * @host https://app.apifox.com/link/project/undefined/apis/api-undefined
 */
export const deleteQuickTransfersTransferId = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteQuickTransfersTransferIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(``, {}, _config)
}
