import { getToken, getUserInfo } from '@/utils/storage'

export const isAdminUser = (): boolean => getUserInfo()?.role === 'admin'

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
