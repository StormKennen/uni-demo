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
  getCompendiumsLineupMappingsQuery,
  getCompendiumsLineupMappingsRes,
  getCompendiumsLineupsLineupIdQuery,
  getCompendiumsLineupsLineupIdRes,
  getCompendiumsLineupsQuery,
  getCompendiumsLineupsRes,
  patchAdminLineupMappingsMappingIdBody,
  patchAdminLineupMappingsMappingIdRes,
  patchAdminLineupsLineupIdBody,
  patchAdminLineupsLineupIdRes,
  patchCompendiumsLineupMappingsMappingIdBody,
  patchCompendiumsLineupMappingsMappingIdRes,
  patchCompendiumsLineupsLineupIdBody,
  patchCompendiumsLineupsLineupIdRes,
  postAdminLineupMappingsBody,
  postAdminLineupMappingsRes,
  postAdminLineupRelationsBody,
  postAdminLineupRelationsRes,
  postAdminLineupsBody,
  postAdminLineupsRes,
  postCompendiumsLineupMappingsBody,
  postCompendiumsLineupMappingsRes,
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
    `/compendiums/characters/$${characterId}/lineups`,
    params,
    _config,
  )
}

/**
 * 自定义函数：usegetCharactersCharacterIdLineups
 * @description CompendiumLineups/获取人物关联阵容
 * @url GET /compendiums/characters/{characterId}/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064661
 */

export const useGetCharactersCharacterIdLineups = (
  characterId: string,
  params: Expand<getCharactersCharacterIdLineupsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [
      `/compendiums/characters/${characterId}/lineups`,
      params,
      fetchOptions,
    ],
    queryFn: () =>
      getCharactersCharacterIdLineups(characterId, params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCharactersCharacterIdLineups = (
  characterId: string,
  params: Expand<getCharactersCharacterIdLineupsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [
      `/compendiums/characters/${characterId}/lineups`,
      params,
      fetchOptions,
    ],
    queryFn: () =>
      getCharactersCharacterIdLineups(characterId, params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.get(`/compendiums/lineups`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsLineups
 * @description CompendiumLineups/获取阵容列表（用户侧）
 * @url GET /compendiums/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141957
 */

export const useGetCompendiumsLineups = (
  params: Expand<getCompendiumsLineupsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/lineups`, params, fetchOptions],
    queryFn: () => getCompendiumsLineups(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsLineups = (
  params: Expand<getCompendiumsLineupsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/lineups`, params, fetchOptions],
    queryFn: () => getCompendiumsLineups(params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.post(`/compendiums/lineups`, data, _config)
}

/**
 * 自定义函数：usepostCompendiumsLineups
 * @description CompendiumLineups/创建阵容（用户侧）
 * @url POST /compendiums/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141958
 */

export const usePostCompendiumsLineups = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postCompendiumsLineups, ..._queryOptions })
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
  return http.get(`/compendiums/lineups/$${lineupId}`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsLineupsLineupId
 * @description CompendiumLineups/获取阵容详情（用户侧）
 * @url GET /compendiums/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141959
 */

export const useGetCompendiumsLineupsLineupId = (
  lineupId: string,
  params: Expand<getCompendiumsLineupsLineupIdQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/lineups/${lineupId}`, params, fetchOptions],
    queryFn: () =>
      getCompendiumsLineupsLineupId(lineupId, params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsLineupsLineupId = (
  lineupId: string,
  params: Expand<getCompendiumsLineupsLineupIdQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/lineups/${lineupId}`, params, fetchOptions],
    queryFn: () =>
      getCompendiumsLineupsLineupId(lineupId, params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.patch(`/compendiums/lineups/$${lineupId}`, data, _config)
}

/**
 * 自定义函数：usepatchCompendiumsLineupsLineupId
 * @description CompendiumLineups/编辑阵容（用户侧）
 * @url PATCH /compendiums/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141960
 */

export const usePatchCompendiumsLineupsLineupId = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: patchCompendiumsLineupsLineupId,
    ..._queryOptions,
  })
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
  return http.delete(`/compendiums/lineups/$${lineupId}`, {}, _config)
}

/**
 * 自定义函数：usedeleteCompendiumsLineupsLineupId
 * @description CompendiumLineups/删除阵容（用户侧）
 * @url DELETE /compendiums/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141961
 */

export const useDeleteCompendiumsLineupsLineupId = (
  lineupId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/lineups/${lineupId}`, fetchOptions],
    queryFn: () => deleteCompendiumsLineupsLineupId(lineupId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionDeleteCompendiumsLineupsLineupId = (
  lineupId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/lineups/${lineupId}`, fetchOptions],
    queryFn: () => deleteCompendiumsLineupsLineupId(lineupId, fetchOptions),
    ..._queryOptions,
  })
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
  return http.post(`/compendiums/lineups/$${lineupId}/reaction`, data, _config)
}

