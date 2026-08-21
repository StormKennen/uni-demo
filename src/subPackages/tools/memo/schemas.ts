/**
 * 子包内本地 schemas 文件 —— 合并自 src/editor-core/schemas/blocks/*.schema.ts
 *
 * 为什么要在这里再放一份？
 *   uni-app 编译 mp-weixin 子包时，跨目录的 .ts 模块在产物中找不到对应的 .js 文件，
 *   会出现 `module 'editor-core/schemas/blocks/xxx.schema.js' is not defined` 报错。
 *   把 schema 数据放到子包内部，require 路径恒为子包相对路径，问题彻底绕开。
 *
 * 类型 import 走 `@/editor-core/...` 是安全的：`import type` 在编译后会被 TS 擦除，
 * 不会产生任何运行时 require 调用。
 */
import type { SchemaField, SchemaFieldGroup } from './components/editor-core/schemas/schema-field'
import type {
  ContentAction,
  ListBlockData,
  ListItem,
  TableBlockData,
  TableRow,
  CalloutBlockData,
  LinkCardBlockData,
  MemoBlockStyle,
} from './content-model'
import type { BlockSchema as CoreBlockSchema } from '@/editor-core/schemas/block-schema'

// 导出类型供子包内其他组件使用
export type BlockSchema<TBlock = unknown> = Omit<
  CoreBlockSchema<TBlock>,
  'styleSchema' | 'businessSchema' | 'itemSchema' | 'createDefaultItem'
> & {
  styleSchema?: SchemaField[]
  businessSchema?: SchemaField[]
  itemSchema?: SchemaField[]
  createDefaultItem?: () => unknown
}

export type { SchemaField, SchemaFieldGroup }

const getActionDraft = (draft: unknown, prefix: string): Record<string, unknown> => {
  if (!draft || typeof draft !== 'object') return {}
  const action = (draft as Record<string, unknown>)[prefix]
  return action && typeof action === 'object' ? (action as Record<string, unknown>) : {}
}

const createActionSchema = (prefix = 'action'): SchemaField[] => {
  const isType = (type: ContentAction['type']) => (draft: unknown) => getActionDraft(draft, prefix).type === type
  return [
    {
      key: `${prefix}.type`,
      label: '点击行为',
      type: 'select',
      group: 'interaction',
      default: 'none',
      options: [
        { label: '无', value: 'none' },
        { label: '图片预览', value: 'previewImage' },
        { label: '外部链接', value: 'url' },
        { label: '微信小程序', value: 'miniProgram' },
        { label: '其他备忘录', value: 'memo' },
        { label: '内部页面', value: 'internalPage' },
        { label: '地图导航', value: 'navigation' },
        { label: '锚点跳转', value: 'anchor' },
        { label: '内容弹窗', value: 'popup' },
      ],
    },
    {
      key: `${prefix}.url`,
      label: '目标 URL',
      type: 'input',
      group: 'interaction',
      placeholder: 'https://example.com',
      visible: isType('url'),
    },
    { key: `${prefix}.appId`, label: '小程序 AppId', type: 'input', group: 'interaction', visible: isType('miniProgram') },
    {
      key: `${prefix}.path`,
      label: '小程序路径',
      type: 'input',
      group: 'interaction',
      placeholder: 'pages/index/index',
      visible: isType('miniProgram'),
    },
    {
      key: `${prefix}.envVersion`,
      label: '小程序环境',
      type: 'select',
      group: 'advanced',
      default: 'release',
      options: [
        { label: '正式版', value: 'release' },
        { label: '体验版', value: 'trial' },
        { label: '开发版', value: 'develop' },
      ],
      visible: isType('miniProgram'),
    },
    { key: `${prefix}.fallbackUrl`, label: 'H5 后备链接', type: 'input', group: 'advanced', visible: isType('miniProgram') },
    {
      key: `${prefix}.extraDataText`,
      label: 'extraData JSON',
      type: 'textarea',
      group: 'advanced',
      placeholder: '{"source":"memo"}',
      visible: isType('miniProgram'),
    },
    { key: `${prefix}.memoId`, label: '备忘录 ID', type: 'input', group: 'interaction', visible: isType('memo') },
    {
      key: `${prefix}.pagePath`,
      label: '内部页面路径',
      type: 'input',
      group: 'interaction',
      placeholder: '/subPackages/...',
      visible: isType('internalPage'),
    },
    { key: `${prefix}.latitude`, label: '纬度', type: 'input', group: 'interaction', visible: isType('navigation') },
    { key: `${prefix}.longitude`, label: '经度', type: 'input', group: 'interaction', visible: isType('navigation') },
    { key: `${prefix}.name`, label: '地点名称', type: 'input', group: 'interaction', visible: isType('navigation') },
    { key: `${prefix}.address`, label: '详细地址', type: 'input', group: 'interaction', visible: isType('navigation') },
    { key: `${prefix}.anchorId`, label: '锚点 ID', type: 'input', group: 'interaction', placeholder: 'L1', visible: isType('anchor') },
    { key: `${prefix}.content`, label: '弹窗内容', type: 'textarea', group: 'content', visible: isType('popup') },
    { key: `${prefix}.isMarkdown`, label: 'Markdown 渲染', type: 'switch', group: 'advanced', default: false, visible: isType('popup') },
  ]
}

