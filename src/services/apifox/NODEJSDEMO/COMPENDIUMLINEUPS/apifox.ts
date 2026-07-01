/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteAdminLineupMappingsMappingIdRes,
  deleteAdminLineupsLineupIdRes,
  deleteCompendiumsLineupsLineupIdRes,
  getAdminLineupMappingsMappingIdRes,
  getAdminLineupMappingsQuery,
  getAdminLineupMappingsRes,
  getAdminLineupRelationsSourceLineupIdQuery,
  getAdminLineupRelationsSourceLineupIdRes,
  getAdminLineupsCharacterOptionsQuery,
  getAdminLineupsCharacterOptionsRes,
  getAdminLineupsLineupIdQuery,
  getAdminLineupsLineupIdRes,
  getAdminLineupsOptionsQuery,
  getAdminLineupsOptionsRes,
  getAdminLineupsQuery,
  getAdminLineupsRes,
  getAdminLineupsTypesQuery,
  getAdminLineupsTypesRes,
  getCharactersCharacterIdLineupsQuery,
  getCharactersCharacterIdLineupsRes,
  getCompendiumsLineupMappingsMappingIdRes,
  getCompendiumsLineupsLineupIdQuery,
  getCompendiumsLineupsLineupIdRes,
  getCompendiumsLineupsQuery,
  getCompendiumsLineupsRes,
  patchAdminLineupMappingsMappingIdBody,
  patchAdminLineupMappingsMappingIdRes,
  patchAdminLineupsLineupIdBody,
  patchAdminLineupsLineupIdRes,
  patchCompendiumsLineupsLineupIdBody,
  patchCompendiumsLineupsLineupIdRes,
  postAdminLineupMappingsBody,
  postAdminLineupMappingsRes,
  postAdminLineupRelationsBody,
  postAdminLineupRelationsRes,
  postAdminLineupsBody,
  postAdminLineupsRes,
  postCompendiumsLineupsBody,
  postCompendiumsLineupsRes,
  postLineupsLineupIdReactionBody,
  postLineupsLineupIdReactionPathQuery,
  postLineupsLineupIdReactionRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description CompendiumLineups/获取人物关联阵容
 * @url GET /compendiums/characters/{characterId}/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064661
 */
export const getCharactersCharacterIdLineups = async (
  characterId: string,
  params: Expand<getCharactersCharacterIdLineupsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCharactersCharacterIdLineupsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(
    '/compendiums/characters/${characterId}/lineups',
    params,
    _config,
  )
}

/**
 * @description CompendiumLineups/获取阵容列表（用户侧）
 * @url GET /compendiums/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141957
 */
export const getCompendiumsLineups = async (
  params: Expand<getCompendiumsLineupsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsLineupsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/lineups', params, _config)
}

/**
 * @description CompendiumLineups/创建阵容（用户侧）
 * @url POST /compendiums/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141958
 */
export const postCompendiumsLineups = async (
  data: Expand<postCompendiumsLineupsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postCompendiumsLineupsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/compendiums/lineups', data, _config)
}

/**
 * @description CompendiumLineups/获取阵容详情（用户侧）
 * @url GET /compendiums/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141959
 */
export const getCompendiumsLineupsLineupId = async (
  lineupId: string,
  params: Expand<getCompendiumsLineupsLineupIdQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsLineupsLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/lineups/${lineupId}', params, _config)
}

/**
 * @description CompendiumLineups/编辑阵容（用户侧）
 * @url PATCH /compendiums/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141960
 */
export const patchCompendiumsLineupsLineupId = async (
  lineupId: string,
  data: Expand<patchCompendiumsLineupsLineupIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchCompendiumsLineupsLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch('/compendiums/lineups/${lineupId}', data, _config)
}

/**
 * @description CompendiumLineups/删除阵容（用户侧）
 * @url DELETE /compendiums/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141961
 */
export const deleteCompendiumsLineupsLineupId = async (
  lineupId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteCompendiumsLineupsLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/compendiums/lineups/${lineupId}', {}, _config)
}

/**
 * @description CompendiumLineups/阵容点赞/点踩（态度切换）
 * @url POST /compendiums/lineups/{lineupId}/reaction
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141962
 */
export const postLineupsLineupIdReaction = async (
  lineupId: string,
  data: Expand<postLineupsLineupIdReactionBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postLineupsLineupIdReactionRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/compendiums/lineups/${lineupId}/reaction', data, _config)
}

/**
 * @description CompendiumLineups/Get lineup list for the admin editor
 * @url GET /admin/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105489
 */
export const getAdminLineups = async (
  params: Expand<getAdminLineupsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/admin/lineups', params, _config)
}

/**
 * @description CompendiumLineups/Create a lineup
 * @url POST /admin/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064662
 */
export const postAdminLineups = async (
  data: Expand<postAdminLineupsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminLineupsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/admin/lineups', data, _config)
}

