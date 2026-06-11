import type { CipherMetadata, CipherSource } from '../types/index'
import { arrayBufferToDataUrl, dataUrlToArrayBuffer, extractPngMetadataHistory, injectPngMetadataHistory } from './pngMetadata'
import { extractJpegMetadataHistory, injectJpegMetadataHistory } from './jpegMetadata'

declare const wx: any | undefined
declare const uni: any | undefined
declare const plus: any | undefined

const getWxFS = () => (typeof wx !== 'undefined' && wx?.getFileSystemManager ? wx.getFileSystemManager() : null)
const getUniFS = () => (typeof uni !== 'undefined' && uni?.getFileSystemManager ? uni.getFileSystemManager() : null)

const readFileFromFS = async (path: string): Promise<ArrayBuffer | null> => {
  const fs = getWxFS() ?? getUniFS()
  if (fs) {
    return await new Promise((resolve, reject) => {
      fs.readFile({
        filePath: path,
        success: (res: any) => resolve(res.data as ArrayBuffer),
        fail: reject
      })
    })
  }
  if (typeof plus !== 'undefined' && plus?.io) {
    return await plusReadFile(path)
  }
  if (typeof fetch !== 'undefined') {
    const response = await fetch(path)
    return await response.arrayBuffer()
  }
  return null
}

const plusReadFile = async (path: string): Promise<ArrayBuffer | null> => {
  return await new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      path,
      (entry: any) => {
        entry.file(
          (file: any) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as ArrayBuffer)
            reader.onerror = reject
            reader.readAsArrayBuffer(file)
          },
          reject
        )
      },
      reject
    )
  })
}

const writeFileToFS = async (path: string, buffer: ArrayBuffer): Promise<void> => {
  const fs = getWxFS() ?? getUniFS()
  if (fs) {
    await new Promise((resolve, reject) => {
      fs.writeFile({ filePath: path, data: buffer, success: resolve, fail: reject })
    })
    return
  }
  if (typeof plus !== 'undefined' && plus?.io) {
    await plusWriteFile(path, buffer)
  }
}

const plusWriteFile = async (path: string, buffer: ArrayBuffer): Promise<void> => {
  await new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      path,
      (entry: any) => {
        entry.createWriter(
          (writer: any) => {
            writer.onwrite = resolve
            writer.onerror = reject
            writer.seek(0)
            writer.write(buffer)
          },
          reject
        )
      },
      reject
    )
  })
}

const readBufferFromSource = async (source: CipherSource): Promise<ArrayBuffer | null> => {
  if (source.type === 'base64') {
    return dataUrlToArrayBuffer(source.uri)
  }
  if (source.type === 'remote') {
    if (typeof fetch === 'undefined') return null
    const response = await fetch(source.uri)
    return await response.arrayBuffer()
  }
  return await readFileFromFS(source.uri)
}

export interface MetadataInspectionResult {
  status: 'ok' | 'empty-buffer' | 'unsupported-format' | 'no-metadata' | 'error'
  format?: 'png' | 'jpeg'
  size?: number
  head?: number[]
  historyLength?: number
  error?: unknown
}

export const inspectMetadataSource = async (source: CipherSource): Promise<MetadataInspectionResult> => {
  try {
    const buffer = await readBufferFromSource(source)
    if (!buffer) {
      return { status: 'empty-buffer' }
    }
    const format = detectFormat(buffer)
    const size = buffer.byteLength
    const head = Array.from(new Uint8Array(buffer.slice(0, 8)))
    if (!format) {
      return { status: 'unsupported-format', size, head }
    }
    const history =
      format === 'png' ? extractPngMetadataHistory(buffer) : extractJpegMetadataHistory(buffer)
    return {
      status: history?.length ? 'ok' : 'no-metadata',
      format,
      size,
      head,
      historyLength: history?.length ?? 0
    }
  } catch (error) {
    return { status: 'error', error }
  }
}

export const readMetadataHistoryFromSource = async (source: CipherSource): Promise<CipherMetadata[] | null> => {
  try {
    const buffer = await readBufferFromSource(source)
    if (!buffer) {
      console.warn('[TomatoCipher] read metadata history failed: empty buffer', source)
      return null
    }
    const format = detectFormat(buffer)
    if (!format) {
      console.warn('[TomatoCipher] unsupported image format for metadata extraction', {
        uri: source.uri,
        type: source.type
      })
      return null
    }
    const history =
      format === 'png' ? extractPngMetadataHistory(buffer) : extractJpegMetadataHistory(buffer)
    if (!history?.length) {
      const preview = Array.from(new Uint8Array(buffer.slice(0, 8)))
      console.info('[TomatoCipher] no embedded metadata detected in source', {
        uri: source.uri,
        type: source.type,
        format,
        size: buffer.byteLength,
        head: preview
      })
    }
    return history
  } catch (err) {
    console.warn('[TomatoCipher] read metadata history failed', err)
    return null
  }
}

export const writeMetadataHistoryToUri = async (
  uri: string,
  type: 'base64' | 'tempFile',
  history: CipherMetadata[]
): Promise<string> => {
  if (!history.length) return uri
  if (type === 'base64') {
    const mime = getMimeFromDataUrl(uri)
    const buffer = dataUrlToArrayBuffer(uri)
    const patched = injectMetadataHistory(buffer, history)
    return arrayBufferToDataUrl(patched, mime ?? 'image/png')
  }
  const buffer = await readFileFromFS(uri)
  if (!buffer) return uri
  const patched = injectMetadataHistory(buffer, history)
  await writeFileToFS(uri, patched)
  return uri
}

const getMimeFromDataUrl = (dataUrl: string): string | null => {
  const match = /^data:(.*?);/i.exec(dataUrl)
  return match ? match[1] : null
}

const detectFormat = (buffer: ArrayBuffer): 'png' | 'jpeg' | null => {
  const bytes = new Uint8Array(buffer.slice(0, 10))
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png'
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return 'jpeg'
  }
  return null
}

const injectMetadataHistory = (buffer: ArrayBuffer, history: CipherMetadata[]): ArrayBuffer => {
  const format = detectFormat(buffer)
  if (format === 'png') return injectPngMetadataHistory(buffer, history)
  if (format === 'jpeg') return injectJpegMetadataHistory(buffer, history)
  return buffer
}
