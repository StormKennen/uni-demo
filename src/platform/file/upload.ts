import type { SelectedFile } from './types'
import { uploadQuickTransferFileInBrowser } from '@/utilsH5/quick-transfer-upload'

export interface DirectUploadOptions {
  file: SelectedFile
  url: string
  fileField: string
  fields: Record<string, string>
  onProgress?: (progress: number | null) => void
}

export interface DirectUploadResult {
  statusCode: number
}

export interface DirectUploadTask {
  promise: Promise<DirectUploadResult>
  abort: () => void
}

const getBrowserBlob = (file: SelectedFile): Blob => {
  if (file.raw && typeof file.raw === 'object') return file.raw as Blob
  throw new Error('H5 文件内容不可用，请重新选择文件')
}

export const uploadFileDirect = (options: DirectUploadOptions): DirectUploadTask => {
  // #ifdef H5
  const task = uploadQuickTransferFileInBrowser({
    url: options.url,
    fileField: options.fileField,
    fields: options.fields,
    file: getBrowserBlob(options.file),
    fileName: options.file.name,
    onProgress: options.onProgress,
  })
  return { promise: task.promise, abort: task.abort }
  // #endif

  // #ifndef H5
  let uploadTask: UniApp.UploadTask | null = null
  const promise = new Promise<DirectUploadResult>((resolve, reject) => {
    uploadTask = uni.uploadFile({
      url: options.url,
      filePath: options.file.path,
      name: options.fileField,
      formData: options.fields,
      success: result => resolve({ statusCode: result.statusCode }),
      fail: reject,
    })
    uploadTask.onProgressUpdate?.(result => options.onProgress?.(result.progress))
  })
  return { promise, abort: () => uploadTask?.abort() }
  // #endif
}
