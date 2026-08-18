/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getCompendiumsCharacterEquipmentQuery,
  getCompendiumsCharacterEquipmentRes,
  postCompendiumsCharacterEquipmentImportBody,
  postCompendiumsCharacterEquipmentImportRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Equipment/获取人物推荐装备
 * @url GET /compendiums/character-equipment
 * @host https://app.apifox.com/link/project/7048425/apis/api-502666455
 */
export const getCompendiumsCharacterEquipment = async (
  params: Expand<getCompendiumsCharacterEquipmentQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsCharacterEquipmentRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/character-equipment`, params, _config)
}

/**
 * @description Equipment/批量导入人物推荐装备
 * @url POST /compendiums/character-equipment/import
 * @host https://app.apifox.com/link/project/7048425/apis/api-502666456
 */
export const postCompendiumsCharacterEquipmentImport = async (
  data: Expand<postCompendiumsCharacterEquipmentImportBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postCompendiumsCharacterEquipmentImportRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/compendiums/character-equipment/import`, data, _config)
}
