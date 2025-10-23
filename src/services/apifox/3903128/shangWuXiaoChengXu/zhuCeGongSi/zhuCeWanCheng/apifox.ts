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
    GetBizCompanyRegisterFinishQuery,
    GetBizCompanyRegisterFinishRes,
} from './interface'
    
/** 注册完成-基础信息 */
export function GetBizCompanyRegisterFinish(params: GetBizCompanyRegisterFinishQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyRegisterFinishRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/register/finish`, params, _config) as Promise<GetBizCompanyRegisterFinishRes>
}
