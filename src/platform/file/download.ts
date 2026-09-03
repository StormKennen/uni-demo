import { openQuickTransferBrowserDownload } from '@/utilsH5/quick-transfer-download'

export type FileOperationCode = 'DOWNLOAD_FAILED' | 'PREVIEW_FAILED' | 'SAVE_FAILED' | 'FILE_ACCESS_FAILED'

export interface DirectDownloadOptions {
  url: string
  fileName: string
  mimeType: string
  fileId?: string
}

export interface LocalFile {
  path: string
  isRemote: boolean
  expiresAt?: string
}

export class FileOperationError extends Error {
  readonly code: FileOperationCode
  readonly statusCode?: number
  readonly errMsg?: string

  constructor(code: FileOperationCode, message: string, details: { statusCode?: number; errMsg?: string } = {}) {
    super(message)
    this.name = 'FileOperationError'
    this.code = code
    this.statusCode = details.statusCode
    this.errMsg = details.errMsg
  }
}

const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return String(error || '')
  const candidate = error as { errMsg?: unknown; message?: unknown }
  return typeof candidate.errMsg === 'string' ? candidate.errMsg : typeof candidate.message === 'string' ? candidate.message : ''
}

export const logFileOperationFailure = (
  code: FileOperationCode,
  options: Pick<DirectDownloadOptions, 'fileId' | 'mimeType'>,
  details: { statusCode?: number; errMsg?: string },
): void => {
  if (!import.meta.env.DEV) return
  console.warn('[QuickTransfer file]', {
    code,
    fileId: options.fileId || '',
    mimeType: options.mimeType,
    statusCode: details.statusCode,
    errMsg: details.errMsg || '',
  })
}

export const downloadFileToLocal = (options: DirectDownloadOptions, expiresAt = ''): Promise<LocalFile> => {
  // #ifdef H5
  return Promise.resolve({ path: options.url, isRemote: true, expiresAt })
  // #endif

  // #ifdef MP-WEIXIN
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url: options.url,
      success: result => {
        if (result.statusCode !== 200) {
          const details = { statusCode: result.statusCode, errMsg: `downloadFile statusCode=${result.statusCode}` }
          logFileOperationFailure('DOWNLOAD_FAILED', options, details)
          reject(new FileOperationError('DOWNLOAD_FAILED', '文件下载失败，请稍后重试', details))
          return
        }
        if (!result.tempFilePath) {
          const details = { statusCode: result.statusCode, errMsg: 'downloadFile missing tempFilePath' }
          logFileOperationFailure('DOWNLOAD_FAILED', options, details)
          reject(new FileOperationError('DOWNLOAD_FAILED', '文件下载失败，请稍后重试', details))
          return
        }
        resolve({ path: result.tempFilePath, isRemote: false, expiresAt })
      },
      fail: error => {
        const details = { errMsg: getErrorMessage(error) }
        logFileOperationFailure('DOWNLOAD_FAILED', options, details)
        reject(new FileOperationError('DOWNLOAD_FAILED', '文件下载失败，请稍后重试', details))
      },
    })
  })
  // #endif

  return Promise.reject(new FileOperationError('DOWNLOAD_FAILED', '当前平台不支持文件下载'))
}

export const previewLocalImage = (file: LocalFile, options: Pick<DirectDownloadOptions, 'fileId' | 'mimeType'>): Promise<boolean> => {
  // #ifdef H5
  return Promise.resolve(Boolean(file.path))
  // #endif

  // #ifdef MP-WEIXIN
  return new Promise(resolve => {
    uni.previewImage({
      urls: [file.path],
      success: () => resolve(true),
      fail: error => {
        const details = { errMsg: getErrorMessage(error) }
        logFileOperationFailure('PREVIEW_FAILED', options, details)
        resolve(false)
      },
    })
  })
  // #endif

  return Promise.resolve(false)
}

export const saveLocalFile = (file: LocalFile, options: DirectDownloadOptions): Promise<boolean> => {
  // #ifdef H5
  return Promise.resolve(openQuickTransferBrowserDownload(file.path, options.fileName))
  // #endif

  // #ifdef MP-WEIXIN
  return new Promise(resolve => {
    const onFail = (error: unknown) => {
      const details = { errMsg: getErrorMessage(error) }
      logFileOperationFailure('SAVE_FAILED', options, details)
      resolve(false)
    }
    if (options.mimeType.startsWith('image/')) {
      uni.saveImageToPhotosAlbum({ filePath: file.path, success: () => resolve(true), fail: onFail })
      return
    }
    uni.saveFile({ tempFilePath: file.path, success: () => resolve(true), fail: onFail })
  })
  // #endif

  return Promise.resolve(false)
}

export const downloadFileDirect = async (options: DirectDownloadOptions): Promise<boolean> => {
  try {
    const file = await downloadFileToLocal(options)
    return await saveLocalFile(file, options)
  } catch (error) {
    if (error instanceof FileOperationError) return false
    const details = { errMsg: getErrorMessage(error) }
    logFileOperationFailure('DOWNLOAD_FAILED', options, details)
    return false
  }
}
