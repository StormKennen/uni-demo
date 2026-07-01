/**
 * @description Interactions/通用点赞/点踩（态度切换）--接口请求Body参数
 * @url POST /interactions/reaction
 */
export type postInteractionsReactionBody = string

/**
 * @description Interactions/通用点赞/点踩（态度切换）--接口返回值
 * @url POST /interactions/reaction
 */
export type postInteractionsReactionRes = string

/**
 * @description Interactions/通用收藏（布尔切换）--接口请求Body参数
 * @url POST /interactions/favorite
 */
export type postInteractionsFavoriteBody = string

/**
 * @description Interactions/通用收藏（布尔切换）--接口返回值
 * @url POST /interactions/favorite
 */
export type postInteractionsFavoriteRes = string

/**
 * @description Interactions/评论列表（顶级分页 + 内嵌回复）--接口请求Query参数
 * @url GET /interactions/comments
 */
export interface getInteractionsCommentsQuery {
  targetType: string
  /** 该 targetType 的 refs，JSON 字符串。例如 `{"articleId":"a1"}`。 */
  refs: string

  page?: number

  limit?: number
}

/**
 * @description Interactions/评论列表（顶级分页 + 内嵌回复）--接口返回值
 * @url GET /interactions/comments
 */
export type getInteractionsCommentsRes = string

/**
 * @description Interactions/发表评论 / 回复--接口请求Body参数
 * @url POST /interactions/comments
 */
export type postInteractionsCommentsBody = string

/**
 * @description Interactions/发表评论 / 回复--接口返回值
 * @url POST /interactions/comments
 */
export type postInteractionsCommentsRes = string

/**
 * @description Interactions/删除评论（软删除）--接口返回值
 * @url DELETE /interactions/comments/{commentId}
 */
export type deleteInteractionsCommentsCommentIdRes = string

/**
 * @description Interactions/互动汇总（计数 + 我的态度 + 是否收藏）--接口请求Query参数
 * @url GET /interactions/summary
 */
export interface getInteractionsSummaryQuery {
  targetType: string
  /** 该 targetType 的 refs，JSON 字符串。 */
  refs: string
}

/**
 * @description Interactions/互动汇总（计数 + 我的态度 + 是否收藏）--接口返回值
 * @url GET /interactions/summary
 */
export type getInteractionsSummaryRes = string

/**
 * @description Interactions/评论审核（管理侧）--接口请求Body参数
 * @url PATCH /admin/interactions/comments/{commentId}/moderate
 */
export interface patchCommentsCommentIdModerateBody {
  status: 'published' | 'pending' | 'deleted'
}

/**
 * @description Interactions/评论审核（管理侧）--接口返回值
 * @url PATCH /admin/interactions/comments/{commentId}/moderate
 */
export type patchCommentsCommentIdModerateRes = string
