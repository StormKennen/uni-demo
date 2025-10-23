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
    GetBizPersonOpenAccountListQuery,
    GetBizPersonOpenAccountListRes,
    GetBizPersonOpenAccountMatchBankQuery,
    GetBizPersonOpenAccountMatchBankRes,
    PostBizPersonOpenAccountCertUploadReq,
    PostBizPersonOpenAccountCertUploadRes,
    PostBizPersonOpenAccountUserinfoSaveReq,
    PostBizPersonOpenAccountUserinfoSaveRes,
    GetBizPersonOpenAccountUserinfoGetQuery,
    GetBizPersonOpenAccountUserinfoGetRes,
    GetBizPersonOpenAccountInterviewGetQuery,
    GetBizPersonOpenAccountInterviewGetRes,
    PostBizPersonOpenAccountInterviewSubmitReq,
    PostBizPersonOpenAccountInterviewSubmitRes,
    GetBizPersonOpenAccountCertGetQuery,
    GetBizPersonOpenAccountCertGetRes,
} from './interface'
    
/** 个人开户服务页-列表查询 */
export function GetBizPersonOpenAccountList(params: GetBizPersonOpenAccountListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonOpenAccountListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/person/open-account/list`, params, _config) as Promise<GetBizPersonOpenAccountListRes>
}

/** 个人开户-我的信息-匹配开户行 */
export function GetBizPersonOpenAccountMatchBank(params: GetBizPersonOpenAccountMatchBankQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonOpenAccountMatchBankRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/person/open-account/match/bank`, params, _config) as Promise<GetBizPersonOpenAccountMatchBankRes>
}

/** 个人开户-我的信息-上传证件 */
export function PostBizPersonOpenAccountCertUpload(params: PostBizPersonOpenAccountCertUploadReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonOpenAccountCertUploadRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/person/open-account/cert/upload`, params, _config) as Promise<PostBizPersonOpenAccountCertUploadRes>
}

/** 个人开户-我的信息-个人信息保存 */
export function PostBizPersonOpenAccountUserinfoSave(params: PostBizPersonOpenAccountUserinfoSaveReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonOpenAccountUserinfoSaveRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/person/open-account/userinfo/save`, params, _config) as Promise<PostBizPersonOpenAccountUserinfoSaveRes>
}

/** 个人开户-我的信息-个人信息获取 */
export function GetBizPersonOpenAccountUserinfoGet(params: GetBizPersonOpenAccountUserinfoGetQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonOpenAccountUserinfoGetRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/person/open-account/userinfo/get`, params, _config) as Promise<GetBizPersonOpenAccountUserinfoGetRes>
}

/** 个人开户-预约面试 */
export function GetBizPersonOpenAccountInterviewGet(params: GetBizPersonOpenAccountInterviewGetQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonOpenAccountInterviewGetRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/person/open-account/interview/get`, params, _config) as Promise<GetBizPersonOpenAccountInterviewGetRes>
}

/** 个人开户-预约面试提交 */
export function PostBizPersonOpenAccountInterviewSubmit(params: PostBizPersonOpenAccountInterviewSubmitReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonOpenAccountInterviewSubmitRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/person/open-account/interview/submit`, params, _config) as Promise<PostBizPersonOpenAccountInterviewSubmitRes>
}

/** 个人开户-我的信息-上传证件 */
export function GetBizPersonOpenAccountCertGet(params: GetBizPersonOpenAccountCertGetQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonOpenAccountCertGetRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/person/open-account/cert/get`, params, _config) as Promise<GetBizPersonOpenAccountCertGetRes>
}
