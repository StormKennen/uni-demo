import { 
  getToken, 
  setToken,
  getRefreshToken, 
  setRefreshToken,
  getUserInfo, 
  clearLoginData,
  isTokenExpired,
  isRefreshTokenExpired,
  setTokenExpiresAt,
  setRefreshTokenExpiresAt
} from './storage'
import { postAuthRefreshTokens } from '@/services/apifox/NODEJSDEMO/AUTH/apifox'

/**
 * 检查用户是否已登录且token有效
 */
export const checkLoginStatus = (): { 
  isLoggedIn: boolean; 
  user: any | null; 
  tokenExpired: boolean 
} => {
  const token = getToken()
  const user = getUserInfo()
  
  if (!token || !user) {
    return { isLoggedIn: false, user: null, tokenExpired: true }
  }
  
  // 检查token是否过期
  const tokenExpired = isTokenExpired()
  
  return { 
    isLoggedIn: !tokenExpired, 
    user, 
    tokenExpired 
  }
}

/**
 * 轻量级登录状态检查 - 仅检查本地token是否过期
 * 不发起网络请求，适用于UI操作前的快速检查
 */
export const isUserLoggedIn = (): boolean => {
  const token = getToken()
  const user = getUserInfo()
  console.log('token:', token, 'user:', user);
  
  // 没有token或用户信息，未登录
  if (!token || !user) {
    return false
  }
  
  // 检查token是否过期
  return !isTokenExpired()
}

/**
 * 尝试使用refresh token刷新access token
 */
export const refreshAccessToken = async (): Promise<{ success: boolean }> => {
  try {
    const refreshToken = getRefreshToken()
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    // 检查refresh token是否过期
    if (isRefreshTokenExpired()) {
      throw new Error('Refresh token expired')
    }
    
    // 调用刷新token的API
    const response = await postAuthRefreshTokens({
      refreshToken: refreshToken
    })
    
    if (response && response.access && response.refresh) {
      // 更新存储的tokens
      setToken(response.access.token || '')
      setRefreshToken(response.refresh.token || '')
      
      // 保存token过期时间
      if (response.access.expires) {
        setTokenExpiresAt(response.access.expires)
      } else if (response.access.expiresIn) {
        // 如果返回的是相对时间（秒），转换为绝对时间
        const expires = Date.now() + (response.access.expiresIn * 1000)
        setTokenExpiresAt(expires)
      }
      
      if (response.refresh.expires) {
        setRefreshTokenExpiresAt(response.refresh.expires)
      } else if (response.refresh.expiresIn) {
        // 如果返回的是相对时间（秒），转换为绝对时间
        const expires = Date.now() + (response.refresh.expiresIn * 1000)
        setRefreshTokenExpiresAt(expires)
      }
      
      return { success: true }
    }
    
    throw new Error('Invalid refresh response')
    
  } catch (error) {
    console.warn('🚀 ~ refreshAccessToken ~ error:', error)
    // 刷新失败，清除登录数据
    clearLoginData()
    return { success: false }
  }
}

/**
 * 自动登录检查 - 混合策略
 * 1. 首先检查token是否存在和过期
 * 2. 如果token未过期，直接返回登录状态
 * 3. 如果token过期但refresh token有效，尝试刷新
 * 4. 如果都无效，需要手动登录
 */
export const autoLogin = async (): Promise<{ 
  isLoggedIn: boolean; 
  user: any | null; 
  needManualLogin: boolean 
}> => {
  try {
    const { isLoggedIn, user, tokenExpired } = checkLoginStatus()
    
    // 如果已经登录且token未过期，直接返回
    if (isLoggedIn && user && !tokenExpired) {
      console.log('Token is valid, user already logged in')
      return { isLoggedIn: true, user, needManualLogin: false }
    }
    
    // 如果token过期但用户信息存在，尝试刷新token
    if (user && tokenExpired) {
      const refreshToken = getRefreshToken()
      
      if (refreshToken && !isRefreshTokenExpired()) {
        console.log('Token expired, trying to refresh...')
        const refreshResult = await refreshAccessToken()
        
        if (refreshResult.success) {
          console.log('Token refreshed successfully')
          return { isLoggedIn: true, user, needManualLogin: false }
        } else {
          console.log('Token refresh failed, need manual login')
          clearLoginData()
          return { isLoggedIn: false, user: null, needManualLogin: true }
        }
      } else {
        console.log('Refresh token expired or not available, need manual login')
        clearLoginData()
        return { isLoggedIn: false, user: null, needManualLogin: true }
      }
    }
    
    // 没有有效的登录信息，需要手动登录
    console.log('No valid login information, need manual login')
    return { isLoggedIn: false, user: null, needManualLogin: true }
    
  } catch (error) {
    console.error('Auto login error:', error)
    clearLoginData()
    return { isLoggedIn: false, user: null, needManualLogin: true }
  }
}

/**
 * 登出，清除所有登录数据
 */
export const logout = () => {
  clearLoginData()
  console.log('User logged out, all login data cleared')
}