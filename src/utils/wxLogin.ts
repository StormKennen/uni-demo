import { postAuthLogin } from '@/services/apifox/NODEJSDEMO/AUTH/apifox';

import { PostBizUserCode2session } from "@/services/apifox/3903128/shangWuXiaoChengXu/apifox"
import { getToken, setStorageSync, setWxSession } from "./storage"



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
    
    // const res = await PostBizUserCode2session({
    //   js_code: code as string
    // })
    // setWxSession(res)
    const kRes = await postAuthLogin({
      email: 'root@admin.com',
      password: 'Admin7877169900'
    })
    console.log('wxCode2Session-kRes:', kRes);
    
  } catch (error) {
    console.log("🚀 ~ wxCode2Session ~ error:", error)
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