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
    GetSuperAppAssociatedOrderServicesRes,
    GetSuperAppAssociatedOrderBusinessListRes,
    PostSuperAppAssociatedOrderServicesLinkRes,
} from './interface'
    
/** 订单主体列表 */
export function GetSuperAppAssociatedOrderServices(config?: ParticalUniAppRequestOptions): Promise<GetSuperAppAssociatedOrderServicesRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/super-app/associated-order/services', _config) as Promise<GetSuperAppAssociatedOrderServicesRes>
}

/** 客户对应订单 */
export function GetSuperAppAssociatedOrderBusinessList(config?: ParticalUniAppRequestOptions): Promise<GetSuperAppAssociatedOrderBusinessListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/super-app/associated-order/business/list', _config) as Promise<GetSuperAppAssociatedOrderBusinessListRes>
}

/** 订单主体关联 */
export function PostSuperAppAssociatedOrderServicesLink(_, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppAssociatedOrderServicesLinkRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/super-app/associated-order/services/link', {}, _config) as Promise<PostSuperAppAssociatedOrderServicesLinkRes>
}
