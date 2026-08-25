import mime from 'mime'
import type { SelectedFile } from './types'

export interface RawSelectedFile {
  name?: string
  path?: string
  size?: number
  tempFilePath?: string
  type?: string
  raw?: unknown
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

const isStandardMimeType = (value: string): boolean => /^[^/\s]+\/[^/\s]+$/.test(value)

export const normalizeSelectedFileMimeType = (fileName: string, selectedType?: string): string => {
  const normalizedType = selectedType?.trim().toLowerCase() || ''
  if (isStandardMimeType(normalizedType)) return normalizedType
  return mime.getType(fileName) || 'application/octet-stream'
}

export const normalizeFiles = (files: RawSelectedFile[], fallbackPrefix: string): SelectedFile[] =>
  files.reduce<SelectedFile[]>((selectedFiles, file, index) => {
    const path = file.path || file.tempFilePath || ''
    if (!path && !file.raw) return selectedFiles

    selectedFiles.push({
      name: file.name || fileNameFromPath(path, `${fallbackPrefix}_${index + 1}`),
      path,
      size: file.size,
      type: normalizeSelectedFileMimeType(file.name || fileNameFromPath(path, `${fallbackPrefix}_${index + 1}`), file.type),
      raw: file.raw,
    })
    return selectedFiles
  }, [])

export const normalizeImageSelection = (result: RawImageSelection): SelectedFile[] => {
  const rawFiles = Array.isArray(result.tempFiles) ? result.tempFiles : result.tempFiles ? [result.tempFiles] : []
  const normalized = normalizeFiles(rawFiles, 'image')

  if (normalized.length > 0) return normalized

  return (result.tempFilePaths || []).map((path, index) => ({
    name: fileNameFromPath(path, `image_${index + 1}`),
    path,
  }))
}
