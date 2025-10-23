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
    GetBizCompanyOpenAccountMessageListQuery,
    GetBizCompanyOpenAccountMessageListRes,
    GetBizCompanyOpenAccountMessageCertificatesDetailQuery,
    GetBizCompanyOpenAccountMessageCertificatesDetailRes,
    GetBizCompanyOpenAccountMessageHsPlanQuery,
    GetBizCompanyOpenAccountMessageHsPlanRes,
    GetBizCompanyOpenAccountMessageZhKycQuery,
    GetBizCompanyOpenAccountMessageZhKycRes,
    PostBizCompanyOpenAccountMessageCertificatesReq,
    PostBizCompanyOpenAccountMessageCertificatesRes,
    GetBizCompanyOpenAccountMessageCertificatesSendEmailQuery,
    GetBizCompanyOpenAccountMessageCertificatesSendEmailRes,
    PostBizCompanyOpenAccountMessageHsPlanReq,
    PostBizCompanyOpenAccountMessageHsPlanRes,
    PostBizCompanyOpenAccountMessageZhKycReq,
    PostBizCompanyOpenAccountMessageZhKycRes,
} from './interface'
    
/** 我的信息-列表 */
export function GetBizCompanyOpenAccountMessageList(params: GetBizCompanyOpenAccountMessageListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountMessageListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/message/list`, params, _config) as Promise<GetBizCompanyOpenAccountMessageListRes>
}

/** 我的信息-详情 */
export function GetBizCompanyOpenAccountMessageCertificatesDetail(params: GetBizCompanyOpenAccountMessageCertificatesDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountMessageCertificatesDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/message/certificates/detail`, params, _config) as Promise<GetBizCompanyOpenAccountMessageCertificatesDetailRes>
}

/** 证件-恒生商业计划书-详情 */
export function GetBizCompanyOpenAccountMessageHsPlan(params: GetBizCompanyOpenAccountMessageHsPlanQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountMessageHsPlanRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/message/hs/plan`, params, _config) as Promise<GetBizCompanyOpenAccountMessageHsPlanRes>
}

/** 证件-中行KYC-详情  */
export function GetBizCompanyOpenAccountMessageZhKyc(params: GetBizCompanyOpenAccountMessageZhKycQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountMessageZhKycRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/message/zh/kyc`, params, _config) as Promise<GetBizCompanyOpenAccountMessageZhKycRes>
}

/** 证件/文书上传 */
export function PostBizCompanyOpenAccountMessageCertificates(params: PostBizCompanyOpenAccountMessageCertificatesReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyOpenAccountMessageCertificatesRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/open-account/message/certificates`, params, _config) as Promise<PostBizCompanyOpenAccountMessageCertificatesRes>
}

/** 文书-发送邮箱 */
export function GetBizCompanyOpenAccountMessageCertificatesSendEmail(params: GetBizCompanyOpenAccountMessageCertificatesSendEmailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountMessageCertificatesSendEmailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/message/certificates/send-email`, params, _config) as Promise<GetBizCompanyOpenAccountMessageCertificatesSendEmailRes>
}

/** 证件-恒生商业计划书-提交 */
export function PostBizCompanyOpenAccountMessageHsPlan(params: PostBizCompanyOpenAccountMessageHsPlanReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyOpenAccountMessageHsPlanRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/open-account/message/hs/plan`, params, _config) as Promise<PostBizCompanyOpenAccountMessageHsPlanRes>
}

/** 证件-中行KYC-详情  */
export function PostBizCompanyOpenAccountMessageZhKyc(params: PostBizCompanyOpenAccountMessageZhKycReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyOpenAccountMessageZhKycRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/open-account/message/zh/kyc`, params, _config) as Promise<PostBizCompanyOpenAccountMessageZhKycRes>
}
