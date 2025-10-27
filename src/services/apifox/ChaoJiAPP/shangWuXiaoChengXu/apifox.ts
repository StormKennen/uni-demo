/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getBizPeriodGetPeriodListQuery,
  getBizPeriodGetPeriodListRes,
  getBizStockExchangeCodeRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description /获取产品的周期列表 (C端通用接口)
 * @url GET /biz/period/get-period-list
 * @host https://app.apifox.com/link/project/3903128/apis/api-289151199
 */
export const getBizPeriodGetPeriodList = async (
  params: Expand<getBizPeriodGetPeriodListQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getBizPeriodGetPeriodListRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/period/get-period-list', params, _config)
}

/**
 * @description /交易所代码列表
 * @url GET /biz/stock-exchange/code
 * @host https://app.apifox.com/link/project/3903128/apis/api-329820123
 */
export const getBizStockExchangeCode = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getBizStockExchangeCodeRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/stock-exchange/code', {}, _config)
}
