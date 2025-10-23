import { getAppStatusHFromSession, getAppYhidFromQuery, isYinheAppEnv } from "@/utilsH5/env";
import { getWxUserInfo } from "./storage";

interface SystemInfo {
  /**
   * 设备类型。`phone`、`pad`、`pc`
   */
  deviceType: 'phone' | 'pad' | 'pc'
  /**
   * 设备像素比 1 | 2 | 3
   */
  devicePixelRatio: number
  /**
   * ios、android、windows、mac、linux
   */
  osName: 'ios' | 'android' | 'windows' | 'mac' | 'linux'
  /**
 * App、小程序宿主名称，如：`WeChat`、`FeiShu`、`alipay`、`DINGTALK`。H5 端为浏览器名称
 */
  hostName: string;
  /**
   * 是否在kaiAPP中
   */
  isYinheApp?: boolean
  statusBarHeight: number
}

export function getSystemInfo(): SystemInfo {
  const result = uni.getSystemInfoSync()
  return {
    deviceType: result.deviceType,
    devicePixelRatio: result.devicePixelRatio,
    osName: result.osName,
    hostName: result.hostName,
    statusBarHeight: result.statusBarHeight,
    isYinheApp: isYinheAppEnv()
  } as SystemInfo
}

/**
 * 状态栏高度
 * app: 读取session保存的值
 * 小程序: 直接返回空,因为小程序是根据胶囊位置直接设置了导航栏的高度
 * @returns 
 */
export const getStatusBarHeight = (): string | undefined => {
  const sys = getSystemInfo()
  const isWeChat = sys.hostName === 'WeChat'
  if(sys.isYinheApp) {
    const app_h = getAppStatusHFromSession()
    console.log('app statusBarHeight', app_h);
    return app_h
  }
  return ''
}

export const getYhIdByPlatform = () =>{
  const wxUserInfo = getWxUserInfo()
  let yhId = wxUserInfo.yhId || ''
  // #ifdef WEB
  yhId = getAppYhidFromQuery()
  // #endif
  return yhId
}

export const getAppOsByPlatform = () =>{
  let source = 'mp-weixin'
  // #ifdef WEB
  source = 'h5'
  // #endif
  return source
}