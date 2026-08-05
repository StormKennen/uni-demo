import { webFilePicker } from './web'
import { wechatFilePicker } from './wechat'
import type { FilePicker } from './types'

export type { FilePicker, PickFileOptions, PickImageOptions, SelectedFile } from './types'

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
