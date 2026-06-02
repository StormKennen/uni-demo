import type { BlockSchema } from '../block-schema'
import type { SchemaField } from '../schema-field'

/**
 * ImageBlock 数据形状（Phase 1 简化版）
 *
 * 重点：通过 layout.type 控制有限自由布局（grid / carousel / free）
 *       —— 这是 Block 控制布局、Item 控制局部样式的范例。
 */
export interface ImageItem {
  url: string
  /** 单个图片的局部样式：宽高比 / 占位提示等（Item 局部） */
  aspectRatio?: number
  /** 兼容旧数据：图片尺寸控制 */
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
  style?: {
    backgroundColor?: string
  }
  /** 布局信息：Block 控制布局 */
  layout: {
    type: 'grid' | 'carousel' | 'free'
    /** grid 模式下的列数（1-4），其它模式无意义 */
    columns?: number
    /** 项间距，单位 rpx */
    gap?: number
  }
}

const itemSchema: SchemaField[] = [
  {
    key: 'url',
    label: '图片 URL',
    type: 'input',
    default: '',
    placeholder: '输入图片链接',
  },
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
  {
    key: 'style.width',
    label: '宽度 (px)',
    type: 'slider',
    default: 300,
    min: 50,
    max: 750,
    step: 10,
    visible: (d) => d?.style?.sizeMode === 'fixedWidth',
  },
  {
    key: 'style.height',
    label: '高度 (px)',
    type: 'slider',
    default: 300,
    min: 50,
    max: 750,
    step: 10,
    visible: (d) => d?.style?.sizeMode === 'fixedHeight',
  },
  {
    key: 'style.widthPercent',
    label: '宽度百分比 (%)',
    type: 'slider',
    default: 100,
    min: 10,
    max: 100,
    step: 5,
    visible: (d) => d?.style?.sizeMode === 'percentWidth',
  },
  {
    key: 'style.rotate',
    label: '旋转角度',
    type: 'slider',
    default: 0,
    min: 0,
    max: 360,
    step: 5,
  },
]

const styleSchema: SchemaField[] = [
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
  {
    key: 'layout.columns',
    label: '网格列数',
    type: 'slider',
    default: 2,
    min: 1,
    max: 4,
    step: 1,
    // 仅在 grid 模式下显示
    visible: (d) => d?.layout?.type === 'grid',
  },
  {
    key: 'layout.gap',
    label: '间距 (rpx)',
    type: 'slider',
    default: 12,
    min: 0,
    max: 40,
    step: 2,
  },
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
  styleSchema,
  itemSchema,
  createDefaultItem: (): ImageItem => ({
    url: '',
    style: { sizeMode: 'auto' },
  }),
}
