/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  postAdminPlaceCoordinatesImportBody,
  postAdminPlaceCoordinatesImportRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description PlaceCoordinates/导入全国地点坐标 JSON
 * @url POST /admin/place-coordinates/import
 * @host https://app.apifox.com/link/project/7048425/apis/api-521446067
 */
export const postAdminPlaceCoordinatesImport = async (
  data: Expand<postAdminPlaceCoordinatesImportBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAdminPlaceCoordinatesImportRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/admin/place-coordinates/import`, data, _config)
}
