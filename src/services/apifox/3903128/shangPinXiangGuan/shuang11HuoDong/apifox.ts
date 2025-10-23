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
    GetSuperAppGoodsPlaceByGoodsIdQuery,
    GetSuperAppGoodsPlaceByGoodsIdRes,
    GetSuperAppGoodsPlaceDetailByGoodsIdQuery,
    GetSuperAppGoodsPlaceDetailByGoodsIdRes,
    GetSuperAppGoodsPlaceDetailViewNoticeQuery,
    GetSuperAppGoodsPlaceDetailViewNoticeRes,
    GetSuperAppGoodsOrderPayInfoQuery,
    GetSuperAppGoodsOrderPayInfoRes,
    GetSuperAppGoodsOrderPayInfoLinksQuery,
    GetSuperAppGoodsOrderPayInfoLinksRes,
} from './interface'
    
/** 展示页商品详情 */
export function GetSuperAppGoodsPlaceByGoodsId(params: GetSuperAppGoodsPlaceByGoodsIdQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppGoodsPlaceByGoodsIdRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/goods/place-by-goods-id`, params, _config) as Promise<GetSuperAppGoodsPlaceByGoodsIdRes>
}

/** 展示页商品详情-包含关联的crm2.0产品 */
export function GetSuperAppGoodsPlaceDetailByGoodsId(params: GetSuperAppGoodsPlaceDetailByGoodsIdQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppGoodsPlaceDetailByGoodsIdRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/goods/place-detail-by-goods-id`, params, _config) as Promise<GetSuperAppGoodsPlaceDetailByGoodsIdRes>
}

/** 浏览商品-通知-需要登录态 */
export function GetSuperAppGoodsPlaceDetailViewNotice(params: GetSuperAppGoodsPlaceDetailViewNoticeQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppGoodsPlaceDetailViewNoticeRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/goods/place-detail-view-notice`, params, _config) as Promise<GetSuperAppGoodsPlaceDetailViewNoticeRes>
}

/** 获取订单信息 */
export function GetSuperAppGoodsOrderPayInfo(params: GetSuperAppGoodsOrderPayInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppGoodsOrderPayInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/goods/order/pay-info`, params, _config) as Promise<GetSuperAppGoodsOrderPayInfoRes>
}

/** 获取订单合同e签信息 */
export function GetSuperAppGoodsOrderPayInfoLinks(params: GetSuperAppGoodsOrderPayInfoLinksQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppGoodsOrderPayInfoLinksRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/goods/order/pay-info-links`, params, _config) as Promise<GetSuperAppGoodsOrderPayInfoLinksRes>
}
