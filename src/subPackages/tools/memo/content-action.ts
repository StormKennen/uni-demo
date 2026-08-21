import type { ContentAction } from './content-model'
import { openExternalLink, openMapNavigation } from '@/utils/map'

export interface ContentActionContext {
  previewImage?: (url: string) => void
  scrollToAnchor?: (anchorId: string) => void
  showPopup?: (content: string, isMarkdown?: boolean) => void
}

const showUnsupported = () => uni.showToast({ title: '当前环境不支持此操作', icon: 'none' })

export const executeContentAction = (action: ContentAction | undefined, context: ContentActionContext = {}): void => {
  if (!action || action.type === 'none') return

  if (action.type === 'previewImage') {
    if (action.url && context.previewImage) context.previewImage(action.url)
    return
  }

  if (action.type === 'url') {
    if (action.url) openExternalLink(action.url)
    else uni.showToast({ title: '链接地址为空', icon: 'none' })
    return
  }

  if (action.type === 'miniProgram') {
    let extraData = action.extraData
    if (!extraData && action.extraDataText?.trim()) {
      try {
        const parsed = JSON.parse(action.extraDataText)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) extraData = parsed as Record<string, unknown>
      } catch {
        uni.showToast({ title: 'extraData JSON 格式错误', icon: 'none' })
        return
      }
    }
    // #ifdef MP-WEIXIN
    if (!action.appId) {
      uni.showToast({ title: '小程序 AppId 为空', icon: 'none' })
      return
    }
    uni.navigateToMiniProgram({
      appId: action.appId,
      path: action.path || '',
      envVersion: action.envVersion || 'release',
      extraData,
      fail: () => {
        if (action.fallbackUrl) openExternalLink(action.fallbackUrl)
        else uni.showToast({ title: '小程序打开失败', icon: 'none' })
      },
    })
    // #endif
    // #ifndef MP-WEIXIN
    if (action.fallbackUrl) openExternalLink(action.fallbackUrl)
    else showUnsupported()
    // #endif
    return
  }

  if (action.type === 'memo') {
    if (action.memoId) uni.navigateTo({ url: `/subPackages/tools/memo/detail?id=${encodeURIComponent(action.memoId)}` })
    else uni.showToast({ title: '备忘录 ID 为空', icon: 'none' })
    return
  }

  if (action.type === 'internalPage') {
    if (action.pagePath?.startsWith('/')) uni.navigateTo({ url: action.pagePath })
    else uni.showToast({ title: '内部页面路径无效', icon: 'none' })
    return
  }

  if (action.type === 'navigation') {
    const latitude = Number(action.latitude)
    const longitude = Number(action.longitude)
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      openMapNavigation(latitude, longitude, action.name || action.address || '目的地', action.address)
    } else {
      uni.showToast({ title: '缺少经纬度信息', icon: 'none' })
    }
    return
  }

  if (action.type === 'anchor') {
    if (action.anchorId && context.scrollToAnchor) context.scrollToAnchor(action.anchorId)
    else uni.showToast({ title: '锚点无效', icon: 'none' })
    return
  }

  if (action.type === 'popup') {
    if (context.showPopup) context.showPopup(action.content || '', action.isMarkdown)
    else uni.showModal({ title: '详细内容', content: action.content || '', showCancel: false })
  }
}
