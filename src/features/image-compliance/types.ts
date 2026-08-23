import type { SelectedFile } from '@/platform/file'

export type ComplianceStep = 'rule' | 'image' | 'crop' | 'processing' | 'result'
export type ComplianceFormat = 'jpeg' | 'png'
export type ComplianceResizeMode = 'cover' | 'contain'

export interface NormalizedCrop {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageComplianceRule {
  id: string
  name: string
  description?: string
  category: string
  targetFormat: ComplianceFormat
  width?: number
  height?: number
  resizeMode: ComplianceResizeMode
  minFileSize?: number
  maxFileSize?: number
  cropEnabled?: boolean
  lockCropRatio?: boolean
  recommended?: boolean
  custom?: boolean
}

export interface ComplianceImageInfo {
  file: SelectedFile
  previewUrl: string
  width: number
  height: number
  fileSize: number
  mimeType: string
  format: ComplianceFormat | string
}

export interface ComplianceCheck {
  actual: string
  expected: string
  passed: boolean
}

export interface ComplianceValidationResult {
  dimensions: ComplianceCheck
  format: ComplianceCheck
  fileSize: ComplianceCheck
  passed: boolean
}

export interface ComplianceImageResult {
  previewUrl: string
  localPath?: string
  mimeType: string
  fileSize: number
  width?: number
  height?: number
}

export interface ComplianceApiResultPayload {
  base64: string
  mimeType?: string
  fileSize?: number
  width?: number
  height?: number
}

export interface ComplianceApiResponse {
  alreadyCompliant: boolean
  original?: {
    fileSize: number
    format: string
    height: number
    mimeType: string
    width: number
  }
  passed: boolean
  reason?: unknown
  result: ComplianceApiResultPayload
}

export interface ComplianceCustomRuleInput {
  width: string
  height: string
  targetFormat: ComplianceFormat
  minFileSizeKb: string
  maxFileSizeKb: string
  resizeMode: ComplianceResizeMode
}
