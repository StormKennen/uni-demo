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
  return http.get(`/compendiums`, params, _config)
}

/**
 * 自定义函数：usegetCompendiums
 * @description Compendiums/获取图鉴列表
 * @url GET /compendiums
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751677
 */

export const useGetCompendiums = (
  params: Expand<getCompendiumsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums`, params, fetchOptions],
    queryFn: () => getCompendiums(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiums = (
  params: Expand<getCompendiumsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums`, params, fetchOptions],
    queryFn: () => getCompendiums(params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.get(`/compendiums/detail`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsDetail
 * @description Compendiums/获取图鉴详情
 * @url GET /compendiums/detail
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751678
 */

export const useGetCompendiumsDetail = (
  params: Expand<getCompendiumsDetailQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/detail`, params, fetchOptions],
    queryFn: () => getCompendiumsDetail(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsDetail = (
  params: Expand<getCompendiumsDetailQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/detail`, params, fetchOptions],
    queryFn: () => getCompendiumsDetail(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description Compendiums/获取图鉴配置（分类定义与属性定义）
 * @url GET /compendiums/config
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751679
 */
export const getCompendiumsConfig = async (
  params: Expand<getCompendiumsConfigQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsConfigRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/config`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsConfig
 * @description Compendiums/获取图鉴配置（分类定义与属性定义）
 * @url GET /compendiums/config
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751679
 */

export const useGetCompendiumsConfig = (
  params: Expand<getCompendiumsConfigQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/config`, params, fetchOptions],
    queryFn: () => getCompendiumsConfig(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsConfig = (
  params: Expand<getCompendiumsConfigQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/config`, params, fetchOptions],
    queryFn: () => getCompendiumsConfig(params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.get(`/compendiums/characters`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsCharacters
 * @description Compendiums/获取人物列表
 * @url GET /compendiums/characters
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751680
 */

export const useGetCompendiumsCharacters = (
  params: Expand<getCompendiumsCharactersQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/characters`, params, fetchOptions],
    queryFn: () => getCompendiumsCharacters(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsCharacters = (
  params: Expand<getCompendiumsCharactersQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/characters`, params, fetchOptions],
    queryFn: () => getCompendiumsCharacters(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description Compendiums/获取人物详情（含技能和排名）
 * @url GET /compendiums/character
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751681
 */
export const getCompendiumsCharacter = async (
  params: Expand<getCompendiumsCharacterQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsCharacterRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/character`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsCharacter
 * @description Compendiums/获取人物详情（含技能和排名）
 * @url GET /compendiums/character
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751681
 */

export const useGetCompendiumsCharacter = (
  params: Expand<getCompendiumsCharacterQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/character`, params, fetchOptions],
    queryFn: () => getCompendiumsCharacter(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsCharacter = (
  params: Expand<getCompendiumsCharacterQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/character`, params, fetchOptions],
    queryFn: () => getCompendiumsCharacter(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description Compendiums/获取单个人物的各属性排名
 * @url GET /compendiums/character-rankings
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751682
 */
export const getCompendiumsCharacterRankings = async (
  params: Expand<getCompendiumsCharacterRankingsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsCharacterRankingsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/character-rankings`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsCharacterRankings
 * @description Compendiums/获取单个人物的各属性排名
 * @url GET /compendiums/character-rankings
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751682
 */

export const useGetCompendiumsCharacterRankings = (
  params: Expand<getCompendiumsCharacterRankingsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/character-rankings`, params, fetchOptions],
    queryFn: () => getCompendiumsCharacterRankings(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsCharacterRankings = (
  params: Expand<getCompendiumsCharacterRankingsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/character-rankings`, params, fetchOptions],
    queryFn: () => getCompendiumsCharacterRankings(params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.get(`/compendiums/rankings`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsRankings
 * @description Compendiums/获取属性排行榜
 * @url GET /compendiums/rankings
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751683
 */

export const useGetCompendiumsRankings = (
  params: Expand<getCompendiumsRankingsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/rankings`, params, fetchOptions],
    queryFn: () => getCompendiumsRankings(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsRankings = (
  params: Expand<getCompendiumsRankingsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/rankings`, params, fetchOptions],
    queryFn: () => getCompendiumsRankings(params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.get(`/compendiums/compare`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsCompare
 * @description Compendiums/对比多个人物
 * @url GET /compendiums/compare
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751684
 */

export const useGetCompendiumsCompare = (
  params: Expand<getCompendiumsCompareQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/compare`, params, fetchOptions],
    queryFn: () => getCompendiumsCompare(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsCompare = (
  params: Expand<getCompendiumsCompareQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/compare`, params, fetchOptions],
    queryFn: () => getCompendiumsCompare(params, fetchOptions),
    ..._queryOptions,
  })
}
