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
    PostBizCompanyRegisterNameTranslateReq,
    PostBizCompanyRegisterNameTranslateRes,
    PostBizCompanyRegisterSubmitNameReq,
    PostBizCompanyRegisterSubmitNameRes,
    GetBizCompanyRegisterNameQuery,
    GetBizCompanyRegisterNameRes,
} from './interface'
    
/** 公司名称查册-名称翻译 */
export function PostBizCompanyRegisterNameTranslate(params: PostBizCompanyRegisterNameTranslateReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterNameTranslateRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/name-translate`, params, _config) as Promise<PostBizCompanyRegisterNameTranslateRes>
}

/** 公司名称查册-提交 */
export function PostBizCompanyRegisterSubmitName(params: PostBizCompanyRegisterSubmitNameReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterSubmitNameRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/submit-name`, params, _config) as Promise<PostBizCompanyRegisterSubmitNameRes>
}

/** 公司名称查册-详情 */
export function GetBizCompanyRegisterName(params: GetBizCompanyRegisterNameQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterNameRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/name`, params, _config) as Promise<GetBizCompanyRegisterNameRes>
}
