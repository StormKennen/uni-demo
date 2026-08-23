import { describe, expect, it } from 'vitest'
import { calculateNormalizedCrop, requiresComplianceCrop } from './crop'
import { parseComplianceBase64 } from './result-adapter'
import { createCustomComplianceRule, isValidStoredComplianceRule, normalizeImageFormat, validateCompliance } from './validator'

describe('image compliance validator', () => {
  it('normalizes jpg as jpeg', () => {
    expect(normalizeImageFormat('image/jpg')).toBe('jpeg')
    expect(normalizeImageFormat('.JPEG')).toBe('jpeg')
  })

  it('requires every configured target to pass', () => {
    const result = validateCompliance(
      { width: 295, height: 413, fileSize: 80 * 1024, format: 'png', mimeType: 'image/png' },
      {
        id: 'test',
        name: 'test',
        category: 'test',
        targetFormat: 'jpeg',
        width: 295,
        height: 413,
        minFileSize: 20 * 1024,
        maxFileSize: 100 * 1024,
        resizeMode: 'cover',
      },
    )

    expect(result.dimensions.passed).toBe(true)
    expect(result.format.passed).toBe(false)
    expect(result.fileSize.passed).toBe(true)
    expect(result.passed).toBe(false)
  })

  it('rejects incomplete dimensions in custom rules', () => {
    expect(() =>
      createCustomComplianceRule({
        width: '295',
        height: '',
        targetFormat: 'jpeg',
        minFileSizeKb: '',
        maxFileSizeKb: '100',
        resizeMode: 'cover',
      }),
    ).toThrow('宽和高需要同时填写')
  })

  it('allows format-only custom rules', () => {
    expect(
      createCustomComplianceRule({
        width: '',
        height: '',
        targetFormat: 'jpeg',
        minFileSizeKb: '',
        maxFileSizeKb: '',
        resizeMode: 'contain',
      }),
    ).toMatchObject({ targetFormat: 'jpeg', width: undefined, height: undefined })
  })

  it('keeps original dimensions when a rule omits an explicit target size', () => {
    const result = validateCompliance(
      { width: 800, height: 599, fileSize: 80 * 1024, format: 'jpeg', mimeType: 'image/jpeg' },
      {
        id: 'max-100kb',
        name: 'max 100kb',
        category: 'test',
        targetFormat: 'jpeg',
        maxFileSize: 100 * 1024,
        resizeMode: 'contain',
      },
      { width: 800, height: 600 },
    )

    expect(result.dimensions).toMatchObject({ passed: false, expected: '800 × 600 px' })
    expect(result.passed).toBe(false)
  })

  it('calculates centered normalized crop coordinates', () => {
    expect(
      calculateNormalizedCrop({ frameWidth: 300, frameHeight: 400, imageWidth: 600, imageHeight: 400, offsetX: 0, offsetY: 0 }),
    ).toEqual({ x: 0.25, y: 0, width: 0.5, height: 1 })
  })

  it('only opens the cropper when source and target ratios differ', () => {
    expect(requiresComplianceCrop(590, 826, 295, 413)).toBe(false)
    expect(requiresComplianceCrop(800, 600, 295, 413)).toBe(true)
  })

  it('reflects image drag in normalized crop coordinates', () => {
    expect(
      calculateNormalizedCrop({ frameWidth: 300, frameHeight: 400, imageWidth: 600, imageHeight: 400, offsetX: -60, offsetY: 0 }),
    ).toEqual({ x: 0.35, y: 0, width: 0.5, height: 1 })
  })

  it('keeps crop bounds inside the normalized source image', () => {
    expect(
      calculateNormalizedCrop({ frameWidth: 300, frameHeight: 300, imageWidth: 600, imageHeight: 600, offsetX: -600, offsetY: 600 }),
    ).toEqual({ x: 0.5, y: 0, width: 0.5, height: 0.5 })
  })

  it('parses data URLs and removes base64 whitespace', () => {
    expect(parseComplianceBase64('data:image/png;base64, iVBO\nRw==')).toEqual({
      base64: 'iVBORw==',
      extension: 'png',
      fileSize: 4,
      mimeType: 'image/png',
    })
  })

  it('rejects malformed or unsupported result payloads', () => {
    expect(() => parseComplianceBase64('not-base64!')).toThrow('图片数据无效')
    expect(() => parseComplianceBase64('UklGRg==', 'image/webp')).toThrow('JPG 或 PNG')
    expect(() => parseComplianceBase64('iVBORw==', 'image/jpeg')).toThrow('格式与图片内容不一致')
  })

  it('drops malformed recent rules from storage', () => {
    expect(
      isValidStoredComplianceRule({
        id: 'valid',
        name: 'valid',
        category: 'test',
        targetFormat: 'jpeg',
        resizeMode: 'contain',
        maxFileSize: 1024,
      }),
    ).toBe(true)
    expect(
      isValidStoredComplianceRule({
        id: 'invalid',
        name: 'invalid',
        category: 'test',
        targetFormat: 'jpeg',
        resizeMode: 'cover',
        width: -1,
        height: 100,
      }),
    ).toBe(false)
  })
})
