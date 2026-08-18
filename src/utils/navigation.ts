import { TabsRoutes } from './const'

export const DEFAULT_BACK_FALLBACK = '/pages/tools/index'

export interface SafeBackOptions {
  /** 页面栈不足时替换当前页的业务父页面。 */
  fallbackUrl?: string
  /** 正常页面栈返回层级，默认返回一层。 */
  delta?: number
}

interface CurrentPage {
  route?: string
}

const routePath = (url: string): string => {
  const [path] = url.split('?')
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

const getPages = (): CurrentPage[] => {
  if (typeof getCurrentPages !== 'function') return []
  return getCurrentPages()
}

const getCurrentRoute = (): string => {
  const pages = getPages()
  const current = pages[pages.length - 1]
  return current?.route ? routePath(current.route) : ''
}

export const isTabBarRoute = (url: string): boolean => TabsRoutes.includes(routePath(url))

const relaunchTools = (): void => {
  if (getCurrentRoute() === DEFAULT_BACK_FALLBACK) return
  uni.reLaunch({ url: DEFAULT_BACK_FALLBACK })
}

const navigateToFallback = (fallbackUrl: string, isRecovery = false): void => {
  const targetUrl = fallbackUrl || DEFAULT_BACK_FALLBACK
  const targetRoute = routePath(targetUrl)

  if (!targetRoute || getCurrentRoute() === targetRoute) return

  const recover = (): void => {
    if (isRecovery || targetRoute === DEFAULT_BACK_FALLBACK) {
      relaunchTools()
      return
    }
    navigateToFallback(DEFAULT_BACK_FALLBACK, true)
  }

  if (isTabBarRoute(targetUrl)) {
    uni.switchTab({ url: targetUrl, fail: recover })
    return
  }

  uni.redirectTo({ url: targetUrl, fail: recover })
}

/**
 * 返回真实上一页；单页栈（分享、二维码、冷启动等）则替换为业务父页面。
 */
export const safeBack = (options: SafeBackOptions = {}): void => {
  const requestedDelta = Number.isFinite(options.delta) ? Math.floor(options.delta as number) : 1
  const delta = Math.max(1, requestedDelta)
  const fallbackUrl = options.fallbackUrl || DEFAULT_BACK_FALLBACK
  const pages = getPages()

  if (pages.length > delta) {
    uni.navigateBack({ delta, fail: () => navigateToFallback(fallbackUrl) })
    return
  }

  navigateToFallback(fallbackUrl)
}