/**
 * 自定义函数：usepostLineupsLineupIdReaction
 * @description CompendiumLineups/阵容点赞/点踩（态度切换）
 * @url POST /compendiums/lineups/{lineupId}/reaction
 * @host https://app.apifox.com/link/project/7048425/apis/api-480141962
 */

export const usePostLineupsLineupIdReaction = (_queryOptions?: object = {}) => {
  return useMutation({
    mutationFn: postLineupsLineupIdReaction,
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/获取阵容列表（管理侧）
 * @url GET /admin/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105489
 */
export const getAdminLineups = async (
  params: Expand<getAdminLineupsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/admin/lineups`, params, _config)
}

/**
 * 自定义函数：usegetAdminLineups
 * @description CompendiumLineups/获取阵容列表（管理侧）
 * @url GET /admin/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105489
 */

export const useGetAdminLineups = (
  params: Expand<getAdminLineupsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/lineups`, params, fetchOptions],
    queryFn: () => getAdminLineups(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetAdminLineups = (
  params: Expand<getAdminLineupsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/lineups`, params, fetchOptions],
    queryFn: () => getAdminLineups(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/创建阵容（管理侧）
 * @url POST /admin/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064662
 */
export const postAdminLineups = async (
  data: Expand<postAdminLineupsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminLineupsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/lineups`, data, _config)
}

/**
 * 自定义函数：usepostAdminLineups
 * @description CompendiumLineups/创建阵容（管理侧）
 * @url POST /admin/lineups
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064662
 */

export const usePostAdminLineups = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postAdminLineups, ..._queryOptions })
}

/**
 * @description CompendiumLineups/获取阵容类型列表（管理侧）
 * @url GET /admin/lineups/types
 * @host https://app.apifox.com/link/project/7048425/apis/api-477759054
 */
export const getAdminLineupsTypes = async (
  params: Expand<getAdminLineupsTypesQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsTypesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/admin/lineups/types`, params, _config)
}

/**
 * 自定义函数：usegetAdminLineupsTypes
 * @description CompendiumLineups/获取阵容类型列表（管理侧）
 * @url GET /admin/lineups/types
 * @host https://app.apifox.com/link/project/7048425/apis/api-477759054
 */

export const useGetAdminLineupsTypes = (
  params: Expand<getAdminLineupsTypesQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/lineups/types`, params, fetchOptions],
    queryFn: () => getAdminLineupsTypes(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetAdminLineupsTypes = (
  params: Expand<getAdminLineupsTypesQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/lineups/types`, params, fetchOptions],
    queryFn: () => getAdminLineupsTypes(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/获取阵容选项列表（管理侧）
 * @url GET /admin/lineups/options
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105490
 */
export const getAdminLineupsOptions = async (
  params: Expand<getAdminLineupsOptionsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsOptionsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/admin/lineups/options`, params, _config)
}

/**
 * 自定义函数：usegetAdminLineupsOptions
 * @description CompendiumLineups/获取阵容选项列表（管理侧）
 * @url GET /admin/lineups/options
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105490
 */

