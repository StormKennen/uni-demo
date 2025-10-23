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
    GetBizCompanyOpenAccountMatchingProgrammeQuery,
    GetBizCompanyOpenAccountMatchingProgrammeRes,
    PostBizCompanyOpenAccountMatchingProgrammeReq,
    PostBizCompanyOpenAccountMatchingProgrammeRes,
} from './interface'
    
/** 匹配开户行-开户方案 */
export function GetBizCompanyOpenAccountMatchingProgramme(params: GetBizCompanyOpenAccountMatchingProgrammeQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountMatchingProgrammeRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/matching/programme`, params, _config) as Promise<GetBizCompanyOpenAccountMatchingProgrammeRes>
}

/** 匹配开户行-开户方案-下一步 */
export function PostBizCompanyOpenAccountMatchingProgramme(params: PostBizCompanyOpenAccountMatchingProgrammeReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyOpenAccountMatchingProgrammeRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/open-account/matching/programme`, params, _config) as Promise<PostBizCompanyOpenAccountMatchingProgrammeRes>
}
