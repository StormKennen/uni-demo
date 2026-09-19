import { onBeforeUnmount, ref } from 'vue'
import { postPainterGenerateInfo } from '@/services/apifox/NODEJSDEMO/PAINTER/apifox'

export interface DeployedH5PosterExportOptions {
  fileName: string
  posterId: string
  readySelector: string
  selector: string
  targetUrl: string
  deviceScaleFactor?: number
  extraWaitTime?: number
  timeout?: number
  width?: number
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'errMsg' in error && typeof error.errMsg === 'string') return error.errMsg
  return ''
}

const getPosterImageUrl = (posterId: string): string => {
  const baseUrl = String(import.meta.env.VITE_APP_BASE_URL || '').replace(/['"]/g, '')
  if (!baseUrl) throw new Error('图片服务地址未配置')
  return `${baseUrl}/painter/${encodeURIComponent(posterId)}`
}

const getPosterRequestKey = (options: DeployedH5PosterExportOptions): string =>
  [
    options.posterId,
    options.targetUrl,
    options.selector,
    options.readySelector,
    options.width || 375,
    options.deviceScaleFactor || 2,
    options.extraWaitTime || 1500,
    options.timeout || 120000,
  ].join('|')

// #ifdef H5
const downloadPosterForH5 = async (posterId: string, fileName: string): Promise<void> => {
  const response = await fetch(getPosterImageUrl(posterId))
  if (!response.ok) throw new Error(`图片下载失败，状态码: ${response.status}`)
  const objectUrl = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(objectUrl)
}
// #endif

// #ifndef H5
const getPosterImagePath = (imageUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: imageUrl,
      success: result => resolve(result.path),
      fail: () => {
        uni.downloadFile({
          url: imageUrl,
          success: result => {
            if (result.statusCode === 200 && result.tempFilePath) resolve(result.tempFilePath)
            else reject(new Error(`图片下载失败，状态码: ${result.statusCode}`))
          },
          fail: error => reject(error),
        })
      },
    })
  })

const downloadPosterForMp = async (posterId: string): Promise<void> => {
  const filePath = await getPosterImagePath(getPosterImageUrl(posterId))
  await new Promise<void>((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: error => reject(error),
    })
  })
}
// #endif

export function useDeployedH5PosterExport() {
  const exporting = ref(false)
  let preloadTimer: ReturnType<typeof setTimeout> | null = null
  let preparedPoster: { key: string; id: string } | null = null
  const inFlightPosters = new Map<string, Promise<string>>()

  const clearPreloadTimer = () => {
    if (!preloadTimer) return
    clearTimeout(preloadTimer)
    preloadTimer = null
  }

  const generatePoster = async (options: DeployedH5PosterExportOptions): Promise<string> => {
    const result = await postPainterGenerateInfo({
      id: options.posterId,
      targetUrl: options.targetUrl,
      selector: options.selector,
      options: {
        width: options.width || 375,
        deviceScaleFactor: options.deviceScaleFactor || 2,
        readySelector: options.readySelector,
        timeout: options.timeout || 120000,
        extraWaitTime: options.extraWaitTime || 1500,
      },
    })
    if (!result?.id) throw new Error('海报生成失败，服务器未返回图片')
    return result.id
  }

  const ensurePoster = (options: DeployedH5PosterExportOptions): Promise<string> => {
    const key = getPosterRequestKey(options)
    if (preparedPoster?.key === key) return Promise.resolve(preparedPoster.id)

    const pending = inFlightPosters.get(key)
    if (pending) return pending

    const request = generatePoster(options)
      .then(id => {
        preparedPoster = { key, id }
        return id
      })
      .finally(() => {
        inFlightPosters.delete(key)
      })
    inFlightPosters.set(key, request)
    return request
  }

  /** 延迟预热，避免首屏和用户筛选时抢占主线程/网络资源。 */
  const preloadPoster = (options: DeployedH5PosterExportOptions, delay = 1800): void => {
    clearPreloadTimer()
    const key = getPosterRequestKey(options)
    if (preparedPoster?.key === key || inFlightPosters.has(key)) return

    preloadTimer = setTimeout(() => {
      preloadTimer = null
      void ensurePoster(options).catch(() => {
        // 预热失败不打扰用户，点击导出时仍会重新生成并展示错误。
      })
    }, delay)
  }

  const exportPoster = async (options: DeployedH5PosterExportOptions): Promise<void> => {
    if (exporting.value) return
    exporting.value = true

    try {
      const posterId = await ensurePoster(options)

      // #ifdef H5
      await downloadPosterForH5(posterId, options.fileName)
      // #endif
      // #ifndef H5
      await downloadPosterForMp(posterId)
      // #endif
    } finally {
      exporting.value = false
    }
  }

  onBeforeUnmount(clearPreloadTimer)

  return {
    exporting,
    exportPoster,
    preloadPoster,
    cancelPreload: clearPreloadTimer,
    getErrorMessage,
  }
}
