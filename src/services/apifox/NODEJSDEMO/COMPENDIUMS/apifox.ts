/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getCompendiumsCharacterQuery,
  getCompendiumsCharacterRankingsQuery,
  getCompendiumsCharacterRankingsRes,
  getCompendiumsCharacterRes,
  getCompendiumsCharactersQuery,
  getCompendiumsCharactersRes,
  getCompendiumsCompareQuery,
  getCompendiumsCompareRes,
  getCompendiumsConfigQuery,
  getCompendiumsConfigRes,
  getCompendiumsDetailQuery,
  getCompendiumsDetailRes,
  getCompendiumsQuery,
  getCompendiumsRankingsQuery,
  getCompendiumsRankingsRes,
  getCompendiumsRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Compendiums/获取图鉴列表
 * @url GET /compendiums
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751677
 */
export const getCompendiums = async (
  params: Expand<getCompendiumsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums', params, _config)
}

/**
 * @description Compendiums/获取图鉴详情
 * @url GET /compendiums/detail
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751678
 */
export const getCompendiumsDetail = async (
  params: Expand<getCompendiumsDetailQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsDetailRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/detail', params, _config)
}

/**
 * @description Compendiums/获取图鉴配置
 * @url GET /compendiums/config
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751679
 */
export const getCompendiumsConfig = async (
  params: Expand<getCompendiumsConfigQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsConfigRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/config', params, _config)
}

/**
 * @description Compendiums/获取人物列表
 * @url GET /compendiums/characters
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751680
 */
export const getCompendiumsCharacters = async (
  params: Expand<getCompendiumsCharactersQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsCharactersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/characters', params, _config)
}

/**
 * @description Compendiums/获取人物详情
 * @url GET /compendiums/character
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751681
 */
export const getCompendiumsCharacter = async (
  params: Expand<getCompendiumsCharacterQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsCharacterRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/character', params, _config)
}

/**
 * @description Compendiums/获取人物属性排名
 * @url GET /compendiums/character-rankings
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751682
 */
export const getCompendiumsCharacterRankings = async (
  params: Expand<getCompendiumsCharacterRankingsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsCharacterRankingsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/character-rankings', params, _config)
}

/**
 * @description Compendiums/获取属性排行榜
 * @url GET /compendiums/rankings
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751683
 */
export const getCompendiumsRankings = async (
  params: Expand<getCompendiumsRankingsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsRankingsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/rankings', params, _config)
}

/**
 * @description Compendiums/对比多个人物
 * @url GET /compendiums/compare
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751684
 */
export const getCompendiumsCompare = async (
  params: Expand<getCompendiumsCompareQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsCompareRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/compare', params, _config)
}
