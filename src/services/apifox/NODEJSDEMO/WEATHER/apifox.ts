/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type { getWeatherQuery, getWeatherRes } from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Weather/查询实时天气
 * @url GET /weather
 * @host https://app.apifox.com/link/project/7048425/apis/api-521306427
 */
export const getWeather = async (
  params: Expand<getWeatherQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getWeatherRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/weather`, params, _config)
}
