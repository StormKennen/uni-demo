/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getHsbcConnectedListQuery,
  getHsbcConnectedListRes,
  getHsbcDetailListQuery,
  getHsbcDetailListRes,
  getOpenAccountHsbcCommercialQuery,
  getOpenAccountHsbcCommercialRes,
  getOpenAccountHsbcConnectedEntityQuery,
  getOpenAccountHsbcConnectedEntityRes,
  getOpenAccountHsbcConnectedIndividualQuery,
  getOpenAccountHsbcConnectedIndividualRes,
  getOpenAccountHsbcEntityContactQuery,
  getOpenAccountHsbcEntityContactRes,
  postOpenAccountHsbcCommercialBody,
  postOpenAccountHsbcCommercialRes,
  postOpenAccountHsbcConnectedEntityBody,
  postOpenAccountHsbcConnectedEntityRes,
  postOpenAccountHsbcConnectedIndividualBody,
  postOpenAccountHsbcConnectedIndividualRes,
  postOpenAccountHsbcEntityContactBody,
  postOpenAccountHsbcEntityContactRes,
  postOpenAccountHsbcSubmitBody,
  postOpenAccountHsbcSubmitRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description /公司&联络资料
 * @url POST /biz/company/open-account/hsbc/entity-contact
 * @host https://app.apifox.com/link/project/3903128/apis/api-329683213
 */
export const postOpenAccountHsbcEntityContact = async (
  data: Expand<postOpenAccountHsbcEntityContactBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postOpenAccountHsbcEntityContactRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    '/biz/company/open-account/hsbc/entity-contact',
    data,
    _config,
  )
}

/**
 * @description /商业资料
 * @url POST /biz/company/open-account/hsbc/commercial
 * @host https://app.apifox.com/link/project/3903128/apis/api-329684279
 */
export const postOpenAccountHsbcCommercial = async (
  data: Expand<postOpenAccountHsbcCommercialBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postOpenAccountHsbcCommercialRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/biz/company/open-account/hsbc/commercial', data, _config)
}

/**
 * @description /人士列表
 * @url GET /biz/company/open-account/hsbc/connected/list
 * @host https://app.apifox.com/link/project/3903128/apis/api-329700042
 */
export const getHsbcConnectedList = async (
  params: Expand<getHsbcConnectedListQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getHsbcConnectedListRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    '/biz/company/open-account/hsbc/connected/list',
    params,
    _config,
  )
}

/**
 * @description /有关人士(个人)
 * @url POST /biz/company/open-account/hsbc/connected-individual
 * @host https://app.apifox.com/link/project/3903128/apis/api-329686768
 */
export const postOpenAccountHsbcConnectedIndividual = async (
  data: Expand<postOpenAccountHsbcConnectedIndividualBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postOpenAccountHsbcConnectedIndividualRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    '/biz/company/open-account/hsbc/connected-individual',
    data,
    _config,
  )
}

/**
 * @description /有关人士(法人团体)
 * @url POST /biz/company/open-account/hsbc/connected-entity
 * @host https://app.apifox.com/link/project/3903128/apis/api-329686969
 */
export const postOpenAccountHsbcConnectedEntity = async (
  data: Expand<postOpenAccountHsbcConnectedEntityBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postOpenAccountHsbcConnectedEntityRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    '/biz/company/open-account/hsbc/connected-entity',
    data,
    _config,
  )
}

/**
 * @description /汇丰所需数据提交
 * @url POST /biz/company/open-account/hsbc/submit
 * @host https://app.apifox.com/link/project/3903128/apis/api-329701043
 */
export const postOpenAccountHsbcSubmit = async (
  data: Expand<postOpenAccountHsbcSubmitBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postOpenAccountHsbcSubmitRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/biz/company/open-account/hsbc/submit', data, _config)
}

/**
 * @description /汇丰资料详情列表
 * @url GET /biz/company/open-account/hsbc/detail/list
 * @host https://app.apifox.com/link/project/3903128/apis/api-329706171
 */
export const getHsbcDetailList = async (
  params: Expand<getHsbcDetailListQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getHsbcDetailListRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/company/open-account/hsbc/detail/list', params, _config)
}

/**
 * @description /公司&联络资料详情
 * @url GET /biz/company/open-account/hsbc/entity-contact
 * @host https://app.apifox.com/link/project/3903128/apis/api-329708712
 */
export const getOpenAccountHsbcEntityContact = async (
  params: Expand<getOpenAccountHsbcEntityContactQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getOpenAccountHsbcEntityContactRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    '/biz/company/open-account/hsbc/entity-contact',
    params,
    _config,
  )
}

/**
 * @description /商业资料详情
 * @url GET /biz/company/open-account/hsbc/commercial
 * @host https://app.apifox.com/link/project/3903128/apis/api-329708921
 */
export const getOpenAccountHsbcCommercial = async (
  params: Expand<getOpenAccountHsbcCommercialQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getOpenAccountHsbcCommercialRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/company/open-account/hsbc/commercial', params, _config)
}

/**
 * @description /有关人士(个人)详情
 * @url GET /biz/company/open-account/hsbc/connected-individual
 * @host https://app.apifox.com/link/project/3903128/apis/api-329709278
 */
export const getOpenAccountHsbcConnectedIndividual = async (
  params: Expand<getOpenAccountHsbcConnectedIndividualQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getOpenAccountHsbcConnectedIndividualRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    '/biz/company/open-account/hsbc/connected-individual',
    params,
    _config,
  )
}

/**
 * @description /有关人士(法人团体) 详情
 * @url GET /biz/company/open-account/hsbc/connected-entity
 * @host https://app.apifox.com/link/project/3903128/apis/api-329709366
 */
export const getOpenAccountHsbcConnectedEntity = async (
  params: Expand<getOpenAccountHsbcConnectedEntityQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getOpenAccountHsbcConnectedEntityRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    '/biz/company/open-account/hsbc/connected-entity',
    params,
    _config,
  )
}
