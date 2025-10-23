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
    GetBizCompanyOpenAccountClosureBasicQuery,
    GetBizCompanyOpenAccountClosureBasicRes,
    PostBizCompanyOpenAccountClosureDeliveryAddressReq,
    PostBizCompanyOpenAccountClosureDeliveryAddressRes,
    GetBizCompanyOpenAccountClosureDeliveryAddressQuery,
    GetBizCompanyOpenAccountClosureDeliveryAddressRes,
} from './interface'
    
/** 银行下户-基础信息 */
export function GetBizCompanyOpenAccountClosureBasic(params: GetBizCompanyOpenAccountClosureBasicQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountClosureBasicRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/closure/basic`, params, _config) as Promise<GetBizCompanyOpenAccountClosureBasicRes>
}

/** 银行下户-收货地址提交 */
export function PostBizCompanyOpenAccountClosureDeliveryAddress(params: PostBizCompanyOpenAccountClosureDeliveryAddressReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyOpenAccountClosureDeliveryAddressRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/open-account/closure/delivery-address`, params, _config) as Promise<PostBizCompanyOpenAccountClosureDeliveryAddressRes>
}

/** 银行下户-收货地址详情 */
export function GetBizCompanyOpenAccountClosureDeliveryAddress(params: GetBizCompanyOpenAccountClosureDeliveryAddressQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanyOpenAccountClosureDeliveryAddressRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/open-account/closure/delivery-address`, params, _config) as Promise<GetBizCompanyOpenAccountClosureDeliveryAddressRes>
}
