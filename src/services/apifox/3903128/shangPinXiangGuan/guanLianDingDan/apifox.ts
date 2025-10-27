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
    GetSuperAppPresaleAppAssociatedOrderServerListQuery,
    GetSuperAppPresaleAppAssociatedOrderServerListRes,
    PostSuperAppPresaleAppAssociatedOrderActionableOrderRes,
    GetSuperAppPresaleAppAssociatedOrderBusinessRes,
    GetSuperAppPresaleAppAssociatedOrderOrderListQuery,
    GetSuperAppPresaleAppAssociatedOrderOrderListRes,
} from './interface'
    
/** 客户主体列表 */
export function GetSuperAppPresaleAppAssociatedOrderServerList(params: GetSuperAppPresaleAppAssociatedOrderServerListQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppPresaleAppAssociatedOrderServerListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/presale/app/associated-order/server/list`, params, _config) as Promise<GetSuperAppPresaleAppAssociatedOrderServerListRes>
}

/** 关联订单 */
export function PostSuperAppPresaleAppAssociatedOrderActionableOrder(_, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppPresaleAppAssociatedOrderActionableOrderRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/super-app/presale/app/associated-order/actionable-order', {}, _config) as Promise<PostSuperAppPresaleAppAssociatedOrderActionableOrderRes>
}

/** 首页-交付服务 */
export function GetSuperAppPresaleAppAssociatedOrderBusiness(config?: ParticalUniAppRequestOptions): Promise<GetSuperAppPresaleAppAssociatedOrderBusinessRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/super-app/presale/app/associated-order/business', _config) as Promise<GetSuperAppPresaleAppAssociatedOrderBusinessRes>
}

/** 关联订单列表 */
export function GetSuperAppPresaleAppAssociatedOrderOrderList(params: GetSuperAppPresaleAppAssociatedOrderOrderListQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppPresaleAppAssociatedOrderOrderListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/presale/app/associated-order/order/list`, params, _config) as Promise<GetSuperAppPresaleAppAssociatedOrderOrderListRes>
}
