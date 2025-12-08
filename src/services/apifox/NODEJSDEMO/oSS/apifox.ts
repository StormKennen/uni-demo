/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type { getOssGetSignatureRes, postRes } from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description /获取oss签名
 * @url GET /oss/getSignature
 * @host https://app.apifox.com/link/project/7048425/apis/api-351698861
 */
export const getOssGetSignature = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getOssGetSignatureRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/oss/getSignature', {}, _config)
}

/**
 * @description /上传文件
 * @url POST https://lzk-web.oss-cn-beijing.aliyuncs.com
 * @host https://app.apifox.com/link/project/7048425/apis/api-345259787
 */
export const post = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('https://lzk-web.oss-cn-beijing.aliyuncs.com', {}, _config)
}
