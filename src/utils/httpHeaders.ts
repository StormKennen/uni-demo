/**
 * HTTP Headers 管理工具
 * 避免循环依赖，单独管理HTTP请求头的更新
 */

// 延迟导入避免循环依赖
let getToken: (() => string) | null = null
let http: any = null

const initDependencies = async () => {
  if (!getToken || !http) {
    const storageModule = await import('@/utils/storage')
    const httpModule = await import('@/services/http')
    getToken = storageModule.getToken
    http = httpModule.default
  }
}

/**
 * 更新HTTP请求的全局headers，添加Authorization Bearer token
 */
export const updateHttpHeaders = async () => {
  try {
    await initDependencies()
    
    if (!getToken || !http) {
      console.warn('Failed to initialize dependencies for updateHttpHeaders')
      return
    }
    
    const token = getToken()
    
    if (token && http.config?.header) {
      // 设置Authorization header为Bearer token格式
      http.config.header.Authorization = `Bearer ${token}`
      console.log('🚀 ~ updateHttpHeaders ~ Authorization header updated:', `Bearer ${token.substring(0, 20)}...`)
    } else if (http.config?.header) {
      // 如果没有token，移除Authorization header
      delete http.config.header.Authorization
      console.log('🚀 ~ updateHttpHeaders ~ Authorization header removed')
    }
  } catch (error) {
    console.error('Error updating HTTP headers:', error)
  }
}