/**
 * @description CompendiumLineups/Get distinct lineup types for one compendium
 * @url GET /admin/lineups/types
 * @host https://app.apifox.com/link/project/7048425/apis/api-477759054
 */
export const getAdminLineupsTypes = async (
  params: Expand<getAdminLineupsTypesQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsTypesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/admin/lineups/types', params, _config)
}

/**
 * @description CompendiumLineups/Get lineup options for select components
 * @url GET /admin/lineups/options
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105490
 */
export const getAdminLineupsOptions = async (
  params: Expand<getAdminLineupsOptionsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsOptionsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/admin/lineups/options', params, _config)
}

/**
 * @description CompendiumLineups/Get character options for the lineup member picker
 * @url GET /admin/lineups/character-options
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105491
 */
export const getAdminLineupsCharacterOptions = async (
  params: Expand<getAdminLineupsCharacterOptionsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsCharacterOptionsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/admin/lineups/character-options', params, _config)
}

/**
 * @description CompendiumLineups/Get lineup detail
 * @url GET /admin/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105492
 */
export const getAdminLineupsLineupId = async (
  lineupId: string,
  params: Expand<getAdminLineupsLineupIdQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/admin/lineups/${lineupId}', params, _config)
}

/**
 * @description CompendiumLineups/Update a lineup
 * @url PATCH /admin/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064663
 */
export const patchAdminLineupsLineupId = async (
  lineupId: string,
  data: Expand<patchAdminLineupsLineupIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchAdminLineupsLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch('/admin/lineups/${lineupId}', data, _config)
}

/**
 * @description CompendiumLineups/Delete a lineup
 * @url DELETE /admin/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064664
 */
export const deleteAdminLineupsLineupId = async (
  lineupId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteAdminLineupsLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/admin/lineups/${lineupId}', {}, _config)
}

/**
 * @description CompendiumLineups/Get lineup relation detail for one source lineup
 * @url GET /admin/lineup-relations/{sourceLineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105493
 */
export const getAdminLineupRelationsSourceLineupId = async (
  sourceLineupId: string,
  params: Expand<getAdminLineupRelationsSourceLineupIdQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupRelationsSourceLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/admin/lineup-relations/${sourceLineupId}', params, _config)
}

/**
 * @description CompendiumLineups/Save relation targets for one source lineup
 * @url POST /admin/lineup-relations
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064665
 */
export const postAdminLineupRelations = async (
  data: Expand<postAdminLineupRelationsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminLineupRelationsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/admin/lineup-relations', data, _config)
}

/**
 * @description CompendiumLineups/阵容映射列表（管理侧）
 * @url GET /admin/lineup-mappings
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665650
 */
export const getAdminLineupMappings = async (
  params: Expand<getAdminLineupMappingsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupMappingsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/admin/lineup-mappings', params, _config)
}

/**
 * @description CompendiumLineups/创建阵容映射（管理侧）
 * @url POST /admin/lineup-mappings
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665651
 */
export const postAdminLineupMappings = async (
  data: Expand<postAdminLineupMappingsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminLineupMappingsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/admin/lineup-mappings', data, _config)
}

/**
 * @description CompendiumLineups/阵容映射详情（管理侧）
 * @url GET /admin/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665652
 */
export const getAdminLineupMappingsMappingId = async (
  mappingId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupMappingsMappingIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/admin/lineup-mappings/${mappingId}', {}, _config)
}

/**
 * @description CompendiumLineups/编辑阵容映射（管理侧）
 * @url PATCH /admin/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665653
 */
export const patchAdminLineupMappingsMappingId = async (
  mappingId: string,
  data: Expand<patchAdminLineupMappingsMappingIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchAdminLineupMappingsMappingIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch('/admin/lineup-mappings/${mappingId}', data, _config)
}

/**
 * @description CompendiumLineups/删除阵容映射（软删除，管理侧）
 * @url DELETE /admin/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665654
 */
export const deleteAdminLineupMappingsMappingId = async (
  mappingId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteAdminLineupMappingsMappingIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/admin/lineup-mappings/${mappingId}', {}, _config)
}

/**
 * @description CompendiumLineups/阵容映射详情（用户侧只读）
 * @url GET /compendiums/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665655
 */
export const getCompendiumsLineupMappingsMappingId = async (
  mappingId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsLineupMappingsMappingIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/lineup-mappings/${mappingId}', {}, _config)
}

/**
 * @description CompendiumLineups/容器内阵容点赞/点踩（用户侧便捷路由）
 * @url POST /compendiums/lineup-mappings/{mappingId}/containers/{containerId}/lineups/{lineupId}/reaction
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665656
 */
export const postLineupsLineupIdReaction = async (
  pathParams: Expand<postLineupsLineupIdReactionPathQuery>,
  data: Expand<postLineupsLineupIdReactionBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postLineupsLineupIdReactionRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(
    '/compendiums/lineup-mappings/${pathParams.mappingId}/containers/${pathParams.containerId}/lineups/${pathParams.lineupId}/reaction',
    data,
    _config,
  )
}
