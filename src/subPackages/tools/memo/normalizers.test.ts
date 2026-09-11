import { describe, expect, it } from 'vitest'
import { normalizeContentAction, normalizeMemoContent, normalizeMemoSettings, parseRouteNodes } from './normalizers'

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

  it('keeps route travel fields and converts coordinate strings', () => {
    const nodes = parseRouteNodes([
      {
        name: '双桥沟',
        time: '3h',
        startTime: '09:30',
        duration: '4h',
        address: '四川省阿坝州小金县',
        latitude: '31.135',
        longitude: 102.309,
        icon: '🚗',
      },
    ])
    expect(nodes[0]).toMatchObject({
      name: '双桥沟',
      time: '3h',
      startTime: '09:30',
      duration: '4h',
      address: '四川省阿坝州小金县',
      latitude: 31.135,
      longitude: 102.309,
    })
  })

  it('normalizes ordered and priority list blocks without changing item order', () => {
    const source = [
      {
        type: 'list',
        mode: 'priority',
        children: [
          { text: '酒店', priority: 'P1', desc: '今天完成' },
          { text: '机场', priority: 'P0' },
          { text: '氧气瓶', priority: 'P2' },
          { text: '机位', priority: 'P3' },
        ],
      },
    ]
    const [block] = normalizeMemoContent(source)
    expect(block).toMatchObject({ type: 'list', mode: 'priority', sortMode: 'manual' })
    if (!block || block.type !== 'list') throw new Error('Expected list block')
    expect(block.children).toEqual([
      { text: '酒店', priority: 'P1', desc: '今天完成' },
      { text: '机场', priority: 'P0' },
      { text: '氧气瓶', priority: 'P2' },
      { text: '机位', priority: 'P3' },
    ])
    expect(normalizeMemoContent([{ type: 'list', mode: 'ordered', children: [{ text: '第一项' }, { text: '第二项' }] }])[0]).toMatchObject({
      mode: 'ordered',
      sortMode: 'manual',
    })
  })

  it('tolerates malformed list data and converts legacy descriptions', () => {
    const [block] = normalizeMemoContent([
      { type: 'list', mode: 'priority', children: [{ text: '测试', priority: 'P9', description: '旧说明' }] },
    ])
    if (!block || block.type !== 'list') throw new Error('Expected list block')
    expect(block.children).toEqual([{ text: '测试', desc: '旧说明' }])
    expect(normalizeMemoContent([{ type: 'list', mode: 'priority' }])[0]).toMatchObject({ children: [] })
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
