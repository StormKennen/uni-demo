/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getVotesVoteIdParticipantsQuery,
  getVotesVoteIdParticipantsRes,
  getVotesVoteIdRes,
  patchVotesVoteIdBallotBody,
  patchVotesVoteIdBallotRes,
  patchVotesVoteIdBody,
  patchVotesVoteIdRes,
  postVotesBody,
  postVotesRes,
  postVotesVoteIdBallotsBody,
  postVotesVoteIdBallotsRes,
  postVotesVoteIdCloseRes,
  postVotesVoteIdRevealRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Votes/创建投票
 * @url POST /votes
 * @host https://app.apifox.com/link/project/7048425/apis/api-515185144
 */
export const postVotes = async (
  data: Expand<postVotesBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postVotesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/votes`, data, _config)
}

/**
 * @description Votes/分页获取投票参与者
 * @url GET /votes/{voteId}/participants
 * @host https://app.apifox.com/link/project/7048425/apis/api-515185145
 */
export const getVotesVoteIdParticipants = async (
  voteId: string,
  params: Expand<getVotesVoteIdParticipantsQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getVotesVoteIdParticipantsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/votes/${voteId}/participants`, params, _config)
}

/**
 * @description Votes/关闭投票
 * @url POST /votes/{voteId}/close
 * @host https://app.apifox.com/link/project/7048425/apis/api-515185146
 */
export const postVotesVoteIdClose = async (
  voteId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postVotesVoteIdCloseRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/votes/${voteId}/close`, {}, _config)
}

/**
 * @description Votes/手动公布投票结果
 * @url POST /votes/{voteId}/reveal
 * @host https://app.apifox.com/link/project/7048425/apis/api-515185147
 */
export const postVotesVoteIdReveal = async (
  voteId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postVotesVoteIdRevealRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/votes/${voteId}/reveal`, {}, _config)
}

/**
 * @description Votes/提交投票
 * @url POST /votes/{voteId}/ballots
 * @host https://app.apifox.com/link/project/7048425/apis/api-515185148
 */
export const postVotesVoteIdBallots = async (
  voteId: string,
  data: Expand<postVotesVoteIdBallotsBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postVotesVoteIdBallotsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/votes/${voteId}/ballots`, data, _config)
}

/**
 * @description Votes/修改自己的投票
 * @url PATCH /votes/{voteId}/ballot
 * @host https://app.apifox.com/link/project/7048425/apis/api-515185149
 */
export const patchVotesVoteIdBallot = async (
  voteId: string,
  data: Expand<patchVotesVoteIdBallotBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchVotesVoteIdBallotRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/votes/${voteId}/ballot`, data, _config)
}

/**
 * @description Votes/获取投票详情、权限、我的投票和可见结果
 * @url GET /votes/{voteId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-515185150
 */
export const getVotesVoteId = async (
  voteId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getVotesVoteIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/votes/${voteId}`, {}, _config)
}

/**
 * @description Votes/更新投票
 * @url PATCH /votes/{voteId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-515185151
 */
export const patchVotesVoteId = async (
  voteId: string,
  data: Expand<patchVotesVoteIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchVotesVoteIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/votes/${voteId}`, data, _config)
}
