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
    GetBizChatGetInitInfoRes,
    PostBizChatSetConversationIdReq,
    PostBizChatSetConversationIdRes,
} from './interface'
    
/** 会话-获取初始化信息 */
export function GetBizChatGetInitInfo(config?: ParticalUniAppRequestOptions): Promise<GetBizChatGetInitInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/chat/get-init-info', _config) as Promise<GetBizChatGetInitInfoRes>
}

/** 会话-设置会话id */
export function PostBizChatSetConversationId(params: PostBizChatSetConversationIdReq, config?: ParticalUniAppRequestOptions): Promise<PostBizChatSetConversationIdRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/chat/set-conversation-id`, params, _config) as Promise<PostBizChatSetConversationIdRes>
}
