import type { LineupStatus, LineupType } from '@/services/compendium-lineups'

export const ALL_VALUE = ''

export interface FilterOption {
  label: string
  value: string
}

export const LINEUP_FILTER_TYPE_OPTIONS: FilterOption[] = [
  { label: '全部', value: ALL_VALUE },
  { label: '进攻', value: 'offense' },
  { label: '防御', value: 'defense' },
]

export const LINEUP_FILTER_STATUS_OPTIONS: FilterOption[] = [
  { label: '全部', value: ALL_VALUE },
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

export const LINEUP_TYPE_OPTIONS: Array<{ label: string; value: LineupType }> = [
  { label: '进攻阵容', value: 'offense' },
  { label: '防御阵容', value: 'defense' },
]

export const LINEUP_STATUS_OPTIONS: Array<{ label: string; value: LineupStatus }> = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

export const getLineupTypeLabel = (type: string): string => {
  if (type === 'offense') return '进攻'
  if (type === 'defense') return '防御'
  return type || '未知'
}

export const getLineupStatusLabel = (status: string): string => {
  if (status === 'enabled') return '启用'
  if (status === 'disabled') return '停用'
  return status || '未知'
}