// ===== TextBlock =====
export interface TextItem {
  value: string
  style?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    lineThrough?: boolean
    fontSize?: number
    color?: string
  }
  action?: ContentAction
  linkInfo?: Record<string, any>
  linkIcon?: string
  interactionType?: 'normal' | 'popup' | string
}

export interface TextBlockData {
  type: 'text'
  children: TextItem[]
  style?: MemoBlockStyle & {
    textAlign?: 'left' | 'center' | 'right'
    backgroundColor?: string
    borderTop?: boolean
    borderBottom?: boolean
  }
  isMarkdown?: boolean
}

const textStyleSchema: SchemaField[] = [
  {
    key: 'style.textAlign',
    label: '对齐方式',
    type: 'radio',
    group: 'layout',
    default: 'left',
    options: [
      { label: '左', value: 'left' },
      { label: '中', value: 'center' },
      { label: '右', value: 'right' },
    ],
  },
  { key: 'style.borderTop', label: '顶部边框', type: 'switch', group: 'style', default: false },
  { key: 'style.borderBottom', label: '底部边框', type: 'switch', group: 'style', default: false },
  {
    key: 'style.backgroundColor',
    label: '背景色',
    type: 'select',
    group: 'style',
    default: '',
    options: [
      { label: '无', value: '' },
      { label: '浅灰', value: '#f5f5f5' },
      { label: '米黄', value: '#fff8e1' },
      { label: '浅蓝', value: '#e3f2fd' },
    ],
  },
]

const textBusinessSchema: SchemaField[] = [
  { key: 'isMarkdown', label: 'Markdown 模式', type: 'switch', group: 'content', default: false, hint: '开启后整块按 Markdown 语法渲染' },
]

const textItemSchema: SchemaField[] = [
  { key: 'value', label: '文本内容', type: 'textarea', group: 'content', default: '', placeholder: '输入段落内容...' },
  { key: 'style.bold', label: '粗体', type: 'switch', group: 'style', default: false },
  { key: 'style.italic', label: '斜体', type: 'switch', group: 'style', default: false },
  { key: 'style.underline', label: '下划线', type: 'switch', group: 'style', default: false },
  { key: 'style.lineThrough', label: '删除线', type: 'switch', group: 'style', default: false },
  { key: 'style.fontSize', label: '字号', type: 'slider', group: 'style', default: 16, min: 12, max: 36, step: 1 },
  {
    key: 'style.color',
    label: '文字颜色',
    type: 'color',
    group: 'style',
    default: '',
    options: [
      { label: '默认', value: '' },
      { label: '深灰', value: '#333' },
      { label: '红色', value: '#e53935' },
      { label: '橙色', value: '#fb8c00' },
      { label: '绿色', value: '#43a047' },
      { label: '蓝色', value: '#1e88e5' },
    ],
  },
  ...createActionSchema(),
]

