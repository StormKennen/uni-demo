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
    GetBizCompanySalariesTaxBasicInfoListQuery,
    GetBizCompanySalariesTaxBasicInfoListRes,
    PostBizCompanySalariesTaxBasicInfoRemoveReq,
    PostBizCompanySalariesTaxBasicInfoRemoveRes,
    PostBizCompanySalariesTaxBasicInfoCertificatesReq,
    PostBizCompanySalariesTaxBasicInfoCertificatesRes,
    PostBizCompanySalariesTaxBasicInfoInfoReq,
    PostBizCompanySalariesTaxBasicInfoInfoRes,
    PostBizCompanySalariesTaxBasicInfoSubmitReq,
    PostBizCompanySalariesTaxBasicInfoSubmitRes,
    GetBizCompanySalariesTaxBasicInfoDetailQuery,
    GetBizCompanySalariesTaxBasicInfoDetailRes,
} from './interface'
    
/** 基础信息-申报人信息列表 */
export function GetBizCompanySalariesTaxBasicInfoList(params: GetBizCompanySalariesTaxBasicInfoListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanySalariesTaxBasicInfoListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/salaries-tax/basic-info/list`, params, _config) as Promise<GetBizCompanySalariesTaxBasicInfoListRes>
}

/** 基础信息-申报人移除 */
export function PostBizCompanySalariesTaxBasicInfoRemove(params: PostBizCompanySalariesTaxBasicInfoRemoveReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySalariesTaxBasicInfoRemoveRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/salaries-tax/basic-info/remove`, params, _config) as Promise<PostBizCompanySalariesTaxBasicInfoRemoveRes>
}

/** 基础信息-申报人-证件上传 */
export function PostBizCompanySalariesTaxBasicInfoCertificates(params: PostBizCompanySalariesTaxBasicInfoCertificatesReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySalariesTaxBasicInfoCertificatesRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/salaries-tax/basic-info/certificates`, params, _config) as Promise<PostBizCompanySalariesTaxBasicInfoCertificatesRes>
}

/** 基础信息-申报人-个人信息填写 */
export function PostBizCompanySalariesTaxBasicInfoInfo(params: PostBizCompanySalariesTaxBasicInfoInfoReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySalariesTaxBasicInfoInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/salaries-tax/basic-info/info`, params, _config) as Promise<PostBizCompanySalariesTaxBasicInfoInfoRes>
}

/** 基础信息-提交 */
export function PostBizCompanySalariesTaxBasicInfoSubmit(params: PostBizCompanySalariesTaxBasicInfoSubmitReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySalariesTaxBasicInfoSubmitRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/salaries-tax/basic-info/submit`, params, _config) as Promise<PostBizCompanySalariesTaxBasicInfoSubmitRes>
}

/** 基础信息-申报人-个人信息详情 */
export function GetBizCompanySalariesTaxBasicInfoDetail(params: GetBizCompanySalariesTaxBasicInfoDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanySalariesTaxBasicInfoDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/salaries-tax/basic-info/detail`, params, _config) as Promise<GetBizCompanySalariesTaxBasicInfoDetailRes>
}
