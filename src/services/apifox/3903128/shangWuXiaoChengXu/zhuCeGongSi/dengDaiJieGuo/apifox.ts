/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable vue/no-irregular-whitespace */
/* eslint-disable sort-imports */
import http from '../../../../../http'
import type { ParticalUniAppRequestOptions }   from '../../../../../interface'
const baseURL = undefined
import type {
    GetBizCompanyRegisterResultQuery,
    GetBizCompanyRegisterResultRes,
    GetBizCompanyRegisterResultNextQuery,
    GetBizCompanyRegisterResultNextRes,
    PostBizCompanyRegisterResultNameReq,
    PostBizCompanyRegisterResultNameRes,
    PostBizCompanyRegisterResultContinueReq,
    PostBizCompanyRegisterResultContinueRes,
} from './interface'
    
/** 等待结果-基础信息 */
export function GetBizCompanyRegisterResult(params: GetBizCompanyRegisterResultQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterResultRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/result`, params, _config) as Promise<GetBizCompanyRegisterResultRes>
}

/** 等待结果-下一步 */
export function GetBizCompanyRegisterResultNext(params: GetBizCompanyRegisterResultNextQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterResultNextRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/result/next`, params, _config) as Promise<GetBizCompanyRegisterResultNextRes>
}

/** 公司名称修改 */
export function PostBizCompanyRegisterResultName(params: PostBizCompanyRegisterResultNameReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterResultNameRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/result/name`, params, _config) as Promise<PostBizCompanyRegisterResultNameRes>
}

/** 继续使用 */
export function PostBizCompanyRegisterResultContinue(params: PostBizCompanyRegisterResultContinueReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterResultContinueRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/result/continue`, params, _config) as Promise<PostBizCompanyRegisterResultContinueRes>
}
