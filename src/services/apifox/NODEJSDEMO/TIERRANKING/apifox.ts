/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never
import type {
  getCompendiumsTierRankingsConfigQuery,
  getCompendiumsTierRankingsConfigRes,
  getCompendiumsTierRankingsLatestQuery,
  getCompendiumsTierRankingsLatestRes,
  getCompendiumsTierRankingsReportQuery,
  getCompendiumsTierRankingsReportRes,
  getCompendiumsTierRankingsReportsQuery,
  getCompendiumsTierRankingsReportsRes,
} from './interface'

/**
 * @description TierRanking/获取评级榜配置
 * @url GET /compendiums/tier-rankings/config
 * @host https://app.apifox.com/link/project/7048425/apis/api-510650822
 */
export const getCompendiumsTierRankingsConfig = async (
  params: Expand<getCompendiumsTierRankingsConfigQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsTierRankingsConfigRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/tier-rankings/config`, params, _config)
}

/**
 * @description TierRanking/获取已发布评级报告列表
 * @url GET /compendiums/tier-rankings/reports
 * @host https://app.apifox.com/link/project/7048425/apis/api-510650823
 */
export const getCompendiumsTierRankingsReports = async (
  params: Expand<getCompendiumsTierRankingsReportsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsTierRankingsReportsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/tier-rankings/reports`, params, _config)
}

/**
 * @description TierRanking/获取最新已发布评级榜
 * @url GET /compendiums/tier-rankings/latest
 * @host https://app.apifox.com/link/project/7048425/apis/api-510650824
 */
export const getCompendiumsTierRankingsLatest = async (
  params: Expand<getCompendiumsTierRankingsLatestQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsTierRankingsLatestRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/tier-rankings/latest`, params, _config)
}

/**
 * @description TierRanking/获取指定日期评级榜
 * @url GET /compendiums/tier-rankings/report
 * @host https://app.apifox.com/link/project/7048425/apis/api-510650825
 */
export const getCompendiumsTierRankingsReport = async (
  params: Expand<getCompendiumsTierRankingsReportQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsTierRankingsReportRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/tier-rankings/report`, params, _config)
}
