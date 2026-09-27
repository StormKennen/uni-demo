/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getAltitudeCurrentQuery,
  getAltitudeCurrentRes,
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
