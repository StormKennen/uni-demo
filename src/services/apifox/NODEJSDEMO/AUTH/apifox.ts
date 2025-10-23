/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  postAuthForgotPasswordBody,
  postAuthForgotPasswordRes,
  postAuthLoginBody,
  postAuthLoginRes,
  postAuthLogoutBody,
  postAuthLogoutRes,
  postAuthRefreshTokensBody,
  postAuthRefreshTokensRes,
  postAuthRegisterBody,
  postAuthRegisterRes,
  postAuthResetPasswordBody,
  postAuthResetPasswordQuery,
  postAuthResetPasswordRes,
  postAuthSendVerificationEmailRes,
  postAuthVerifyEmailQuery,
  postAuthVerifyEmailRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description Auth/Register as user
 * @url POST /auth/register
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075586
 */
export const postAuthRegister = async (
  data: Expand<postAuthRegisterBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAuthRegisterRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/auth/register', data, _config)
}

/**
 * @description Auth/Login
 * @url POST /auth/login
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075587
 */
export const postAuthLogin = async (
  data: Expand<postAuthLoginBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAuthLoginRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/auth/login', data, _config)
}

/**
 * @description Auth/Logout
 * @url POST /auth/logout
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075588
 */
export const postAuthLogout = async (
  data: Expand<postAuthLogoutBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAuthLogoutRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/auth/logout', data, _config)
}

/**
 * @description Auth/Refresh auth tokens
 * @url POST /auth/refresh-tokens
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075589
 */
export const postAuthRefreshTokens = async (
  data: Expand<postAuthRefreshTokensBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAuthRefreshTokensRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/auth/refresh-tokens', data, _config)
}

/**
 * @description Auth/Forgot password
 * @url POST /auth/forgot-password
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075590
 */
export const postAuthForgotPassword = async (
  data: Expand<postAuthForgotPasswordBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAuthForgotPasswordRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/auth/forgot-password', data, _config)
}

/**
 * @description Auth/Reset password
 * @url POST /auth/reset-password
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075591
 */
export const postAuthResetPassword = async (
  params: Expand<postAuthResetPasswordQuery>,
  data: Expand<postAuthResetPasswordBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAuthResetPasswordRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/auth/reset-password', data, _config)
}

/**
 * @description Auth/Send verification email
 * @url POST /auth/send-verification-email
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075592
 */
export const postAuthSendVerificationEmail = async (
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAuthSendVerificationEmailRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/auth/send-verification-email', {}, _config)
}

/**
 * @description Auth/verify email
 * @url POST /auth/verify-email
 * @host https://app.apifox.com/link/project/7048425/apis/api-363075593
 */
export const postAuthVerifyEmail = async (
  params: Expand<postAuthVerifyEmailQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postAuthVerifyEmailRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/auth/verify-email', {}, _config)
}
