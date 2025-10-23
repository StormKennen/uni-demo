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
    GetBizCompanyRegisterShareholdersBasicQuery,
    GetBizCompanyRegisterShareholdersBasicRes,
    PostBizCompanyRegisterShareholdersRemoveReq,
    PostBizCompanyRegisterShareholdersRemoveRes,
    PostBizCompanyRegisterShareholdersCertificatesReq,
    PostBizCompanyRegisterShareholdersCertificatesRes,
    PostBizCompanyRegisterShareholdersInfoReq,
    PostBizCompanyRegisterShareholdersInfoRes,
    GetBizCompanyRegisterShareholdersDetailQuery,
    GetBizCompanyRegisterShareholdersDetailRes,
    GetBizCompanyRegisterShareholdersListQuery,
    GetBizCompanyRegisterShareholdersListRes,
    PostBizCompanyRegisterShareholdersCheckReq,
    PostBizCompanyRegisterShareholdersCheckRes,
    PostBizCompanyRegisterShareholdersSubmitReq,
    PostBizCompanyRegisterShareholdersSubmitRes,
} from './interface'
    
/** 股东董事-基础信息 */
export function GetBizCompanyRegisterShareholdersBasic(params: GetBizCompanyRegisterShareholdersBasicQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterShareholdersBasicRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/shareholders/basic`, params, _config) as Promise<GetBizCompanyRegisterShareholdersBasicRes>
}

/** 股东董事-删除自然人 */
export function PostBizCompanyRegisterShareholdersRemove(params: PostBizCompanyRegisterShareholdersRemoveReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterShareholdersRemoveRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/shareholders/remove`, params, _config) as Promise<PostBizCompanyRegisterShareholdersRemoveRes>
}

/** 股东董事-证件上传 */
export function PostBizCompanyRegisterShareholdersCertificates(params: PostBizCompanyRegisterShareholdersCertificatesReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterShareholdersCertificatesRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/shareholders/certificates`, params, _config) as Promise<PostBizCompanyRegisterShareholdersCertificatesRes>
}

/** 股东董事-个人信息填写 */
export function PostBizCompanyRegisterShareholdersInfo(params: PostBizCompanyRegisterShareholdersInfoReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterShareholdersInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/shareholders/info`, params, _config) as Promise<PostBizCompanyRegisterShareholdersInfoRes>
}

/** 股东董事-个人详情 */
export function GetBizCompanyRegisterShareholdersDetail(params: GetBizCompanyRegisterShareholdersDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterShareholdersDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/shareholders/detail`, params, _config) as Promise<GetBizCompanyRegisterShareholdersDetailRes>
}

/** 股东董事-成员列表 */
export function GetBizCompanyRegisterShareholdersList(params: GetBizCompanyRegisterShareholdersListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterShareholdersListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/shareholders/list`, params, _config) as Promise<GetBizCompanyRegisterShareholdersListRes>
}

/** 股东董事-信息核对 */
export function PostBizCompanyRegisterShareholdersCheck(params: PostBizCompanyRegisterShareholdersCheckReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterShareholdersCheckRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/shareholders/check`, params, _config) as Promise<PostBizCompanyRegisterShareholdersCheckRes>
}

/** 股东董事-提交 */
export function PostBizCompanyRegisterShareholdersSubmit(params: PostBizCompanyRegisterShareholdersSubmitReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterShareholdersSubmitRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/shareholders/submit`, params, _config) as Promise<PostBizCompanyRegisterShareholdersSubmitRes>
}
