/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽类错 系工生
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type { patchAdminCompendiumsCharactersBody, patchAdminCompendiumsCharactersRes } from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description CompendiumAdmin/更新图鉴人物
 * @url PATCH /admin/compendiums/characters
 */
export const patchAdminCompendiumsCharacters = async (
  data: Expand<patchAdminCompendiumsCharactersBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchAdminCompendiumsCharactersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch('/admin/compendiums/characters', data, _config)
}
