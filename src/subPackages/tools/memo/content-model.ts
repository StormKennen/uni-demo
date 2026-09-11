export type ContentActionType =
  | 'none'
  | 'previewImage'
  | 'url'
  | 'miniProgram'
  | 'memo'
  | 'internalPage'
  | 'navigation'
  | 'anchor'
  | 'popup'

export interface ContentAction {
  type: ContentActionType
  url?: string
  appId?: string
  path?: string
  envVersion?: 'develop' | 'trial' | 'release'
  extraData?: Record<string, unknown>
  extraDataText?: string
  fallbackUrl?: string
  memoId?: string
  pagePath?: string
  latitude?: number
  longitude?: number
  name?: string
  address?: string
  anchorId?: string
  content?: string
  isMarkdown?: boolean
}

export interface MemoBlockBase {
  type: string
  anchor?: string
  locked?: boolean
  style?: MemoBlockStyle
}

export interface MemoBlockStyle extends Record<string, unknown> {
  enablePokerCard?: boolean
  enable3DMode?: boolean
}

export type ListMode = 'ordered' | 'priority'
export type ListPriority = 'P0' | 'P1' | 'P2' | 'P3'

/** 旧版 V2 列表模式，仅用于读取历史内容。新建内容不再使用这些模式。 */
export type LegacyListMode = 'bullet' | 'number' | 'checklist'

export interface ListItem {
  text: string
  priority?: ListPriority
  desc?: string
  /** @deprecated 兼容旧版 checklist 数据，不会由新建的 ListBlock 写入。 */
  checked?: boolean
  /** @deprecated 兼容旧版列表数据，读取时优先转换为 desc。 */
  description?: string
}

export interface ListBlockData extends MemoBlockBase {
  type: 'list'
  mode: ListMode | LegacyListMode
  children: ListItem[]
  sortMode?: 'manual'
  style?: MemoBlockStyle & {
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
  }
}

export interface TableRow {
  cells: string[]
}

export interface TableBlockData extends MemoBlockBase {
  type: 'table'
  mode: 'keyValue' | 'table'
  columns: string[]
  children: TableRow[]
  header: boolean
  align: 'left' | 'center' | 'right'
  horizontalScroll: boolean
}

export interface CalloutBlockData extends MemoBlockBase {
  type: 'callout'
  tone: 'info' | 'warning' | 'danger' | 'success' | 'note'
  icon?: string
  title?: string
  content: string
}

export interface LinkCardBlockData extends MemoBlockBase {
  type: 'linkCard'
  icon?: string
  cover?: string
  title: string
  description?: string
  buttonText?: string
  action: ContentAction
}

export type StructuredMemoBlock = ListBlockData | TableBlockData | CalloutBlockData | LinkCardBlockData

export interface MemoSettings {
  editorVersion: 2
  padding: { top: number; bottom: number; left: number; right: number }
  border: { top: number; bottom: number; left: number; right: number; color: string }
  appearance: {
    backgroundColor: string
    backgroundImage: string
    backgroundBlur: number
    backgroundOpacity: number
    enableBlob: boolean
    blobBlur: number
    enableCyberGrid: boolean
  }
  romanticEffects: { popupAnimation: 'zoom-in' | 'slide-up'; enableGlassBlur: boolean }
  typography: { fontSize: 'standard' | 'medium' | 'large'; lineHeight: number }
  layout: { contentWidth: 'full' | 'narrow' }
  features: { showWatermark: boolean; enableComments: boolean }
  showBlockActions: boolean
  showEditButtons: boolean
  showBackToTop: boolean
  hideNavActions: boolean
  globalAttachment: { enabled: boolean; url: string; title: string }
}
