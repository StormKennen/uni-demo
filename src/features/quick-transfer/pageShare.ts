import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { QuickTransferSharePayload } from './share'

const getShareTimelineQuery = (path: string): string => {
  const queryIndex = path.indexOf('?')
  return queryIndex === -1 ? '' : path.slice(queryIndex + 1)
}

/**
 * 小程序分享生命周期必须注册在页面组件中，不能只依赖 PageLayout 子组件。
 * 动态飞船分享始终从当前页面内存读取，不持久化分享凭证。
 */
export const registerQuickTransferPageShare = (source: MaybeRefOrGetter<QuickTransferSharePayload>): void => {
  // #ifdef MP-WEIXIN
  onShareAppMessage(() => {
    const payload = toValue(source)
    return {
      title: payload.title,
      path: payload.path,
      imageUrl: payload.imageUrl,
    }
  })

  onShareTimeline(() => {
    const payload = toValue(source)
    return {
      title: payload.title,
      query: getShareTimelineQuery(payload.path),
      imageUrl: payload.imageUrl,
    }
  })
  // #endif
}
