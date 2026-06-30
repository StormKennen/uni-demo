import { getToken, getUserInfo } from '@/utils/storage'

export const isAdminUser = (): boolean => getUserInfo()?.role === 'admin'

/** 登录即可访问；未登录跳登录页（带回跳地址）。 */
export const ensureLoginAccess = (redirectUrl: string): boolean => {
  if (!getToken()) {
    uni.navigateTo({
      url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(redirectUrl)}`,
    })
    return false
  }
  return true
}

/** 当前用户能否管理某阵容：优先用后端 canEdit；兜底用 createdBy 比对 + 管理员。 */
export const canManageLineup = (lineup: { canEdit?: boolean; createdBy?: string | null }): boolean => {
  if (typeof lineup.canEdit === 'boolean') return lineup.canEdit
  if (isAdminUser()) return true
  const myId = getUserInfo()?.id
  return Boolean(myId && lineup.createdBy && lineup.createdBy === myId)
}

export const ensureAdminAccess = (redirectUrl: string): boolean => {
  const token = getToken()

  if (!token) {
    uni.navigateTo({
      url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(redirectUrl)}`,
    })
    return false
  }

  if (!isAdminUser()) {
    uni.showToast({
      title: '仅管理员可访问',
      icon: 'none',
      duration: 1800,
    })

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index',
      })
    }, 500)

    return false
  }

  return true
}
