/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable vue/no-irregular-whitespace */
/* eslint-disable sort-imports */
import http from '../../../http'
import type { ParticalUniAppRequestOptions }   from '../../../interface'
const baseURL = undefined
import type {
    GetSuperAppPresaleAppShopCartRes,
    PostSuperAppPresaleAppShopCartCreateReq,
    PostSuperAppPresaleAppShopCartCreateRes,
    PostSuperAppPresaleAppOrderCreateFromCartReq,
    PostSuperAppPresaleAppOrderCreateFromCartRes,
    PostSuperAppPresaleAppOrderCreateReq,
    PostSuperAppPresaleAppOrderCreateRes,
    PostSuperAppPresaleAppOrderSetOrderTypeReq,
    PostSuperAppPresaleAppOrderSetOrderTypeRes,
    PostSuperAppPresaleAppOrderCreateSignReq,
    PostSuperAppPresaleAppOrderCreateSignRes,
    GetSuperAppPresaleAppOrderGetEsignUrlQuery,
    GetSuperAppPresaleAppOrderGetEsignUrlRes,
    PostSuperAppPresaleAppOrderCreatePayLinkReq,
    PostSuperAppPresaleAppOrderCreatePayLinkRes,
    PostSuperAppPresaleAppOrderDeleteReq,
    PostSuperAppPresaleAppOrderDeleteRes,
    PostSuperAppPresaleAppShopCartDeleteReq,
    PostSuperAppPresaleAppShopCartDeleteRes,
    PostSuperAppPresaleAppOrderCancelReq,
    PostSuperAppPresaleAppOrderCancelRes,
    GetSuperAppPresaleAppOrderPaymentInfoQuery,
    GetSuperAppPresaleAppOrderPaymentInfoRes,
    GetSuperAppPresaleAppOrderGetInstitutionNameQuery,
    GetSuperAppPresaleAppOrderGetInstitutionNameRes,
    GetSuperAppPresaleAppOrderInfoQuery,
    GetSuperAppPresaleAppOrderInfoRes,
    GetSuperAppPresaleAppOrderListQuery,
    GetSuperAppPresaleAppOrderListRes,
    PostSuperAppPresaleAppShopCartStoreReq,
    PostSuperAppPresaleAppShopCartStoreRes,
} from './interface'
    
/** 获取购物车信息 */
export function GetSuperAppPresaleAppShopCart(config?: ParticalUniAppRequestOptions): Promise<GetSuperAppPresaleAppShopCartRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/super-app/presale/app/shop-cart', _config) as Promise<GetSuperAppPresaleAppShopCartRes>
}

/** 添加到购物车 */
export function PostSuperAppPresaleAppShopCartCreate(params: PostSuperAppPresaleAppShopCartCreateReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppShopCartCreateRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/shop-cart/create`, params, _config) as Promise<PostSuperAppPresaleAppShopCartCreateRes>
}

/** 购物车创建订单 */
export function PostSuperAppPresaleAppOrderCreateFromCart(params: PostSuperAppPresaleAppOrderCreateFromCartReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppOrderCreateFromCartRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/order/create-from-cart`, params, _config) as Promise<PostSuperAppPresaleAppOrderCreateFromCartRes>
}

/** 创建订单-立即购买 */
export function PostSuperAppPresaleAppOrderCreate(params: PostSuperAppPresaleAppOrderCreateReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppOrderCreateRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/order/create`, params, _config) as Promise<PostSuperAppPresaleAppOrderCreateRes>
}

/** 订单签署：设置订单类型,个人/企业 */
export function PostSuperAppPresaleAppOrderSetOrderType(params: PostSuperAppPresaleAppOrderSetOrderTypeReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppOrderSetOrderTypeRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/order/set-order-type`, params, _config) as Promise<PostSuperAppPresaleAppOrderSetOrderTypeRes>
}

/** 订单签署,添加签署信息 */
export function PostSuperAppPresaleAppOrderCreateSign(params: PostSuperAppPresaleAppOrderCreateSignReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppOrderCreateSignRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/order/create-sign`, params, _config) as Promise<PostSuperAppPresaleAppOrderCreateSignRes>
}

/** 订单签署,获取E签宝的签署地址 */
export function GetSuperAppPresaleAppOrderGetEsignUrl(params: GetSuperAppPresaleAppOrderGetEsignUrlQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppPresaleAppOrderGetEsignUrlRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/presale/app/order/get-esign-url`, params, _config) as Promise<GetSuperAppPresaleAppOrderGetEsignUrlRes>
}

/** 订单支付,分比支付创建 */
export function PostSuperAppPresaleAppOrderCreatePayLink(params: PostSuperAppPresaleAppOrderCreatePayLinkReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppOrderCreatePayLinkRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/order/create-pay-link`, params, _config) as Promise<PostSuperAppPresaleAppOrderCreatePayLinkRes>
}

/** 订单删除，已取消订单删除 */
export function PostSuperAppPresaleAppOrderDelete(params: PostSuperAppPresaleAppOrderDeleteReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppOrderDeleteRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/order/delete`, params, _config) as Promise<PostSuperAppPresaleAppOrderDeleteRes>
}

/** 购物车删除 */
export function PostSuperAppPresaleAppShopCartDelete(params: PostSuperAppPresaleAppShopCartDeleteReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppShopCartDeleteRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/shop-cart/delete`, params, _config) as Promise<PostSuperAppPresaleAppShopCartDeleteRes>
}

/** 取消订单，用于未签署订单 */
export function PostSuperAppPresaleAppOrderCancel(params: PostSuperAppPresaleAppOrderCancelReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppOrderCancelRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/order/cancel`, params, _config) as Promise<PostSuperAppPresaleAppOrderCancelRes>
}

/** 订单已付款信息 */
export function GetSuperAppPresaleAppOrderPaymentInfo(params: GetSuperAppPresaleAppOrderPaymentInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppPresaleAppOrderPaymentInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/presale/app/order/payment-info`, params, _config) as Promise<GetSuperAppPresaleAppOrderPaymentInfoRes>
}

/** 签署时获取公司信息(税号信息) */
export function GetSuperAppPresaleAppOrderGetInstitutionName(params: GetSuperAppPresaleAppOrderGetInstitutionNameQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppPresaleAppOrderGetInstitutionNameRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/presale/app/order/get-institution-name`, params, _config) as Promise<GetSuperAppPresaleAppOrderGetInstitutionNameRes>
}

/** 订单详细 */
export function GetSuperAppPresaleAppOrderInfo(params: GetSuperAppPresaleAppOrderInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppPresaleAppOrderInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/presale/app/order/info`, params, _config) as Promise<GetSuperAppPresaleAppOrderInfoRes>
}

/** 订单列表,我的订单 */
export function GetSuperAppPresaleAppOrderList(params: GetSuperAppPresaleAppOrderListQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppPresaleAppOrderListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/presale/app/order/list`, params, _config) as Promise<GetSuperAppPresaleAppOrderListRes>
}

/** 更新购物车 */
export function PostSuperAppPresaleAppShopCartStore(params: PostSuperAppPresaleAppShopCartStoreReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppShopCartStoreRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/presale/app/shop-cart/store`, params, _config) as Promise<PostSuperAppPresaleAppShopCartStoreRes>
}
