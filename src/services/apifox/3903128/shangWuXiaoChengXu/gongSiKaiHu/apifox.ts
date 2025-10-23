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
    GetBizCompanyOpenAccountListQuery,
    GetBizCompanyOpenAccountListRes,
    PostBizCompanySendEmailReq,
    PostBizCompanySendEmailRes,
} from './interface'
    
/** 列表 */
export function GetBizCompanyOpenAccountList(params: GetBizCompanyOpenAccountListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/list`, params, _config) as Promise<GetBizCompanyOpenAccountListRes>
}

/** 发送邮箱 */
export function PostBizCompanySendEmail(params: PostBizCompanySendEmailReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySendEmailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/send-email`, params, _config) as Promise<PostBizCompanySendEmailRes>
}
