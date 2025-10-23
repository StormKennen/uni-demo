/**
 * @description Auth/Register as user--接口请求Body参数
 * @url POST /auth/register
 */
export interface postAuthRegisterBody {
  email: string
  name: string
  password: string
}

/**
 * @description Auth/Register as user--接口返回值
 * @url POST /auth/register
 */
export type postAuthRegisterRes = string

/**
 * @description Auth/Login--接口请求Body参数
 * @url POST /auth/login
 */
export interface postAuthLoginBody {
  email: string
  password: string
}

/**
 * @description Auth/Login--接口返回值
 * @url POST /auth/login
 */
export interface postAuthLoginRes {
  tokens?: postAuthLoginResTokens
  user?: postAuthLoginResUser
}

/** postAuthLoginResTokensAccess */
export interface postAuthLoginResTokensAccess {
  expires?: string
  token?: string
}

/** postAuthLoginResTokens */
export interface postAuthLoginResTokens {
  access?: postAuthLoginResTokensAccess
  refresh?: postAuthLoginResTokensAccess
}

/** postAuthLoginResUser */
export interface postAuthLoginResUser {
  email?: string
  id?: string
  name?: string
  role?: 'user' | 'admin'
}

/**
 * @description Auth/Logout--接口请求Body参数
 * @url POST /auth/logout
 */
export interface postAuthLogoutBody {
  refreshToken: string
}

/**
 * @description Auth/Logout--接口返回值
 * @url POST /auth/logout
 */
export type postAuthLogoutRes = string

/**
 * @description Auth/Refresh auth tokens--接口请求Body参数
 * @url POST /auth/refresh-tokens
 */
export interface postAuthRefreshTokensBody {
  refreshToken: string
}

/**
 * @description Auth/Refresh auth tokens--接口返回值
 * @url POST /auth/refresh-tokens
 */
export interface postAuthRefreshTokensRes {
  access?: postAuthRefreshTokensResAccess
  refresh?: postAuthRefreshTokensResAccess
}

/** postAuthRefreshTokensResAccess */
export interface postAuthRefreshTokensResAccess {
  expires?: string
  token?: string
}

/**
 * @description Auth/Forgot password--接口请求Body参数
 * @url POST /auth/forgot-password
 */
export interface postAuthForgotPasswordBody {
  email: string
}

/**
 * @description Auth/Forgot password--接口返回值
 * @url POST /auth/forgot-password
 */
export type postAuthForgotPasswordRes = string

/**
 * @description Auth/Reset password--接口请求Query参数
 * @url POST /auth/reset-password
 */
export interface postAuthResetPasswordQuery {
  /** The reset password token */
  token: string
}

/**
 * @description Auth/Reset password--接口请求Body参数
 * @url POST /auth/reset-password
 */
export interface postAuthResetPasswordBody {
  password: string
}

/**
 * @description Auth/Reset password--接口返回值
 * @url POST /auth/reset-password
 */
export type postAuthResetPasswordRes = string

/**
 * @description Auth/Send verification email--接口返回值
 * @url POST /auth/send-verification-email
 */
export type postAuthSendVerificationEmailRes = string

/**
 * @description Auth/verify email--接口请求Query参数
 * @url POST /auth/verify-email
 */
export interface postAuthVerifyEmailQuery {
  /** The verify email token */
  token: string
}

/**
 * @description Auth/verify email--接口返回值
 * @url POST /auth/verify-email
 */
export type postAuthVerifyEmailRes = string
