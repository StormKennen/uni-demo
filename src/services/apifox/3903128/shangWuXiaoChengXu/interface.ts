/* eslint-disable prettier/prettier */
export interface PostBizUserLoginReq {
    /** 头像  */
    avatar_url?: string
    /** 昵称  */
    nickname?: string
    /** 性别  */
    gender?: string
    /** 城市  */
    city?: string
    /** 省份  */
    province?: string
    /** 国家  */
    country?: string
    /** 通过code2session获取  */
    unionid: string
    /** 小程序用户授权手机code码  */
    mobile_js_code: string
    /** 手机号码 mobile_js_code不存在时候必填 */
    mobile: string
    /** 手机验证码 mobile_js_code不存在时候必填 */
    sms_code: string
}
export interface PostBizUserLoginRes {
    /**   */
    token: string
    /**   */
    yh_id: string
    /**   */
    avatar_url: string
    /**   */
    nickname: string
    /**   */
    gender: string
}
export interface PostBizUserCode2sessionReq {
    /**   */
    js_code: string
}
export interface PostBizUserCode2sessionRes {
    /**   */
    unionid: string
    /**   */
    openid: string
    /**   */
    session_key: string
}
export interface PostBizUserSendSmsCodeQuery {
    /** 手机号码  example:  */
    mobile?: string
    /** 区号:  中国大陆=+86  example: +86 */
    code?: string
}
export interface PostBizUserSendSmsCodeReq {
    /** 手机号码  */
    mobile: string
    /** 区号:  中国大陆=+86  */
    code: string
}

export type PostBizUserSendSmsCodeRes = any
export interface GetBizRegionTreeRes {
}
