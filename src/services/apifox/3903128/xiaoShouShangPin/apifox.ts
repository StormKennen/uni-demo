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
    GetSuperAppGoodsCategoryInfoQuery,
    GetSuperAppGoodsCategoryInfoRes,
    GetSuperAppGoodsInfoQuery,
    GetSuperAppGoodsInfoRes,
} from './interface'
    
/** 获取销售商品品类信息 */
export function GetSuperAppGoodsCategoryInfo(params: GetSuperAppGoodsCategoryInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppGoodsCategoryInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/goods-category-info`, params, _config) as Promise<GetSuperAppGoodsCategoryInfoRes>
}

/** 获取销售商品信息 */
export function GetSuperAppGoodsInfo(params: GetSuperAppGoodsInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppGoodsInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/goods-info`, params, _config) as Promise<GetSuperAppGoodsInfoRes>
}
