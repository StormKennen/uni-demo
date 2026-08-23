export interface BrowserDirectUploadOptions {
  url: string
  fileField: string
  fields: Record<string, string>
  file: Blob
  fileName: string
  onProgress?: (progress: number | null) => void
}

export interface BrowserDirectUploadResult {
  statusCode: number
}

export interface BrowserDirectUploadTask {
  promise: Promise<BrowserDirectUploadResult>
  abort: () => void
}

export const uploadQuickTransferFileInBrowser = (options: BrowserDirectUploadOptions): BrowserDirectUploadTask => {
  const request = new XMLHttpRequest()
  const promise = new Promise<BrowserDirectUploadResult>((resolve, reject) => {
    let settled = false
    const fail = (error: unknown) => {
      if (settled) return
      settled = true
      reject(error)
    }

    request.upload.addEventListener('progress', event => {
      if (event.lengthComputable) options.onProgress?.(Math.round((event.loaded / event.total) * 100))
      else options.onProgress?.(null)
    })
    request.addEventListener('load', () => {
      if (settled) return
      settled = true
      resolve({ statusCode: request.status })
    })
    request.addEventListener('error', () => fail({ code: 'DIRECT_UPLOAD_FAILED', message: '文件上传失败' }))
    request.addEventListener('abort', () => fail({ code: 'DIRECT_UPLOAD_ABORTED', message: '文件上传已取消' }))
    request.open('POST', options.url, true)

    const formData = new FormData()
    Object.entries(options.fields).forEach(([key, value]) => formData.append(key, value))
    formData.append(options.fileField, options.file, options.fileName)
    request.send(formData)
  })
  return { promise, abort: () => request.abort() }
}
