/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable vue/no-irregular-whitespace */
/* eslint-disable sort-imports */
import http from '../../../http'
import type { ParticalUniAppRequestOptions }   from '../../../interface'
const baseURL = undefined
import type {
    PostBizUserLoginReq,
    PostBizUserLoginRes,
    PostBizUserCode2sessionReq,
    PostBizUserCode2sessionRes,
    PostBizUserSendSmsCodeReq,
    PostBizUserSendSmsCodeRes,
    GetBizRegionTreeRes,
} from './interface'
    
/** 登录 需要获取手机号码、微信授权登录、头像 */
export function PostBizUserLogin(params: PostBizUserLoginReq, config?: ParticalUniAppRequestOptions): Promise<PostBizUserLoginRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/user/login`, params, _config) as Promise<PostBizUserLoginRes>
}

/** 微信小程序静默登录 */
export function PostBizUserCode2session(params: PostBizUserCode2sessionReq, config?: ParticalUniAppRequestOptions): Promise<PostBizUserCode2sessionRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/user/code2session`, params, _config) as Promise<PostBizUserCode2sessionRes>
}

/** 发送手机短信验证码 */
export function PostBizUserSendSmsCode(params: PostBizUserSendSmsCodeReq, config?: ParticalUniAppRequestOptions): Promise<PostBizUserSendSmsCodeRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/user/send-sms-code`, params, _config) as Promise<PostBizUserSendSmsCodeRes>
}

/** 省市区查询 */
export function GetBizRegionTree(config?: ParticalUniAppRequestOptions): Promise<GetBizRegionTreeRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/region/tree', _config) as Promise<GetBizRegionTreeRes>
}
