/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteAdminLineupsLineupIdRes,
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
  getCharactersCharacterIdLineupsQuery,
  getCharactersCharacterIdLineupsRes,
  patchAdminLineupsLineupIdBody,
  patchAdminLineupsLineupIdRes,
  postAdminLineupRelationsBody,
  postAdminLineupRelationsRes,
  postAdminLineupsBody,
  postAdminLineupsRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description CompendiumLineups/Get lineup usage for a character
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
 * @description CompendiumLineups/Get lineup relation detail for one defense lineup
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
 * @description CompendiumLineups/Save relation targets for one defense lineup
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
