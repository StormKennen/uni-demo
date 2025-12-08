import { postAuthLogin } from '@/services/apifox/NODEJSDEMO/AUTH/apifox';

import { PostBizUserCode2session } from "@/services/apifox/3903128/shangWuXiaoChengXu/apifox"
import { getToken, setStorageSync, setWxSession, setToken, setWxUserInfo } from "./storage"



export const wxLogin = async () => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin', //使用微信登录
      success: function (res) {
        console.log(res)
        console.log("🚀 ~ returnnewPromise ~ res:", res)

        resolve(res.code)
      },
      fail: function (error: any) {
        reject(error)
      }
    })
  })

}

export const wxCode2Session = async () => {
  try {
    const code = await wxLogin()
    console.log('wxCode2Session-code:', code);
    
    // 使用微信code进行静默登录
    const res = await postAuthLogin({
      code: code as string,
      type: 'wx'
    })
    console.log('wxCode2Session-res:', res);
    
    // 保存登录信息
    if (res.data) {
      setWxSession(res.data.user)
      return res
    }
    
  } catch (error) {
    console.log("🚀 ~ wxCode2Session ~ error:", error)
    
    // 如果是401错误，说明微信code无效，不需要特殊处理
    if (error?.code === 401) {
      console.log('微信code验证失败，可能已过期')
    }
    
    throw error
  }
}

export const wxGetUserInfo = async () => {
  return new Promise((resolve, reject) => {
    uni.getUserInfo({
      provider: 'weixin',
      // withCredentials: true,
      success: function (res) {
        console.log("🚀 ~ newPromise ~ res:", res)
        resolve(res)
      },
      fail: function (error: any) {
        console.warn("🚀 ~ newPromise ~ error:", error)
        reject(error)
      }
    })
  })
}

/** @param url 不传的话登录成功返回当前页 */
export const checkLoginBeforeNavigator = (url?: string) => {
  if (!getToken()) {
    uni.navigateTo({
      url: `/pages/mine/login/login?redirectUrl=${url || ''}`
    })
    return false
  }
  if(url){
    uni.navigateTo({
      url
    })
  }
  return true
}

/**
 * 微信静默登录 - 在应用启动时自动调用
 * 适用于微信小程序环境，H5环境会跳过
 */
export const wxSilentLogin = async () => {
  try {
    // 检查是否已经登录
    if (getToken()) {
      console.log('用户已登录，跳过静默登录')
      return true
    }

    // 检查是否在微信环境
    // #ifdef MP-WEIXIN
    console.log('开始微信静默登录...')
    
    // 获取微信code
    const code = await wxLogin()
    console.log('获取微信code成功:', code)
    
    // 使用code进行登录
    const res = await postAuthLogin({
      code: code as string,
      type: 'wx'
    })
    
    if (res.data) {
      // 保存登录信息
      setToken(res.data.tokens.access.token)
      setWxUserInfo(res.data.user)
      setWxSession(res.data.user)
      
      console.log('微信静默登录成功:', res.data.user)
      return true
    }
    // #endif
    
    // #ifdef H5
    console.log('H5环境，跳过微信静默登录')
    // #endif
    
    return false
  } catch (error) {
    console.log('微信静默登录失败:', error)
    
    // 如果是401错误，说明code无效或已过期，这是正常情况
    if (error?.code === 401) {
      console.log('微信code无效或已过期，需要用户手动登录')
    }
    
    return false
  }
}