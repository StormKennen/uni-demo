import type { ComplianceApiResponse, ComplianceApiResultPayload, ImageComplianceRule, NormalizedCrop } from './types'
import http from '@/services/http'
import type { SelectedFile } from '@/platform/file'

interface RawComplianceResponse {
  alreadyCompliant?: boolean
  original?: ComplianceApiResponse['original']
  passed?: boolean
  reason?: unknown
  result?: string | ComplianceApiResultPayload
  base64?: string
  mimeType?: string
  fileSize?: number
  width?: number
  height?: number
}

const compactFormData = (rule: ImageComplianceRule, crop?: NormalizedCrop): Record<string, string> => {
  const fields: Record<string, string> = {
    targetFormat: rule.targetFormat,
    resizeMode: rule.resizeMode,
  }
  if (rule.width !== undefined) fields.width = String(rule.width)
  if (rule.height !== undefined) fields.height = String(rule.height)
  if (rule.minFileSize !== undefined) fields.minFileSize = String(rule.minFileSize)
  if (rule.maxFileSize !== undefined) fields.maxFileSize = String(rule.maxFileSize)
  if (crop) fields.crop = JSON.stringify(crop)
  return fields
}

const normalizeApiResponse = (response: RawComplianceResponse, rule: ImageComplianceRule): ComplianceApiResponse => {
  const result = response.result
  const payload = typeof result === 'string' ? { base64: result } : result || { base64: response.base64 || '' }
  if (!payload.base64) throw new Error('服务端未返回处理后的图片')

  return {
    alreadyCompliant: Boolean(response.alreadyCompliant),
    original: response.original,
    passed: Boolean(response.passed),
    reason: response.reason,
    result: {
      base64: payload.base64,
      mimeType: payload.mimeType || response.mimeType || `image/${rule.targetFormat}`,
      fileSize: payload.fileSize ?? response.fileSize,
      width: payload.width ?? response.width,
      height: payload.height ?? response.height,
    },
  }
}

export const processImageCompliance = async (
  file: SelectedFile,
  rule: ImageComplianceRule,
  crop?: NormalizedCrop,
): Promise<ComplianceApiResponse> => {
  const response = await http.upload<RawComplianceResponse>('/image-tools/compliance', {
    filePath: file.path,
    name: 'image',
    formData: compactFormData(rule, crop),
  })
  return normalizeApiResponse(response, rule)
}
