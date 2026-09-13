/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getRtaScoreConfigQuery,
  getRtaScoreConfigRes,
  getRtaScoreCurrentQuery,
  getRtaScoreCurrentRes,
  getRtaScoreForecastQuery,
  getRtaScoreForecastRes,
  getRtaScoreHistoryQuery,
  getRtaScoreHistoryRes,
  getRtaScoreOptionsQuery,
  getRtaScoreOptionsRes,
  getRtaScoreSeasonHistoryQuery,
  getRtaScoreSeasonHistoryRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description RTAScore/获取 RTA 分数筛选枚举
 * @url GET /compendiums/rta/score/options
 * @host https://app.apifox.com/link/project/7048425/apis/api-514231319
 */
export const getRtaScoreOptions = async (
  params: Expand<getRtaScoreOptionsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRtaScoreOptionsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/rta/score/options`, params, _config)
}

/**
 * @description RTAScore/获取 RTA 分数能力配置
 * @url GET /compendiums/rta/score/config
 * @host https://app.apifox.com/link/project/7048425/apis/api-514231320
 */
export const getRtaScoreConfig = async (
  params: Expand<getRtaScoreConfigQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRtaScoreConfigRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/rta/score/config`, params, _config)
}

/**
 * @description RTAScore/获取当前 RTA 分数线快照
 * @url GET /compendiums/rta/score/current
 * @host https://app.apifox.com/link/project/7048425/apis/api-514231321
 */
export const getRtaScoreCurrent = async (
  params: Expand<getRtaScoreCurrentQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRtaScoreCurrentRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/rta/score/current`, params, _config)
}

/**
 * @description RTAScore/获取 RTA 分数历史曲线
 * @url GET /compendiums/rta/score/history
 * @host https://app.apifox.com/link/project/7048425/apis/api-514231322
 */
export const getRtaScoreHistory = async (
  params: Expand<getRtaScoreHistoryQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRtaScoreHistoryRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/rta/score/history`, params, _config)
}

/**
 * @description RTAScore/获取 RTA 赛季分数预测
 * @url GET /compendiums/rta/score/forecast
 * @host https://app.apifox.com/link/project/7048425/apis/api-514231323
 */
export const getRtaScoreForecast = async (
  params: Expand<getRtaScoreForecastQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRtaScoreForecastRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/rta/score/forecast`, params, _config)
}

/**
 * @description RTAScore/获取 RTA 历史赛季相对 FINAL 曲线
 * @url GET /compendiums/rta/score/season-history
 * @host https://app.apifox.com/link/project/7048425/apis/api-514410346
 */
export const getRtaScoreSeasonHistory = async (
  params: Expand<getRtaScoreSeasonHistoryQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRtaScoreSeasonHistoryRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/rta/score/season-history`, params, _config)
}
