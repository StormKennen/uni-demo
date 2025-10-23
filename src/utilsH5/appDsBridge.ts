import qs from 'qs'
import { isYinheAppEnv } from './env'
import loadFile from '@/utils/loadFile'
export interface IShowPicsSynParams {
  curIndex: number // 当前图片索引
  pics: string[] // 全部图片url数组
}
export interface IGoH5UISynParams {
  url?: string // 跳转地址
  isInformationUrl?: 1 | 0 // 1-资讯类型 0-非资讯类型
  id?: number // 资讯id
  type?: number // 首页咨询 类型 1 是视频
  isFullScreen?: 1 | 0 // 1-通屏 0-非通屏
  navTitle?: string // 文章标题
  hideNavigationTitleFlag?: 0 // 0-展示 1-隐藏
}
export interface IGoNewsInformationListUISynParams {
  id: number // 资讯类别id
  name: string // 资讯类别名称
  hotNum: number // 顶部栏目数量（最新，精品）
}

// '0': 不支持内部返回；'1': 支持内部返回
export type TSupportInnerBackSyn = '0' | '1'

export interface IOpenNewWebViewParams {
  path: string // navigator url
  query?: object // query
  options?: Omit<IGoH5UISynParams, 'url'>
  origin?: string // origin
  replace?: boolean
}

export interface IGoShareH5SynParams {
  ShareH5Title: string // 页面标题
  ShareH5Describe: string // 页面描述
  ShareH5Url: string // 页面链接
}

export interface IToCmbPayQuery {
  id: number
  from: 'app' | string // 'app' | ''
  e_sign_token: string // token
}

export interface IEsignParams {
  url: string
}

export interface IEvaluationResultParams {
  type: 1 | 2 // 1  直接关闭。 2 测评出结果关闭
  result: object // 评价结果
}

export interface IOpenShareViewParams {
  ShareH5Title: string
  ShareH5Describe: string
  ShareH5Url: string
  ContentUrl: string
}

export interface IOpenLivePageParams {
  type: 1 | 2 // 1-直播间 2-录播
  id: string | number // 直播间id/录播id
}

export interface IAgentChatParam {
  id: string // agentId  唯一  app端对应会话Id
  title: string // agent标题
  businessType: 'saleBot' | 'educationBot' | 'businessBot' // “saleBot” 销售agent。 “educationBot” 教育agent。 “businessBot” 商务agent
  botId: string // 智能体id
}

