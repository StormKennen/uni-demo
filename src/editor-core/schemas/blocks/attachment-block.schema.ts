import type { BlockSchema } from '../block-schema'
import type { SchemaField } from '../schema-field'

/**
 * AttachmentBlock —— 附件块。
 *   - children: 附件项数组（name + url + size?）
 *   - appId: 关联的微信小程序 appId（在小程序内可跳转打开附件）
 */
export interface AttachmentItem {
  name: string
  url: string
  size?: number
}

export interface AttachmentBlockData {
  type: 'attachment'
  children: AttachmentItem[]
  style?: {
    backgroundColor?: string
  }
  appId?: string
}

const styleSchema: SchemaField[] = [
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

const itemSchema: SchemaField[] = [
  {
    key: 'url',
    label: '附件 URL',
    type: 'input',
    default: '',
    placeholder: '输入附件链接',
  },
  {
    key: 'name',
    label: '文件名',
    type: 'input',
    default: '',
    placeholder: '附件名称',
  },
]

const businessSchema: SchemaField[] = [
  {
    key: 'appId',
    label: '小程序 AppId',
    type: 'input',
    default: 'wxd45c635d754dbf59',
    placeholder: '附件跳转使用的小程序 appId',
    hint: '保留默认即可，除非有特殊需求',
  },
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
  styleSchema,
  businessSchema,
  itemSchema,
  createDefaultItem: (): AttachmentItem => ({
    name: '新附件.pdf',
    url: '',
  }),
}
