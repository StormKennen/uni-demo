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
    GetSuperAppGoodsCategoryListRes,
    GetSuperAppGoodsListQuery,
    GetSuperAppGoodsListRes,
} from './interface'
    
/** 商品分类列表 */
export function GetSuperAppGoodsCategoryList(config?: ParticalUniAppRequestOptions): Promise<GetSuperAppGoodsCategoryListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/super-app/goods/category-list', _config) as Promise<GetSuperAppGoodsCategoryListRes>
}

/** 通过分类获取商品列表 */
export function GetSuperAppGoodsList(params: GetSuperAppGoodsListQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppGoodsListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/goods/list`, params, _config) as Promise<GetSuperAppGoodsListRes>
}
