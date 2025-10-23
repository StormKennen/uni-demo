import SA from '@/libs/Sensorsdata-UniPlugin-JS_0.1.5/index.js'
import { getAppYhidFromQuery, isWeChatBrowser, isYinheAppEnv } from '@/utilsH5/env'
import { getWxUserInfo } from './storage'

type Envs = 'development' | 'test' | 'production'

const serveUrlMap: Record<Envs, string> = {
  development: 'https://importsensors.galaxy-immi.com/sa?project=default',
  test: 'https://importsensors.galaxy-immi.com/sa?project=default',
  production: 'https://importsensors.galaxy-immi.com/sa?project=production_1',
}

let source = 'BusinessWx'

const wxUserInfo = getWxUserInfo()
let yhId = wxUserInfo.yhId

// #ifdef WEB
source = isYinheAppEnv() ? 'APP-H5' : isWeChatBrowser() ? 'weixin-browser' : 'H5'
yhId = getAppYhidFromQuery()
// #endif

const config = {
  server_url: serveUrlMap[import.meta.env.VITE_APP_ENV as Envs],
  show_log: true, //是否开启日志
  name: 'sensors',
  global_properties: {
    // 配置全局属性，所有上报事件属性中均会携带
    // property1: 'value1'
    // 环境和来源
    uni_source: source,
    env: import.meta.env.VITE_APP_ENV,
    system_mark: 'GALAXY_BUSINESS_APP',
    yhId: yhId
  },
  autoTrack: {
    //小程序全埋点配置
    appLaunch: true, // 默认为 true，false 则关闭 $MPLaunch 事件采集
    appShow: true, // 默认为 true，false 则关闭 $MPShow 事件采集
    appHide: true, // 默认为 true，false 则关闭 $MPHide 事件采集
    pageShow: true, // 默认为 true，false 则关闭 $MPViewScreen 事件采集
    pageShare: true, // 默认为 true，false 则关闭 $MPShare 事件采集
    mpClick: true, // 默认为 false，true 则开启 $MPClick 事件采集
    mpFavorite: true, // 默认为 true，false 则关闭 $MPAddFavorites 事件采集
    pageLeave: true, // 默认为 false， true 则开启 $MPPageLeave事件采集
  },
  app: {
    // Android & iOS 初始化配置
    remote_config_url: '',
    flush_interval: 15000, //两次数据发送的最小时间间隔，单位毫秒
    flush_bulkSize: 100, //设置本地缓存日志的最大条目数，最小 50 条， 默认 100 条
    flush_network_policy: 30, //设置 flush 时网络发送策略
    auto_track: 0, // 1 应用启动， 2 应用退出，3 应用启动和退出 默认 0
    encrypt: false, //是否开启加密
    add_channel_callback_event: false, //是否开启渠道事件
    javascript_bridge: false, // WebView 打通功能
    android: {
      //Android 特有配置
      session_interval_time: 30000,
      request_network: true,
      max_cache_size: 32, // 默认 32MB，最小 16MB
      mp_process_flush: false, //使用小程序 SDK 时，小程序进程是否可发送数据
    },
    ios: {
      //iOS 特有配置
      max_cache_size: 10000, //最大缓存条数，默认 10000 条
    },
  },
}
// 环境和来源
const sc = {
  source: 'business-weixin-app',
  env: import.meta.env.VITE_APP_ENV,
}

const sensorsCreated = () => {
  SA.init(config)
  //弹窗 SDK 初始化，需在 init 之后调用
  SA.popupInit({
    // 是否打印 log 日志
    show_log: true,
    // SFO 地址，由 SF 后端提供，sfo 在线服务地址
    api_base_url: '',
    enable_popup: true, //初始化后是否允许弹窗，若禁止则在需要弹窗时调用 enablePopup  @platform Android
    app_id: 'wx2bd4280478755b8f'
  })
}

const customizeTrack = (eventName: string, properName: string, expandProps: Record<string, any> = {}) => {
  let source = '商务小程序'
  const wxUserInfo = getWxUserInfo()
  let yhId = wxUserInfo.yhId
  // #ifdef WEB
  source = isYinheAppEnv() ? 'kai港生活APP' : isWeChatBrowser() ? '微信浏览器' : '浏览器H5'
  yhId = getAppYhidFromQuery()
  // #endif
  const props = {
    name: properName,
    application_name: source,
    yhId,
    ...expandProps,
  }
  console.log('神策上报 customizeTrack：', eventName, props)
  console.log('SA.track.....', SA.track)
  SA.track(eventName, props)
}

const sensorsClickTrack = () => {
  // #ifdef WEB
  // window.addEventListener('click', e => {
  //   console.log('window click', e)
  //   const sensorsEventName = e.target?.dataset?.sensorsEventName
  //   if (sensorsEventName) {
  //     const sensorsChinaEventName = e.target?.dataset?.sensorsChinaEventName || ''
  //     customizeTrack(sensorsEventName, sensorsChinaEventName)
  //   }
  // })
  // #endif
}

export { SA, sensorsCreated, customizeTrack, sensorsClickTrack }
