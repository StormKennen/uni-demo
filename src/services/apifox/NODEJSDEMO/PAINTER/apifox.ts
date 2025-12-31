/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deletePainterCacheAllRes,
  deletePainterIdRes,
  getPainterIdRes,
  getPainterStatusRes,
  postPainterBatchBody,
  postPainterBatchRes,
  postPainterGenerateBody,
  postPainterGenerateInfoBody,
  postPainterGenerateInfoRes,
  postPainterGenerateRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Painter/生成海报
 * @url POST /painter/generate
 * @host https://app.apifox.com/link/project/7048425/apis/api-399071843
 */
export const postPainterGenerate = async (
  data: Expand<postPainterGenerateBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postPainterGenerateRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/painter/generate', data, _config)
}

/**
 * @description Painter/生成海报（返回信息）
 * @url POST /painter/generate/info
 * @host https://app.apifox.com/link/project/7048425/apis/api-399071844
 */
export const postPainterGenerateInfo = async (
  data: Expand<postPainterGenerateInfoBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postPainterGenerateInfoRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/painter/generate/info', data, _config)
}

/**
 * @description Painter/批量生成海报
 * @url POST /painter/batch
 * @host https://app.apifox.com/link/project/7048425/apis/api-399071845
 */
export const postPainterBatch = async (
  data: Expand<postPainterBatchBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postPainterBatchRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/painter/batch', data, _config)
}

/**
 * @description Painter/获取服务状态
 * @url GET /painter/status
 * @host https://app.apifox.com/link/project/7048425/apis/api-399071846
 */
export const getPainterStatus = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getPainterStatusRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/painter/status', {}, _config)
}

/**
 * @description Painter/清空所有缓存
 * @url DELETE /painter/cache/all
 * @host https://app.apifox.com/link/project/7048425/apis/api-399071847
 */
export const deletePainterCacheAll = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deletePainterCacheAllRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/painter/cache/all', {}, _config)
}

/**
 * @description Painter/获取缓存的海报
 * @url GET /painter/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-399071848
 */
export const getPainterId = async (
  id: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getPainterIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/painter/${id}`, {}, _config)
}

/**
 * @description Painter/删除缓存的海报
 * @url DELETE /painter/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-399071849
 */
export const deletePainterId = async (
  id: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deletePainterIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(`/painter/${id}`, {}, _config)
}
