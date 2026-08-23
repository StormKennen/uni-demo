import { openQuickTransferBrowserDownload } from '@/utilsH5/quick-transfer-download'

export interface DirectDownloadOptions {
  url: string
  fileName: string
  mimeType: string
}

export const downloadFileDirect = (options: DirectDownloadOptions): Promise<boolean> => {
  // #ifdef H5
  return Promise.resolve(openQuickTransferBrowserDownload(options.url, options.fileName))
  // #endif

  // #ifdef MP-WEIXIN
  return new Promise(resolve => {
    uni.downloadFile({
      url: options.url,
      success: result => {
        if (result.statusCode !== 200) {
          resolve(false)
          return
        }

        if (options.mimeType.startsWith('image/')) {
          uni.previewImage({ urls: [result.tempFilePath], success: () => resolve(true), fail: () => resolve(false) })
          return
        }

        if (
          options.mimeType === 'application/pdf' ||
          options.mimeType.includes('officedocument') ||
          options.mimeType.includes('msword') ||
          options.mimeType.includes('spreadsheet') ||
          options.mimeType.includes('presentation')
        ) {
          uni.openDocument({
            filePath: result.tempFilePath,
            showMenu: true,
            success: () => resolve(true),
            fail: () => resolve(false),
          })
          return
        }

        uni.showToast({ title: '文件已准备，可在微信中打开', icon: 'none' })
        resolve(true)
      },
      fail: () => resolve(false),
    })
  })
  // #endif

  return Promise.resolve(false)
}
