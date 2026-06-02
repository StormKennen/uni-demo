/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteVideoTaskTaskIdRes,
  getVideoDownloadQuery,
  getVideoDownloadRes,
  getVideoInfoQuery,
  getVideoInfoRes,
  getVideoPlatformsRes,
  getVideoQueueStatusRes,
  getVideoStatusRes,
  getVideoTaskTaskIdRes,
  postVideoBatchBody,
  postVideoBatchRes,
  postVideoExtractUrlBody,
  postVideoExtractUrlRes,
  postVideoProcessBody,
  postVideoProcessRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Video/获取支持的平台列表
 * @url GET /video/platforms
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075577
 */
export const getVideoPlatforms = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getVideoPlatformsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/video/platforms', {}, _config)
}

/**
 * @description Video/处理视频去水印
 * @url POST /video/process
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075578
 */
export const postVideoProcess = async (
  data: Expand<postVideoProcessBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postVideoProcessRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/video/process', data, _config)
}

/**
 * @description Video/批量处理视频去水印
 * @url POST /video/batch
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075579
 */
export const postVideoBatch = async (
  data: Expand<postVideoBatchBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postVideoBatchRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/video/batch', data, _config)
}

/**
 * @description Video/获取视频信息
 * @url GET /video/info
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075580
 */
export const getVideoInfo = async (
  params: Expand<getVideoInfoQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getVideoInfoRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/video/info', params, _config)
}

/**
 * @description Video/获取服务状态
 * @url GET /video/status
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075581
 */
export const getVideoStatus = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getVideoStatusRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/video/status', {}, _config)
}

/**
 * @description Video/获取队列状态
 * @url GET /video/queue/status
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075582
 */
export const getVideoQueueStatus = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getVideoQueueStatusRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/video/queue/status', {}, _config)
}

/**
 * @description Video/获取任务状态
 * @url GET /video/task/{taskId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075583
 */
export const getVideoTaskTaskId = async (
  taskId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getVideoTaskTaskIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/video/task/${taskId}', {}, _config)
}

/**
 * @description Video/取消任务
 * @url DELETE /video/task/{taskId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075584
 */
export const deleteVideoTaskTaskId = async (
  taskId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteVideoTaskTaskIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/video/task/${taskId}', {}, _config)
}

/**
 * @description Video/提取视频URL
 * @url POST /video/extract-url
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075585
 */
export const postVideoExtractUrl = async (
  data: Expand<postVideoExtractUrlBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postVideoExtractUrlRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/video/extract-url', data, _config)
}

/**
 * @description Video/代理下载无水印视频
 * @url GET /video/download
 * @host https://app.apifox.com/link/project/7048425/apis/api-466130706
 */
export const getVideoDownload = async (
  params: Expand<getVideoDownloadQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getVideoDownloadRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/video/download', params, _config)
}