export const TextBlockSchema: BlockSchema<TextBlockData> = {
  type: 'text',
  label: '文字',
  icon: '📝',
  supportsChildren: true,
  createDefault: (): TextBlockData => ({
    type: 'text',
    children: [{ value: '', style: {}, action: { type: 'none' } }],
    style: { textAlign: 'left' },
    isMarkdown: false,
  }),
  styleSchema: textStyleSchema,
  businessSchema: textBusinessSchema,
  itemSchema: textItemSchema,
  createDefaultItem: (): TextItem => ({ value: '', style: {}, action: { type: 'none' } }),
}

// ===== ImageBlock =====
export interface ImageItem {
  url: string
  value?: string | { url?: string }
  aspectRatio?: number
  action?: ContentAction
  style?: {
    sizeMode?: 'auto' | 'fixedWidth' | 'fixedHeight' | 'percentWidth' | 'percentHeight'
    width?: number
    height?: number
    widthPercent?: number
    heightPercent?: number
    rotate?: number
    rotateX?: number
    rotateY?: number
  }
}

export interface ImageBlockData {
  type: 'image'
  children: ImageItem[]
  style?: MemoBlockStyle & { backgroundColor?: string }
  layout: { type: 'single' | 'grid' | 'horizontal' | 'carousel' | 'feature'; columns?: number; gap?: number }
}

const imageItemSchema: SchemaField[] = [
  { key: 'url', label: '图片 URL', type: 'input', group: 'content', default: '', placeholder: '输入图片链接' },
  {
    key: 'style.sizeMode',
    label: '尺寸模式',
    type: 'radio',
    group: 'layout',
    default: 'auto',
    options: [
      { label: '自动', value: 'auto' },
      { label: '固定宽', value: 'fixedWidth' },
      { label: '固定高', value: 'fixedHeight' },
      { label: '百分比宽', value: 'percentWidth' },
    ],
  },
  {
    key: 'style.width',
    label: '宽度 (px)',
    type: 'slider',
    group: 'layout',
    default: 300,
    min: 50,
    max: 750,
    step: 10,
    visible: d => d?.style?.sizeMode === 'fixedWidth',
  },
  {
    key: 'style.height',
    label: '高度 (px)',
    type: 'slider',
    group: 'layout',
    default: 300,
    min: 50,
    max: 750,
    step: 10,
    visible: d => d?.style?.sizeMode === 'fixedHeight',
  },
  {
    key: 'style.widthPercent',
    label: '宽度百分比 (%)',
    type: 'slider',
    group: 'layout',
    default: 100,
    min: 10,
    max: 100,
    step: 5,
    visible: d => d?.style?.sizeMode === 'percentWidth',
  },
  { key: 'style.rotate', label: '旋转角度', type: 'slider', group: 'style', default: 0, min: 0, max: 360, step: 5 },
  ...createActionSchema(),
]

const imageStyleSchema: SchemaField[] = [
  {
    key: 'layout.type',
    label: '布局模式',
    type: 'radio',
    group: 'layout',
    default: 'grid',
    options: [
      { label: '单图', value: 'single' },
      { label: '网格', value: 'grid' },
      { label: '横向', value: 'horizontal' },
      { label: '轮播', value: 'carousel' },
      { label: '一大两小', value: 'feature' },
    ],
  },
  {
    key: 'layout.columns',
    label: '网格列数',
    type: 'slider',
    group: 'layout',
    default: 2,
    min: 1,
    max: 4,
    step: 1,
    visible: d => d?.layout?.type === 'grid',
  },
  { key: 'layout.gap', label: '间距 (rpx)', type: 'slider', group: 'layout', default: 12, min: 0, max: 40, step: 2 },
  {
    key: 'style.backgroundColor',
    label: '背景色',
    type: 'select',
    group: 'style',
    default: '',
    options: [
      { label: '无', value: '' },
      { label: '浅灰', value: '#f5f5f5' },
      { label: '深色', value: '#222' },
    ],
  },
]

export const ImageBlockSchema: BlockSchema<ImageBlockData> = {
  type: 'image',
  label: '图片',
  icon: '🖼️',
  supportsChildren: true,
  createDefault: (): ImageBlockData => ({
    type: 'image',
    children: [],
    layout: { type: 'grid', columns: 2, gap: 12 },
    style: {},
  }),
  styleSchema: imageStyleSchema,
  itemSchema: imageItemSchema,
  createDefaultItem: (): ImageItem => ({ url: '', style: { sizeMode: 'auto' }, action: { type: 'previewImage' } }),
}

