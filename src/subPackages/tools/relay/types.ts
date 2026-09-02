import type { postRelaysBody } from '@/services/apifox/NODEJSDEMO/RELAYS/interface'

export type RelayFieldType = 'text' | 'textarea' | 'number' | 'image' | 'single_select'
export type RelayStatus = 'open' | 'closed' | 'deleted'
export type RelayEntryStatus = 'active' | 'withdrawn' | 'deleted'
export type RelayFieldValue = string | number | string[] | null

export interface RelayFieldOptionViewModel {
  label: string
  value: string
}

export interface RelayFieldConfigViewModel {
  min?: number
  max?: number
  maxLength?: number
  maxCount?: number
}

export interface RelayFieldViewModel {
  key: string
  type: RelayFieldType
  label: string
  required: boolean
  defaultValue: RelayFieldValue
  config: RelayFieldConfigViewModel
  aggregate: 'sum' | null
  options: RelayFieldOptionViewModel[]
}

export interface RelaySettingsViewModel {
  allowGuest: boolean
  allowEditNickname: boolean
  allowEditEntry: boolean
  allowWithdraw: boolean
  maxEntriesPerParticipant: number
  deadline: string | null
  participantLimit: number | null
  showSequence: boolean
  showParticipantCount: boolean
  showStatistics: boolean
}

export interface RelayShareViewModel {
  enabled: boolean
  createdAt: string | null
  shareCode: string | null
}

export interface RelayViewModel {
  id: string
  ownerId: string
  title: string
  description: string
  status: RelayStatus
  schemaVersion: number
  fields: RelayFieldViewModel[]
  settings: RelaySettingsViewModel
  nextSequenceNo: number
  share: RelayShareViewModel
  createdAt: string | null
  updatedAt: string | null
}

export interface RelayParticipantViewModel {
  id: string
  nickname: string
}

export interface RelayAggregateViewModel {
  type: 'sum'
  value: number
}

export interface RelayStatisticsViewModel {
  participantCount: number
  entryCount: number
  aggregates: Record<string, RelayAggregateViewModel>
}

export interface RelayPermissionsViewModel {
  canJoin: boolean
  canEditRelay: boolean
  canClose: boolean
  canReopen: boolean
  canDeleteRelay: boolean
  canEditNickname: boolean
  canSubmit: boolean
  canEditOwnEntry: boolean
  canWithdraw: boolean
}

export interface RelayDetailViewModel {
  relay: RelayViewModel
  currentParticipant: RelayParticipantViewModel | null
  permissions: RelayPermissionsViewModel
  statistics: RelayStatisticsViewModel
}

export interface RelayEntryViewModel {
  id: string
  sequenceNo: number
  participant: RelayParticipantViewModel
  values: Record<string, unknown>
  isMine: boolean
  status: RelayEntryStatus
  createdAt: string | null
  updatedAt: string | null
}

export interface RelayPaginationViewModel {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface RelayMineItemViewModel {
  relay: RelayViewModel
  participant: RelayParticipantViewModel | null
}

export interface RelayListViewModel<T> {
  items: T[]
  pagination: RelayPaginationViewModel
}

export interface RelayFormState {
  title: string
  description: string
  preset: 'free' | 'activity' | 'gallery'
  enableImages: boolean
  enableStatistics: boolean
  defaultNumber: number
  deadline: string
  maxEntriesPerParticipant: number
  allowEditNickname: boolean
  allowEditEntry: boolean
  allowWithdraw: boolean
}

export type RelayCreatePayload = postRelaysBody

export interface RelayImageValue {
  fileId: string
  url: string
  state: 'local' | 'uploading' | 'uploaded' | 'failed'
  localPath?: string
  fileName?: string
  fileSize?: number
}

export interface RelayEntryFormState {
  nickname: string
  values: Record<string, RelayFieldValue>
  images: Record<string, RelayImageValue[]>
}

export interface RelayAggregateRowViewModel {
  key: string
  label: string
  value: number
}