export const useGetAdminLineupsOptions = (
  params: Expand<getAdminLineupsOptionsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/lineups/options`, params, fetchOptions],
    queryFn: () => getAdminLineupsOptions(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetAdminLineupsOptions = (
  params: Expand<getAdminLineupsOptionsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/lineups/options`, params, fetchOptions],
    queryFn: () => getAdminLineupsOptions(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/获取人物选项列表（管理侧）
 * @url GET /admin/lineups/character-options
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105491
 */
export const getAdminLineupsCharacterOptions = async (
  params: Expand<getAdminLineupsCharacterOptionsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsCharacterOptionsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/admin/lineups/character-options`, params, _config)
}

/**
 * 自定义函数：usegetAdminLineupsCharacterOptions
 * @description CompendiumLineups/获取人物选项列表（管理侧）
 * @url GET /admin/lineups/character-options
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105491
 */

export const useGetAdminLineupsCharacterOptions = (
  params: Expand<getAdminLineupsCharacterOptionsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/lineups/character-options`, params, fetchOptions],
    queryFn: () => getAdminLineupsCharacterOptions(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetAdminLineupsCharacterOptions = (
  params: Expand<getAdminLineupsCharacterOptionsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/lineups/character-options`, params, fetchOptions],
    queryFn: () => getAdminLineupsCharacterOptions(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/获取阵容详情（管理侧）
 * @url GET /admin/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105492
 */
export const getAdminLineupsLineupId = async (
  lineupId: string,
  params: Expand<getAdminLineupsLineupIdQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupsLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/admin/lineups/$${lineupId}`, params, _config)
}

/**
 * 自定义函数：usegetAdminLineupsLineupId
 * @description CompendiumLineups/获取阵容详情（管理侧）
 * @url GET /admin/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105492
 */

export const useGetAdminLineupsLineupId = (
  lineupId: string,
  params: Expand<getAdminLineupsLineupIdQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/lineups/${lineupId}`, params, fetchOptions],
    queryFn: () => getAdminLineupsLineupId(lineupId, params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetAdminLineupsLineupId = (
  lineupId: string,
  params: Expand<getAdminLineupsLineupIdQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/lineups/${lineupId}`, params, fetchOptions],
    queryFn: () => getAdminLineupsLineupId(lineupId, params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/编辑阵容（管理侧）
 * @url PATCH /admin/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064663
 */
export const patchAdminLineupsLineupId = async (
  lineupId: string,
  data: Expand<patchAdminLineupsLineupIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchAdminLineupsLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/admin/lineups/$${lineupId}`, data, _config)
}

/**
 * 自定义函数：usepatchAdminLineupsLineupId
 * @description CompendiumLineups/编辑阵容（管理侧）
 * @url PATCH /admin/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064663
 */

export const usePatchAdminLineupsLineupId = (_queryOptions?: object = {}) => {
  return useMutation({
    mutationFn: patchAdminLineupsLineupId,
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/删除阵容（管理侧）
 * @url DELETE /admin/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064664
 */
export const deleteAdminLineupsLineupId = async (
  lineupId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteAdminLineupsLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(`/admin/lineups/$${lineupId}`, {}, _config)
}

/**
 * 自定义函数：usedeleteAdminLineupsLineupId
 * @description CompendiumLineups/删除阵容（管理侧）
 * @url DELETE /admin/lineups/{lineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064664
 */

export const useDeleteAdminLineupsLineupId = (
  lineupId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/lineups/${lineupId}`, fetchOptions],
    queryFn: () => deleteAdminLineupsLineupId(lineupId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionDeleteAdminLineupsLineupId = (
  lineupId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/lineups/${lineupId}`, fetchOptions],
    queryFn: () => deleteAdminLineupsLineupId(lineupId, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/获取阵容映射关系详情（管理侧）
 * @url GET /admin/lineup-relations/{sourceLineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105493
 */
export const getAdminLineupRelationsSourceLineupId = async (
  sourceLineupId: string,
  params: Expand<getAdminLineupRelationsSourceLineupIdQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getAdminLineupRelationsSourceLineupIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/admin/lineup-relations/$${sourceLineupId}`, params, _config)
}

/**
 * 自定义函数：usegetAdminLineupRelationsSourceLineupId
 * @description CompendiumLineups/获取阵容映射关系详情（管理侧）
 * @url GET /admin/lineup-relations/{sourceLineupId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-476105493
 */

export const useGetAdminLineupRelationsSourceLineupId = (
  sourceLineupId: string,
  params: Expand<getAdminLineupRelationsSourceLineupIdQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [
      `/admin/lineup-relations/${sourceLineupId}`,
      params,
      fetchOptions,
    ],
    queryFn: () =>
      getAdminLineupRelationsSourceLineupId(
        sourceLineupId,
        params,
        fetchOptions,
      ),
    ..._queryOptions,
  })
}
export const useOptionGetAdminLineupRelationsSourceLineupId = (
  sourceLineupId: string,
  params: Expand<getAdminLineupRelationsSourceLineupIdQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [
      `/admin/lineup-relations/${sourceLineupId}`,
      params,
      fetchOptions,
    ],
    queryFn: () =>
      getAdminLineupRelationsSourceLineupId(
        sourceLineupId,
        params,
        fetchOptions,
      ),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/保存阵容映射关系（管理侧）
 * @url POST /admin/lineup-relations
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064665
 */
export const postAdminLineupRelations = async (
  data: Expand<postAdminLineupRelationsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminLineupRelationsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/lineup-relations`, data, _config)
}

/**
 * 自定义函数：usepostAdminLineupRelations
 * @description CompendiumLineups/保存阵容映射关系（管理侧）
 * @url POST /admin/lineup-relations
 * @host https://app.apifox.com/link/project/7048425/apis/api-476064665
 */

export const usePostAdminLineupRelations = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postAdminLineupRelations, ..._queryOptions })
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
  return http.get(`/admin/lineup-mappings`, params, _config)
}

/**
 * 自定义函数：usegetAdminLineupMappings
 * @description CompendiumLineups/阵容映射列表（管理侧）
 * @url GET /admin/lineup-mappings
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665650
 */

export const useGetAdminLineupMappings = (
  params: Expand<getAdminLineupMappingsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/lineup-mappings`, params, fetchOptions],
    queryFn: () => getAdminLineupMappings(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetAdminLineupMappings = (
  params: Expand<getAdminLineupMappingsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/lineup-mappings`, params, fetchOptions],
    queryFn: () => getAdminLineupMappings(params, fetchOptions),
    ..._queryOptions,
  })
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
  return http.post(`/admin/lineup-mappings`, data, _config)
}

/**
 * 自定义函数：usepostAdminLineupMappings
 * @description CompendiumLineups/创建阵容映射（管理侧）
 * @url POST /admin/lineup-mappings
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665651
 */

export const usePostAdminLineupMappings = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postAdminLineupMappings, ..._queryOptions })
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
  return http.get(`/admin/lineup-mappings/$${mappingId}`, {}, _config)
}

/**
 * 自定义函数：usegetAdminLineupMappingsMappingId
 * @description CompendiumLineups/阵容映射详情（管理侧）
 * @url GET /admin/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665652
 */

export const useGetAdminLineupMappingsMappingId = (
  mappingId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/lineup-mappings/${mappingId}`, fetchOptions],
    queryFn: () => getAdminLineupMappingsMappingId(mappingId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetAdminLineupMappingsMappingId = (
  mappingId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/lineup-mappings/${mappingId}`, fetchOptions],
    queryFn: () => getAdminLineupMappingsMappingId(mappingId, fetchOptions),
    ..._queryOptions,
  })
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
  return http.patch(`/admin/lineup-mappings/$${mappingId}`, data, _config)
}

/**
 * 自定义函数：usepatchAdminLineupMappingsMappingId
 * @description CompendiumLineups/编辑阵容映射（管理侧）
 * @url PATCH /admin/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665653
 */

export const usePatchAdminLineupMappingsMappingId = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: patchAdminLineupMappingsMappingId,
    ..._queryOptions,
  })
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
  return http.delete(`/admin/lineup-mappings/$${mappingId}`, {}, _config)
}

/**
 * 自定义函数：usedeleteAdminLineupMappingsMappingId
 * @description CompendiumLineups/删除阵容映射（软删除，管理侧）
 * @url DELETE /admin/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665654
 */

export const useDeleteAdminLineupMappingsMappingId = (
  mappingId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/admin/lineup-mappings/${mappingId}`, fetchOptions],
    queryFn: () => deleteAdminLineupMappingsMappingId(mappingId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionDeleteAdminLineupMappingsMappingId = (
  mappingId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/admin/lineup-mappings/${mappingId}`, fetchOptions],
    queryFn: () => deleteAdminLineupMappingsMappingId(mappingId, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/阵容映射列表（用户侧）
 * @url GET /compendiums/lineup-mappings
 * @host https://app.apifox.com/link/project/7048425/apis/api-480736381
 */
export const getCompendiumsLineupMappings = async (
  params: Expand<getCompendiumsLineupMappingsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsLineupMappingsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/lineup-mappings`, params, _config)
}

/**
 * 自定义函数：usegetCompendiumsLineupMappings
 * @description CompendiumLineups/阵容映射列表（用户侧）
 * @url GET /compendiums/lineup-mappings
 * @host https://app.apifox.com/link/project/7048425/apis/api-480736381
 */

export const useGetCompendiumsLineupMappings = (
  params: Expand<getCompendiumsLineupMappingsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/lineup-mappings`, params, fetchOptions],
    queryFn: () => getCompendiumsLineupMappings(params, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsLineupMappings = (
  params: Expand<getCompendiumsLineupMappingsQuery>,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/lineup-mappings`, params, fetchOptions],
    queryFn: () => getCompendiumsLineupMappings(params, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/创建阵容映射（用户侧）
 * @url POST /compendiums/lineup-mappings
 * @host https://app.apifox.com/link/project/7048425/apis/api-480736382
 */
export const postCompendiumsLineupMappings = async (
  data: Expand<postCompendiumsLineupMappingsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postCompendiumsLineupMappingsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/compendiums/lineup-mappings`, data, _config)
}

/**
 * 自定义函数：usepostCompendiumsLineupMappings
 * @description CompendiumLineups/创建阵容映射（用户侧）
 * @url POST /compendiums/lineup-mappings
 * @host https://app.apifox.com/link/project/7048425/apis/api-480736382
 */

export const usePostCompendiumsLineupMappings = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: postCompendiumsLineupMappings,
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/阵容映射详情（用户侧）
 * @url GET /compendiums/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665655
 */
export const getCompendiumsLineupMappingsMappingId = async (
  mappingId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsLineupMappingsMappingIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/compendiums/lineup-mappings/$${mappingId}`, {}, _config)
}

/**
 * 自定义函数：usegetCompendiumsLineupMappingsMappingId
 * @description CompendiumLineups/阵容映射详情（用户侧）
 * @url GET /compendiums/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665655
 */

export const useGetCompendiumsLineupMappingsMappingId = (
  mappingId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return useQuery({
    queryKey: [`/compendiums/lineup-mappings/${mappingId}`, fetchOptions],
    queryFn: () =>
      getCompendiumsLineupMappingsMappingId(mappingId, fetchOptions),
    ..._queryOptions,
  })
}
export const useOptionGetCompendiumsLineupMappingsMappingId = (
  mappingId: string,
  fetchOptions: Expand<RequestInit> = {},
  _queryOptions?: object = {},
) => {
  return queryOptions({
    queryKey: [`/compendiums/lineup-mappings/${mappingId}`, fetchOptions],
    queryFn: () =>
      getCompendiumsLineupMappingsMappingId(mappingId, fetchOptions),
    ..._queryOptions,
  })
}

/**
 * @description CompendiumLineups/编辑阵容映射（用户侧）
 * @url PATCH /compendiums/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480736383
 */
export const patchCompendiumsLineupMappingsMappingId = async (
  mappingId: string,
  data: Expand<patchCompendiumsLineupMappingsMappingIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchCompendiumsLineupMappingsMappingIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/compendiums/lineup-mappings/$${mappingId}`, data, _config)
}

/**
 * 自定义函数：usepatchCompendiumsLineupMappingsMappingId
 * @description CompendiumLineups/编辑阵容映射（用户侧）
 * @url PATCH /compendiums/lineup-mappings/{mappingId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480736383
 */

export const usePatchCompendiumsLineupMappingsMappingId = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: patchCompendiumsLineupMappingsMappingId,
    ..._queryOptions,
  })
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
    `/compendiums/lineup-mappings/${pathParams.mappingId}/containers/${pathParams.containerId}/lineups/${pathParams.lineupId}/reaction`,
    data,
    _config,
  )
}

/**
 * 自定义函数：usepostLineupsLineupIdReaction
 * @description CompendiumLineups/容器内阵容点赞/点踩（用户侧便捷路由）
 * @url POST /compendiums/lineup-mappings/{mappingId}/containers/{containerId}/lineups/{lineupId}/reaction
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665656
 */

export const usePostLineupsLineupIdReaction = (_queryOptions?: object = {}) => {
  return useMutation({
    mutationFn: postLineupsLineupIdReaction,
    ..._queryOptions,
  })
}
