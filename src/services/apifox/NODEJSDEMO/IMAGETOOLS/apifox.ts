/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  postImageToolsComplianceBody,
  postImageToolsComplianceRes,
  postImageToolsStitchBody,
  postImageToolsStitchRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description ImageTools/云端长截图拼接
 * @url POST /image-tools/stitch
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256865
 */
export const postImageToolsStitch = async (
  data: Expand<postImageToolsStitchBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postImageToolsStitchRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/image-tools/stitch`, data, _config)
}

/**
 * @description ImageTools/图片上传合规处理
 * @url POST /image-tools/compliance
 * @host https://app.apifox.com/link/project/7048425/apis/api-504615541
 */
export const postImageToolsCompliance = async (
  data: Expand<postImageToolsComplianceBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postImageToolsComplianceRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/image-tools/compliance`, data, _config)
}
