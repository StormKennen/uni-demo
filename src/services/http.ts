// request.js

// lodash 合并函数，也可以自己实现
import { getToken, getWxUserInfo } from "@/utils/storage";
import { merge } from "lodash-es"
import type { Options, ParticalUniAppRequestOptions } from "./interface";
import { getAppTokenFromQuery } from "@/utilsH5/env";
import { getAppOsByPlatform, getYhIdByPlatform } from "@/utils/env";
import { getCookie } from "@/utilsH5/cookie";

type Methods = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'

enum RES_CODE {
  Success = 200,
  InvalidToken = 20003,
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
    CreateSource: 3, // 2 APP; 3 商务小程序
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
    _config.header.Token = getTokenByPlatform()
    if(!this.config.header.Userid){
      _config.header.Userid = getYhIdByPlatform()
    }
    const configs = {
      ..._config,
      url,
      data,
      method,
    };
    // 返回组装的配置
    return configs;
  }
  // 响应拦截，这里只是做了示例，可以根据自己情况进行扩展
  async responseInterceptor(res: any) {
    console.log("🚀 ~ Request ~ responseInterceptor ~ res:", res)
    const { data: _data } = res;
    const { code, msg, data } = _data;
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
    // Promise 封装
    return new Promise((resolve, reject) => {
      uni.request({
        ..._config,
        success: (res) => {
          this.responseInterceptor(res).then(resolve).catch(reject);
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


