// request.js

// lodash 合并函数，也可以自己实现
import { getToken, getWxUserInfo, clearLoginData } from "@/utils/storage";
import { refreshAccessToken } from "@/utils/autoLogin";
import { merge } from "lodash-es"
import type { Options, ParticalUniAppRequestOptions } from "./interface";
import { getAppTokenFromQuery } from "@/utilsH5/env";
import { getAppOsByPlatform, getYhIdByPlatform } from "@/utils/env";
import { getCookie } from "@/utilsH5/cookie";

type Methods = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'

enum RES_CODE {
  Success = 200,
  InvalidToken = 20003,
  Unauthorized = 401,
}

const getTokenByPlatform = () =>{
  let token = ''
  // #ifdef WEB
  token = getAppTokenFromQuery() || ''
  // #endif
  // #ifndef WEB
  token = getToken() || ''
  // #endif
  return token
}

// 默认配置
const DEFAULT_CONFIG: Options = {
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  url: '',
  data: {},
  header: {
    app_platform: 'h5',
    CreateSource: 3, // 2 APP; 3 小程序
    Token: getTokenByPlatform(),
    Userid: getYhIdByPlatform(),
    'App-Os': getAppOsByPlatform(),
    'App-Version': getCookie('App_Version'),
  },
  method: "GET",
  timeout: 150000,
  dataType: "json",
  responseType: "text",
  sslVerify: true,
  withCredentials: false,
  firstIpv4: false,
};

export class Request {
  config: Options
  constructor(options = {}) {
    // 合并用户自定义配置
    this.config = merge({}, DEFAULT_CONFIG, options);
    const token = getTokenByPlatform()
    this.config.header.Token = token
    
    // 设置Authorization header（新API标准）
    if (token) {
      this.config.header.Authorization = `Bearer ${token}`
    }
  }
  // 请求拦截 主要是合并url，合并接口特定配置，可以根据自己情况进行扩展
  requestInterceptor(url: string, data: object, config: ParticalUniAppRequestOptions, method: Methods) {
    const { baseURL } = this.config;
    // 拼接Url
    url = config.baseURL ? config.baseURL + url : baseURL + url;
    const _config = {
      ...this.config,
      ...config
    }
    
    // 更新Token字段（兼容旧API）
    _config.header.Token = getTokenByPlatform()
    
    // 更新Authorization header（新API标准）
    const token = getTokenByPlatform()
    if (token) {
      _config.header.Authorization = `Bearer ${token}`
    } else {
      delete _config.header.Authorization
    }
    
    if(!this.config.header.Userid){
      _config.header.Userid = getYhIdByPlatform()
    }
    const configs = {
      ..._config,
      url,
      data,
      method,
      // 添加标记，用于在响应拦截器中识别登录相关接口
      _isAuthRequest: this.isAuthRequest(url),
    };
    // 返回组装的配置
    return configs;
  }

