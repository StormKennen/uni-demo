/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getCalendarAuspiciousQuery,
  getCalendarAuspiciousRes,
  getCalendarDetailQuery,
  getCalendarDetailRes,
  getCalendarMonthQuery,
  getCalendarMonthRes,
  getCalendarTodayRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Calendar/获取今日黄历
 * @url GET /calendar/today
 * @host https://app.apifox.com/link/project/7048425/apis/api-399455430
 */
export const getCalendarToday = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCalendarTodayRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/calendar/today', {}, _config)
}

/**
 * @description Calendar/获取指定日期的黄历详情
 * @url GET /calendar/detail
 * @host https://app.apifox.com/link/project/7048425/apis/api-399455431
 */
export const getCalendarDetail = async (
  params: Expand<getCalendarDetailQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCalendarDetailRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/calendar/detail', params, _config)
}

/**
 * @description Calendar/获取指定月份的日历数据
 * @url GET /calendar/month
 * @host https://app.apifox.com/link/project/7048425/apis/api-399455432
 */
export const getCalendarMonth = async (
  params: Expand<getCalendarMonthQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCalendarMonthRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/calendar/month', params, _config)
}

/**
 * @description Calendar/获取择吉日列表
 * @url GET /calendar/auspicious
 * @host https://app.apifox.com/link/project/7048425/apis/api-399455433
 */
export const getCalendarAuspicious = async (
  params: Expand<getCalendarAuspiciousQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCalendarAuspiciousRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/calendar/auspicious', params, _config)
}

