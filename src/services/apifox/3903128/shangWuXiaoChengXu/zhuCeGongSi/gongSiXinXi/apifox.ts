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
    GetBizCompanyRegisterInfoListQuery,
    GetBizCompanyRegisterInfoListRes,
    GetBizCompanyRegisterInfoDetailQuery,
    GetBizCompanyRegisterInfoDetailRes,
    PostBizCompanyRegisterInfoReq,
    PostBizCompanyRegisterInfoRes,
    GetBizCompanyRegisterScopeListRes,
} from './interface'
    
/** 公司信息-列表 */
export function GetBizCompanyRegisterInfoList(params: GetBizCompanyRegisterInfoListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterInfoListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/info/list`, params, _config) as Promise<GetBizCompanyRegisterInfoListRes>
}

/** 公司信息-详情 */
export function GetBizCompanyRegisterInfoDetail(params: GetBizCompanyRegisterInfoDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterInfoDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/info/detail`, params, _config) as Promise<GetBizCompanyRegisterInfoDetailRes>
}

/** 公司信息-保存 */
export function PostBizCompanyRegisterInfo(params: PostBizCompanyRegisterInfoReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/info`, params, _config) as Promise<PostBizCompanyRegisterInfoRes>
}

/** 经营范围-列表 */
export function GetBizCompanyRegisterScopeList(config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterScopeListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/company/register/scope/list', _config) as Promise<GetBizCompanyRegisterScopeListRes>
}
