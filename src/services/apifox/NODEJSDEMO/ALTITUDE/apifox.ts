/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getAltitudeCurrentQuery,
  getAltitudeCurrentRes,
  getAltitudePlacesOptionsRes,
  getAltitudePlacesQuery,
  getAltitudePlacesRes,
  getPlacesPlaceIdElevationRes,
  postAltitudePlacesImportBody,
  postAltitudePlacesImportRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Altitude/查询当前海拔
 * @url GET /altitude/current
 * @host https://app.apifox.com/link/project/7048425/apis/api-520072681
 */
export const getAltitudeCurrent = async (
  params: Expand<getAltitudeCurrentQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAltitudeCurrentRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/altitude/current`, params, _config)
}

/**
 * @description Altitude/搜索预采集地点海拔
 * @url GET /altitude/places
 * @host https://app.apifox.com/link/project/7048425/apis/api-520509022
 */
export const getAltitudePlaces = async (
  params: Expand<getAltitudePlacesQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAltitudePlacesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/altitude/places`, params, _config)
}

/**
 * @description Altitude/获取预采集地点选择树
 * @url GET /altitude/places/options
 * @host https://app.apifox.com/link/project/7048425/apis/api-521044036
 */
export const getAltitudePlacesOptions = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAltitudePlacesOptionsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/altitude/places/options`, {}, _config)
}

/**
 * @description Altitude/导入海拔 JSON
 * @url POST /admin/altitude/places/import
 * @host https://app.apifox.com/link/project/7048425/apis/api-521044037
 */
export const postAltitudePlacesImport = async (
  data: Expand<postAltitudePlacesImportBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAltitudePlacesImportRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/altitude/places/import`, data, _config)
}

/**
 * @description Altitude/查询地点海拔
 * @url GET /altitude/places/{placeId}/elevation
 * @host https://app.apifox.com/link/project/7048425/apis/api-521262738
 */
export const getPlacesPlaceIdElevation = async (
  placeId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getPlacesPlaceIdElevationRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/altitude/places/${placeId}/elevation`, {}, _config)
}
