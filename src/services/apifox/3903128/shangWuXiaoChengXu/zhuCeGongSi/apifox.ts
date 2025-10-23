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
    GetBizCompanyRegisterListQuery,
    GetBizCompanyRegisterListRes,
    PostBizCompanySendEmailReq,
    PostBizCompanySendEmailRes,
} from './interface'
    
/** 列表 */
export function GetBizCompanyRegisterList(params: GetBizCompanyRegisterListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/list`, params, _config) as Promise<GetBizCompanyRegisterListRes>
}

/** 发送邮箱 */
export function PostBizCompanySendEmail(params: PostBizCompanySendEmailReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySendEmailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/send-email`, params, _config) as Promise<PostBizCompanySendEmailRes>
}
