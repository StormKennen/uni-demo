import { normalizeFiles, normalizeImageSelection, type RawImageSelection, type RawSelectedFile } from './normalize'
import type { FilePicker } from './types'

interface FileSelectionResult {
  tempFilePaths?: string[]
  tempFiles?: RawSelectedFile[]
}

export const webFilePicker: FilePicker = {
  async pickImage(options = {}) {
    const result = (await uni.chooseImage({
      count: options.count ?? 1,
      sizeType: options.sizeType,
      sourceType: options.sourceType,
    })) as RawImageSelection

    return normalizeImageSelection(result)
  },

  async pickFile(options = {}) {
    const type = options.type === 'file' ? 'all' : options.type
    const result = (await uni.chooseFile({
      count: options.count ?? 1,
      extension: options.extensions,
      type: type ?? 'all',
    })) as FileSelectionResult

    const rawFiles = result.tempFiles || (result.tempFilePaths || []).map(path => ({ path }))
    return normalizeFiles(rawFiles, 'file')
  },
}
