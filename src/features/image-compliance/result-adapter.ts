import type { ComplianceApiResultPayload, ComplianceImageResult } from './types'

const MAX_RESULT_SIZE = 2 * 1024 * 1024

declare const wx: {
  env: { USER_DATA_PATH: string }
  getFileSystemManager(): {
    writeFile(options: { data: string; encoding: 'base64'; filePath: string; success: () => void; fail: (error: unknown) => void }): void
    unlink(options: { filePath: string; complete: () => void }): void
  }
}

interface ParsedComplianceBase64 {
  base64: string
  extension: 'jpg' | 'png'
  fileSize: number
  mimeType: 'image/jpeg' | 'image/png'
}

const stripDataUrlPrefix = (base64: string): string => base64.replace(/^data:[^;]+;base64,/i, '')

const estimateBase64Size = (base64: string): number => {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding)
}

const normalizeSupportedMimeType = (mimeType?: string): ParsedComplianceBase64['mimeType'] | undefined => {
  const normalized = mimeType?.toLowerCase()
  if (normalized === 'image/jpeg' || normalized === 'image/jpg' || normalized === 'jpeg' || normalized === 'jpg') return 'image/jpeg'
  if (normalized === 'image/png' || normalized === 'png') return 'image/png'
  return undefined
}

export const parseComplianceBase64 = (value: string, fallbackMimeType?: string): ParsedComplianceBase64 => {
  const dataUrlMimeType = value.match(/^data:([^;]+);base64,/i)?.[1]
  const base64 = stripDataUrlPrefix(value).replace(/\s/g, '')
  if (!base64 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) {
    throw new Error('服务端返回的图片数据无效')
  }

  const detectedMimeType = base64.startsWith('/9j/') ? 'image/jpeg' : base64.startsWith('iVBOR') ? 'image/png' : undefined
  const declaredMimeType = normalizeSupportedMimeType(dataUrlMimeType) || normalizeSupportedMimeType(fallbackMimeType)
  if (!detectedMimeType) throw new Error('处理结果不是支持的 JPG 或 PNG 图片')
  if (declaredMimeType && declaredMimeType !== detectedMimeType) throw new Error('处理结果格式与图片内容不一致')
  const mimeType = detectedMimeType

  return {
    base64,
    extension: mimeType === 'image/png' ? 'png' : 'jpg',
    fileSize: estimateBase64Size(base64),
    mimeType,
  }
}

export const createComplianceImageResult = async (payload: ComplianceApiResultPayload): Promise<ComplianceImageResult> => {
  const { base64, extension, fileSize, mimeType } = parseComplianceBase64(payload.base64, payload.mimeType)
  if (fileSize > MAX_RESULT_SIZE) throw new Error('处理结果超过 2MB，无法生成预览')
  const result: ComplianceImageResult = {
    previewUrl: '',
    localPath: undefined,
    mimeType,
    fileSize,
    width: payload.width,
    height: payload.height,
  }

  // #ifdef H5
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  result.previewUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }))
  // #endif

  // #ifdef MP-WEIXIN
  result.localPath = `${wx.env.USER_DATA_PATH}/image-compliance-${Date.now()}.${extension}`
  await new Promise<void>((resolve, reject) => {
    wx.getFileSystemManager().writeFile({
      data: base64,
      encoding: 'base64',
      filePath: result.localPath as string,
      success: () => resolve(),
      fail: reject,
    })
  })
  result.previewUrl = result.localPath
  // #endif

  if (!result.previewUrl) throw new Error('当前平台无法生成结果预览')
  return result
}

export const releaseComplianceImageResult = async (result?: ComplianceImageResult): Promise<void> => {
  if (!result) return

  // #ifdef H5
  if (result.previewUrl.startsWith('blob:')) URL.revokeObjectURL(result.previewUrl)
  // #endif

  // #ifdef MP-WEIXIN
  if (result.localPath) {
    await new Promise<void>(resolve => {
      wx.getFileSystemManager().unlink({ filePath: result.localPath as string, complete: () => resolve() })
    })
  }
  // #endif
}

export const readResultImageInfo = (src: string): Promise<{ width: number; height: number; type?: string }> =>
  new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: info => resolve({ width: info.width, height: info.height, type: info.type }),
      fail: reject,
    })
  })
