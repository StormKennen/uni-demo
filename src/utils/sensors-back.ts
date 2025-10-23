/*
 * @FilePath: /easybay-diy-mini-h5/src/utils/sensors.ts
 * @Description:
 */
// import SA from 'sa-sdk-miniprogram'
import SA from '@/libs/Sensorsdata-UniPlugin-JS_0.1.5/index.js'

type Envs = 'development' | 'test' | 'production'

const serveUrlMap: Record<Envs, string> = {
  development: 'https://importsensors.galaxy-immi.com/sa?project=default',
  test: 'https://importsensors.galaxy-immi.com/sa?project=default',
  production: 'https://importsensors.galaxy-immi.com/sa?project=production_1',
}
const config = {
  server_url: serveUrlMap[import.meta.env.VITE_APP_ENV as Envs],
  app_js_bridge: true,
  is_track_single_page: true, // 单页面配置，默认开启，若页面中有锚点设计，需要将该配置删除，否则触发锚点会多触发 $pageview 事件
  use_client_time: true,
  send_type: 'beacon',
  // show_log: import.meta.env.VITE_APP_ENV !== 'production',
  // show_log: process.env.NODE_ENV === 'development',
  show_log: true,
  heatmap: {
    // 是否开启点击图，default 表示开启，自动采集 $WebClick 事件，可以设置 'not_collect' 表示关闭。
    clickmap: 'default',
    // 是否开启触达图，not_collect 表示关闭，不会自动采集 $WebStay 事件，可以设置 'default' 表示开启。
    scroll_notice_map: 'default',
    // div 类型元素的自动采集
    collect_tags: {
      div: true,
    },
  },
}
// 环境和来源
const sc = {
  source: 'business-weixin-app',
  env: import.meta.env.VITE_APP_ENV,
}

const sensorsCreated = () => {
  SA.logout()
  SA.init(config)
  // 注册公共属性
  SA.registerApp({
    sc: JSON.stringify(sc),
    platform_type: 'weixin', // 平台类型
    system_mark: 'GALAXY_BUSINESS_APP', // 系统标识
  })

  SA.quick('autoTrack')
}

const customizeTrack = (eventName: string, properName: string, expandProps: Record<string, any> = {}) => {
  const source = 'kai小程序'
  const props = {
    name: properName,
    application_name: source,
    ...expandProps,
  }
  SA.track(eventName, props)
}

const sensorsClickTrack = () => {
  window.addEventListener('click', (e) => {
    const sensorsEventName = e.target?.dataset?.sensorsEventName
    if (sensorsEventName) {
      const sensorsChinaEventName = e.target?.dataset?.sensorsChinaEventName || ''
      customizeTrack(sensorsEventName, sensorsChinaEventName)
    }
  })
}

export {
  SA,
  sensorsCreated,
  customizeTrack,
  sensorsClickTrack,
}
