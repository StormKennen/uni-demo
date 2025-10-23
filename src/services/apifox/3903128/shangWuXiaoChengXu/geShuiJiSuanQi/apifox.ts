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
    PostBizTaxCalculateReq,
    PostBizTaxCalculateRes,
    GetBizTaxCalculateRecordQuery,
    GetBizTaxCalculateRecordRes,
} from './interface'
    
/** 计算个税 */
export function PostBizTaxCalculate(params: PostBizTaxCalculateReq, config?: ParticalUniAppRequestOptions): Promise<PostBizTaxCalculateRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/tax/calculate`, params, _config) as Promise<PostBizTaxCalculateRes>
}

/** 个税详情 */
export function GetBizTaxCalculateRecord(params: GetBizTaxCalculateRecordQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizTaxCalculateRecordRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/tax/calculate/record`, params, _config) as Promise<GetBizTaxCalculateRecordRes>
}
