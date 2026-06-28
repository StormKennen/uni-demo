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

/**
 * @description Auth/Login--接口请求Body参数
 * @url POST /auth/login
 */
export type postAuthLoginBody = string

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
 * @description Auth/微信快捷登录--接口请求Body参数
 * @url POST /auth/wechat-login
 */
export interface postAuthWechatLoginBody {
  /** 微信授权码。小程序来自 `uni.login()`，H5 来自微信网页授权回调参数 `code` */
  code: string
  /** 登录来源。`mp` 表示微信小程序，`h5` 表示微信浏览器网页授权 */
  source: 'mp' | 'h5'
}

/**
 * @description Auth/微信快捷登录--接口返回值
 * @url POST /auth/wechat-login
 */
export interface postAuthWechatLoginRes {
  auth?: postAuthWechatLoginResAuth
  tokens?: postAuthWechatLoginResTokens
  user?: postAuthWechatLoginResUser
}

/** postAuthWechatLoginResAuthProviders */
export interface postAuthWechatLoginResAuthProviders {
  /** 对应微信应用的 AppId；手机号密码登录为空字符串 */
  appId?: string
  /** 该登录方式最近一次登录时间 */
  lastLoginAt?: any
  /** 登录提供方。`phone` 表示手机号密码，`wechat_mp` 表示微信小程序，`wechat_h5` 表示微信 H5 网页授权 */
  provider?: 'phone' | 'wechat_mp' | 'wechat_h5'
  /** 登录来源。`phone` 表示手机号密码，`mp` 表示微信小程序，`h5` 表示微信 H5 */
  source?: 'phone' | 'mp' | 'h5'
}

/** postAuthWechatLoginResAuth */
export interface postAuthWechatLoginResAuth {
  /** 当前用户是否已设置密码 */
  hasPassword?: boolean
  /** 当前用户是否已绑定手机号 */
  hasPhone?: boolean
  /** 当前用户是否具备手机号密码登录能力 */
  hasPhonePassword?: boolean
  /** 当前用户是否绑定过任一微信登录方式 */
  isWechatUser?: boolean
  /** 本次登录方式。`phone_password`、`email_password`、`wechat_quick` */
  loginMethod?: string
  /** 本次登录提供方。`phone`、`email`、`wechat_mp`、`wechat_h5` */
  loginProvider?: string
  /** 本次登录来源。手机号密码为 `phone`，邮箱密码为 `email`，微信快捷登录为 `mp` 或 `h5` */
  loginSource?: string
  /** 当前用户已绑定的登录方式列表 */
  providers?: postAuthWechatLoginResAuthProviders[]
}

/** postAuthWechatLoginResTokensAccess */
export interface postAuthWechatLoginResTokensAccess {
  expires?: string
  token?: string
}

/** postAuthWechatLoginResTokens */
export interface postAuthWechatLoginResTokens {
  access?: postAuthWechatLoginResTokensAccess
  refresh?: postAuthWechatLoginResTokensAccess
}

/** postAuthWechatLoginResUser */
export interface postAuthWechatLoginResUser {
  /** 邮箱，手机号注册用户可为空 */
  email?: any
  /** 用户ID */
  id?: string
  /** 用户展示名称 */
  name?: string
  /** 手机号。微信静默注册用户在未绑定手机号前可能为空 */
  phone?: any
  /** 用户角色 */
  role?: 'user' | 'admin'
}
