/**
 * 微信小程序分享配置工具
 */

// 分享配置接口
export interface ShareConfig {
  title?: string
  path?: string
  imageUrl?: string
}

// 默认分享配置
const DEFAULT_SHARE_CONFIG: ShareConfig = {
  title: 'kai - 专业服务平台',
  path: '/pages/index/index',
  imageUrl: '/static/logo.png'
}

/**
 * 获取分享配置
 * @param customConfig 自定义分享配置
 * @returns 完整的分享配置
 */
export function getShareConfig(customConfig: Partial<ShareConfig> = {}): ShareConfig {
  return {
    ...DEFAULT_SHARE_CONFIG,
    ...customConfig
  }
}

/**
 * 创建onShareAppMessage方法
 * @param customConfig 自定义分享配置
 * @returns onShareAppMessage方法
 */
export function createShareAppMessage(customConfig: Partial<ShareConfig> = {}) {
  return function onShareAppMessage() {
    const config = getShareConfig(customConfig)
    console.log('分享配置:', config)
    return config
  }
}

/**
 * 创建onShareTimeline方法（朋友圈分享）
 * @param customConfig 自定义分享配置
 * @returns onShareTimeline方法
 */
export function createShareTimeline(customConfig: Partial<ShareConfig> = {}) {
  return function onShareTimeline() {
    const config = getShareConfig(customConfig)
    console.log('朋友圈分享配置:', config)
    return {
      title: config.title,
      path: config.path,
      imageUrl: config.imageUrl
    }
  }
}

/**
 * 页面级别的分享配置预设
 */
export const PAGE_SHARE_CONFIGS = {
  // 首页
  index: {
    title: 'kai - 专业服务平台',
    path: '/pages/index/index',
    imageUrl: '/static/logo.png'
  },
  
  // 商城
  // mall: {
  //   title: 'kai商城 - 优质商品推荐',
  //   path: '/pages/mall/mall',
  //   imageUrl: '/static/logo.png'
  // },
  
  // 个人中心
  mine: {
    title: 'kai - 我的个人中心',
    path: '/pages/mine/mine',
    imageUrl: '/static/logo.png'
  },
  
  // 族谱工具
  familyTree: {
    title: '族谱工具 - 记录家族传承',
    path: '/subPackages/tools/family-tree/index',
    imageUrl: '/static/logo.png'
  },
  
  // 二维码生成器
  qrGenerator: {
    title: '二维码生成器 - 快速生成二维码',
    path: '/subPackages/tools/qr-generator/index',
    imageUrl: '/static/logo.png'
  },
  
  // 图片压缩
  imageCompress: {
    title: '图片压缩工具 - 高效压缩图片',
    path: '/subPackages/tools/image-compress/index',
    imageUrl: '/static/logo.png'
  },
  
  // 食谱
  recipe: {
    title: '食谱大全 - 美食制作指南',
    path: '/subPackages/services/recipe/index',
    imageUrl: '/static/logo.png'
  }
}

/**
 * 根据页面类型获取分享配置
 * @param pageType 页面类型
 * @param customConfig 自定义配置
 * @returns 分享配置
 */
export function getPageShareConfig(pageType: keyof typeof PAGE_SHARE_CONFIGS, customConfig: Partial<ShareConfig> = {}): ShareConfig {
  const baseConfig = PAGE_SHARE_CONFIGS[pageType] || PAGE_SHARE_CONFIGS.index
  return getShareConfig({ ...baseConfig, ...customConfig })
}

/**
 * 为页面添加分享功能的组合式函数
 * @param pageType 页面类型
 * @param customConfig 自定义配置
 * @returns 分享方法对象
 */
export function useShare(pageType: keyof typeof PAGE_SHARE_CONFIGS = 'index', customConfig: Partial<ShareConfig> = {}) {
  const shareConfig = getPageShareConfig(pageType, customConfig)
  
  const onShareAppMessage = () => {
    console.log('分享给朋友:', shareConfig)
    return shareConfig
  }
  
  const onShareTimeline = () => {
    console.log('分享到朋友圈:', shareConfig)
    return shareConfig
  }
  
  return {
    onShareAppMessage,
    onShareTimeline,
    shareConfig
  }
}