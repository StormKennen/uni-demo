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
    GetBizCompanyRegisterGreenBoxBasicQuery,
    GetBizCompanyRegisterGreenBoxBasicRes,
    GetBizCompanyRegisterGreenBoxDetailQuery,
    GetBizCompanyRegisterGreenBoxDetailRes,
    PostBizCompanyRegisterGreenBoxReceivingReq,
    PostBizCompanyRegisterGreenBoxReceivingRes,
    GetBizCompanyRegisterGreenBoxKycDetailQuery,
    GetBizCompanyRegisterGreenBoxKycDetailRes,
    PostBizCompanyRegisterGreenBoxKycUploadReq,
    PostBizCompanyRegisterGreenBoxKycUploadRes,
    PostBizCompanyRegisterGreenBoxKycSignReq,
    PostBizCompanyRegisterGreenBoxKycSignRes,
} from './interface'
    
/** 绿盒-基础信息 */
export function GetBizCompanyRegisterGreenBoxBasic(params: GetBizCompanyRegisterGreenBoxBasicQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterGreenBoxBasicRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/green-box/basic`, params, _config) as Promise<GetBizCompanyRegisterGreenBoxBasicRes>
}

/** 绿盒-详情信息 */
export function GetBizCompanyRegisterGreenBoxDetail(params: GetBizCompanyRegisterGreenBoxDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterGreenBoxDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/green-box/detail`, params, _config) as Promise<GetBizCompanyRegisterGreenBoxDetailRes>
}

/** 绿盒-收货信息提交 */
export function PostBizCompanyRegisterGreenBoxReceiving(params: PostBizCompanyRegisterGreenBoxReceivingReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterGreenBoxReceivingRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/green-box/receiving`, params, _config) as Promise<PostBizCompanyRegisterGreenBoxReceivingRes>
}

/** 绿盒-kyc详情 */
export function GetBizCompanyRegisterGreenBoxKycDetail(params: GetBizCompanyRegisterGreenBoxKycDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterGreenBoxKycDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/green-box/kyc/detail`, params, _config) as Promise<GetBizCompanyRegisterGreenBoxKycDetailRes>
}

/** 绿盒-kyc上传 */
export function PostBizCompanyRegisterGreenBoxKycUpload(params: PostBizCompanyRegisterGreenBoxKycUploadReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterGreenBoxKycUploadRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/green-box/kyc/upload`, params, _config) as Promise<PostBizCompanyRegisterGreenBoxKycUploadRes>
}

/** 绿盒-kyc签字 */
export function PostBizCompanyRegisterGreenBoxKycSign(params: PostBizCompanyRegisterGreenBoxKycSignReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyRegisterGreenBoxKycSignRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/register/green-box/kyc/sign`, params, _config) as Promise<PostBizCompanyRegisterGreenBoxKycSignRes>
}