  // 判断是否为认证相关的接口
  private isAuthRequest(url: string): boolean {
    const authEndpoints = [
      '/auth/login',
      '/auth/register', 
      '/auth/refresh-tokens',
      '/auth/forgot-password',
      '/auth/reset-password'
    ];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * 静默刷新token并重试请求
   */
  private async handleTokenRefreshAndRetry(originalUrl: string, originalData: any, originalConfig: ParticalUniAppRequestOptions, originalMethod: Methods): Promise<any> {
    try {
      console.log('尝试静默刷新token...')
      const refreshResult = await refreshAccessToken()
      
      if (refreshResult.success) {
        console.log('Token刷新成功，重试原请求')
        // 更新请求头中的token和Authorization
        const newConfig = { ...originalConfig }
        if (newConfig.header) {
          newConfig.header.Token = getToken()
          // Authorization header已经通过updateHttpHeaders自动更新到全局config中
          // 这里确保新请求也包含最新的Authorization header
          if (this.config.header.Authorization) {
            newConfig.header.Authorization = this.config.header.Authorization
          }
        }
        
        // 重试原请求
        return this.request(originalUrl, originalData, newConfig, originalMethod)
      } else {
        console.log('Token刷新失败')
        throw new Error('Token刷新失败')
      }
    } catch (error) {
      console.log('静默刷新token失败:', error)
      throw error
    }
  }

  /**
   * 显示友好的登录提示对话框
   */
  private showLoginDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      uni.showModal({
        title: '登录状态已过期',
        content: '为了继续使用，请重新登录',
        confirmText: '去登录',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            // 获取当前页面路径作为重定向URL
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            const redirectUrl = currentPage ? `/${currentPage.route}` : ''
            
            uni.navigateTo({
              url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(redirectUrl)}`
            })
            resolve(true)
          } else {
            resolve(false)
          }
        }
      })
    })
  }
  // 响应拦截，这里只是做了示例，可以根据自己情况进行扩展
  async responseInterceptor(res: any, requestConfig?: any) {
    console.log("🚀 ~ Request ~ responseInterceptor ~ res:", res)
    const { data: _data, statusCode } = res;
    
    // 处理HTTP状态码401 - 未授权
    if (statusCode === RES_CODE.Unauthorized) {
      // 如果是认证相关接口的401错误，不自动跳转登录页，让调用方处理
      if (requestConfig?._isAuthRequest) {
        console.log('认证接口返回401，不自动跳转，由调用方处理')
        return Promise.reject({
          code: 401,
          message: '认证失败',
          data: _data
        })
      }
      
      // 非认证接口的401错误 - 尝试静默刷新token
      console.log('非认证接口401错误，尝试静默刷新token')
      try {
        // 尝试静默刷新token并重试请求
        return await this.handleTokenRefreshAndRetry(
          requestConfig?.url || '',
          requestConfig?.data || {},
          requestConfig || {},
          requestConfig?.method || 'GET'
        )
      } catch (refreshError) {
        // 静默刷新失败，显示友好的登录提示
        console.log('静默刷新失败，显示登录提示')
        await this.showLoginDialog()
        return Promise.reject({
          code: 401,
          message: '登录已过期',
          data: _data
        })
      }
    }
    
    const { code, msg, data } = _data;
    
    // 处理业务层面的token失效 - 尝试静默刷新token
    if (code === RES_CODE.InvalidToken) {
      console.log('业务层面Token失效，尝试静默刷新token')
      try {
        // 尝试静默刷新token并重试请求
        return await this.handleTokenRefreshAndRetry(
          requestConfig?.url || '',
          requestConfig?.data || {},
          requestConfig || {},
          requestConfig?.method || 'GET'
        )
      } catch (refreshError) {
        // 静默刷新失败，显示友好的登录提示
        console.log('静默刷新失败，显示登录提示')
        await this.showLoginDialog()
        return Promise.reject({
          code: RES_CODE.InvalidToken,
          message: 'Token失效',
          data: _data
        })
      }
    }
    
    // todo: 删除code!==0判断
    if (code !== RES_CODE.Success) {
      return Promise.reject(msg);
    }
    return data;
  }
  // 请求方法，做了Promise封装，返回Promise
  /**
   * @param {String} url 接口
   * @param {Object} data 参数
   * @param {Object} config 某个接口自定义配置
   * @param {String} method 请求方法，只实现post和get，这么做了原因是 只有这两个没有兼容问题
   * @returns
   */
  request(url: string, data: any, config: ParticalUniAppRequestOptions, method: Methods) {
    // 显示loading
    // uni.showLoading();
    // 请求拦截，返回处理过的结果配置
    const _config = this.requestInterceptor(url, data, config, method);
    
    // 保存原始请求参数，用于重试
    const requestParams = {
      url,
      data,
      method,
      ...config
    }
    
    // Promise 封装
    return new Promise((resolve, reject) => {
      uni.request({
        ..._config,
        success: (res) => {
          this.responseInterceptor(res, requestParams).then(resolve).catch(reject);
          // this.responseInterceptor(res).then(res => {
          //   resolve(res)
          // }).catch(err => {
          //   reject(err)
          // });
        },
        fail: (err: any) => {
          // 提示错误
          console.log("fail", err);
        },
        complete: () => {
          // 关闭Loading
          // uni.hideLoading();
        },
      });
    });
  }
  // 只实现post和get，这么做了原因是 只有这两个没有兼容问题
  // 需要其他方式，可以以同样的方式自行扩展

  /**
   * get请求
   * @param {String} url 接口
   * @param {Object} data 请求参数 可选
   * @param {Object} config 接口自定义配置 可选
   * @returns
   */
  get(url: string, data = {}, config: ParticalUniAppRequestOptions = {}) {
    return this.request(url, data, config, "GET");
  }
  /**
   * post请求
   * @param {String} url 接口
   * @param {Object} data 请求参数 可选
   * @param {Object} config 接口自定义配置 可选
   * @returns
   */
  post(url: string, data = {}, config: ParticalUniAppRequestOptions = {}) {
    return this.request(url, data, config, "POST");
  }
  /**
   * post请求
   * @param {String} url 接口
   * @param {Object} data 请求参数 可选
   * @param {Object} config 接口自定义配置 可选
   * @returns
   */
  put(url: string, data = {}, config: ParticalUniAppRequestOptions = {}) {
    return this.request(url, data, config, "PUT");
  }
  /**
   * post请求
   * @param {String} url 接口
   * @param {Object} data 请求参数 可选
   * @param {Object} config 接口自定义配置 可选
   * @returns
   */
  delete(url: string, data = {}, config: ParticalUniAppRequestOptions = {}) {
    return this.request(url, data, config, "DELETE");
  }
  // 错误提示
  handleError(title: string) {
    uni.showToast({
      title,
      icon: "none",
    });
  }
}

const http = new Request()

export default http


