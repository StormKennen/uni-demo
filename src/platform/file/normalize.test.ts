import { describe, expect, it } from 'vitest'
import { normalizeFiles } from './normalize'

describe('file selection normalization', () => {
  it('turns WeChat media labels into MIME types inferred from the filename', () => {
    expect(normalizeFiles([{ name: 'photo.jpg', path: '/tmp/photo.jpg', type: 'image' }], 'file')[0]?.type).toBe('image/jpeg')
    expect(normalizeFiles([{ name: 'photo.webp', path: '/tmp/photo.webp', type: 'image' }], 'file')[0]?.type).toBe('image/webp')
    expect(normalizeFiles([{ name: 'report.pdf', path: '/tmp/report.pdf', type: 'file' }], 'file')[0]?.type).toBe('application/pdf')
  })

  it('keeps a valid MIME type supplied by a picker', () => {
    expect(normalizeFiles([{ name: 'photo.png', path: '/tmp/photo.png', type: 'image/png' }], 'file')[0]?.type).toBe('image/png')
  })
})
