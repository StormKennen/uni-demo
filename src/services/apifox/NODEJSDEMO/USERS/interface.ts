/**
 * @description Users/Create a user--接口请求Body参数
 * @url POST /users
 */
export interface postUsersBody {
  /** must be unique */
  email: string
  name: string
  /** At least one number and one letter */
  password: string
  role: 'user' | 'admin'
}

/**
 * @description Users/Create a user--接口返回值
 * @url POST /users
 */
export type postUsersRes = string

/**
 * @description Users/Get all users--接口请求Query参数
 * @url GET /users
 */
export interface getUsersQuery {
  /** User name */
  name?: string
  /** User role */
  role?: string
  /** sort by query in the form of field:desc/asc (ex. name:asc) */
  sortBy?: string
  /** Maximum number of users example: 10 */
  limit?: number
  /** Page number */
  page?: number
}

/**
 * @description Users/Get all users--接口返回值
 * @url GET /users
 */
export interface getUsersRes {
  limit?: number
  page?: number
  results?: getUsersResResults[]
  totalPages?: number
  totalResults?: number
}

/** getUsersResResults */
export interface getUsersResResults {
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

/**
 * @description Users/Get a user--接口返回值
 * @url GET /users/{id}
 */
export interface getUsersIdRes {
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

/**
 * @description Users/Update a user--接口请求Body参数
 * @url PATCH /users/{id}
 */
export interface patchUsersIdBody {
  /** must be unique */
  email?: string
  name?: string
  /** At least one number and one letter */
  password?: string
}

/**
 * @description Users/Update a user--接口返回值
 * @url PATCH /users/{id}
 */
export interface patchUsersIdRes {
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

/**
 * @description Users/Delete a user--接口返回值
 * @url DELETE /users/{id}
 */
export type deleteUsersIdRes = any

/**
 * @description Users/获取我的资料--接口返回值
 * @url GET /users/me
 */
export interface getUsersMeRes {
  /** 应用内展示头像 URL，不等同于微信头像快照 */
  avatar: string
  createdAt: string
  id: string
  /** 应用内展示昵称 */
  name: string
  updatedAt: string
}

/**
 * @description Users/修改我的资料--接口请求Body参数
 * @url PATCH /users/me
 */
export interface patchUsersMeBody {
  /** http/https 应用头像 URL；空字符串表示清除自定义头像 */
  avatar?: string
  /** 应用内展示昵称 */
  name?: string
}

/**
 * @description Users/修改我的资料--接口返回值
 * @url PATCH /users/me
 */
export type patchUsersMeRes = object

/**
 * @description Users/获取我的账号绑定状态--接口返回值
 * @url GET /users/me/bindings
 */
export interface getUsersMeBindingsRes {
  phone: getUsersMeBindingsResPhone
  wechat: getUsersMeBindingsResWechat
}

/** getUsersMeBindingsResPhone */
export interface getUsersMeBindingsResPhone {
  bound: boolean
  hasPassword: boolean
  maskedPhone: string
}

/** getUsersMeBindingsResWechat */
export interface getUsersMeBindingsResWechat {
  bound: boolean
}

/**
 * @description Users/为当前账号绑定手机号和密码--接口请求Body参数
 * @url POST /users/me/bindings/phone
 */
export interface postMeBindingsPhoneBody {
  /** 至少包含一个英文字母和一个数字 */
  password: string
  phone: string
}

/**
 * @description Users/为当前账号绑定手机号和密码--接口返回值
 * @url POST /users/me/bindings/phone
 */
export type postMeBindingsPhoneRes = object

/**
 * @description Users/为当前账号绑定微信小程序身份--接口请求Body参数
 * @url POST /users/me/bindings/wechat
 */
export interface postMeBindingsWechatBody {
  /** wx.login 返回的一次性 code */
  code: string
}

/**
 * @description Users/为当前账号绑定微信小程序身份--接口返回值
 * @url POST /users/me/bindings/wechat
 */
export type postMeBindingsWechatRes = object
