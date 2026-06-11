import type { CipherMetadata } from '../types/index'

declare const Buffer: { from(input: string | ArrayBuffer | Uint8Array, encoding?: string): any } | undefined
declare const atob: (input: string) => string
declare const btoa: (input: string) => string

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
const KEYWORD = 'TomatoCipher'
const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null
const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null
const crcTable = buildCrcTable()

type MetadataPackage = {
  version: 1
  history: CipherMetadata[]
}

const utf8Encode = (input: string): Uint8Array => {
  if (encoder) return encoder.encode(input)
  const encoded = encodeURIComponent(input)
  const bytes: number[] = []
  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === '%') {
      bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16))
      i += 2
    } else {
      bytes.push(encoded.charCodeAt(i))
    }
  }
  return Uint8Array.from(bytes)
}

const utf8Decode = (bytes: Uint8Array): string => {
  if (decoder) return decoder.decode(bytes)
  let encoded = ''
  for (let i = 0; i < bytes.length; i++) {
    const value = bytes[i]
    if (value < 0x80) encoded += String.fromCharCode(value)
    else encoded += `%${value.toString(16).padStart(2, '0')}`
  }
  return decodeURIComponent(encoded)
}

function buildCrcTable() {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
}

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const isPng = (buffer: Uint8Array) => buffer.length >= 8 && PNG_SIGNATURE.every((byte, idx) => buffer[idx] === byte)

const createChunk = (type: string, data: Uint8Array): Uint8Array => {
  const length = data.length
  const chunk = new Uint8Array(12 + length)
  const view = new DataView(chunk.buffer)
  view.setUint32(0, length)
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i)
  }
  chunk.set(data, 8)
  const crc = crc32(chunk.subarray(4, 8 + length))
  view.setUint32(8 + length, crc)
  return chunk
}

const isMetadataChunk = (chunk: Uint8Array): boolean => {
  const type = String.fromCharCode(chunk[4], chunk[5], chunk[6], chunk[7])
  if (type !== 'tEXt') return false
  const data = chunk.subarray(8, chunk.length - 4)
  const nullIndex = data.indexOf(0)
  if (nullIndex < 0) return false
  const keyword = utf8Decode(data.subarray(0, nullIndex))
  return keyword === KEYWORD
}

const buildMetadataChunk = (history: CipherMetadata[]): Uint8Array | null => {
  if (!history.length) return null
  const payload: MetadataPackage = {
    version: 1,
    history
  }
  const keywordBytes = utf8Encode(KEYWORD)
  const valueBytes = utf8Encode(JSON.stringify(payload))
  const data = new Uint8Array(keywordBytes.length + 1 + valueBytes.length)
  data.set(keywordBytes, 0)
  data[keywordBytes.length] = 0
  data.set(valueBytes, keywordBytes.length + 1)
  return createChunk('tEXt', data)
}

const stripMetadataChunk = (buffer: Uint8Array): Uint8Array[] => {
  const chunks: Uint8Array[] = []
  let offset = 8
  while (offset < buffer.length) {
    const view = new DataView(buffer.buffer, buffer.byteOffset + offset)
    const length = view.getUint32(0)
    const total = 12 + length
    const chunk = buffer.subarray(offset, offset + total)
    const type = String.fromCharCode(chunk[4], chunk[5], chunk[6], chunk[7])
    offset += total
    if (type === 'tEXt' && isMetadataChunk(chunk)) continue
    chunks.push(chunk)
    if (type === 'IEND') break
  }
  return chunks
}

const concatBuffers = (parts: Uint8Array[]): ArrayBuffer => {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result.buffer
}

export const injectPngMetadataHistory = (buffer: ArrayBuffer, history: CipherMetadata[]): ArrayBuffer => {
  const data = new Uint8Array(buffer)
  if (!isPng(data)) return buffer
  const chunks = stripMetadataChunk(data)
  const parts: Uint8Array[] = [PNG_SIGNATURE]
  const metadataChunk = buildMetadataChunk(history)
  for (const chunk of chunks) {
    const type = String.fromCharCode(chunk[4], chunk[5], chunk[6], chunk[7])
    if (type === 'IEND' && metadataChunk) {
      parts.push(metadataChunk)
    }
    parts.push(chunk)
  }
  return concatBuffers(parts)
}

export const extractPngMetadataHistory = (buffer: ArrayBuffer): CipherMetadata[] | null => {
  const data = new Uint8Array(buffer)
  if (!isPng(data)) return null
  let offset = 8
  while (offset < data.length) {
    const view = new DataView(data.buffer, data.byteOffset + offset)
    const length = view.getUint32(0)
    const total = 12 + length
    const chunk = data.subarray(offset, offset + total)
    offset += total
    if (isMetadataChunk(chunk)) {
      const payload = chunk.subarray(8, chunk.length - 4)
      const nullIndex = payload.indexOf(0)
      if (nullIndex < 0) continue
      try {
        const json = utf8Decode(payload.subarray(nullIndex + 1))
        const parsed = JSON.parse(json) as MetadataPackage
        if (parsed && parsed.history && Array.isArray(parsed.history)) {
          return parsed.history
        }
      } catch (err) {
        console.warn('[TomatoCipher] parse embedded metadata failed', err)
      }
    }
    const type = String.fromCharCode(chunk[4], chunk[5], chunk[6], chunk[7])
    if (type === 'IEND') break
  }
  return null
}

const base64ToUint8Array = (base64: string): Uint8Array => {
  if (typeof Buffer !== 'undefined' && Buffer) {
    const buf = Buffer.from(base64, 'base64')
    return buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  }
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== 'undefined' && Buffer) {
    return Buffer.from(bytes).toString('base64')
  }
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export const dataUrlToArrayBuffer = (dataUrl: string): ArrayBuffer => {
  const commaIndex = dataUrl.indexOf(',')
  const base64 = dataUrl.slice(commaIndex + 1)
  return base64ToUint8Array(base64).buffer as ArrayBuffer
}

export const arrayBufferToDataUrl = (buffer: ArrayBuffer, mime = 'image/png'): string => {
  const base64 = uint8ArrayToBase64(new Uint8Array(buffer))
  return `data:${mime};base64,${base64}`
}
