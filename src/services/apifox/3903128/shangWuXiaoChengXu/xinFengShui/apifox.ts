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
    GetBizCompanySalariesTaxListQuery,
    GetBizCompanySalariesTaxListRes,
    PostBizCompanyDocumentSendEmailReq,
    PostBizCompanyDocumentSendEmailRes,
} from './interface'
    
/** 列表 */
export function GetBizCompanySalariesTaxList(params: GetBizCompanySalariesTaxListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanySalariesTaxListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/salaries-tax/list`, params, _config) as Promise<GetBizCompanySalariesTaxListRes>
}

/** 发送邮箱 */
export function PostBizCompanyDocumentSendEmail(params: PostBizCompanyDocumentSendEmailReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyDocumentSendEmailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/document/send-email`, params, _config) as Promise<PostBizCompanyDocumentSendEmailRes>
}
