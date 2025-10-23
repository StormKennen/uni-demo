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
    GetBizViewPosterRes,
} from './interface'
    
/** 获取二级页面的海报 */
export function GetBizViewPoster(config?: ParticalUniAppRequestOptions): Promise<GetBizViewPosterRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/view/poster', _config) as Promise<GetBizViewPosterRes>
}
