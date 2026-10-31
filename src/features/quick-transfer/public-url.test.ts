import { describe, expect, it } from 'vitest'
import {
  buildQuickTransferPublicReceiveUrl,
  isLocalQuickTransferPublicH5BaseUrl,
  isValidQuickTransferPublicH5BaseUrl,
  normalizeQuickTransferPublicH5BaseUrl,
} from './public-url'

describe('quick transfer public H5 URL', () => {
  it('builds a hash-router receiver URL from a configured base', () => {
    const quote = String.fromCharCode(39)
    expect(
      buildQuickTransferPublicReceiveUrl({
        baseUrl: quote + 'https://example.com/#' + quote,
        shareToken: 'share/a',
      }),
    ).toBe('https://example.com/#/subPackages/tools/quick-transfer/receive/index?shareToken=share%2Fa')
    expect(
      buildQuickTransferPublicReceiveUrl({
        baseUrl: 'https://example.com/superAppBridge.html#',
        shareToken: 'share-1',
      }),
    ).toBe('https://example.com/superAppBridge.html#/subPackages/tools/quick-transfer/receive/index?shareToken=share-1')
    expect(
      buildQuickTransferPublicReceiveUrl({
        baseUrl: 'https://liangzhikai.top/#',
        shareToken: 'share-1',
      }),
    ).toBe('https://liangzhikai.top/#/subPackages/tools/quick-transfer/receive/index?shareToken=share-1')
  })

  it('normalizes and validates configured public H5 bases', () => {
    const quote = String.fromCharCode(39)
    expect(normalizeQuickTransferPublicH5BaseUrl(' ' + quote + 'https://example.com/#' + quote + ' ')).toBe('https://example.com/#')
    expect(isValidQuickTransferPublicH5BaseUrl('https://example.com/#')).toBe(true)
    expect(isValidQuickTransferPublicH5BaseUrl('/#/subPackages/tools/quick-transfer/receive/index')).toBe(false)
    expect(isValidQuickTransferPublicH5BaseUrl('undefined/#')).toBe(false)
    expect(isLocalQuickTransferPublicH5BaseUrl('http://localhost:5173/#')).toBe(true)
    expect(isLocalQuickTransferPublicH5BaseUrl('https://example.com/#')).toBe(false)
    expect(buildQuickTransferPublicReceiveUrl({ baseUrl: 'not-a-url', shareToken: 'share-1' })).toBe('')
  })
})
