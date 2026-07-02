/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  patchAdminCompendiumsBody,
  patchAdminCompendiumsCharactersBody,
  patchAdminCompendiumsCharactersRes,
  patchAdminCompendiumsRes,
  postAdminCompendiumsBody,
  postAdminCompendiumsCharactersBody,
  postAdminCompendiumsCharactersRes,
  postAdminCompendiumsImportExcelBody,
  postAdminCompendiumsImportExcelRes,
  postAdminCompendiumsImportJsonBody,
  postAdminCompendiumsImportJsonFileBody,
  postAdminCompendiumsImportJsonFileRes,
  postAdminCompendiumsImportJsonRes,
  postAdminCompendiumsRebuildRankingsBody,
  postAdminCompendiumsRebuildRankingsRes,
  postAdminCompendiumsRes,
  postCompendiumsCharactersBatchBody,
  postCompendiumsCharactersBatchRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description CompendiumAdmin/创建图鉴
 * @url POST /admin/compendiums
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751685
 */
export const postAdminCompendiums = async (
  data: Expand<postAdminCompendiumsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminCompendiumsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/compendiums`, data, _config)
}

/**
 * 自定义函数：usepostAdminCompendiums
 * @description CompendiumAdmin/创建图鉴
 * @url POST /admin/compendiums
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751685
 */

export const usePostAdminCompendiums = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postAdminCompendiums, ..._queryOptions })
}

/**
 * @description CompendiumAdmin/更新图鉴
 * @url PATCH /admin/compendiums
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751686
 */
export const patchAdminCompendiums = async (
  data: Expand<patchAdminCompendiumsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchAdminCompendiumsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/admin/compendiums`, data, _config)
}

/**
 * 自定义函数：usepatchAdminCompendiums
 * @description CompendiumAdmin/更新图鉴
 * @url PATCH /admin/compendiums
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751686
 */

export const usePatchAdminCompendiums = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: patchAdminCompendiums, ..._queryOptions })
}

/**
 * @description CompendiumAdmin/单条新增人物
 * @url POST /admin/compendiums/characters
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751687
 */
export const postAdminCompendiumsCharacters = async (
  data: Expand<postAdminCompendiumsCharactersBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminCompendiumsCharactersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/compendiums/characters`, data, _config)
}

/**
 * 自定义函数：usepostAdminCompendiumsCharacters
 * @description CompendiumAdmin/单条新增人物
 * @url POST /admin/compendiums/characters
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751687
 */

export const usePostAdminCompendiumsCharacters = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: postAdminCompendiumsCharacters,
    ..._queryOptions,
  })
}

/**
 * @description CompendiumAdmin/更新人物
 * @url PATCH /admin/compendiums/characters
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751688
 */
export const patchAdminCompendiumsCharacters = async (
  data: Expand<patchAdminCompendiumsCharactersBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchAdminCompendiumsCharactersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/admin/compendiums/characters`, data, _config)
}

/**
 * 自定义函数：usepatchAdminCompendiumsCharacters
 * @description CompendiumAdmin/更新人物
 * @url PATCH /admin/compendiums/characters
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751688
 */

export const usePatchAdminCompendiumsCharacters = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: patchAdminCompendiumsCharacters,
    ..._queryOptions,
  })
}

/**
 * @description CompendiumAdmin/批量新增人物
 * @url POST /admin/compendiums/characters/batch
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751689
 */
export const postCompendiumsCharactersBatch = async (
  data: Expand<postCompendiumsCharactersBatchBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postCompendiumsCharactersBatchRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/compendiums/characters/batch`, data, _config)
}

/**
 * 自定义函数：usepostCompendiumsCharactersBatch
 * @description CompendiumAdmin/批量新增人物
 * @url POST /admin/compendiums/characters/batch
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751689
 */

export const usePostCompendiumsCharactersBatch = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: postCompendiumsCharactersBatch,
    ..._queryOptions,
  })
}

/**
 * @description CompendiumAdmin/使用 JSON 请求体导入图鉴
 * @url POST /admin/compendiums/import-json
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751690
 */
export const postAdminCompendiumsImportJson = async (
  data: Expand<postAdminCompendiumsImportJsonBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminCompendiumsImportJsonRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/compendiums/import-json`, data, _config)
}

/**
 * 自定义函数：usepostAdminCompendiumsImportJson
 * @description CompendiumAdmin/使用 JSON 请求体导入图鉴
 * @url POST /admin/compendiums/import-json
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751690
 */

export const usePostAdminCompendiumsImportJson = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: postAdminCompendiumsImportJson,
    ..._queryOptions,
  })
}

/**
 * @description CompendiumAdmin/上传 JSON 文件导入图鉴
 * @url POST /admin/compendiums/import-json-file
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751691
 */
export const postAdminCompendiumsImportJsonFile = async (
  data: Expand<postAdminCompendiumsImportJsonFileBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminCompendiumsImportJsonFileRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/compendiums/import-json-file`, data, _config)
}

/**
 * 自定义函数：usepostAdminCompendiumsImportJsonFile
 * @description CompendiumAdmin/上传 JSON 文件导入图鉴
 * @url POST /admin/compendiums/import-json-file
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751691
 */

export const usePostAdminCompendiumsImportJsonFile = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: postAdminCompendiumsImportJsonFile,
    ..._queryOptions,
  })
}

/**
 * @description CompendiumAdmin/上传 Excel 文件导入图鉴
 * @url POST /admin/compendiums/import-excel
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751692
 */
export const postAdminCompendiumsImportExcel = async (
  data: Expand<postAdminCompendiumsImportExcelBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminCompendiumsImportExcelRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/compendiums/import-excel`, data, _config)
}

/**
 * 自定义函数：usepostAdminCompendiumsImportExcel
 * @description CompendiumAdmin/上传 Excel 文件导入图鉴
 * @url POST /admin/compendiums/import-excel
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751692
 */

export const usePostAdminCompendiumsImportExcel = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: postAdminCompendiumsImportExcel,
    ..._queryOptions,
  })
}

/**
 * @description CompendiumAdmin/重建排行
 * @url POST /admin/compendiums/rebuild-rankings
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751693
 */
export const postAdminCompendiumsRebuildRankings = async (
  data: Expand<postAdminCompendiumsRebuildRankingsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminCompendiumsRebuildRankingsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/compendiums/rebuild-rankings`, data, _config)
}

/**
 * 自定义函数：usepostAdminCompendiumsRebuildRankings
 * @description CompendiumAdmin/重建排行
 * @url POST /admin/compendiums/rebuild-rankings
 * @host https://app.apifox.com/link/project/7048425/apis/api-470751693
 */

export const usePostAdminCompendiumsRebuildRankings = (
  _queryOptions?: object = {},
) => {
  return useMutation({
    mutationFn: postAdminCompendiumsRebuildRankings,
    ..._queryOptions,
  })
}
