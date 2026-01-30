/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteGeminiSessionIdRes,
  getGeminiAuditStatusRes,
  getGeminiHistoryChatIdRes,
  getGeminiSessionIdRes,
  getGeminiSessionsQuery,
  getGeminiSessionsRes,
  patchGeminiSessionIdBody,
  patchGeminiSessionIdRes,
  postGeminiChatBody,
  postGeminiChatRes,
  postGeminiGenerateBody,
  postGeminiGenerateRes,
  postGeminiSessionBody,
  postGeminiSessionRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Gemini/创建新会话
 * @url POST /gemini/session
 * @host https://app.apifox.com/link/project/7048425/apis/api-406220508
 */
export const postGeminiSession = async (
  data: Expand<postGeminiSessionBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postGeminiSessionRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/gemini/session', data, _config)
}

/**
 * @description Gemini/获取会话列表
 * @url GET /gemini/sessions
 * @host https://app.apifox.com/link/project/7048425/apis/api-406220509
 */
export const getGeminiSessions = async (
  params: Expand<getGeminiSessionsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGeminiSessionsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/gemini/sessions', params, _config)
}

/**
 * @description Gemini/获取会话详情
 * @url GET /gemini/session/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-406220510
 */
export const getGeminiSessionId = async (
  id: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGeminiSessionIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/gemini/session/${id}`, {}, _config)
}

/**
 * @description Gemini/多轮对话（支持会话持久化）
 * @url POST /gemini/chat
 * @host https://app.apifox.com/link/project/7048425/apis/api-405889633
 */
export const postGeminiChat = async (
  data: Expand<postGeminiChatBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postGeminiChatRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/gemini/chat', data, _config)
}

/**
 * @description Gemini/更新会话标题
 * @url PATCH /gemini/session/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-406220511
 */
export const patchGeminiSessionId = async (
  id: string,
  data: Expand<patchGeminiSessionIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchGeminiSessionIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/gemini/session/${id}`, data, _config)
}

/**
 * @description Gemini/单轮生成
 * @url POST /gemini/generate
 * @host https://app.apifox.com/link/project/7048425/apis/api-405889634
 */
export const postGeminiGenerate = async (
  data: Expand<postGeminiGenerateBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postGeminiGenerateRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/gemini/generate', data, _config)
}

/**
 * @description Gemini/删除会话
 * @url DELETE /gemini/session/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-406220512
 */
export const deleteGeminiSessionId = async (
  id: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteGeminiSessionIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(`/gemini/session/${id}`, {}, _config)
}

/**
 * @description Gemini/获取会话历史消息
 * @url GET /gemini/history/{chatId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-406220513
 */
export const getGeminiHistoryChatId = async (
  chatId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGeminiHistoryChatIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/gemini/history/${chatId}', {}, _config)
}

/**
 * @description Gemini/获取审核模式状态
 * @url GET /gemini/audit-status
 * @host https://app.apifox.com/link/project/7048425/apis/api-406772501
 */
export const getGeminiAuditStatus = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getGeminiAuditStatusRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/gemini/audit-status', {}, _config)
}
