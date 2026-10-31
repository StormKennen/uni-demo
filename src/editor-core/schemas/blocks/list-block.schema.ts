import type { BlockSchema } from '../block-schema'
import type { SchemaField } from '../schema-field'

export type ListMode = 'ordered' | 'priority'
export type ListPriority = 'P0' | 'P1' | 'P2' | 'P3'

export interface ListItem {
  text: string
  priority?: ListPriority
  desc?: string
}

export interface ListBlockData {
  type: 'list'
  children: ListItem[]
  mode: ListMode
  sortMode?: 'manual'
  style?: {
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
  }
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

const businessSchema: SchemaField[] = [
  {
    key: 'mode',
    label: '列表类型',
    type: 'radio',
    default: 'ordered',
    options: [
      { label: '有序列表', value: 'ordered' },
      { label: '优先级列表', value: 'priority' },
    ],
  },
]

const itemSchema: SchemaField[] = [
  { key: 'text', label: '内容', type: 'textarea', default: '', placeholder: '请输入列表内容' },
  { key: 'desc', label: '补充说明', type: 'textarea', default: '', placeholder: '可选' },
  {
    key: 'priority',
    label: '优先级',
    type: 'select',
    options: [
      { label: 'P0 最高', value: 'P0' },
      { label: 'P1 高', value: 'P1' },
      { label: 'P2 普通', value: 'P2' },
      { label: 'P3 低', value: 'P3' },
    ],
    visible: draft => draft?.__listMode === 'priority',
  },
]

export const ListBlockSchema: BlockSchema<ListBlockData> = {
  type: 'list',
  label: '列表',
  icon: '☷',
  supportsChildren: true,
  createDefault: (): ListBlockData => ({
    type: 'list',
    mode: 'ordered',
    sortMode: 'manual',
    children: [{ text: '新列表项' }],
    style: {},
  }),
  styleSchema,
  businessSchema,
  itemSchema,
  createDefaultItem: (): ListItem => ({ text: '' }),
}
