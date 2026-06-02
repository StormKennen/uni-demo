import type { BlockSchema } from '../block-schema'
import type { SchemaField } from '../schema-field'

/**
 * MediaBlock —— 多媒体块（视频/音频）。
 *
 * 注意：Phase 2 仅在 block 级别提供整块默认配置；
 *       item 级别的 autoplay/controls/loop 在 Phase 2.5 单独的 Item 面板里编辑。
 */
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
  style?: {
    backgroundColor?: string
  }
  /** 块级默认值：新增 item 时使用 */
  defaultAutoplay?: boolean
  defaultControls?: boolean
  defaultLoop?: boolean
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
      { label: '深色', value: '#222' },
    ],
  },
]

const itemSchema: SchemaField[] = [
  {
    key: 'url',
    label: '媒体 URL',
    type: 'input',
    default: '',
    placeholder: '输入视频/音频链接',
  },
  {
    key: 'title',
    label: '标题',
    type: 'input',
    default: '',
    placeholder: '媒体标题',
  },
  {
    key: 'autoplay',
    label: '自动播放',
    type: 'switch',
    default: false,
  },
  {
    key: 'controls',
    label: '显示控制条',
    type: 'switch',
    default: true,
  },
  {
    key: 'loop',
    label: '循环播放',
    type: 'switch',
    default: false,
  },
]

const businessSchema: SchemaField[] = [
  {
    key: 'defaultAutoplay',
    label: '默认自动播放',
    type: 'switch',
    default: false,
    hint: '新加入此块的视频/音频默认是否自动播放',
  },
  {
    key: 'defaultControls',
    label: '默认显示控制条',
    type: 'switch',
    default: true,
  },
  {
    key: 'defaultLoop',
    label: '默认循环播放',
    type: 'switch',
    default: false,
  },
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
  styleSchema,
  businessSchema,
  itemSchema,
  createDefaultItem: (): MediaItem => ({
    title: '新视频',
    url: '',
    autoplay: false,
    controls: true,
    loop: false,
  }),
}
