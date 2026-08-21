import type { ContentAction, MemoBlockBase, MemoSettings, StructuredMemoBlock } from './content-model'
import type { AttachmentBlockData, ImageBlockData, MediaBlockData, RouteBlockData, TextBlockData } from './schemas'

type UnknownRecord = Record<string, unknown>

export type NormalizedMemoBlock = (
  | TextBlockData
  | ImageBlockData
  | RouteBlockData
  | AttachmentBlockData
  | MediaBlockData
  | StructuredMemoBlock
) &
  MemoBlockBase

const isRecord = (value: unknown): value is UnknownRecord => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const asString = (value: unknown): string => (typeof value === 'string' ? value : '')
const asNumber = (value: unknown): number | undefined => {
  const result = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : Number.NaN
  return Number.isFinite(result) ? result : undefined
}

export const normalizeContentAction = (source: unknown, legacyInteractionType?: unknown): ContentAction => {
  const data = isRecord(source) ? source : {}
  const rawType = asString(data.type || data.linkType || legacyInteractionType)
  const typeMap: Record<string, ContentAction['type']> = {
    normal: 'none',
    internal: 'memo',
    preview: 'previewImage',
  }
  const type = typeMap[rawType] || rawType

  if (type === 'url') return { type, url: asString(data.url) }
  if (type === 'miniProgram') {
    return {
      type,
      appId: asString(data.appId),
      path: asString(data.path),
      envVersion: data.envVersion === 'develop' || data.envVersion === 'trial' ? data.envVersion : 'release',
      extraData: isRecord(data.extraData) ? data.extraData : undefined,
      extraDataText: asString(data.extraDataText),
      fallbackUrl: asString(data.fallbackUrl),
    }
  }
  if (type === 'memo') {
    if (data.internalScene && data.internalScene !== 'memo' && data.internalPath) {
      return { type: 'internalPage', pagePath: asString(data.internalPath) }
    }
    return { type, memoId: asString(data.memoId || data.internalId) }
  }
  if (type === 'internalPage') return { type, pagePath: asString(data.pagePath || data.internalPath) }
  if (type === 'navigation') {
    return {
      type,
      latitude: asNumber(data.latitude),
      longitude: asNumber(data.longitude),
      name: asString(data.name || data.label),
      address: asString(data.address),
    }
  }
  if (type === 'anchor') return { type, anchorId: asString(data.anchorId || data.targetAnchor) }
  if (type === 'popup') {
    return {
      type,
      content: asString(data.content || data.popupContent),
      isMarkdown: data.isMarkdown === true || data.popupIsMarkdown === true,
    }
  }
  if (type === 'previewImage') return { type, url: asString(data.url) }
  return { type: 'none' }
}

const normalizeTextItem = (item: UnknownRecord): UnknownRecord => {
  const actionSource = isRecord(item.action) ? item.action : item.linkInfo
  const action = normalizeContentAction(actionSource, item.interactionType)
  if (action.type === 'popup' && !action.content) action.content = asString(item.value)
  return { ...item, action }
}

