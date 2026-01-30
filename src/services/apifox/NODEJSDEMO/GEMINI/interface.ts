/**
 * @description Gemini/创建新会话--接口请求Body参数
 * @url POST /gemini/session
 */
export interface postGeminiSessionBody {
  title?: string
}

/**
 * @description Gemini/创建新会话--接口返回值
 * @url POST /gemini/session
 */
export interface postGeminiSessionRes {}

/**
 * @description Gemini/获取会话列表--接口请求Query参数
 * @url GET /gemini/sessions
 */
export interface getGeminiSessionsQuery {
  /** 页码 */
  page?: number
  /** 每页数量 */
  limit?: number
}

/**
 * @description Gemini/获取会话列表--接口返回值
 * @url GET /gemini/sessions
 */
export interface getGeminiSessionsRes {}

/**
 * @description Gemini/获取会话详情--接口返回值
 * @url GET /gemini/session/{id}
 */
export interface getGeminiSessionIdRes {}

/**
 * @description Gemini/多轮对话（支持会话持久化）--接口请求Body参数
 * @url POST /gemini/chat
 */
export interface postGeminiChatBody {
  chatId?: string
  history?: postGeminiChatBodyHistoryItem[]
  prompt: string
}

/** 历史对话数组 */
export interface postGeminiChatBodyHistoryItem {
  content?: string
  role?: 'user' | 'model'
}

/**
 * @description Gemini/多轮对话（支持会话持久化）--接口返回值
 * @url POST /gemini/chat
 */
export interface postGeminiChatRes {}

/**
 * @description Gemini/更新会话标题--接口请求Body参数
 * @url PATCH /gemini/session/{id}
 */
export interface patchGeminiSessionIdBody {
  title: string
}

/**
 * @description Gemini/更新会话标题--接口返回值
 * @url PATCH /gemini/session/{id}
 */
export interface patchGeminiSessionIdRes {}

/**
 * @description Gemini/单轮生成--接口请求Body参数
 * @url POST /gemini/generate
 */
export interface postGeminiGenerateBody {
  prompt: string
}

/**
 * @description Gemini/单轮生成--接口返回值
 * @url POST /gemini/generate
 */
export interface postGeminiGenerateRes {}

/**
 * @description Gemini/删除会话--接口返回值
 * @url DELETE /gemini/session/{id}
 */
export interface deleteGeminiSessionIdRes {}

/**
 * @description Gemini/获取会话历史消息--接口返回值
 * @url GET /gemini/history/{chatId}
 */
export interface getGeminiHistoryChatIdRes {}

/**
 * @description Gemini/获取审核模式状态--接口返回值
 * @url GET /gemini/audit-status
 */
export interface getGeminiAuditStatusRes {
  isAuditMode?: boolean
}
