import type { RelayFormState } from './types'
import type { postRelaysBodyFields, postRelaysBodySettings } from '@/services/apifox/NODEJSDEMO/RELAYS/interface'

export interface RelayPreset {
  key: RelayFormState['preset']
  label: string
  description: string
  fields: postRelaysBodyFields[]
  settings: Partial<postRelaysBodySettings>
}

export const RELAY_PRESETS: RelayPreset[] = [
  {
    key: 'free',
    label: '自由接龙',
    description: '适合简单报名、收集留言和图片',
    fields: [
      { key: 'content', type: 'textarea', label: '接龙内容', required: true, config: { maxLength: 500 } },
      { key: 'images', type: 'image', label: '图片', required: false, config: { max_count: 9 } },
    ],
    settings: { show_statistics: false },
  },
  {
    key: 'activity',
    label: '活动报名',
    description: '适合聚会、活动和多人报名',
    fields: [
      { key: 'count', type: 'number', label: '报名人数', required: true, aggregate: 'sum', config: { min: 1, max: 20 } },
      { key: 'remark', type: 'textarea', label: '备注', required: false, config: { maxLength: 500 } },
      { key: 'images', type: 'image', label: '图片', required: false, config: { max_count: 9 } },
    ],
    settings: { show_statistics: true },
  },
  {
    key: 'gallery',
    label: '晒图接龙',
    description: '适合作品、照片和现场分享',
    fields: [
      { key: 'content', type: 'textarea', label: '文字说明', required: false, config: { maxLength: 500 } },
      { key: 'images', type: 'image', label: '图片', required: true, config: { max_count: 9 } },
    ],
    settings: { show_statistics: false },
  },
]

export const getRelayPreset = (key: RelayFormState['preset']): RelayPreset =>
  RELAY_PRESETS.find(item => item.key === key) || RELAY_PRESETS[0]

export const buildRelayFields = (form: RelayFormState): postRelaysBodyFields[] => {
  const preset = getRelayPreset(form.preset)
  return preset.fields
    .filter(field => form.enableImages || field.type !== 'image')
    .map(field => {
      if (field.type !== 'number') return field
      return {
        ...field,
        config: { ...field.config, min: form.defaultNumber > 0 ? Math.min(form.defaultNumber, 20) : 1 },
      }
    })
}

export const buildRelaySettings = (form: RelayFormState): postRelaysBodySettings => {
  const preset = getRelayPreset(form.preset)
  return {
    allow_guest: true,
    allow_edit_nickname: form.allowEditNickname,
    allow_edit_entry: form.allowEditEntry,
    allow_withdraw: form.allowWithdraw,
    max_entries_per_participant: form.maxEntriesPerParticipant,
    deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    show_participant_count: true,
    show_sequence: true,
    show_statistics: form.enableStatistics && preset.settings.show_statistics !== false,
  }
}
