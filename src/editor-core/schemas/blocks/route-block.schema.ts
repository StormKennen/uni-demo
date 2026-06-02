import type { BlockSchema } from '../block-schema'
import type { SchemaField } from '../schema-field'

/**
 * RouteBlock —— 行程路径块。
 *
 * 数据形状刻意贴近旧 editor.vue 的 RouteBlock，以便后续 memo-v2 直接使用同一份 JSON。
 *   - content: 路径节点数组
 *   - showTime: 是否显示时间列
 */
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
    key: 'showTime',
    label: '显示时间列',
    type: 'switch',
    default: true,
    hint: '关闭后只展示站点名称与描述',
  },
]

const itemSchema: SchemaField[] = [
  {
    key: 'name',
    label: '站点名称',
    type: 'input',
    default: '',
    placeholder: '请输入站点名称',
  },
  {
    key: 'time',
    label: '耗时',
    type: 'input',
    default: '',
    placeholder: '如 1h',
    visible: (d) => !d?.isEnd,
  },
  {
    key: 'icon',
    label: '交通图标',
    type: 'input',
    default: '',
    placeholder: '如 🚗',
    visible: (d) => !d?.isEnd,
  },
  {
    key: 'desc',
    label: '描述',
    type: 'input',
    default: '',
    placeholder: '如 接机、换乘等',
    visible: (d) => !d?.isEnd,
  },
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
  {
    key: 'isEnd',
    label: '终点站',
    type: 'switch',
    default: false,
    hint: '标记为路径终点',
  },
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
  styleSchema,
  businessSchema,
  itemSchema,
  itemArrayKey: 'content',
  createDefaultItem: (): RouteNode => ({
    name: '新站点',
    type: 'normal',
  }),
}
