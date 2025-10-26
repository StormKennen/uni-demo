const TokenKey = 'token'
const WxUserInfo = 'WxUserInfo'
const WxSession = 'WxSession'
const IsGoChatCoze = 'IsGoChatCoze'
const WxEncryptedData = 'WxEncryptedData'


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

// 微信加密数据相关函数
export interface WxEncryptedDataType {
  cloudID?: string
  encryptedData: string
  iv: string
  signature: string
  rawData?: string
  userInfo?: any
}

export const setWxEncryptedData = (data: WxEncryptedDataType)=>{
  setStorageSync(WxEncryptedData, data)
}

export const getWxEncryptedData = (): WxEncryptedDataType | null =>{
  return getStorageSync(WxEncryptedData)
}

export const removeWxEncryptedData = ()=>{
  return removeStorageSync(WxEncryptedData)
}

// refresh token 支持
const RefreshTokenKey = 'refreshToken'

export const setRefreshToken = (refreshToken: string) => {
  setStorageSync(RefreshTokenKey, refreshToken)
}

export const getRefreshToken = () => {
  return getStorageSync(RefreshTokenKey)
}

export const removeRefreshToken = () => {
  return removeStorageSync(RefreshTokenKey)
}

// token 过期时间支持
const TokenExpiresAtKey = 'tokenExpiresAt'
const RefreshTokenExpiresAtKey = 'refreshTokenExpiresAt'

export const setTokenExpiresAt = (expires: number) => {
  setStorageSync(TokenExpiresAtKey, expires)
}

export const getTokenExpiresAt = (): number | null => {
  return getStorageSync(TokenExpiresAtKey)
}

export const removeTokenExpiresAt = () => {
  return removeStorageSync(TokenExpiresAtKey)
}

export const setRefreshTokenExpiresAt = (expires: number) => {
  setStorageSync(RefreshTokenExpiresAtKey, expires)
}

export const getRefreshTokenExpiresAt = (): number | null => {
  return getStorageSync(RefreshTokenExpiresAtKey)
}

export const removeRefreshTokenExpiresAt = () => {
  return removeStorageSync(RefreshTokenExpiresAtKey)
}

/**
 * 检查token是否过期
 * @param bufferMinutes 提前多少分钟认为token过期（默认5分钟）
 */
export const isTokenExpired = (bufferMinutes: number = 5): boolean => {
  const expires = getTokenExpiresAt()
  console.log('expires', expires);
  
  if (!expires) {
    return true // 没有过期时间信息，认为已过期
  }
  
  const now = Date.now()
  const bufferMs = bufferMinutes * 60 * 1000
  return now >= (expires - bufferMs)
}

/**
 * 检查refresh token是否过期
 */
export const isRefreshTokenExpired = (): boolean => {
  const expires = getRefreshTokenExpiresAt()
  if (!expires) {
    return true // 没有过期时间信息，认为已过期
  }
  
  const now = Date.now()
  return now >= expires
}

// 用户信息支持
export interface UserInfoType {
  id: string
  name: string
  phone: string
  role: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  wechatGender: number
}

const UserInfoKey = 'userInfo'

export const setUserInfo = (userInfo: UserInfoType) => {
  setStorageSync(UserInfoKey, userInfo)
}

export const getUserInfo = (): UserInfoType | null => {
  return getStorageSync(UserInfoKey)
}

export const removeUserInfo = () => {
  return removeStorageSync(UserInfoKey)
}

// 清除所有登录相关数据
export const clearLoginData = () => {
  removeToken()
  removeRefreshToken()
  removeTokenExpiresAt()
  removeRefreshTokenExpiresAt()
  removeUserInfo()
  removeWxUserInfo()
}

