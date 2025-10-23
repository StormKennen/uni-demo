/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable vue/no-irregular-whitespace */
/* eslint-disable sort-imports */
import http from '../../../../http'
import type { ParticalUniAppRequestOptions }   from '../../../../interface'
const baseURL = undefined
import type {
    GetSuperAppAiAgentInfoQuery,
    GetSuperAppAiAgentInfoRes,
    PostSuperAppAiAgentChatReq,
    PostSuperAppAiAgentChatRes,
    PostSuperAppAiAgentChatCancelReq,
    PostSuperAppAiAgentChatCancelRes,
    PostSuperAppAiAgentChatCreateMessageReq,
    PostSuperAppAiAgentChatCreateMessageRes,
    GetSuperAppAiAgentChatDetailsQuery,
    GetSuperAppAiAgentChatDetailsRes,
    GetSuperAppAiAgentConversationRes,
    GetSuperAppAiAgentEntranceRes,
} from './interface'
    
/** 获取智能体配置信息 */
export function GetSuperAppAiAgentInfo(params: GetSuperAppAiAgentInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppAiAgentInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/ai/agent/info`, params, _config) as Promise<GetSuperAppAiAgentInfoRes>
}

/** 智能体聊天 */
export function PostSuperAppAiAgentChat(params: PostSuperAppAiAgentChatReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppAiAgentChatRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/ai/agent/chat`, params, _config) as Promise<PostSuperAppAiAgentChatRes>
}

/** 取消进行中的对话 */
export function PostSuperAppAiAgentChatCancel(params: PostSuperAppAiAgentChatCancelReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppAiAgentChatCancelRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/ai/agent/chat-cancel`, params, _config) as Promise<PostSuperAppAiAgentChatCancelRes>
}

/** 智能体聊天创建消息 */
export function PostSuperAppAiAgentChatCreateMessage(params: PostSuperAppAiAgentChatCreateMessageReq, config?: ParticalUniAppRequestOptions): Promise<PostSuperAppAiAgentChatCreateMessageRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/super-app/ai/agent/chat-create-message`, params, _config) as Promise<PostSuperAppAiAgentChatCreateMessageRes>
}

/** 智能体聊天记录查询 */
export function GetSuperAppAiAgentChatDetails(params: GetSuperAppAiAgentChatDetailsQuery, config?: ParticalUniAppRequestOptions): Promise<GetSuperAppAiAgentChatDetailsRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/super-app/ai/agent/chat-details`, params, _config) as Promise<GetSuperAppAiAgentChatDetailsRes>
}

/** 智能体获取一个会话id */
export function GetSuperAppAiAgentConversation(config?: ParticalUniAppRequestOptions): Promise<GetSuperAppAiAgentConversationRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/super-app/ai/agent/conversation', _config) as Promise<GetSuperAppAiAgentConversationRes>
}

/** 智能体入口页的配置 */
export function GetSuperAppAiAgentEntrance(config?: ParticalUniAppRequestOptions): Promise<GetSuperAppAiAgentEntranceRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/super-app/ai/agent/entrance', _config) as Promise<GetSuperAppAiAgentEntranceRes>
}
