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
import type { BlockSchema } from '@/editor-core/schemas/block-schema'
import type { SchemaField } from '@/editor-core/schemas/schema-field'

// 导出类型供子包内其他组件使用
export type { BlockSchema, SchemaField }

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
  linkInfo?: Record<string, any>
  linkIcon?: string
  interactionType?: 'normal' | 'popup' | string
}

export interface TextBlockData {
  type: 'text'
  children: TextItem[]
  style?: {
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
    default: 'left',
    options: [
      { label: '左', value: 'left' },
      { label: '中', value: 'center' },
      { label: '右', value: 'right' },
    ],
  },
  { key: 'style.borderTop', label: '顶部边框', type: 'switch', default: false },
  { key: 'style.borderBottom', label: '底部边框', type: 'switch', default: false },
  {
    key: 'style.backgroundColor',
    label: '背景色',
    type: 'select',
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
  { key: 'isMarkdown', label: 'Markdown 模式', type: 'switch', default: false, hint: '开启后整块按 Markdown 语法渲染' },
]

const textItemSchema: SchemaField[] = [
  { key: 'value', label: '文本内容', type: 'textarea', default: '', placeholder: '输入段落内容...' },
  { key: 'style.bold', label: '粗体', type: 'switch', default: false },
  { key: 'style.italic', label: '斜体', type: 'switch', default: false },
  { key: 'style.underline', label: '下划线', type: 'switch', default: false },
  { key: 'style.lineThrough', label: '删除线', type: 'switch', default: false },
  { key: 'style.fontSize', label: '字号', type: 'slider', default: 16, min: 12, max: 36, step: 1 },
  {
    key: 'style.color',
    label: '文字颜色',
    type: 'color',
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
  {
    key: 'interactionType',
    label: '交互类型',
    type: 'select',
    default: 'normal',
    hint: '为该段文字附加链接/交互行为',
    options: [
      { label: '无', value: 'normal' },
      { label: '🔗 外部链接', value: 'url' },
      { label: '💬 内容弹窗', value: 'popup' },
      { label: '📍 地图导航', value: 'navigation' },
      { label: '⚓ 锚点跳转', value: 'anchor' },
      { label: '📎 关联素材', value: 'internal' },
    ],
  },
  { key: 'linkInfo.label', label: '链接显示文本', type: 'input', default: '', placeholder: '留空则使用段落内容', visible: (d) => d?.interactionType && d.interactionType !== 'normal' },
  { key: 'linkInfo.url', label: '目标 URL', type: 'input', default: '', placeholder: 'https://example.com', visible: (d) => d?.interactionType === 'url' },
  { key: 'linkInfo.popupContent', label: '弹窗内容', type: 'textarea', default: '', placeholder: '支持 Markdown 语法', visible: (d) => d?.interactionType === 'popup' },
  { key: 'linkInfo.popupIsMarkdown', label: 'Markdown 渲染', type: 'switch', default: true, visible: (d) => d?.interactionType === 'popup' },
  { key: 'linkInfo.address', label: '目的地地址', type: 'input', default: '', placeholder: '如：北京市朝阳区 xxx', visible: (d) => d?.interactionType === 'navigation' },
  { key: 'linkInfo.latitude', label: '纬度', type: 'input', default: '', placeholder: '如：39.9042', visible: (d) => d?.interactionType === 'navigation' },
  { key: 'linkInfo.longitude', label: '经度', type: 'input', default: '', placeholder: '如：116.4074', visible: (d) => d?.interactionType === 'navigation' },
  { key: 'linkInfo.anchorId', label: '锚点 ID', type: 'input', default: '', placeholder: '如：L1、section2', hint: '与页面内块的 anchor 字段对应', visible: (d) => d?.interactionType === 'anchor' },
  { key: 'linkInfo.internalTitle', label: '素材标题', type: 'input', default: '', placeholder: '关联备忘录或内容标题', visible: (d) => d?.interactionType === 'internal' },
  { key: 'linkInfo.internalId', label: '素材 ID', type: 'input', default: '', placeholder: '关联内容的 ID', visible: (d) => d?.interactionType === 'internal' },
]

export const TextBlockSchema: BlockSchema<TextBlockData> = {
  type: 'text',
  label: '文字',
  icon: '📝',
  supportsChildren: true,
  createDefault: (): TextBlockData => ({
    type: 'text',
    children: [{ value: '', style: {} }],
    style: { textAlign: 'left' },
    isMarkdown: false,
  }),
  styleSchema: textStyleSchema,
  businessSchema: textBusinessSchema,
  itemSchema: textItemSchema,
  createDefaultItem: (): TextItem => ({ value: '', style: {} }),
}

// ===== ImageBlock =====
export interface ImageItem {
  url: string
  aspectRatio?: number
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
  style?: { backgroundColor?: string }
  layout: { type: 'grid' | 'carousel' | 'free'; columns?: number; gap?: number }
}

const imageItemSchema: SchemaField[] = [
  { key: 'url', label: '图片 URL', type: 'input', default: '', placeholder: '输入图片链接' },
  {
    key: 'style.sizeMode',
    label: '尺寸模式',
    type: 'radio',
    default: 'auto',
    options: [
      { label: '自动', value: 'auto' },
      { label: '固定宽', value: 'fixedWidth' },
      { label: '固定高', value: 'fixedHeight' },
      { label: '百分比宽', value: 'percentWidth' },
    ],
  },
  { key: 'style.width', label: '宽度 (px)', type: 'slider', default: 300, min: 50, max: 750, step: 10, visible: (d) => d?.style?.sizeMode === 'fixedWidth' },
  { key: 'style.height', label: '高度 (px)', type: 'slider', default: 300, min: 50, max: 750, step: 10, visible: (d) => d?.style?.sizeMode === 'fixedHeight' },
  { key: 'style.widthPercent', label: '宽度百分比 (%)', type: 'slider', default: 100, min: 10, max: 100, step: 5, visible: (d) => d?.style?.sizeMode === 'percentWidth' },
  { key: 'style.rotate', label: '旋转角度', type: 'slider', default: 0, min: 0, max: 360, step: 5 },
]

const imageStyleSchema: SchemaField[] = [
  {
    key: 'layout.type',
    label: '布局模式',
    type: 'radio',
    default: 'grid',
    options: [
      { label: '网格', value: 'grid' },
      { label: '轮播', value: 'carousel' },
      { label: '自由', value: 'free' },
    ],
  },
  { key: 'layout.columns', label: '网格列数', type: 'slider', default: 2, min: 1, max: 4, step: 1, visible: (d) => d?.layout?.type === 'grid' },
  { key: 'layout.gap', label: '间距 (rpx)', type: 'slider', default: 12, min: 0, max: 40, step: 2 },
  {
    key: 'style.backgroundColor',
    label: '背景色',
    type: 'select',
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
  createDefaultItem: (): ImageItem => ({ url: '', style: { sizeMode: 'auto' } }),
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
  style?: {
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
  { key: 'time', label: '耗时', type: 'input', default: '', placeholder: '如 1h', visible: (d) => !d?.isEnd },
  { key: 'icon', label: '交通图标', type: 'input', default: '', placeholder: '如 🚗', visible: (d) => !d?.isEnd },
  { key: 'desc', label: '描述', type: 'input', default: '', placeholder: '如 接机、换乘等', visible: (d) => !d?.isEnd },
  {
    key: 'type',
    label: '站点类型',
    type: 'radio',
    default: 'normal',
    options: [
      { label: '途经站', value: 'normal' },
      { label: '换乘站', value: 'transfer' },
    ],
    visible: (d) => !d?.isEnd,
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
  url: string
  size?: number
}

export interface AttachmentBlockData {
  type: 'attachment'
  children: AttachmentItem[]
  style?: { backgroundColor?: string }
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
  { key: 'url', label: '附件 URL', type: 'input', default: '', placeholder: '输入附件链接' },
  { key: 'name', label: '文件名', type: 'input', default: '', placeholder: '附件名称' },
]

const attachmentBusinessSchema: SchemaField[] = [
  { key: 'appId', label: '小程序 AppId', type: 'input', default: 'wxd45c635d754dbf59', placeholder: '附件跳转使用的小程序 appId', hint: '保留默认即可，除非有特殊需求' },
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
    appId: 'wxd45c635d754dbf59',
  }),
  styleSchema: attachmentStyleSchema,
  businessSchema: attachmentBusinessSchema,
  itemSchema: attachmentItemSchema,
  createDefaultItem: (): AttachmentItem => ({ name: '新附件.pdf', url: '' }),
}

// ===== MediaBlock =====
export interface MediaItem {
  title: string
  url: string
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
}

export interface MediaBlockData {
  type: 'media'
  children: MediaItem[]
  style?: { backgroundColor?: string }
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
  { key: 'url', label: '媒体 URL', type: 'input', default: '', placeholder: '输入视频/音频链接' },
  { key: 'title', label: '标题', type: 'input', default: '', placeholder: '媒体标题' },
  { key: 'autoplay', label: '自动播放', type: 'switch', default: false },
  { key: 'controls', label: '显示控制条', type: 'switch', default: true },
  { key: 'loop', label: '循环播放', type: 'switch', default: false },
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
    autoplay: false,
    controls: true,
    loop: false,
  }),
}

// ===== 本地 registry =====
const _allSchemas: BlockSchema[] = [
  TextBlockSchema,
  ImageBlockSchema,
  RouteBlockSchema,
  AttachmentBlockSchema,
  MediaBlockSchema,
]

export const getAllBlockSchemas = (): BlockSchema[] => _allSchemas
export const getBlockSchema = (type: string): BlockSchema | undefined => _allSchemas.find(s => s.type === type)
