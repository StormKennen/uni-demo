/**
 * 跨平台地图导航工具
 */

/**
 * 跨平台唤起导航
 * @param latitude - 纬度
 * @param longitude - 经度
 * @param name - 地点名称
 * @param address - 详细地址
 */
export const openMapNavigation = (
  latitude: number,
  longitude: number,
  name: string,
  address?: string
) => {
  // #ifdef MP-WEIXIN
  // 微信小程序端：使用原生地图查看器
  uni.openLocation({
    latitude: Number(latitude),
    longitude: Number(longitude),
    name: name,
    address: address || name,
    success: () => {
      console.log('小程序地图打开成功')
    },
    fail: (err) => {
      console.error('打开地图失败:', err)
      uni.showToast({
        title: '打开地图失败',
        icon: 'none'
      })
    }
  })
  // #endif

  // #ifdef H5
  // H5端：通过腾讯地图移动端链接唤起
  const encodedName = encodeURIComponent(name)
  const encodedAddress = encodeURIComponent(address || name)
  const url = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${latitude},${longitude};title:${encodedName};addr:${encodedAddress}&referer=uni-demo`
  window.location.href = url
  // #endif
}

/**
 * 打开外部链接
 * @param url - 链接地址
 */
export const openExternalLink = (url: string) => {
  if (!url) {
    uni.showToast({
      title: '链接地址为空',
      icon: 'none'
    })
    return
  }

  // 确保URL有协议前缀
  let finalUrl = url
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    finalUrl = 'https://' + url
  }

  // #ifdef MP-WEIXIN
  // 微信小程序：复制链接到剪贴板
  uni.setClipboardData({
    data: finalUrl,
    success: () => {
      uni.showToast({
        title: '链接已复制',
        icon: 'success'
      })
    }
  })
  // #endif

  // #ifdef H5
  // H5端：直接打开链接
  window.open(finalUrl, '_blank')
  // #endif
}