class AppDsBridge {
  isLoadDsBridge = false
  public async loadDsBridgeFile() {
    // #ifdef WEB
    return new Promise((resolve, reject) => {
      try {
        loadFile.loadScript(`${import.meta.env.VITE_APP_CDN_OSS_BUSINESS}/js/dsbridge-3.1.4.js`).then(() => {
          this.isLoadDsBridge = true
          resolve(true)
        })
        if (import.meta.env.VITE_APP_ENV === 'development') {
          loadFile.loadScript(`/src/js/dsbridge-3.1.4.js`).then(() => {
            this.isLoadDsBridge = true
            resolve(true)
          })
        }
      } catch (error) {
        console.log('🚀 ~ AppDsBridge ~ returnnewPromise ~ err:', error)
      }
    })

    // #endif
  }
  async #triggerNativeMethod(methodName: string, params?: any) {
    // #ifdef WEB
    console.log('🚀 ~ AppDsBridge triggerNativeMethod', methodName, this.isLoadDsBridge)
    if (!this.isLoadDsBridge) {
      const isSuccess = await this.loadDsBridgeFile()
      console.log('🚀 ~ AppDsBridge ~ #triggerNativeMethod ~ loadDsBridgeFile isSuccess:', isSuccess)
    }
    console.log('🚀 ~ AppDsBridge triggerNativeMethod params', params)
    if (typeof params === 'object' && params !== null) {
      params = JSON.stringify(params)
    }
    if (window.android?.[methodName]) {
      typeof params === 'undefined' ? window.android[methodName]() : window.android[methodName](params)
    } else {
      if (window.dsBridge?.hasNativeMethod(methodName)) {
        typeof params === 'undefined' ? window.dsBridge.call(methodName) : window.dsBridge.call(methodName, params)
      }
    }
    // #endif
  }

  #registerNativeMethods = Object.create(null) as Record<string, Set<(...args: any[]) => void>>

  async #registerNativeMethod(methodName: string, callback: (...args: any[]) => void) {
    // #ifdef WEB
    console.log('🚀 ~ AppDsBridge registerNativeMethod', methodName, this.isLoadDsBridge)
    if (!this.isLoadDsBridge) {
      const isSuccess = await this.loadDsBridgeFile()
      console.log('🚀 ~ AppDsBridge ~ #registerNativeMethod ~ loadDsBridgeFile isSuccess:', isSuccess)
    }

    const callbackSet = this.#registerNativeMethods[methodName]
    // truthy 已经注册了
    if (callbackSet) {
      callbackSet.add(callback)
      return
    }

    this.#registerNativeMethods[methodName] = new Set([callback]);
      // @ts-expect-error
    if (window.android) {
      // @ts-expect-error
      window[`android_${methodName}`] = (...args:any[]) => {
        this.#registerNativeMethods[methodName].forEach((cb) => {
          cb(...args)
        })
      }
      return  
    }
    
    // @ts-expect-error
    window.dsBridge.register(methodName,  (...args: any[]) => {
      this.#registerNativeMethods[methodName].forEach((cb) => {
        cb(...args)
      })
    })
    // #endif
  }
  #unRegisterNativeMethod(methodName: string, callback: (...args: any[]) => void) {
    const callbackSet = this.#registerNativeMethods[methodName]
    if (callbackSet) {
      callbackSet.delete(callback)
    }
  }

  /** 保存图片到本地 */
  public saveLocalPictureSyn(pictureUrl: string) {
    this.#triggerNativeMethod('saveLocalPictureSyn', pictureUrl)
  }

  /** 图片组预览 */
  public showPicsSyn(params: IShowPicsSynParams) {
    this.#triggerNativeMethod('showPicsSyn', params)
  }

  /** 跳转赴港时间预约界面 */
  public gotoAppointCertificateSyn(orderId: string) {
    this.#triggerNativeMethod('gotoAppointCertificateSyn', orderId)
  }

  /** 非通屏状态下 设置app导航栏标题 隐藏、显示 与 document.title同样的效果 */
  public setAppNavigation(isShow: boolean) {
    this.#triggerNativeMethod('setAppNavigation', isShow)
  }

  /** 返回App上一个界面 */
  public backToAppPreView() {
    this.#triggerNativeMethod('backToAppPreView', '')
  }

  /** 展示另一个H5界面 */
  public goH5UISyn(params: IGoH5UISynParams) {
    this.#triggerNativeMethod('goH5UISyn', {
      isInformationUrl: 0,
      isFullScreen: 0,
      ...params,
    })
  }

  /** 通过 url 打开新的webview（YinheApp环境使用：goH5UISyn） 或者window.open下个页面（其他环境） */
  public openAppWebViewOrLoactionHref(params: IGoH5UISynParams) {
    if (isYinheAppEnv()) {
      this.goH5UISyn(params)
    } else {
      window.location.href = params.url as string
    }
  }

  /** 通过navigator url(path) 打开新的webview 请使用 openAppWebViewOrNavigator 替代 */
  public openAppWebViewByPath(params: IOpenNewWebViewParams) {
    const { path, query = {}, origin = import.meta.env.VITE_APP_H5_URL, options } = params
    const url = `${origin}${path}?${qs.stringify(query)}`
    console.log('openAppWebViewByPath', url, options)
    this.goH5UISyn({
      url,
      ...options,
    })
  }

  /** 通过vue router path 打开新的webview（YinheApp环境） 或者 路由到下个页面（其他环境） */
  public openAppWebViewOrNavigator(params: IOpenNewWebViewParams) {
    if (isYinheAppEnv()) {
      console.log('openAppWebViewOrNavigator')
      this.openAppWebViewByPath(params)
    } else {
      const { path, query = {}, replace = false } = params
      const url = `${path}?${qs.stringify(query)}`
      if (replace === true) {
        uni.redirectTo({
          url,
        })
      } else {
        uni.navigateTo({
          url,
        })
      }
    }
  }

  /** 跳转首页-生活Tab */
  public goHomeLifeTabSyn() {
    this.#triggerNativeMethod('goHomeLifeTabSyn', '')
  }

  /** 跳转案例分享UI id: 案例id */
  public goCaseShareUISyn(id: number) {
    this.#triggerNativeMethod('goCaseShareUISyn', id)
  }

  /** 跳转资讯列表页 */
  public goNewsInformationListUISyn(params: IGoNewsInformationListUISynParams) {
    this.#triggerNativeMethod('goNewsInformationListUISyn', params)
  }

  /** 拨打电话 */
  public appCallPhoneSyn(phoneNumber: string) {
    this.#triggerNativeMethod('appCallPhoneSyn', phoneNumber)
  }

  /** 设置导航栏返回按钮颜色
   * @param color '0':白色 | '1':黑色
   */
  public setNavigationBackColor(color: '0' | '1') {
    this.#triggerNativeMethod('setNavigationBackColor', color)
  }

  /** webView内支持内部一级一级返回
   * @param tag '0': 不支持内部返回 | '1': 支持内部返回
   */
  public supportInnerBackSyn(tag: TSupportInnerBackSyn) {
    this.#triggerNativeMethod('supportInnerBackSyn', tag)
  }

  /** 是否支持通屏
   * @param tag '0': 不支持通屏 | '1': 支持通屏
   */
  public supportFullScreenSyn(tag: '0' | '1') {
    this.#triggerNativeMethod('supportFullScreenSyn', tag)
  }

  /** 隐藏导航栏
   * @param tag '0': 不隐藏 | '1': 隐藏
   * 注意和 setAppNavigation 区分
   */
  public hideNavigationBarSyn(tag: '0' | '1') {
    this.#triggerNativeMethod('hideNavigationBarSyn', tag)
  }

  /** 登录带token刷新
   * @param tag '0': 仅登录 | '1': 登录后带token刷新当前WKWebView | '2': token失效，登录后带token刷新当前WKWebView
   */
  public loginAndRefeshWithTokenSyn(tag: '0' | '1' | '2') {
    console.log('appDsBridge loginAndRefeshWithToken tag', tag)
    this.#triggerNativeMethod('loginAndRefeshWithTokenSyn', tag)
  }

  /** 招行聚合支付 请使用 toCmbPay 方法替代
   * @param payUrl   eg:   cmbPaySyn("https://beta-sign.galaxy-immi.com/webPayConfirm?id=Qk9sbUlzenp0OGFOdVZ4ekphQXJGWnJ0ODdBS3gxdWNJcURrOHBLbm4xND0%3D")
   * PS：因招商实现原因，这个方法仅iOS平台调用；安卓平台是h5端直接跳转
   */
  public cmbPaySyn(payUrl: String) {
    this.#triggerNativeMethod('cmbPaySyn', payUrl)
  }

  /** 去招行支付 兼容android ios h5 */
  public toCmbPay(query: IToCmbPayQuery, baseUrl = `${import.meta.env.VITE_E_SIGN_URL}/IndividualityWaitPay`) {
    const url = `${baseUrl}?${qs.stringify(query)}`
    if (isYinheAppEnv()) {
      if (window.android) {
        appDsBridge.goH5UISyn({
          url,
        })
      } else {
        appDsBridge.cmbPaySyn(url)
      }
    } else {
      window.open(url)
    }
  }

  /** 分享H5页面 */
  public shareH5Sync(params: IGoShareH5SynParams) {
    this.#triggerNativeMethod('shareH5Syn', params)
  }

  /** 返回时刷新界面 */
  public reloadwebVeiwSyn() {
    this.#triggerNativeMethod('reloadwebVeiwSyn', '')
  }

  /** 导航栏上是否展示title  tag:0 显示title   默认显示; tag:1 隐藏title */
  public hideNavigationTitleSyn(tag: '0' | '1') {
    this.#triggerNativeMethod('hideNavigationTitleSyn', tag)
  }

  /** 使用safari WebView打开Url  url: www.baidu.com 仅IOS有 */
  public openUrlWithSafariSyn(url: string) {
    this.#triggerNativeMethod('openUrlWithSafariSyn', url)
  }

  public openSignUISyn(params: IEsignParams) {
    this.#triggerNativeMethod('openSignUISyn', params)
  }

  /** 关闭AI聊天的测评弹窗并获取测评结果  */
  public closeEvaluationGetResult(params: IEvaluationResultParams) {
    this.#triggerNativeMethod('closeEvaluationGetResult', params)
  }

  /** 返回首页的某一个菜单
   * @param index 0 推荐 1kai甄选 2直播 3咨询
   */
  public goAppHomePage(index: number) {
    this.#triggerNativeMethod('backToHomeIndex', index)
  }

  /** 打开分享弹窗 */
  public openShareView(params: IOpenShareViewParams) {
    this.#triggerNativeMethod('openShareView', params)
  }

  /** 跳转到APP直播或录播页面 */
  public openLivePage(params: IOpenLivePageParams) {
    this.#triggerNativeMethod('openLivePage', params)
  }

  /** 商品详情页面  调用原生方法 关闭APP小窗 */
  public closeSmallWindow(params: string) {
    this.#triggerNativeMethod('closeSmallWindow', params)
  }

  /** 跳转App 底部一级tab
   * @param tag home 首页 | server 服务 | ai 人工智能 | friend 好友 | mine 我的
   */
  public goAppTab(tag: 'home' | 'server' | 'ai' | 'friend' | 'mine') {
    this.#triggerNativeMethod('goAppTab', tag)
  }

  /** 跳转App 服务-服务进度页面
   */
  public goServiceProgressPage() {
    this.#triggerNativeMethod('goServiceProgressPage', '')
  }

  /** H5调用原生方法预览文件
   * url: oss私有和公有地址(私有链接不需要自己转换, APP内部会处理)
   */
  public goPreviewFile(url: string) {
    this.#triggerNativeMethod('goPreviewFile', url)
  }

  /**
   * H5跳转App智能体会话页面
   */
  public goAgentChatPage(params: IAgentChatParam) {
    this.#triggerNativeMethod('goAgentChatPage', params)
  }
  
  /**
   * H5跳转App服务中心并传入订单ID
   */
  public goServiceByOrderId(orderId: string) {
    this.#triggerNativeMethod('goServiceByOrderId', orderId)
  }


  // 键盘高度变化事件的监听函数 height 键盘高度，0为收起，非0为弹起
  public onKeyboardHeightChanged(cb: (height: number) => void) {
    this.#registerNativeMethod('onKeyboardHeightChanged', (res: { height: string } | string) => {
      if (typeof res === 'string') {
        cb(Number.parseInt(res))
      } else {
        cb(Number.parseInt(res.height))
      }
    })
  }

  // 移除键盘高度变化事件的监听函数
  public offKeyboardHeightChange(cb: (height: number) => void)  {
    this.#unRegisterNativeMethod('onKeyboardHeightChanged', cb)
  }
  /**
   * H5禁用App手势滑动退出
   * @param tag 0开启手势 1关闭手势
   * @description 单个VC页面生效，非全局
   */
  public disableFullScreenGestureSyn(tag: '0' | '1') {
    this.#triggerNativeMethod('disableFullScreenGestureSyn', tag)
  }

  // 键盘高度变化事件的监听函数 height 键盘高度，0为收起，非0为弹起
  public onKeyboardHeightChanged(cb: (height: number) => void) {
    this.#registerNativeMethod('onKeyboardHeightChanged', (res: { height: string } | string) => {
      if (typeof res === 'string') {
        cb(Number.parseInt(res))
      } else {
        cb(Number.parseInt(res.height))
      }
    })
  }

  // 移除键盘高度变化事件的监听函数
  public offKeyboardHeightChange(cb: (height: number) => void)  {
    this.#unRegisterNativeMethod('onKeyboardHeightChanged', cb)
  }
}

const appDsBridge = new AppDsBridge()

export default appDsBridge
