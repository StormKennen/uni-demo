import type { ImageComplianceRule } from './types'
import { isValidStoredComplianceRule } from './validator'
import { getStorageSync, setStorageSync } from '@/utils/storage'

export const IMAGE_COMPLIANCE_RECENT_RULES = 'IMAGE_COMPLIANCE_RECENT_RULES'
const MAX_RECENT_RULES = 5
const KB = 1024

export const IMAGE_COMPLIANCE_PRESETS: ImageComplianceRule[] = [
  {
    id: 'registration-295-413',
    name: '报名照 · 295×413',
    description: '常见报名材料规格',
    category: '常用场景',
    targetFormat: 'jpeg',
    width: 295,
    height: 413,
    resizeMode: 'cover',
    minFileSize: 20 * KB,
    maxFileSize: 100 * KB,
    cropEnabled: true,
    lockCropRatio: true,
    recommended: true,
  },
  {
    id: 'id-photo-one-inch',
    name: '一寸照 · 常用规格',
    category: '常用场景',
    targetFormat: 'jpeg',
    width: 295,
    height: 413,
    resizeMode: 'cover',
    minFileSize: 20 * KB,
    maxFileSize: 200 * KB,
    cropEnabled: true,
    lockCropRatio: true,
  },
  {
    id: 'id-photo-two-inch',
    name: '二寸照 · 常用规格',
    category: '常用场景',
    targetFormat: 'jpeg',
    width: 413,
    height: 579,
    resizeMode: 'cover',
    minFileSize: 20 * KB,
    maxFileSize: 300 * KB,
    cropEnabled: true,
    lockCropRatio: true,
  },
  {
    id: 'avatar-800',
    name: '头像 · 800×800',
    category: '常用场景',
    targetFormat: 'jpeg',
    width: 800,
    height: 800,
    resizeMode: 'cover',
    maxFileSize: 500 * KB,
    cropEnabled: true,
    lockCropRatio: true,
  },
  {
    id: 'max-100kb',
    name: '压到 100KB 内',
    description: '保持原图尺寸',
    category: '文件大小',
    targetFormat: 'jpeg',
    resizeMode: 'contain',
    maxFileSize: 100 * KB,
  },
  {
    id: 'max-200kb',
    name: '压到 200KB 内',
    description: '保持原图尺寸',
    category: '文件大小',
    targetFormat: 'jpeg',
    resizeMode: 'contain',
    maxFileSize: 200 * KB,
  },
  {
    id: 'max-500kb',
    name: '压到 500KB 内',
    description: '保持原图尺寸',
    category: '文件大小',
    targetFormat: 'jpeg',
    resizeMode: 'contain',
    maxFileSize: 500 * KB,
  },
  {
    id: 'square-1024',
    name: '正方形图片',
    description: '1024×1024 · JPG · 1MB以内',
    category: '其他',
    targetFormat: 'jpeg',
    width: 1024,
    height: 1024,
    resizeMode: 'cover',
    maxFileSize: 1024 * KB,
    cropEnabled: true,
    lockCropRatio: true,
  },
  {
    id: 'jpg-500kb',
    name: '转换成 JPG',
    description: 'JPG · 500KB以内',
    category: '其他',
    targetFormat: 'jpeg',
    resizeMode: 'contain',
    maxFileSize: 500 * KB,
  },
]

export const getCompliancePresets = (): ImageComplianceRule[] => IMAGE_COMPLIANCE_PRESETS.map(rule => ({ ...rule }))

export const getRecentComplianceRules = (): ImageComplianceRule[] => {
  const stored = getStorageSync(IMAGE_COMPLIANCE_RECENT_RULES)
  return Array.isArray(stored) ? stored.filter(isValidStoredComplianceRule).slice(0, MAX_RECENT_RULES) : []
}

export const saveRecentComplianceRule = (rule: ImageComplianceRule): ImageComplianceRule[] => {
  const recent = getRecentComplianceRules().filter(item => item.id !== rule.id)
  const next = [{ ...rule }, ...recent].slice(0, MAX_RECENT_RULES)
  setStorageSync(IMAGE_COMPLIANCE_RECENT_RULES, next)
  return next
}