// ===== RouteBlock =====
export interface RouteNode {
  name: string
  time?: string
  icon?: string
  desc?: string
  type?: 'normal' | 'transfer'
  isEnd?: boolean
}

export interface RouteBlockData {
  type: 'route'
  content: RouteNode[]
  style?: MemoBlockStyle & {
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
  }
  showTime?: boolean
}

const routeStyleSchema: SchemaField[] = [
  {
    key: 'style.textAlign',
    label: '对齐方式',
    type: 'radio',
    default: 'left',
    options: [
      { label: '左', value: 'left' },
      { label: '中', value: 'center' },
      { label: '右', value: 'right' },
    ],
  },
  {
    key: 'style.backgroundColor',
    label: '背景色',
    type: 'color',
    default: '',
    options: [
      { label: '无', value: '' },
      { label: '浅灰', value: '#f5f5f5' },
      { label: '米黄', value: '#fff8e1' },
      { label: '浅蓝', value: '#e3f2fd' },
    ],
  },
]

const routeBusinessSchema: SchemaField[] = [
  { key: 'showTime', label: '显示时间列', type: 'switch', default: true, hint: '关闭后只展示站点名称与描述' },
]

const routeItemSchema: SchemaField[] = [
  { key: 'name', label: '站点名称', type: 'input', default: '', placeholder: '请输入站点名称' },
  { key: 'time', label: '耗时', type: 'input', default: '', placeholder: '如 1h', visible: d => !d?.isEnd },
  { key: 'icon', label: '交通图标', type: 'input', default: '', placeholder: '如 🚗', visible: d => !d?.isEnd },
  { key: 'desc', label: '描述', type: 'input', default: '', placeholder: '如 接机、换乘等', visible: d => !d?.isEnd },
  {
    key: 'type',
    label: '站点类型',
    type: 'radio',
    default: 'normal',
    options: [
      { label: '途经站', value: 'normal' },
      { label: '换乘站', value: 'transfer' },
    ],
    visible: d => !d?.isEnd,
  },
  { key: 'isEnd', label: '终点站', type: 'switch', default: false, hint: '标记为路径终点' },
]

export const RouteBlockSchema: BlockSchema<RouteBlockData> = {
  type: 'route',
  label: '路径',
  icon: '🗺️',
  supportsChildren: true,
  createDefault: (): RouteBlockData => ({
    type: 'route',
    content: [
      { name: '起点', type: 'normal' },
      { name: '终点', type: 'normal', isEnd: true },
    ],
    style: { textAlign: 'left' },
    showTime: true,
  }),
  styleSchema: routeStyleSchema,
  businessSchema: routeBusinessSchema,
  itemSchema: routeItemSchema,
  itemArrayKey: 'content',
  createDefaultItem: (): RouteNode => ({ name: '新站点', type: 'normal' }),
}

// ===== AttachmentBlock =====
export interface AttachmentItem {
  name: string
  title?: string
  url: string
  size?: number
  mimeType?: string
}

export interface AttachmentBlockData {
  type: 'attachment'
  children: AttachmentItem[]
  style?: MemoBlockStyle & { backgroundColor?: string }
  appId?: string
}

const attachmentStyleSchema: SchemaField[] = [
  {
    key: 'style.backgroundColor',
    label: '背景色',
    type: 'color',
    default: '',
    options: [
      { label: '无', value: '' },
      { label: '浅灰', value: '#f5f5f5' },
      { label: '米黄', value: '#fff8e1' },
    ],
  },
]

const attachmentItemSchema: SchemaField[] = [
  { key: 'url', label: '附件 URL', type: 'input', group: 'content', default: '', placeholder: '输入附件链接' },
  { key: 'name', label: '文件名', type: 'input', group: 'content', default: '', placeholder: '附件名称' },
  { key: 'mimeType', label: '文件类型', type: 'input', group: 'content', default: '', placeholder: '如 application/pdf' },
]

