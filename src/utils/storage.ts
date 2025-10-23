const TokenKey = 'token'
const WxUserInfo = 'WxUserInfo'
const WxSession = 'WxSession'
const IsGoChatCoze = 'IsGoChatCoze'


export const getStorageSync = (key: string)=>{
  try {
    const value = uni.getStorageSync(key);
    return value
  } catch (e) {
    console.log("🚀 ~ getStorageSync ~ e:",key, e)
  }
}

export const setStorageSync = (key: string, value: any)=>{
  try {
    uni.setStorageSync(key, value);
  } catch (e) {
    console.log("🚀 ~ setStorageSync ~ e:",key,value, e)
  }
}

export const removeStorageSync = (key: string)=>{
  try {
    uni.removeStorageSync(key);
  } catch (e) {
    console.log("🚀 ~ removeStorageSync ~ e:",key, e)
  }
}

export const setToken = (token: string)=>{
  setStorageSync(TokenKey, token)
}

export const getToken = ()=>{
  return getStorageSync(TokenKey)
}

export const removeToken = ()=>{
  return removeStorageSync(TokenKey)
}

export const setWxUserInfo = (userInfo: any)=>{
  setStorageSync(WxUserInfo, userInfo)
}

export const getWxUserInfo = ()=>{
  return getStorageSync(WxUserInfo)
}

export const removeWxUserInfo = ()=>{
  return removeStorageSync(WxUserInfo)
}

export const setWxSession = (wxSession: any)=>{
  setStorageSync(WxSession, wxSession)
}

export const getWxSession = ()=>{
  return getStorageSync(WxSession)
}

export const removeWxSession = ()=>{
  return removeStorageSync(WxSession)
}

export const setIsGoChatCoze = (val: boolean)=>{
  setStorageSync(IsGoChatCoze, val)

}

export const getIsGoChatCoze = ()=>{
  return getStorageSync(IsGoChatCoze)
}

