/* eslint-disable prettier/prettier */
export interface GetBizChatGetInitInfoRes {
    /** 智能体id  */
    bot_id?: string
    /** Access Token 此字段命名是跟随教育系统的智能体信息字段，前端希望两边保持统一  */
    Authorization?: string
    /** Access Token 的过期时间，Unixtime 时间戳格式，精度为秒  */
    expires_in?: string
    /** 会话id 此字段命名是跟随教育系统的智能体信息字段，前端希望两边保持统一  */
    conversationId?: string
}
export interface PostBizChatSetConversationIdReq {
    /** 会话id 此字段命名是跟随教育系统的智能体信息字段，前端希望两边保持统一  */
    conversationId?: string
}

export type PostBizChatSetConversationIdRes = any
