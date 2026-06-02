import type { BlockSchema } from '../block-schema'
import type { SchemaField } from '../schema-field'

/**
 * TextBlock 数据形状（Phase 1 简化版）
 *
 * 注意：这里的 TextBlock 与 src/subPackages/services/memo/editor.vue 中的 TextBlock
 *       结构刻意保持「相似但独立」——本目录是新内核试验区，不耦合现有类型，
 *       将来迁移时再做模型对齐。
 */
/**
 * TextItem —— 文本块的子项。
 *   - `style` 覆盖旧 editor.vue 的所有富文本样式字段
 *   - `linkInfo` / `linkIcon` / `interactionType` 保留旧数据结构但 Phase 3a 不在 UI 中编辑
 *     （Phase 3b 由专门的 LinkConfigPanel 处理）
 */
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
  // 以下三个字段保留以兼容旧数据；Phase 3a UI 暂不编辑
  linkInfo?: Record<string, any>
  linkIcon?: string
  interactionType?: 'normal' | 'popup' | string
}

export interface TextBlockData {
  type: 'text'
  /** 文本块的子项，每个 item 一段文字 */
  children: TextItem[]
  /** 块级样式 */
  style?: {
    textAlign?: 'left' | 'center' | 'right'
    backgroundColor?: string
    borderTop?: boolean
    borderBottom?: boolean
  }
  /** 业务字段 */
  isMarkdown?: boolean
}

const styleSchema: SchemaField[] = [
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
    key: 'style.borderTop',
    label: '顶部边框',
    type: 'switch',
    default: false,
  },
  {
    key: 'style.borderBottom',
    label: '底部边框',
    type: 'switch',
    default: false,
  },
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

const businessSchema: SchemaField[] = [
  {
    key: 'isMarkdown',
    label: 'Markdown 模式',
    type: 'switch',
    default: false,
    hint: '开启后整块按 Markdown 语法渲染',
  },
]

/** 文本 item 级字段 —— 富文本基础样式 + 链接系统 */
const itemSchema: SchemaField[] = [
  { key: 'value', label: '文本内容', type: 'textarea', default: '', placeholder: '输入段落内容...' },
  { key: 'style.bold', label: '粗体', type: 'switch', default: false },
  { key: 'style.italic', label: '斜体', type: 'switch', default: false },
  { key: 'style.underline', label: '下划线', type: 'switch', default: false },
  { key: 'style.lineThrough', label: '删除线', type: 'switch', default: false },
  {
    key: 'style.fontSize',
    label: '字号',
    type: 'slider',
    default: 16,
    min: 12,
    max: 36,
    step: 1,
  },
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

  // ── 链接系统（5 种交互类型）──────────────────────────────
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
  // 通用：显示文本（非 normal 时显示）
  {
    key: 'linkInfo.label',
    label: '链接显示文本',
    type: 'input',
    default: '',
    placeholder: '留空则使用段落内容',
    visible: (d) => d?.interactionType && d.interactionType !== 'normal',
  },
  // url —— 外部链接
  {
    key: 'linkInfo.url',
    label: '目标 URL',
    type: 'input',
    default: '',
    placeholder: 'https://example.com',
    visible: (d) => d?.interactionType === 'url',
  },
  // popup —— 内容弹窗
  {
    key: 'linkInfo.popupContent',
    label: '弹窗内容',
    type: 'textarea',
    default: '',
    placeholder: '支持 Markdown 语法',
    visible: (d) => d?.interactionType === 'popup',
  },
  {
    key: 'linkInfo.popupIsMarkdown',
    label: 'Markdown 渲染',
    type: 'switch',
    default: true,
    visible: (d) => d?.interactionType === 'popup',
  },
  // navigation —— 地图导航
  {
    key: 'linkInfo.address',
    label: '目的地地址',
    type: 'input',
    default: '',
    placeholder: '如：北京市朝阳区 xxx',
    visible: (d) => d?.interactionType === 'navigation',
  },
  {
    key: 'linkInfo.latitude',
    label: '纬度',
    type: 'input',
    default: '',
    placeholder: '如：39.9042',
    visible: (d) => d?.interactionType === 'navigation',
  },
  {
    key: 'linkInfo.longitude',
    label: '经度',
    type: 'input',
    default: '',
    placeholder: '如：116.4074',
    visible: (d) => d?.interactionType === 'navigation',
  },
  // anchor —— 锚点跳转
  {
    key: 'linkInfo.anchorId',
    label: '锚点 ID',
    type: 'input',
    default: '',
    placeholder: '如：L1、section2',
    hint: '与页面内块的 anchor 字段对应',
    visible: (d) => d?.interactionType === 'anchor',
  },
  // internal —— 关联素材
  {
    key: 'linkInfo.internalTitle',
    label: '素材标题',
    type: 'input',
    default: '',
    placeholder: '关联备忘录或内容标题',
    visible: (d) => d?.interactionType === 'internal',
  },
  {
    key: 'linkInfo.internalId',
    label: '素材 ID',
    type: 'input',
    default: '',
    placeholder: '关联内容的 ID',
    visible: (d) => d?.interactionType === 'internal',
  },
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
  styleSchema,
  businessSchema,
  itemSchema,
  createDefaultItem: (): TextItem => ({
    value: '',
    style: {},
  }),
}