export const normalizeBlock = (source: unknown): NormalizedMemoBlock | null => {
  if (!isRecord(source) || typeof source.type !== 'string') return null
  const block: UnknownRecord = JSON.parse(JSON.stringify(source))

  if (block.type === 'text' && Array.isArray(block.children)) block.children = block.children.filter(isRecord).map(normalizeTextItem)

  if (block.type === 'image') {
    const layout = isRecord(block.layout) ? block.layout : {}
    const legacyLayout = layout.type === 'free' ? 'single' : layout.type
    block.layout = { ...layout, type: legacyLayout || 'grid' }
    if (Array.isArray(block.children)) {
      block.children = block.children.filter(isRecord).map(item => {
        const legacyValue = isRecord(item.value) ? item.value : {}
        const url = asString(item.url || legacyValue.url || item.value)
        const action = isRecord(item.action) ? normalizeContentAction(item.action) : { type: 'previewImage' as const, url }
        return { ...item, url, action }
      })
    }
  }

  if (block.type === 'media' && Array.isArray(block.children)) {
    block.children = block.children.filter(isRecord).map(item => {
      const url = asString(item.url)
      const guessedType = /\.(mp3|wav|ogg|aac|m4a|flac)(\?|$)/i.test(url) ? 'audio' : 'video'
      return { ...item, mediaType: item.mediaType === 'audio' ? 'audio' : item.mediaType === 'video' ? 'video' : guessedType }
    })
  }

  if (block.type === 'attachment' && Array.isArray(block.children)) {
    block.children = block.children.filter(isRecord).map(item => ({
      ...item,
      name: asString(item.name || item.title) || '未命名附件',
      mimeType: asString(item.mimeType || item.type),
    }))
  }

  if (block.type === 'linkCard') block.action = normalizeContentAction(block.action)
  return block as unknown as NormalizedMemoBlock
}

export const normalizeMemoContent = (source: unknown): NormalizedMemoBlock[] => {
  let content = source
  if (typeof source === 'string') {
    try {
      content = JSON.parse(source)
    } catch {
      return []
    }
  }
  if (!Array.isArray(content)) return []
  return content.map(normalizeBlock).filter((block): block is NormalizedMemoBlock => block !== null)
}

export const createDefaultMemoSettings = (): MemoSettings => ({
  editorVersion: 2,
  padding: { top: 32, bottom: 32, left: 32, right: 32 },
  border: { top: 0, bottom: 0, left: 0, right: 0, color: '#eeeeee' },
  appearance: {
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundBlur: 0,
    backgroundOpacity: 1,
    enableBlob: false,
    blobBlur: 80,
    enableCyberGrid: false,
  },
  romanticEffects: { popupAnimation: 'zoom-in', enableGlassBlur: true },
  typography: { fontSize: 'standard', lineHeight: 1.6 },
  layout: { contentWidth: 'full' },
  features: { showWatermark: false, enableComments: false },
  showBlockActions: true,
  showEditButtons: true,
  showBackToTop: true,
  hideNavActions: false,
  globalAttachment: { enabled: false, url: '', title: '查看原始文档' },
})

export const normalizeMemoSettings = (source: unknown): MemoSettings => {
  const defaults = createDefaultMemoSettings()
  if (!isRecord(source)) return defaults
  const padding = isRecord(source.padding) ? source.padding : {}
  const border = isRecord(source.border) ? source.border : {}
  const appearance = isRecord(source.appearance) ? source.appearance : {}
  const romanticEffects = isRecord(source.romanticEffects) ? source.romanticEffects : {}
  const typography = isRecord(source.typography) ? source.typography : {}
  const layout = isRecord(source.layout) ? source.layout : {}
  const features = isRecord(source.features) ? source.features : {}
  const globalAttachment = isRecord(source.globalAttachment) ? source.globalAttachment : {}
  return {
    ...defaults,
    ...source,
    editorVersion: 2,
    padding: { ...defaults.padding, ...padding },
    border: { ...defaults.border, ...border },
    appearance: { ...defaults.appearance, ...appearance },
    romanticEffects: { ...defaults.romanticEffects, ...romanticEffects } as MemoSettings['romanticEffects'],
    typography: { ...defaults.typography, ...typography } as MemoSettings['typography'],
    layout: { ...defaults.layout, ...layout } as MemoSettings['layout'],
    features: { ...defaults.features, ...features } as MemoSettings['features'],
    showBlockActions: source.showBlockActions !== false,
    showEditButtons: source.showEditButtons !== false,
    showBackToTop: source.showBackToTop !== false,
    hideNavActions: source.hideNavActions === true,
    globalAttachment: { ...defaults.globalAttachment, ...globalAttachment } as MemoSettings['globalAttachment'],
  }
}
