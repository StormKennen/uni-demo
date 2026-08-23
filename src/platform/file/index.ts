import { webFilePicker } from './web'
import { wechatFilePicker } from './wechat'
import type { FilePicker } from './types'

export type { FilePicker, PickFileOptions, PickImageOptions, SelectedFile } from './types'
export { downloadFileDirect } from './download'
export type { DirectDownloadOptions } from './download'
export { uploadFileDirect } from './upload'
export type { DirectUploadOptions, DirectUploadResult, DirectUploadTask } from './upload'

let platformFilePicker: FilePicker = webFilePicker

// #ifdef MP-WEIXIN
platformFilePicker = wechatFilePicker
// #endif

export const filePicker = platformFilePicker

export const isFilePickerCancel = (error: unknown) => {
  const message = String(
    (error as { errMsg?: string; message?: string })?.errMsg || (error as { message?: string })?.message || error || '',
  )
  return message.toLowerCase().includes('cancel')
}
