/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteInteractionsCommentsCommentIdRes,
  getInteractionsCommentsQuery,
  getInteractionsCommentsRes,
  getInteractionsSummaryQuery,
  getInteractionsSummaryRes,
  patchCommentsCommentIdModerateBody,
  patchCommentsCommentIdModerateRes,
  postInteractionsCommentsBody,
  postInteractionsCommentsRes,
  postInteractionsFavoriteBody,
  postInteractionsFavoriteRes,
  postInteractionsReactionBody,
  postInteractionsReactionRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Interactions/通用点赞/点踩（态度切换）
 * @url POST /interactions/reaction
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665657
 */
export const postInteractionsReaction = async (
  data: Expand<postInteractionsReactionBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postInteractionsReactionRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/interactions/reaction', data, _config)
}

/**
 * @description Interactions/通用收藏（布尔切换）
 * @url POST /interactions/favorite
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665658
 */
export const postInteractionsFavorite = async (
  data: Expand<postInteractionsFavoriteBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postInteractionsFavoriteRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/interactions/favorite', data, _config)
}

/**
 * @description Interactions/评论列表（顶级分页 + 内嵌回复）
 * @url GET /interactions/comments
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665659
 */
export const getInteractionsComments = async (
  params: Expand<getInteractionsCommentsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getInteractionsCommentsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/interactions/comments', params, _config)
}

/**
 * @description Interactions/发表评论 / 回复
 * @url POST /interactions/comments
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665660
 */
export const postInteractionsComments = async (
  data: Expand<postInteractionsCommentsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postInteractionsCommentsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/interactions/comments', data, _config)
}

/**
 * @description Interactions/删除评论（软删除）
 * @url DELETE /interactions/comments/{commentId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665661
 */
export const deleteInteractionsCommentsCommentId = async (
  commentId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteInteractionsCommentsCommentIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/interactions/comments/${commentId}', {}, _config)
}

/**
 * @description Interactions/互动汇总（计数 + 我的态度 + 是否收藏）
 * @url GET /interactions/summary
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665662
 */
export const getInteractionsSummary = async (
  params: Expand<getInteractionsSummaryQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getInteractionsSummaryRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/interactions/summary', params, _config)
}

/**
 * @description Interactions/评论审核（管理侧）
 * @url PATCH /admin/interactions/comments/{commentId}/moderate
 * @host https://app.apifox.com/link/project/7048425/apis/api-480665663
 */
export const patchCommentsCommentIdModerate = async (
  commentId: string,
  data: Expand<patchCommentsCommentIdModerateBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchCommentsCommentIdModerateRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(
    '/admin/interactions/comments/${commentId}/moderate',
    data,
    _config,
  )
}
