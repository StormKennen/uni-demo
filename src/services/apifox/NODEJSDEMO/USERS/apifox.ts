/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteUsersIdRes,
  getUsersIdRes,
  getUsersMeBindingsRes,
  getUsersMeRes,
  getUsersQuery,
  getUsersRes,
  patchUsersIdBody,
  patchUsersIdRes,
  patchUsersMeBody,
  patchUsersMeRes,
  postMeBindingsPhoneBody,
  postMeBindingsPhoneRes,
  postMeBindingsWechatBody,
  postMeBindingsWechatRes,
  postUsersBody,
  postUsersRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Users/Create a user
 * @url POST /users
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075603
 */
export const postUsers = async (
  data: Expand<postUsersBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postUsersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/users`, data, _config)
}

/**
 * @description Users/Get all users
 * @url GET /users
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075604
 */
export const getUsers = async (
  params: Expand<getUsersQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getUsersRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/users`, params, _config)
}

/**
 * @description Users/Get a user
 * @url GET /users/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075605
 */
export const getUsersId = async (
  id: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getUsersIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/users/${id}`, {}, _config)
}

/**
 * @description Users/Update a user
 * @url PATCH /users/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075606
 */
export const patchUsersId = async (
  id: string,
  data: Expand<patchUsersIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchUsersIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/users/${id}`, data, _config)
}

/**
 * @description Users/Delete a user
 * @url DELETE /users/{id}
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075607
 */
export const deleteUsersId = async (
  id: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteUsersIdRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.delete(`/users/${id}`, {}, _config)
}

/**
 * @description Users/获取我的资料
 * @url GET /users/me
 * @host https://app.apifox.com/link/project/7048425/apis/api-500916789
 */
export const getUsersMe = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getUsersMeRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/users/me`, {}, _config)
}

/**
 * @description Users/修改我的资料
 * @url PATCH /users/me
 * @host https://app.apifox.com/link/project/7048425/apis/api-500916790
 */
export const patchUsersMe = async (
  data: Expand<patchUsersMeBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchUsersMeRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.patch(`/users/me`, data, _config)
}

/**
 * @description Users/获取我的账号绑定状态
 * @url GET /users/me/bindings
 * @host https://app.apifox.com/link/project/7048425/apis/api-500916791
 */
export const getUsersMeBindings = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getUsersMeBindingsRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/users/me/bindings`, {}, _config)
}

/**
 * @description Users/为当前账号绑定手机号和密码
 * @url POST /users/me/bindings/phone
 * @host https://app.apifox.com/link/project/7048425/apis/api-500916792
 */
export const postMeBindingsPhone = async (
  data: Expand<postMeBindingsPhoneBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMeBindingsPhoneRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/users/me/bindings/phone`, data, _config)
}

/**
 * @description Users/为当前账号绑定微信小程序身份
 * @url POST /users/me/bindings/wechat
 * @host https://app.apifox.com/link/project/7048425/apis/api-500916793
 */
export const postMeBindingsWechat = async (
  data: Expand<postMeBindingsWechatBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMeBindingsWechatRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/users/me/bindings/wechat`, data, _config)
}
