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
    PostBizCompanyOpenAccountInterviewSubmitReq,
    PostBizCompanyOpenAccountInterviewSubmitRes,
    GetBizCompanyOpenAccountInterviewDetailQuery,
    GetBizCompanyOpenAccountInterviewDetailRes,
    GetBizCompanyOpenAccountInterviewCounselingQuery,
    GetBizCompanyOpenAccountInterviewCounselingRes,
} from './interface'
    
/** 预约面试-提交 */
export function PostBizCompanyOpenAccountInterviewSubmit(params: PostBizCompanyOpenAccountInterviewSubmitReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyOpenAccountInterviewSubmitRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/open-account/interview/submit`, params, _config) as Promise<PostBizCompanyOpenAccountInterviewSubmitRes>
}

/** 预约面试-详情 */
export function GetBizCompanyOpenAccountInterviewDetail(params: GetBizCompanyOpenAccountInterviewDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountInterviewDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/interview/detail`, params, _config) as Promise<GetBizCompanyOpenAccountInterviewDetailRes>
}

/** 预约面试-获取辅导 */
export function GetBizCompanyOpenAccountInterviewCounseling(params: GetBizCompanyOpenAccountInterviewCounselingQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountInterviewCounselingRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/interview/counseling`, params, _config) as Promise<GetBizCompanyOpenAccountInterviewCounselingRes>
}
