/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getMpfFundHomeQuery,
  getMpfFundHomeRes,
  getMpfMpfAccountInfoQuery,
  getMpfMpfAccountInfoRes,
  getMpfWaitResultTaskQuery,
  getMpfWaitResultTaskRes,
  postExpressAddressSaveBody,
  postExpressAddressSaveRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description /强积金首页
 * @url GET /biz/mpf/fund/home
 * @host https://app.apifox.com/link/project/3903128/apis/api-250911599
 */
export const getMpfFundHome = async (
  params: Expand<getMpfFundHomeQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMpfFundHomeRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/mpf/fund/home', params, _config)
}

/**
 * @description /强积金=账号开通页面
 * @url GET /biz/mpf/mpf-account/info
 * @host https://app.apifox.com/link/project/3903128/apis/api-251250376
 */
export const getMpfMpfAccountInfo = async (
  params: Expand<getMpfMpfAccountInfoQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMpfMpfAccountInfoRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/mpf/mpf-account/info', params, _config)
}

/**
 * @description /保存客户填写的地址
 * @url POST /biz/mpf/express/address/save
 * @host https://app.apifox.com/link/project/3903128/apis/api-253796934
 */
export const postExpressAddressSave = async (
  data: Expand<postExpressAddressSaveBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postExpressAddressSaveRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/biz/mpf/express/address/save', data, _config)
}

/**
 * @description /强积金-等待结果
 * @url GET /biz/mpf/wait-result/task
 * @host https://app.apifox.com/link/project/3903128/apis/api-251111178
 */
export const getMpfWaitResultTask = async (
  params: Expand<getMpfWaitResultTaskQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMpfWaitResultTaskRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/mpf/wait-result/task', params, _config)
}
