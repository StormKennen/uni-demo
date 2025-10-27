/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getAppAssociatedOrderBusinessRes,
  getAssociatedOrderOrderListQuery,
  getAssociatedOrderOrderListRes,
  getAssociatedOrderServerListQuery,
  getAssociatedOrderServerListRes,
  postAppAssociatedOrderActionableOrderQuery,
  postAppAssociatedOrderActionableOrderRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description /客户主体列表
 * @url GET /super-app/presale/app/associated-order/server/list
 * @host https://app.apifox.com/link/project/3903128/apis/api-315852332
 */
export const getAssociatedOrderServerList = async (
  params: Expand<getAssociatedOrderServerListQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAssociatedOrderServerListRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    '/super-app/presale/app/associated-order/server/list',
    params,
    _config,
  )
}

/**
 * @description /首页-交付服务
 * @url GET /super-app/presale/app/associated-order/business
 * @host https://app.apifox.com/link/project/3903128/apis/api-315852334
 */
export const getAppAssociatedOrderBusiness = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAppAssociatedOrderBusinessRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    '/super-app/presale/app/associated-order/business',
    {},
    _config,
  )
}

/**
 * @description /关联订单列表
 * @url GET /super-app/presale/app/associated-order/order/list
 * @host https://app.apifox.com/link/project/3903128/apis/api-315852335
 */
export const getAssociatedOrderOrderList = async (
  params: Expand<getAssociatedOrderOrderListQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAssociatedOrderOrderListRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    '/super-app/presale/app/associated-order/order/list',
    params,
    _config,
  )
}

/**
 * @description /关联订单
 * @url POST /super-app/presale/app/associated-order/actionable-order
 * @host https://app.apifox.com/link/project/3903128/apis/api-315852333
 */
export const postAppAssociatedOrderActionableOrder = async (
  params: Expand<postAppAssociatedOrderActionableOrderQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAppAssociatedOrderActionableOrderRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    '/super-app/presale/app/associated-order/actionable-order',
    {},
    _config,
  )
}
