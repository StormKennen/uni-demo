/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getPdfToolkitTasksQuery,
  getPdfToolkitTasksRes,
  getPdfToolkitTasksTaskIdRes,
  postPdfToolkitFilesBody,
  postPdfToolkitFilesRes,
  postPdfToolkitTasksBody,
  postPdfToolkitTasksRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description PdfToolkit/上传文件到 PDF 工具箱
 * @url POST /pdf-toolkit/files
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256866
 */
export const postPdfToolkitFiles = async (
  data: Expand<postPdfToolkitFilesBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postPdfToolkitFilesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/pdf-toolkit/files`, data, _config)
}

/**
 * @description PdfToolkit/创建 PDF 处理任务
 * @url POST /pdf-toolkit/tasks
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256867
 */
export const postPdfToolkitTasks = async (
  data: Expand<postPdfToolkitTasksBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postPdfToolkitTasksRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/pdf-toolkit/tasks`, data, _config)
}

/**
 * @description PdfToolkit/获取当前用户的任务列表
 * @url GET /pdf-toolkit/tasks
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256868
 */
export const getPdfToolkitTasks = async (
  params: Expand<getPdfToolkitTasksQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getPdfToolkitTasksRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/pdf-toolkit/tasks`, params, _config)
}

/**
 * @description PdfToolkit/查询任务状态与结果
 * @url GET /pdf-toolkit/tasks/{taskId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-489256869
 */
export const getPdfToolkitTasksTaskId = async (
  taskId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getPdfToolkitTasksTaskIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/pdf-toolkit/tasks/${taskId}`, {}, _config)
}
