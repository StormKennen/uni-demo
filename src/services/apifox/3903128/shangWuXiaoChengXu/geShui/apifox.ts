/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable vue/no-irregular-whitespace */
/* eslint-disable sort-imports */
import http from '../../../../http'
import type { ParticalUniAppRequestOptions }   from '../../../../interface'
const baseURL = undefined
import type {
    GetBizPersonalTaxSalariesTaxApplicationStatusQuery,
    GetBizPersonalTaxSalariesTaxApplicationStatusRes,
    PostBizPersonalTaxSalariesTaxApplicationStatusReq,
    PostBizPersonalTaxSalariesTaxApplicationStatusRes,
    GetBizPersonalTaxListQuery,
    GetBizPersonalTaxListRes,
} from './interface'
    
/** 个税-薪俸税申报情况 */
export function GetBizPersonalTaxSalariesTaxApplicationStatus(params: GetBizPersonalTaxSalariesTaxApplicationStatusQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxSalariesTaxApplicationStatusRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/salaries-tax-application-status`, params, _config) as Promise<GetBizPersonalTaxSalariesTaxApplicationStatusRes>
}

/** 个税-薪俸税申报情况提交-已申报时候调用 */
export function PostBizPersonalTaxSalariesTaxApplicationStatus(params: PostBizPersonalTaxSalariesTaxApplicationStatusReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxSalariesTaxApplicationStatusRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/salaries-tax-application-status`, params, _config) as Promise<PostBizPersonalTaxSalariesTaxApplicationStatusRes>
}

/** 列表 */
export function GetBizPersonalTaxList(params: GetBizPersonalTaxListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/list`, params, _config) as Promise<GetBizPersonalTaxListRes>
}
