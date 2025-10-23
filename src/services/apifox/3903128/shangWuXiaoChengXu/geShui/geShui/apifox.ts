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
    GetBizPersonalTaxBasicListQuery,
    GetBizPersonalTaxBasicListRes,
    GetBizPersonalTaxBasicSignDocumentQuery,
    GetBizPersonalTaxBasicSignDocumentRes,
    PostBizPersonalTaxBasicSignDocumentReq,
    PostBizPersonalTaxBasicSignDocumentRes,
    PostBizPersonalTaxBasicReceivedTaxBureauNoticeReq,
    PostBizPersonalTaxBasicReceivedTaxBureauNoticeRes,
    PostBizPersonalTaxCustomerDeliveryAddressReq,
    PostBizPersonalTaxCustomerDeliveryAddressRes,
} from './interface'
    
/** 个税-列表 */
export function GetBizPersonalTaxBasicList(params: GetBizPersonalTaxBasicListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxBasicListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/basic/list`, params, _config) as Promise<GetBizPersonalTaxBasicListRes>
}

/** 个税-签字文件详情 */
export function GetBizPersonalTaxBasicSignDocument(params: GetBizPersonalTaxBasicSignDocumentQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxBasicSignDocumentRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/basic/sign-document`, params, _config) as Promise<GetBizPersonalTaxBasicSignDocumentRes>
}

/** 个税-签字文件上传 */
export function PostBizPersonalTaxBasicSignDocument(params: PostBizPersonalTaxBasicSignDocumentReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxBasicSignDocumentRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/basic/sign-document`, params, _config) as Promise<PostBizPersonalTaxBasicSignDocumentRes>
}

/** 个税-收到税务局通知 */
export function PostBizPersonalTaxBasicReceivedTaxBureauNotice(params: PostBizPersonalTaxBasicReceivedTaxBureauNoticeReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxBasicReceivedTaxBureauNoticeRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/basic/received-tax-bureau-notice`, params, _config) as Promise<PostBizPersonalTaxBasicReceivedTaxBureauNoticeRes>
}

/** 个税-客户收件地址 */
export function PostBizPersonalTaxCustomerDeliveryAddress(params: PostBizPersonalTaxCustomerDeliveryAddressReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxCustomerDeliveryAddressRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/customer-delivery-address`, params, _config) as Promise<PostBizPersonalTaxCustomerDeliveryAddressRes>
}
