/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getCompendiumsRtaConfigQuery,
  getCompendiumsRtaConfigRes,
  getCompendiumsRtaMonsterQuery,
  getCompendiumsRtaMonsterRes,
  getCompendiumsRtaMonstersQuery,
  getCompendiumsRtaMonstersRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description RTA/获取 RTA 赛季、筛选项和已实现能力
 * @url GET /compendiums/rta/config
 * @host https://app.apifox.com/link/project/7048425/apis/api-501852947
 */
export const getCompendiumsRtaConfig = async (
  params: Expand<getCompendiumsRtaConfigQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsRtaConfigRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/rta/config`, params, _config)
}

/**
 * @description RTA/获取 RTA 人物排行榜
 * @url GET /compendiums/rta/monsters
 * @host https://app.apifox.com/link/project/7048425/apis/api-501852948
 */
export const getCompendiumsRtaMonsters = async (
  params: Expand<getCompendiumsRtaMonstersQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsRtaMonstersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/rta/monsters`, params, _config)
}

/**
 * @description RTA/按本地 Character ID 获取人物 RTA 详情
 * @url GET /compendiums/rta/monster
 * @host https://app.apifox.com/link/project/7048425/apis/api-501852949
 */
export const getCompendiumsRtaMonster = async (
  params: Expand<getCompendiumsRtaMonsterQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsRtaMonsterRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/rta/monster`, params, _config)
}
