import type { CipherMetadata } from '../types/index'

const JPEG_SOI = 0xffd8
const JPEG_SOS = 0xffda
const JPEG_EOI = 0xffd9
const KEYWORD = 'TomatoCipher:'
const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null
const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null

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

const isJpeg = (data: Uint8Array) => data.length >= 2 && data[0] === 0xff && data[1] === 0xd8

const isMetadataSegment = (segment: Uint8Array): boolean => {
  if (segment.length < 4) return false
  const marker = (segment[0] << 8) | segment[1]
  if (marker !== 0xfffe) return false
  const payload = segment.subarray(4)
  const text = utf8Decode(payload)
  return text.startsWith(KEYWORD)
}

const buildMetadataSegment = (history: CipherMetadata[]): Uint8Array | null => {
  if (!history.length) return null
  const payload: MetadataPackage = { version: 1, history }
  const textBytes = utf8Encode(`${KEYWORD}${JSON.stringify(payload)}`)
  const segment = new Uint8Array(4 + textBytes.length)
  segment[0] = 0xff
  segment[1] = 0xfe
  const length = textBytes.length + 2
  segment[2] = (length >> 8) & 0xff
  segment[3] = length & 0xff
  segment.set(textBytes, 4)
  return segment
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

export const injectJpegMetadataHistory = (buffer: ArrayBuffer, history: CipherMetadata[]): ArrayBuffer => {
  const data = new Uint8Array(buffer)
  if (!isJpeg(data)) return buffer
  const metadataSegment = buildMetadataSegment(history)
  if (!metadataSegment) return buffer
  const parts: Uint8Array[] = []
  parts.push(data.subarray(0, 2)) // SOI
  let offset = 2
  let inserted = false
  while (offset < data.length) {
    if (data[offset] !== 0xff) break
    const marker = (data[offset] << 8) | data[offset + 1]
    if (marker === JPEG_EOI) {
      if (!inserted) parts.push(metadataSegment)
      parts.push(data.subarray(offset))
      inserted = true
      break
    }
    if (marker === JPEG_SOS) {
      if (!inserted) parts.push(metadataSegment)
      parts.push(data.subarray(offset))
      inserted = true
      break
    }
    const length = (data[offset + 2] << 8) | data[offset + 3]
    const segment = data.subarray(offset, offset + 2 + length)
    if (!isMetadataSegment(segment)) {
      parts.push(segment)
    }
    offset += 2 + length
  }
  if (!inserted) {
    parts.push(metadataSegment)
  }
  return concatBuffers(parts)
}

export const extractJpegMetadataHistory = (buffer: ArrayBuffer): CipherMetadata[] | null => {
  const data = new Uint8Array(buffer)
  if (!isJpeg(data)) return null
  let offset = 2
  while (offset < data.length) {
    if (data[offset] !== 0xff) break
    const marker = (data[offset] << 8) | data[offset + 1]
    if (marker === JPEG_SOS || marker === JPEG_EOI) {
      break
    }
    const length = (data[offset + 2] << 8) | data[offset + 3]
    const segment = data.subarray(offset, offset + 2 + length)
    if (isMetadataSegment(segment)) {
      const payload = segment.subarray(4)
      const text = utf8Decode(payload)
      const json = text.slice(KEYWORD.length)
      try {
        const parsed = JSON.parse(json) as MetadataPackage
        if (parsed && Array.isArray(parsed.history)) {
          return parsed.history
        }
      } catch (err) {
        console.warn('[TomatoCipher] parse JPEG metadata failed', err)
      }
    }
    offset += 2 + length
  }
  return null
}
