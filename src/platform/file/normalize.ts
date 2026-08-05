import type { SelectedFile } from './types'

export interface RawSelectedFile {
  name?: string
  path?: string
  size?: number
  tempFilePath?: string
  type?: string
}

export interface RawImageSelection {
  tempFilePaths?: string[]
  tempFiles?: RawSelectedFile[] | RawSelectedFile
}

const fileNameFromPath = (path: string, fallback: string) => {
  const cleanPath = path.split(/[?#]/, 1)[0]
  const name = cleanPath.split('/').filter(Boolean).pop()
  return name ? decodeURIComponent(name) : fallback
}

export const normalizeFiles = (files: RawSelectedFile[], fallbackPrefix: string): SelectedFile[] =>
  files
    .map((file, index) => {
      const path = file.path || file.tempFilePath || ''
      if (!path) return null

      return {
        name: file.name || fileNameFromPath(path, `${fallbackPrefix}_${index + 1}`),
        path,
        size: file.size,
        type: file.type,
      }
    })
    .filter((file): file is SelectedFile => file !== null)

export const normalizeImageSelection = (result: RawImageSelection): SelectedFile[] => {
  const rawFiles = Array.isArray(result.tempFiles) ? result.tempFiles : result.tempFiles ? [result.tempFiles] : []
  const normalized = normalizeFiles(rawFiles, 'image')

  if (normalized.length > 0) return normalized

  return (result.tempFilePaths || []).map((path, index) => ({
    name: fileNameFromPath(path, `image_${index + 1}`),
    path,
  }))
}
