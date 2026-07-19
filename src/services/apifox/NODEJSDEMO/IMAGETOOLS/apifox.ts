/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
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
 * 自定义函数：usepostImageToolsStitch
 * @description ImageTools/云端长截图拼接
 * @url POST /image-tools/stitch
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256865
 */

export const usePostImageToolsStitch = (_queryOptions?: object = {}) => {
  return useMutation({ mutationFn: postImageToolsStitch, ..._queryOptions })
}