export const AttachmentBlockSchema: BlockSchema<AttachmentBlockData> = {
  type: 'attachment',
  label: '附件',
  icon: '📎',
  supportsChildren: true,
  createDefault: (): AttachmentBlockData => ({
    type: 'attachment',
    children: [],
    style: {},
  }),
  styleSchema: attachmentStyleSchema,
  itemSchema: attachmentItemSchema,
  createDefaultItem: (): AttachmentItem => ({ name: '新附件.pdf', url: '' }),
}

// ===== MediaBlock =====
export interface MediaItem {
  title: string
  url: string
  mediaType: 'video' | 'audio'
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
}

export interface MediaBlockData {
  type: 'media'
  children: MediaItem[]
  style?: MemoBlockStyle & { backgroundColor?: string }
  defaultAutoplay?: boolean
  defaultControls?: boolean
  defaultLoop?: boolean
}

const mediaStyleSchema: SchemaField[] = [
  {
    key: 'style.backgroundColor',
    label: '背景色',
    type: 'color',
    default: '',
    options: [
      { label: '无', value: '' },
      { label: '浅灰', value: '#f5f5f5' },
      { label: '深色', value: '#222' },
    ],
  },
]

const mediaItemSchema: SchemaField[] = [
  {
    key: 'mediaType',
    label: '媒体类型',
    type: 'radio',
    group: 'content',
    default: 'video',
    options: [
      { label: '视频', value: 'video' },
      { label: '音频', value: 'audio' },
    ],
  },
  { key: 'url', label: '媒体 URL', type: 'input', group: 'content', default: '', placeholder: '输入视频/音频链接' },
  { key: 'title', label: '标题', type: 'input', group: 'content', default: '', placeholder: '媒体标题' },
  { key: 'autoplay', label: '自动播放', type: 'switch', group: 'interaction', default: false },
  { key: 'controls', label: '显示控制条', type: 'switch', group: 'interaction', default: true },
  { key: 'loop', label: '循环播放', type: 'switch', group: 'interaction', default: false },
]

const mediaBusinessSchema: SchemaField[] = [
  { key: 'defaultAutoplay', label: '默认自动播放', type: 'switch', default: false, hint: '新加入此块的视频/音频默认是否自动播放' },
  { key: 'defaultControls', label: '默认显示控制条', type: 'switch', default: true },
  { key: 'defaultLoop', label: '默认循环播放', type: 'switch', default: false },
]

export const MediaBlockSchema: BlockSchema<MediaBlockData> = {
  type: 'media',
  label: '多媒体',
  icon: '🎬',
  supportsChildren: true,
  createDefault: (): MediaBlockData => ({
    type: 'media',
    children: [],
    style: {},
    defaultAutoplay: false,
    defaultControls: true,
    defaultLoop: false,
  }),
  styleSchema: mediaStyleSchema,
  businessSchema: mediaBusinessSchema,
  itemSchema: mediaItemSchema,
  createDefaultItem: (): MediaItem => ({
    title: '新视频',
    url: '',
    mediaType: 'video',
    autoplay: false,
    controls: true,
    loop: false,
  }),
}

// ===== Structured content blocks =====
const listBlockSchema: SchemaField[] = [
  {
    key: 'mode',
    label: '列表类型',
    type: 'radio',
    group: 'content',
    default: 'bullet',
    options: [
      { label: '项目符号', value: 'bullet' },
      { label: '编号', value: 'number' },
      { label: '清单', value: 'checklist' },
    ],
  },
]

const listItemSchema: SchemaField[] = [
  { key: 'text', label: '内容', type: 'textarea', group: 'content', default: '', placeholder: '输入列表内容' },
  { key: 'description', label: '补充说明', type: 'textarea', group: 'content', default: '', placeholder: '可选' },
  { key: 'checked', label: '已完成', type: 'switch', group: 'interaction', default: false },
]

export const ListBlockSchema: BlockSchema<ListBlockData> = {
  type: 'list',
  label: '列表 / 清单',
  icon: '☑️',
  supportsChildren: true,
  createDefault: () => ({ type: 'list', mode: 'bullet', children: [{ text: '', checked: false }] }),
  businessSchema: listBlockSchema,
  itemSchema: listItemSchema,
  createDefaultItem: (): ListItem => ({ text: '', checked: false }),
}

