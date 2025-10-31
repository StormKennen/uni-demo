/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteFamiliesEventsEventIdRes,
  deleteFamiliesMembersMemberIdRes,
  deleteFamiliesShareShareIdRes,
  getFamiliesEventsEventIdRes,
  getFamiliesEventsRes,
  getFamiliesMembersMemberIdRes,
  getFamiliesMembersQuery,
  getFamiliesMembersRes,
  getFamiliesTimelineRes,
  getFamiliesTreesQuery,
  getFamiliesTreesRes,
  getMembersMemberIdSharesRes,
  getTreesMemberMemberIdQuery,
  getTreesMemberMemberIdRes,
  patchFamiliesMembersMemberIdBody,
  patchFamiliesMembersMemberIdRes,
  postFamiliesMembersBody,
  postFamiliesMembersRes,
  postFamiliesRelationshipsLinkRes,
  postFamiliesShareShareIdRes,
  postMembersMemberIdEventsRes,
  postMembersMemberIdShareRes,
  postShareShareIdDataRes,
  putFamiliesEventsEventIdRes,
  putFamiliesShareShareIdRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Families/获取家族成员列表
 * @url GET /families/members
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075554
 */
export const getFamiliesMembers = async (
  params: Expand<getFamiliesMembersQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getFamiliesMembersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/families/members', params, _config)
}

/**
 * @description Families/按姓氏获取家族树
 * @url GET /families/trees
 * @host https://app.apifox.com/link/project/7048425/apis/api-363079900
 */
export const getFamiliesTrees = async (
  params: Expand<getFamiliesTreesQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getFamiliesTreesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/families/trees', params, _config)
}

/**
 * @description Families/创建家族成员（需登录）
 * @url POST /families/members
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075555
 */
export const postFamiliesMembers = async (
  data: Expand<postFamiliesMembersBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postFamiliesMembersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/families/members', data, _config)
}

/**
 * @description Families/获取成员详情
 * @url GET /families/members/{memberId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075556
 */
export const getFamiliesMembersMemberId = async (
  memberId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getFamiliesMembersMemberIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/families/members/${memberId}', {}, _config)
}

/**
 * @description Families/更新成员信息（需登录）
 * @url PATCH /families/members/{memberId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075557
 */
export const patchFamiliesMembersMemberId = async (
  memberId: string,
  data: Expand<patchFamiliesMembersMemberIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchFamiliesMembersMemberIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch('/families/members/${memberId}', data, _config)
}

/**
 * @description Families/删除成员（需登录）
 * @url DELETE /families/members/{memberId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075558
 */
export const deleteFamiliesMembersMemberId = async (
  memberId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteFamiliesMembersMemberIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/families/members/${memberId}', {}, _config)
}

/**
 * @description Families/按成员ID获取家族树
 * @url GET /families/trees/member/{memberId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075559
 */
export const getTreesMemberMemberId = async (
  memberId: string,
  params: Expand<getTreesMemberMemberIdQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getTreesMemberMemberIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/families/trees/member/${memberId}', params, _config)
}

/**
 * @description Families/创建家族分享链接
 * @url POST /families/members/{memberId}/share
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075561
 */
export const postMembersMemberIdShare = async (
  memberId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMembersMemberIdShareRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/families/members/${memberId}/share', {}, _config)
}

/**
 * @description Families/获取分享信息
 * @url POST /families/share/{shareId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075562
 */
export const postFamiliesShareShareId = async (
  shareId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postFamiliesShareShareIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/families/share/${shareId}', {}, _config)
}

/**
 * @description Families/更新分享设置
 * @url PUT /families/share/{shareId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075563
 */
export const putFamiliesShareShareId = async (
  shareId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<putFamiliesShareShareIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.put('/families/share/${shareId}', {}, _config)
}

/**
 * @description Families/删除分享
 * @url DELETE /families/share/{shareId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075564
 */
export const deleteFamiliesShareShareId = async (
  shareId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteFamiliesShareShareIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/families/share/${shareId}', {}, _config)
}

/**
 * @description Families/获取分享的家族数据
 * @url POST /families/share/{shareId}/data
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075565
 */
export const postShareShareIdData = async (
  shareId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postShareShareIdDataRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/families/share/${shareId}/data', {}, _config)
}

/**
 * @description Families/获取成员的分享列表
 * @url GET /families/members/{memberId}/shares
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075566
 */
export const getMembersMemberIdShares = async (
  memberId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMembersMemberIdSharesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/families/members/${memberId}/shares', {}, _config)
}

/**
 * @description Families/为成员创建事件
 * @url POST /families/members/{memberId}/events
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075567
 */
export const postMembersMemberIdEvents = async (
  memberId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMembersMemberIdEventsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/families/members/${memberId}/events', {}, _config)
}

/**
 * @description Families/获取家族事件列表
 * @url GET /families/events
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075568
 */
export const getFamiliesEvents = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getFamiliesEventsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/families/events', {}, _config)
}

/**
 * @description Families/获取事件详情
 * @url GET /families/events/{eventId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075569
 */
export const getFamiliesEventsEventId = async (
  eventId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getFamiliesEventsEventIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/families/events/${eventId}', {}, _config)
}

/**
 * @description Families/更新事件信息
 * @url PUT /families/events/{eventId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075570
 */
export const putFamiliesEventsEventId = async (
  eventId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<putFamiliesEventsEventIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.put('/families/events/${eventId}', {}, _config)
}

/**
 * @description Families/删除事件
 * @url DELETE /families/events/{eventId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075571
 */
export const deleteFamiliesEventsEventId = async (
  eventId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteFamiliesEventsEventIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete('/families/events/${eventId}', {}, _config)
}

/**
 * @description Families/获取家族时间线数据
 * @url GET /families/timeline
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075572
 */
export const getFamiliesTimeline = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getFamiliesTimelineRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/families/timeline', {}, _config)
}

/**
 * @description Families/建立父母与子女关系（需登录）
 * @url POST /families/relationships/link
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075573
 */
export const postFamiliesRelationshipsLink = async (
  relationshipData: postFamiliesRelationshipsLinkReq,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postFamiliesRelationshipsLinkRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/families/relationships/link', relationshipData, _config)
}
