import { describe, expect, it } from 'vitest'
import { normalizeContentAction, normalizeMemoContent, normalizeMemoSettings } from './normalizers'

describe('memo V2 normalizers', () => {
  it('converts legacy text interactions into ContentAction', () => {
    expect(normalizeContentAction({ linkType: 'internal', internalId: 'memo-1' })).toEqual({ type: 'memo', memoId: 'memo-1' })
    expect(normalizeContentAction({ latitude: '23.1', longitude: '113.2', address: '广州' }, 'navigation')).toEqual({
      type: 'navigation',
      latitude: 23.1,
      longitude: 113.2,
      name: '',
      address: '广州',
    })
    expect(normalizeContentAction({ linkType: 'internal', internalScene: 'chat', internalPath: '/subPackages/tools/chat/list' })).toEqual({
      type: 'internalPage',
      pagePath: '/subPackages/tools/chat/list',
    })
  })

  it('keeps legacy popup text as action content', () => {
    const [block] = normalizeMemoContent([{ type: 'text', children: [{ value: '旧弹窗内容', interactionType: 'popup' }] }])
    expect(block?.type).toBe('text')
    if (!block || block.type !== 'text') throw new Error('Expected text block')
    expect(block.children).toEqual([
      { value: '旧弹窗内容', interactionType: 'popup', action: { type: 'popup', content: '旧弹窗内容', isMarkdown: false } },
    ])
  })

  it('normalizes legacy image and media blocks without mutating input', () => {
    const legacy = [
      { type: 'image', layout: { type: 'free' }, children: [{ value: { url: 'https://img.test/a.jpg' } }] },
      { type: 'media', children: [{ url: 'https://cdn.test/a.mp3' }] },
    ]
    const [imageBlock, mediaBlock] = normalizeMemoContent(legacy)
    expect(imageBlock?.type).toBe('image')
    expect(mediaBlock?.type).toBe('media')
    if (!imageBlock || imageBlock.type !== 'image' || !mediaBlock || mediaBlock.type !== 'media')
      throw new Error('Expected image and media blocks')
    expect(imageBlock.layout).toEqual({ type: 'single' })
    expect(imageBlock.children).toEqual([
      {
        value: { url: 'https://img.test/a.jpg' },
        url: 'https://img.test/a.jpg',
        action: { type: 'previewImage', url: 'https://img.test/a.jpg' },
      },
    ])
    expect(mediaBlock.children).toEqual([{ url: 'https://cdn.test/a.mp3', mediaType: 'audio' }])
    expect(legacy[0].layout.type).toBe('free')
  })

  it('upgrades partial settings to editor version 2', () => {
    const result = normalizeMemoSettings({
      padding: { top: 8 },
      appearance: { backgroundColor: '#fff000' },
      features: { enableComments: true },
      romanticEffects: { popupAnimation: 'slide-up' },
      globalAttachment: { enabled: true, url: 'https://docs.test/a' },
      hideNavActions: true,
      showBackToTop: false,
    })
    expect(result.editorVersion).toBe(2)
    expect(result.padding).toEqual({ top: 8, bottom: 32, left: 32, right: 32 })
    expect(result.appearance.backgroundColor).toBe('#fff000')
    expect(result.features.enableComments).toBe(true)
    expect(result.romanticEffects).toEqual({ popupAnimation: 'slide-up', enableGlassBlur: true })
    expect(result.globalAttachment).toEqual({ enabled: true, url: 'https://docs.test/a', title: '查看原始文档' })
    expect(result.hideNavActions).toBe(true)
    expect(result.showBackToTop).toBe(false)
  })
})
