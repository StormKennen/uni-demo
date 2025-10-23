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
    GetInfoflowOrderInformationGet_informationQuery,
    GetInfoflowOrderInformationGet_informationRes,
    GetInfoflowOrderInformationPreview_informationQuery,
    GetInfoflowOrderInformationPreview_informationRes,
    GetInfoflowOrderInformationGet_simple_informationQuery,
    GetInfoflowOrderInformationGet_simple_informationRes,
    GetInfoflowCountryQuery,
    GetInfoflowCountryRes,
    PostInfoflowOrderInformationGet_hk_macao_passReq,
    PostInfoflowOrderInformationGet_hk_macao_passRes,
    PostInfoflowOrderInformationGet_id_cardReq,
    PostInfoflowOrderInformationGet_id_cardRes,
    PostInfoflowOrderInformationUpdate_informationReq,
    PostInfoflowOrderInformationUpdate_informationRes,
} from './interface'
    
/** 查询单个主申人 */
export function GetInfoflowOrderInformationGet_information(params: GetInfoflowOrderInformationGet_informationQuery, config?: ParticalUniAppRequestOptions): Promise<GetInfoflowOrderInformationGet_informationRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/infoflow/order-information/get_information`, params, _config) as Promise<GetInfoflowOrderInformationGet_informationRes>
}

/** 查询单个主申人预览 */
export function GetInfoflowOrderInformationPreview_information(params: GetInfoflowOrderInformationPreview_informationQuery, config?: ParticalUniAppRequestOptions): Promise<GetInfoflowOrderInformationPreview_informationRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/infoflow/order-information/preview_information`, params, _config) as Promise<GetInfoflowOrderInformationPreview_informationRes>
}

/** 查询单个主申人简单信息 */
export function GetInfoflowOrderInformationGet_simple_information(params: GetInfoflowOrderInformationGet_simple_informationQuery, config?: ParticalUniAppRequestOptions): Promise<GetInfoflowOrderInformationGet_simple_informationRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/infoflow/order-information/get_simple_information`, params, _config) as Promise<GetInfoflowOrderInformationGet_simple_informationRes>
}

/** 国家列表 */
export function GetInfoflowCountry(params: GetInfoflowCountryQuery, config?: ParticalUniAppRequestOptions): Promise<GetInfoflowCountryRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/infoflow/country`, params, _config) as Promise<GetInfoflowCountryRes>
}

/** *
主申人港澳通行证识别 */
export function PostInfoflowOrderInformationGet_hk_macao_pass(params: PostInfoflowOrderInformationGet_hk_macao_passReq, config?: ParticalUniAppRequestOptions): Promise<PostInfoflowOrderInformationGet_hk_macao_passRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/infoflow/order-information/get_hk_macao_pass`, params, _config) as Promise<PostInfoflowOrderInformationGet_hk_macao_passRes>
}

/** *
主申人身份证识别 */
export function PostInfoflowOrderInformationGet_id_card(params: PostInfoflowOrderInformationGet_id_cardReq, config?: ParticalUniAppRequestOptions): Promise<PostInfoflowOrderInformationGet_id_cardRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/infoflow/order-information/get_id_card`, params, _config) as Promise<PostInfoflowOrderInformationGet_id_cardRes>
}

/** *
更新主申人信息 */
export function PostInfoflowOrderInformationUpdate_information(params: PostInfoflowOrderInformationUpdate_informationReq, config?: ParticalUniAppRequestOptions): Promise<PostInfoflowOrderInformationUpdate_informationRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/infoflow/order-information/update_information`, params, _config) as Promise<PostInfoflowOrderInformationUpdate_informationRes>
}
