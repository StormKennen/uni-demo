import type {
  ComplianceCustomRuleInput,
  ComplianceFormat,
  ComplianceImageInfo,
  ComplianceValidationResult,
  ImageComplianceRule,
} from './types'

const KB = 1024

const isPositiveIntegerOrUndefined = (value: unknown): boolean =>
  value === undefined || (typeof value === 'number' && Number.isInteger(value) && value > 0)

export const isValidStoredComplianceRule = (value: unknown): value is ImageComplianceRule => {
  if (!value || typeof value !== 'object') return false
  const rule = value as Partial<ImageComplianceRule>
  const hasPairedDimensions = (rule.width === undefined) === (rule.height === undefined)
  const hasValidFileSizeRange =
    isPositiveIntegerOrUndefined(rule.minFileSize) &&
    isPositiveIntegerOrUndefined(rule.maxFileSize) &&
    (rule.minFileSize === undefined || rule.maxFileSize === undefined || rule.minFileSize <= rule.maxFileSize)
  return (
    typeof rule.id === 'string' &&
    rule.id.length > 0 &&
    typeof rule.name === 'string' &&
    rule.name.length > 0 &&
    typeof rule.category === 'string' &&
    (rule.targetFormat === 'jpeg' || rule.targetFormat === 'png') &&
    (rule.resizeMode === 'cover' || rule.resizeMode === 'contain') &&
    hasPairedDimensions &&
    isPositiveIntegerOrUndefined(rule.width) &&
    isPositiveIntegerOrUndefined(rule.height) &&
    hasValidFileSizeRange
  )
}

export const normalizeImageFormat = (format: string): ComplianceFormat | string => {
  const normalized = format.toLowerCase().replace('image/', '').replace('.', '')
  return normalized === 'jpg' || normalized === 'jpeg' ? 'jpeg' : normalized
}

export const formatComplianceFileSize = (bytes?: number): string => {
  if (bytes === undefined || !Number.isFinite(bytes)) return '未读取'
  if (bytes < KB) return `${Math.round(bytes)} B`
  if (bytes < KB * KB) return `${(bytes / KB).toFixed(bytes >= 10 * KB ? 0 : 1)} KB`
  return `${(bytes / KB / KB).toFixed(2)} MB`
}

export const formatRuleDimensions = (rule: ImageComplianceRule): string =>
  rule.width && rule.height ? `${rule.width} × ${rule.height} px` : '保持原图尺寸'

export const formatRuleFileSize = (rule: ImageComplianceRule): string => {
  if (rule.minFileSize !== undefined && rule.maxFileSize !== undefined) {
    return `${formatComplianceFileSize(rule.minFileSize)} ～ ${formatComplianceFileSize(rule.maxFileSize)}`
  }
  if (rule.maxFileSize !== undefined) return `不超过 ${formatComplianceFileSize(rule.maxFileSize)}`
  if (rule.minFileSize !== undefined) return `不少于 ${formatComplianceFileSize(rule.minFileSize)}`
  return '不限制'
}

export const validateCompliance = (
  image: Pick<ComplianceImageInfo, 'width' | 'height' | 'fileSize' | 'format' | 'mimeType'>,
  rule: ImageComplianceRule,
  originalDimensions?: Pick<ComplianceImageInfo, 'width' | 'height'>,
): ComplianceValidationResult => {
  const actualFormat = normalizeImageFormat(image.format || image.mimeType)
  const expectedWidth = rule.width ?? originalDimensions?.width
  const expectedHeight = rule.height ?? originalDimensions?.height
  const dimensionsPassed = !expectedWidth || !expectedHeight || (image.width === expectedWidth && image.height === expectedHeight)
  const expectedDimensions = expectedWidth && expectedHeight ? `${expectedWidth} × ${expectedHeight} px` : formatRuleDimensions(rule)
  const formatPassed = actualFormat === rule.targetFormat
  const minPassed = rule.minFileSize === undefined || image.fileSize >= rule.minFileSize
  const maxPassed = rule.maxFileSize === undefined || image.fileSize <= rule.maxFileSize
  const fileSizePassed = minPassed && maxPassed

  return {
    dimensions: {
      actual: `${image.width} × ${image.height} px`,
      expected: expectedDimensions,
      passed: dimensionsPassed,
    },
    format: {
      actual: actualFormat === 'jpeg' ? 'JPG' : actualFormat.toUpperCase(),
      expected: rule.targetFormat === 'jpeg' ? 'JPG' : 'PNG',
      passed: formatPassed,
    },
    fileSize: {
      actual: formatComplianceFileSize(image.fileSize),
      expected: formatRuleFileSize(rule),
      passed: fileSizePassed,
    },
    passed: dimensionsPassed && formatPassed && fileSizePassed,
  }
}

const parsePositiveInteger = (value: string): number | undefined => {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export const createCustomComplianceRule = (input: ComplianceCustomRuleInput): ImageComplianceRule => {
  const width = parsePositiveInteger(input.width)
  const height = parsePositiveInteger(input.height)
  if ((width && !height) || (!width && height)) throw new Error('宽和高需要同时填写')
  if ((input.width && !width) || (input.height && !height)) throw new Error('请输入有效的宽高')

  const minKb = parsePositiveInteger(input.minFileSizeKb)
  const maxKb = parsePositiveInteger(input.maxFileSizeKb)
  if ((input.minFileSizeKb && !minKb) || (input.maxFileSizeKb && !maxKb)) throw new Error('请输入有效的文件大小')
  if (minKb && maxKb && minKb > maxKb) throw new Error('最小文件大小不能大于最大值')
  const parts = [width && height ? `${width}×${height}` : '', input.targetFormat === 'jpeg' ? 'JPG' : 'PNG', maxKb ? `${maxKb}KB以内` : '']
    .filter(Boolean)
    .join(' · ')

  return {
    id: `custom-${width || 'auto'}-${height || 'auto'}-${input.targetFormat}-${minKb || 0}-${maxKb || 0}-${input.resizeMode}`,
    name: parts || '自定义规格',
    category: '自定义',
    targetFormat: input.targetFormat,
    width,
    height,
    resizeMode: input.resizeMode,
    minFileSize: minKb ? minKb * KB : undefined,
    maxFileSize: maxKb ? maxKb * KB : undefined,
    cropEnabled: Boolean(width && height && input.resizeMode === 'cover'),
    lockCropRatio: Boolean(width && height),
    custom: true,
  }
}
