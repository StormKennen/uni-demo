/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getAreasAreaIdElevationProfileRes,
  getScenicAdministrativeOptionsRes,
  getScenicAreasAreaIdRes,
  getScenicAreasRes,
  getScenicPointsSearchRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Scenic/获取景区行政筛选树
 * @url GET /scenic/administrative-options
 * @host https://app.apifox.com/link/project/7048425/apis/api-521446062
 */
export const getScenicAdministrativeOptions = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getScenicAdministrativeOptionsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/scenic/administrative-options`, {}, _config)
}

/**
 * @description Scenic/分页查询景区
 * @url GET /scenic/areas
 * @host https://app.apifox.com/link/project/7048425/apis/api-521446063
 */
export const getScenicAreas = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getScenicAreasRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/scenic/areas`, {}, _config)
}

/**
 * @description Scenic/查询景区详情与景点分页
 * @url GET /scenic/areas/{areaId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-521446064
 */
export const getScenicAreasAreaId = async (
  areaId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getScenicAreasAreaIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/scenic/areas/${areaId}`, {}, _config)
}

/**
 * @description Scenic/获取景区景点海拔折线图数据
 * @url GET /scenic/areas/{areaId}/elevation-profile
 * @host https://app.apifox.com/link/project/7048425/apis/api-521446065
 */
export const getAreasAreaIdElevationProfile = async (
  areaId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAreasAreaIdElevationProfileRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/scenic/areas/${areaId}/elevation-profile`, {}, _config)
}

/**
 * @description Scenic/分页搜索景点
 * @url GET /scenic/points/search
 * @host https://app.apifox.com/link/project/7048425/apis/api-521446066
 */
export const getScenicPointsSearch = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getScenicPointsSearchRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/scenic/points/search`, {}, _config)
}