const tableBlockSchema: SchemaField[] = [
  {
    key: 'mode',
    label: '表格模式',
    type: 'radio',
    group: 'content',
    default: 'keyValue',
    options: [
      { label: '键值信息', value: 'keyValue' },
      { label: '数据表格', value: 'table' },
    ],
  },
  { key: 'header', label: '显示表头', type: 'switch', group: 'content', default: true },
  {
    key: 'align',
    label: '内容对齐',
    type: 'radio',
    group: 'layout',
    default: 'left',
    options: [
      { label: '左', value: 'left' },
      { label: '中', value: 'center' },
      { label: '右', value: 'right' },
    ],
  },
  { key: 'horizontalScroll', label: '横向滚动', type: 'switch', group: 'layout', default: true },
]

export const TableBlockSchema: BlockSchema<TableBlockData> = {
  type: 'table',
  label: '表格 / 信息',
  icon: '▦',
  supportsChildren: true,
  createDefault: () => ({
    type: 'table',
    mode: 'keyValue',
    columns: ['项目', '内容'],
    children: [{ cells: ['开放时间', '09:00 - 18:00'] }],
    header: false,
    align: 'left',
    horizontalScroll: true,
  }),
  businessSchema: tableBlockSchema,
  itemArrayKey: 'children',
  createDefaultItem: (): TableRow => ({ cells: ['', ''] }),
}

const calloutSchema: SchemaField[] = [
  {
    key: 'tone',
    label: '提示类型',
    type: 'select',
    group: 'style',
    default: 'info',
    options: [
      { label: '信息', value: 'info' },
      { label: '注意', value: 'warning' },
      { label: '重要', value: 'danger' },
      { label: '推荐', value: 'success' },
      { label: '备注', value: 'note' },
    ],
  },
  { key: 'icon', label: '图标', type: 'input', group: 'style', default: 'ℹ️', placeholder: '可选' },
  { key: 'title', label: '标题', type: 'input', group: 'content', default: '', placeholder: '可选' },
  { key: 'content', label: '内容', type: 'textarea', group: 'content', default: '', placeholder: '输入提示内容' },
]

export const CalloutBlockSchema: BlockSchema<CalloutBlockData> = {
  type: 'callout',
  label: '提示',
  icon: 'ℹ️',
  supportsChildren: false,
  createDefault: () => ({ type: 'callout', tone: 'info', icon: 'ℹ️', title: '提示', content: '' }),
  businessSchema: calloutSchema,
}

const linkCardSchema: SchemaField[] = [
  { key: 'icon', label: '图标', type: 'input', group: 'style', default: '🔗', placeholder: '可选' },
  { key: 'cover', label: '封面 URL', type: 'input', group: 'style', default: '', placeholder: '可选' },
  { key: 'title', label: '标题', type: 'input', group: 'content', default: '', placeholder: '卡片标题' },
  { key: 'description', label: '描述', type: 'textarea', group: 'content', default: '', placeholder: '卡片说明' },
  { key: 'buttonText', label: '按钮文字', type: 'input', group: 'content', default: '查看', placeholder: '查看' },
  ...createActionSchema(),
]

export const LinkCardBlockSchema: BlockSchema<LinkCardBlockData> = {
  type: 'linkCard',
  label: '链接卡片',
  icon: '🔗',
  supportsChildren: false,
  createDefault: () => ({ type: 'linkCard', icon: '🔗', title: '内容入口', description: '', buttonText: '查看', action: { type: 'none' } }),
  businessSchema: linkCardSchema,
}

// ===== 本地 registry =====
const _allSchemas: BlockSchema[] = [
  TextBlockSchema,
  ImageBlockSchema,
  RouteBlockSchema,
  AttachmentBlockSchema,
  MediaBlockSchema,
  ListBlockSchema,
  TableBlockSchema,
  CalloutBlockSchema,
  LinkCardBlockSchema,
]

export const getAllBlockSchemas = (): BlockSchema[] => _allSchemas
export const getBlockSchema = (type: string): BlockSchema | undefined => _allSchemas.find(s => s.type === type)
