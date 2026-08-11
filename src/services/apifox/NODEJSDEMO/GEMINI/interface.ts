/**
 * @description Gemini/创建新会话--接口请求Body参数
 * @url POST /gemini/session
 */
export interface postGeminiSessionBody {
  /** 会话标题（可选） */
  title?: string
}

/**
 * @description Gemini/创建新会话--接口返回值
 * @url POST /gemini/session
 */
export type postGeminiSessionRes = object

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
export type getGeminiSessionsRes = object

/**
 * @description Gemini/获取会话详情--接口返回值
 * @url GET /gemini/session/{id}
 */
export type getGeminiSessionIdRes = object

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
export type patchGeminiSessionIdRes = object

/**
 * @description Gemini/删除会话--接口返回值
 * @url DELETE /gemini/session/{id}
 */
export type deleteGeminiSessionIdRes = object

/**
 * @description Gemini/分享会话给指定用户--接口请求Body参数
 * @url POST /gemini/session/{id}/share
 */
export interface postSessionIdShareBody {
  /** 目标用户ID */
  targetUserId: string
}

/**
 * @description Gemini/分享会话给指定用户--接口返回值
 * @url POST /gemini/session/{id}/share
 */
export type postSessionIdShareRes = object

/**
 * @description Gemini/取消分享会话--接口请求Body参数
 * @url DELETE /gemini/session/{id}/share
 */
export interface deleteSessionIdShareBody {
  /** 目标用户ID */
  targetUserId: string
}

/**
 * @description Gemini/取消分享会话--接口返回值
 * @url DELETE /gemini/session/{id}/share
 */
export type deleteSessionIdShareRes = object

/**
 * @description Gemini/获取审核模式状态--接口返回值
 * @url GET /gemini/audit-status
 */
export interface getGeminiAuditStatusRes {
  /** 是否处于审核模式 */
  isAuditMode?: boolean
}

/**
 * @description Gemini/切换审核模式状态--接口请求Body参数
 * @url POST /gemini/audit-status
 */
export interface postGeminiAuditStatusBody {
  /** 新的审核模式状态 */
  status: boolean
}

/**
 * @description Gemini/切换审核模式状态--接口返回值
 * @url POST /gemini/audit-status
 */
export type postGeminiAuditStatusRes = object

/**
 * @description Gemini/获取会话历史消息--接口返回值
 * @url GET /gemini/history/{chatId}
 */
export type getGeminiHistoryChatIdRes = object

/**
 * @description Gemini/多轮对话（支持会话持久化）--接口请求Body参数
 * @url POST /gemini/chat
 */
export interface postGeminiChatBody {
  /** 会话ID（可选，不传则自动创建新会话） */
  chatId?: string
  /** 历史对话数组 */
  history?: postGeminiChatBodyHistoryItem[]
  /** 当前用户输入 */
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
export type postGeminiChatRes = object

/**
 * @description Gemini/单轮生成--接口请求Body参数
 * @url POST /gemini/generate
 */
export interface postGeminiGenerateBody {
  /** 用户输入 */
  prompt: string
}

/**
 * @description Gemini/单轮生成--接口返回值
 * @url POST /gemini/generate
 */
export type postGeminiGenerateRes = object
