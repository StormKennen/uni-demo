import { normalizeFiles } from './normalize'
import type { FilePicker } from './types'

interface MediaSelectionResult {
  tempFiles?: Array<{
    fileType?: string
    size?: number
    tempFilePath: string
  }>
}

interface MessageFileSelectionResult {
  tempFiles?: Array<{
    name?: string
    path: string
    size?: number
    type?: string
  }>
}

export const wechatFilePicker: FilePicker = {
  async pickImage(options = {}) {
    const result = (await uni.chooseMedia({
      count: options.count ?? 1,
      mediaType: ['image'],
      sizeType: options.sizeType,
      sourceType: options.sourceType,
    })) as MediaSelectionResult

    return normalizeFiles(
      (result.tempFiles || []).map(file => ({
        path: file.tempFilePath,
        size: file.size,
        type: file.fileType,
      })),
      'image',
    )
  },

  async pickFile(options = {}) {
    const result = (await uni.chooseMessageFile({
      count: options.count ?? 1,
      extension: options.extensions,
      type: options.type ?? 'all',
    })) as MessageFileSelectionResult

    return normalizeFiles(result.tempFiles || [], 'file')
  },
}
