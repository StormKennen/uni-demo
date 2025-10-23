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
    GetBizQuestionListQuery,
    GetBizQuestionListRes,
    PostBizQuestionSubmitReq,
    PostBizQuestionSubmitRes,
    PostBizQuestionCompanySubmitReq,
    PostBizQuestionCompanySubmitRes,
    GetBizQuestionCompanyInfoQuery,
    GetBizQuestionCompanyInfoRes,
} from './interface'
    
/** 获取问卷调查问题 */
export function GetBizQuestionList(params: GetBizQuestionListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizQuestionListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/question/list`, params, _config) as Promise<GetBizQuestionListRes>
}

/** 提交问卷调查问题 */
export function PostBizQuestionSubmit(params: PostBizQuestionSubmitReq, config?: ParticalUniAppRequestOptions): Promise<PostBizQuestionSubmitRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/question/submit`, params, _config) as Promise<PostBizQuestionSubmitRes>
}

/** 公司开户-提交问卷调查问题 */
export function PostBizQuestionCompanySubmit(params: PostBizQuestionCompanySubmitReq, config?: ParticalUniAppRequestOptions): Promise<PostBizQuestionCompanySubmitRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/question/company-submit`, params, _config) as Promise<PostBizQuestionCompanySubmitRes>
}

/** 公司开户-获取创建的公司 */
export function GetBizQuestionCompanyInfo(params: GetBizQuestionCompanyInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizQuestionCompanyInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/question/company/info`, params, _config) as Promise<GetBizQuestionCompanyInfoRes>
}
