import { isYinheAppEnv } from "@/utilsH5/env"
import { TabsRoutes } from "./const"
import appDsBridge from "@/utilsH5/appDsBridge"

export const hexToRgb = (hex: string) => {
  hex = hex.replace('#', '')
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return [r, g, b]
}

export const opacityColor = (colorHex: string | undefined, opacity: number) => {
  if (!colorHex) {
    return ''
  }
  const rgb = hexToRgb(colorHex)
  const newColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`
  return newColor
}

/**
 * @description 删除整数数字的 .00
 */
export const getPriceInt = (price?: string) => {
  if (!price) return '--'
  const numberPrice = Number(price)
  return numberPrice
}

/** param 解密 */
export const paramToToken = (param: string) => {
  return param.substring(0, 6) + param.substring(12)
}

/** token加密成param给h5使用 (和superApp保持一致)*/
export const tokenToParam = (token: string) => {
  return token ? `${token.substring(0, 6)}bolyFe${token.substring(6)}` : ''
}
/**
 * @description 格式化数字，添加千分位分隔符
 */
export const formatNumberThousand = (num: number | string): string => {
  // 将数字转换为字符串，并按小数点分割为整数部分和小数部分
  const parts = num.toString().split('.');
  // 对整数部分添加千分位分隔符
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // 重新组合整数部分和小数部分
  return parts.join('.');
}

export const hideAllTabBar = () => {
  uni.setTabBarItem({
    index: 0,
    pagePath: '/pages/index/index',
    visible: false
  })
  uni.setTabBarItem({
    index: 1,
    pagePath: '/pages/mine/mine',
    visible: false
  })
}


/**
 * 异步任务并发，取消前面的，只取最后一个
 */
export function lastAsync<T extends any[], R>(func: (...params: T) => Promise<R>) {
  let preAsync: null | ((msg: string) => void) = null
  let queue = 0
  return (...args: T) => {
    if (preAsync) {
      preAsync('取消')
      preAsync = null
    }
    queue++
    return new Promise<R>((resolve, reject) => {
      preAsync = reject
      func(...args)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          queue--
          if (!queue) {
            preAsync = null
          }
        })
    })
  }
}

/**
 * 给函数添加loading，发生错误的时候，弹出提示
 */
export function loadingFetch<T extends any[], R>(func: (...params: T) => Promise<R>, config?: {
  mask?: boolean
  errorTitle?: string
}) {

  const configObj = {
    mask: true,
    errorTitle: '请求错误',
    ...config
  }

  return (...args: T) => {
    return new Promise<R>((resolve, reject) => {
      uni.showLoading({
        mask: configObj.mask
      })
      func(...args)
        .then(res => {
          uni.hideLoading()
          resolve(res)
        })
        .catch(err => {
          console.error(err)
          uni.hideLoading()
          if (typeof err === 'string') {
            uni.showModal({
              title: configObj.errorTitle,
              content: err,
              showCancel: false
            })
          } else {
            uni.showToast({
              title: configObj.errorTitle,
              icon: 'error',
            })
          }
          reject(err)
        })
    })
  }
}

export const gaNavigatorBack = () => {
  console.log('myNavigatorBack')
  // #ifdef WEB
  if (isYinheAppEnv()) {
    appDsBridge.backToAppPreView()
  } else {
    uni.navigateBack()
  }
  // #endif
  // #ifndef WEB
  uni.navigateBack()
  // #endif
}


/**
 * 使用指定前缀，序号递增生成名称
 * @param prefix 前缀
 * @param names 字符串数组
 * @returns boolean
 */
export const getNextNameUsePrefix = (prefix: string, names: string[]) => {
  let maxIndex = 0
  for (const name of names) {
    if (name.startsWith(prefix)) {
      const indexStr = name.substring(prefix.length)
      const index = parseInt(indexStr, 10)
      if (!isNaN(index) && index > maxIndex) {
        maxIndex = index
      }
    }
  }
  return `${prefix}${maxIndex + 1}`
}
