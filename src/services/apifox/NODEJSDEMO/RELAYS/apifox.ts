/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteRelayIdEntriesEntryIdPathQuery,
  deleteRelayIdEntriesEntryIdRes,
  deleteRelaysRelayIdRes,
  getRelayIdParticipantsMeRes,
  getRelaysMineQuery,
  getRelaysMineRes,
  getRelaysRelayIdEntriesQuery,
  getRelaysRelayIdEntriesRes,
  getRelaysRelayIdRes,
  getRelaysSharedShareCodeRes,
  patchRelayIdEntriesEntryIdBody,
  patchRelayIdEntriesEntryIdPathQuery,
  patchRelayIdEntriesEntryIdRes,
  patchRelayIdParticipantsMeBody,
  patchRelayIdParticipantsMeRes,
  patchRelaysRelayIdBody,
  patchRelaysRelayIdRes,
  postRelayIdParticipantsMeBody,
  postRelayIdParticipantsMeRes,
  postRelaysBody,
  postRelaysRelayIdCloseRes,
  postRelaysRelayIdEntriesBody,
  postRelaysRelayIdEntriesRes,
  postRelaysRelayIdReopenRes,
  postRelaysRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Relays/创建通用接龙
 * @url POST /relays
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475341
 */
export const postRelays = async (
  data: Expand<postRelaysBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postRelaysRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/relays`, data, _config)
}

/**
 * @description Relays/获取当前身份的接龙
 * @url GET /relays/mine
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475342
 */
export const getRelaysMine = async (
  params: Expand<getRelaysMineQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRelaysMineRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/relays/mine`, params, _config)
}

/**
 * @description Relays/通过分享凭证查看接龙
 * @url GET /relays/shared/{shareCode}
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475343
 */
export const getRelaysSharedShareCode = async (
  shareCode: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRelaysSharedShareCodeRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/relays/shared/${shareCode}`, {}, _config)
}

/**
 * @description Relays/获取可访问的接龙详情
 * @url GET /relays/{relayId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475344
 */
export const getRelaysRelayId = async (
  relayId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRelaysRelayIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/relays/${relayId}`, {}, _config)
}

/**
 * @description Relays/更新接龙
 * @url PATCH /relays/{relayId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475345
 */
export const patchRelaysRelayId = async (
  relayId: string,
  data: Expand<patchRelaysRelayIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchRelaysRelayIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/relays/${relayId}`, data, _config)
}

/**
 * @description Relays/软删除接龙
 * @url DELETE /relays/{relayId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475346
 */
export const deleteRelaysRelayId = async (
  relayId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteRelaysRelayIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(`/relays/${relayId}`, {}, _config)
}

/**
 * @description Relays/关闭接龙
 * @url POST /relays/{relayId}/close
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475347
 */
export const postRelaysRelayIdClose = async (
  relayId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postRelaysRelayIdCloseRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/relays/${relayId}/close`, {}, _config)
}

/**
 * @description Relays/重新开启接龙
 * @url POST /relays/{relayId}/reopen
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475348
 */
export const postRelaysRelayIdReopen = async (
  relayId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postRelaysRelayIdReopenRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/relays/${relayId}/reopen`, {}, _config)
}

/**
 * @description Relays/加入接龙或获取当前参与者
 * @url POST /relays/{relayId}/participants/me
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475349
 */
export const postRelayIdParticipantsMe = async (
  relayId: string,
  data: Expand<postRelayIdParticipantsMeBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postRelayIdParticipantsMeRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/relays/${relayId}/participants/me`, data, _config)
}

/**
 * @description Relays/获取当前接龙参与者
 * @url GET /relays/{relayId}/participants/me
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475350
 */
export const getRelayIdParticipantsMe = async (
  relayId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRelayIdParticipantsMeRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/relays/${relayId}/participants/me`, {}, _config)
}

/**
 * @description Relays/修改当前参与者昵称
 * @url PATCH /relays/{relayId}/participants/me
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475351
 */
export const patchRelayIdParticipantsMe = async (
  relayId: string,
  data: Expand<patchRelayIdParticipantsMeBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchRelayIdParticipantsMeRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/relays/${relayId}/participants/me`, data, _config)
}

/**
 * @description Relays/获取接龙记录
 * @url GET /relays/{relayId}/entries
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475352
 */
export const getRelaysRelayIdEntries = async (
  relayId: string,
  params: Expand<getRelaysRelayIdEntriesQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getRelaysRelayIdEntriesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/relays/${relayId}/entries`, params, _config)
}

/**
 * @description Relays/提交接龙记录
 * @url POST /relays/{relayId}/entries
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475353
 */
export const postRelaysRelayIdEntries = async (
  relayId: string,
  data: Expand<postRelaysRelayIdEntriesBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postRelaysRelayIdEntriesRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/relays/${relayId}/entries`, data, _config)
}

/**
 * @description Relays/修改自己的接龙记录
 * @url PATCH /relays/{relayId}/entries/{entryId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475354
 */
export const patchRelaysEntries = async (
  pathParams: Expand<patchRelayIdEntriesEntryIdPathQuery>,
  data: Expand<patchRelayIdEntriesEntryIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchRelayIdEntriesEntryIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(
    `/relays/${pathParams.relayId}/entries/${pathParams.entryId}`,
    data,
    _config,
  )
}

/**
 * @description Relays/撤回或删除接龙记录
 * @url DELETE /relays/{relayId}/entries/{entryId}
 * @host https://app.apifox.com/link/project/7048425/apis/api-509475355
 */
export const deleteRelaysEntries = async (
  pathParams: Expand<deleteRelayIdEntriesEntryIdPathQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteRelayIdEntriesEntryIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(
    `/relays/${pathParams.relayId}/entries/${pathParams.entryId}`,
    {},
    _config,
  )
}
