import type {
  RelayAggregateRowViewModel,
  RelayAggregateViewModel,
  RelayDetailViewModel,
  RelayEntryViewModel,
  RelayFieldConfigViewModel,
  RelayFieldOptionViewModel,
  RelayFieldType,
  RelayFieldValue,
  RelayFieldViewModel,
  RelayListViewModel,
  RelayMineItemViewModel,
  RelayPaginationViewModel,
  RelayParticipantViewModel,
  RelayPermissionsViewModel,
  RelayEntryStatus,
  RelayStatus,
  RelaySettingsViewModel,
  RelayStatisticsViewModel,
  RelayViewModel,
} from './types'

export type UnknownRecord = Record<string, unknown>

export const isRecord = (value: unknown): value is UnknownRecord => Boolean(value && typeof value === 'object' && !Array.isArray(value))

const recordValue = (source: UnknownRecord, key: string): unknown => source[key]

const stringValue = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback)

const nullableStringValue = (value: unknown): string | null => (typeof value === 'string' && value ? value : null)

const numberValue = (value: unknown, fallback = 0): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback)

const nullableNumberValue = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)

const booleanValue = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

const fieldType = (value: unknown): RelayFieldType => {
  if (value === 'textarea' || value === 'number' || value === 'image' || value === 'single_select') return value
  return 'text'
}

const relayStatus = (value: unknown): RelayStatus => {
  if (value === 'closed' || value === 'deleted') return value
  return 'open'
}

const relayEntryStatus = (value: unknown): RelayEntryStatus => {
  if (value === 'withdrawn' || value === 'deleted') return value
  return 'active'
}

const fieldValue = (value: unknown, type: RelayFieldType): RelayFieldValue => {
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value) ? value : null
  if (type === 'image') {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string')
  }
  return typeof value === 'string' ? value : ''
}

const normalizeFieldConfig = (raw: unknown): RelayFieldConfigViewModel => {
  if (!isRecord(raw)) return {}
  const maxCount = nullableNumberValue(recordValue(raw, 'max_count'))
  const maxLength = nullableNumberValue(recordValue(raw, 'maxLength'))
  return {
    min: nullableNumberValue(recordValue(raw, 'min')) ?? undefined,
    max: nullableNumberValue(recordValue(raw, 'max')) ?? undefined,
    maxLength: maxLength ?? undefined,
    maxCount: maxCount ?? undefined,
  }
}

const normalizeOptions = (raw: unknown): RelayFieldOptionViewModel[] => {
  if (!Array.isArray(raw)) return []
  return raw.reduce<RelayFieldOptionViewModel[]>((result, item) => {
    if (!isRecord(item)) return result
    const label = stringValue(recordValue(item, 'label'))
    const value = stringValue(recordValue(item, 'value'))
    if (label && value) result.push({ label, value })
    return result
  }, [])
}

export const normalizeRelayField = (raw: unknown, index = 0): RelayFieldViewModel => {
  const source = isRecord(raw) ? raw : {}
  const type = fieldType(recordValue(source, 'type'))
  const key = stringValue(recordValue(source, 'key'), `field_${index + 1}`)
  return {
    key,
    type,
    label: stringValue(recordValue(source, 'label'), key),
    required: booleanValue(recordValue(source, 'required'), false),
    defaultValue: fieldValue(recordValue(source, 'default_value'), type),
    config: normalizeFieldConfig(recordValue(source, 'config')),
    aggregate: recordValue(source, 'aggregate') === 'sum' ? 'sum' : null,
    options: normalizeOptions(recordValue(source, 'options')),
  }
}

export const normalizeRelaySettings = (raw: unknown): RelaySettingsViewModel => {
  const source = isRecord(raw) ? raw : {}
  return {
    allowGuest: booleanValue(recordValue(source, 'allow_guest'), true),
    allowEditNickname: booleanValue(recordValue(source, 'allow_edit_nickname'), true),
    allowEditEntry: booleanValue(recordValue(source, 'allow_edit_entry'), true),
    allowWithdraw: booleanValue(recordValue(source, 'allow_withdraw'), true),
    maxEntriesPerParticipant: Math.max(1, numberValue(recordValue(source, 'max_entries_per_participant'), 1)),
    deadline: nullableStringValue(recordValue(source, 'deadline')),
    participantLimit: nullableNumberValue(recordValue(source, 'participant_limit')),
    showSequence: booleanValue(recordValue(source, 'show_sequence'), true),
    showParticipantCount: booleanValue(recordValue(source, 'show_participant_count'), true),
    showStatistics: booleanValue(recordValue(source, 'show_statistics'), true),
  }
}

export const normalizeRelay = (raw: unknown): RelayViewModel => {
  const source = isRecord(raw) ? raw : {}
  const share = isRecord(recordValue(source, 'share')) ? (recordValue(source, 'share') as UnknownRecord) : {}
  const fields = Array.isArray(recordValue(source, 'fields')) ? (recordValue(source, 'fields') as unknown[]) : []
  return {
    id: stringValue(recordValue(source, 'id')),
    ownerId: stringValue(recordValue(source, 'owner_id')),
    title: stringValue(recordValue(source, 'title'), '未命名接龙'),
    description: stringValue(recordValue(source, 'description')),
    status: relayStatus(recordValue(source, 'status')),
    schemaVersion: Math.max(1, numberValue(recordValue(source, 'schema_version'), 1)),
    fields: fields.map((field, index) => normalizeRelayField(field, index)),
    settings: normalizeRelaySettings(recordValue(source, 'settings')),
    nextSequenceNo: numberValue(recordValue(source, 'next_sequence_no')),
    share: {
      enabled: booleanValue(recordValue(share, 'enabled'), false),
      createdAt: nullableStringValue(recordValue(share, 'created_at')),
      shareCode: nullableStringValue(recordValue(source, 'shareCode')),
    },
    createdAt: nullableStringValue(recordValue(source, 'createdAt')),
    updatedAt: nullableStringValue(recordValue(source, 'updatedAt')),
  }
}

export const normalizeParticipant = (raw: unknown): RelayParticipantViewModel | null => {
  if (!isRecord(raw)) return null
  const id = stringValue(recordValue(raw, 'id'))
  const nickname = stringValue(recordValue(raw, 'nickname'))
  return id || nickname ? { id, nickname: nickname || '未命名用户' } : null
}

export const normalizePermissions = (raw: unknown): RelayPermissionsViewModel => {
  const source = isRecord(raw) ? raw : {}
  return {
    canJoin: booleanValue(recordValue(source, 'canJoin'), false),
    canEditRelay: booleanValue(recordValue(source, 'canEditRelay'), false),
    canClose: booleanValue(recordValue(source, 'canClose'), false),
    canReopen: booleanValue(recordValue(source, 'canReopen'), false),
    canDeleteRelay: booleanValue(recordValue(source, 'canDeleteRelay'), false),
    canEditNickname: booleanValue(recordValue(source, 'canEditNickname'), false),
    canSubmit: booleanValue(recordValue(source, 'canSubmit'), false),
    canEditOwnEntry: booleanValue(recordValue(source, 'canEditOwnEntry'), false),
    canWithdraw: booleanValue(recordValue(source, 'canWithdraw'), false),
  }
}

export const normalizeStatistics = (raw: unknown): RelayStatisticsViewModel => {
  const source = isRecord(raw) ? raw : {}
  const rawAggregates = isRecord(recordValue(source, 'aggregates')) ? (recordValue(source, 'aggregates') as UnknownRecord) : {}
  const aggregates = Object.entries(rawAggregates).reduce<Record<string, RelayAggregateViewModel>>((result, [key, value]) => {
    if (!isRecord(value) || value.type !== 'sum') return result
    const amount = numberValue(value.value)
    result[key] = { type: 'sum', value: amount }
    return result
  }, {})
  return {
    participantCount: Math.max(0, numberValue(recordValue(source, 'participantCount'))),
    entryCount: Math.max(0, numberValue(recordValue(source, 'entryCount'))),
    aggregates,
  }
}

const valuesRecord = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) return {}
  return Object.entries(value).reduce<Record<string, unknown>>((result, [key, item]) => {
    result[key] = item
    return result
  }, {})
}

export const normalizeRelayEntry = (raw: unknown): RelayEntryViewModel | null => {
  if (!isRecord(raw)) return null
  const participant = normalizeParticipant(recordValue(raw, 'participant'))
  if (!participant) return null
  return {
    id: stringValue(recordValue(raw, 'id')),
    sequenceNo: Math.max(0, numberValue(recordValue(raw, 'sequenceNo'))),
    participant,
    values: valuesRecord(recordValue(raw, 'values')),
    isMine: booleanValue(recordValue(raw, 'isMine'), false),
    status: relayEntryStatus(recordValue(raw, 'status')),
    createdAt: nullableStringValue(recordValue(raw, 'createdAt')),
    updatedAt: nullableStringValue(recordValue(raw, 'updatedAt')),
  }
}

export const unwrapResponse = (raw: unknown): UnknownRecord => {
  if (!isRecord(raw)) return {}
  const nestedData = recordValue(raw, 'data')
  return isRecord(nestedData) && !recordValue(raw, 'relay') && !recordValue(raw, 'items') ? nestedData : raw
}

export const normalizeRelayDetail = (raw: unknown): RelayDetailViewModel => {
  const source = unwrapResponse(raw)
  return {
    relay: normalizeRelay(recordValue(source, 'relay')),
    currentParticipant: normalizeParticipant(recordValue(source, 'currentParticipant')),
    permissions: normalizePermissions(recordValue(source, 'permissions')),
    statistics: normalizeStatistics(recordValue(source, 'statistics')),
  }
}

const normalizePagination = (raw: unknown): RelayPaginationViewModel => {
  const source = isRecord(raw) ? raw : {}
  const page = Math.max(1, numberValue(recordValue(source, 'page'), 1))
  const limit = Math.max(1, numberValue(recordValue(source, 'limit'), 20))
  const totalPages = Math.max(page, numberValue(recordValue(source, 'totalPages'), page))
  return {
    page,
    limit,
    total: Math.max(0, numberValue(recordValue(source, 'total'))),
    totalPages,
    hasNext: booleanValue(recordValue(source, 'hasNext'), page < totalPages),
    hasPrev: booleanValue(recordValue(source, 'hasPrev'), page > 1),
  }
}

const listSource = (raw: unknown): UnknownRecord => unwrapResponse(raw)

export const normalizeRelayEntries = (raw: unknown): RelayListViewModel<RelayEntryViewModel> => {
  const source = listSource(raw)
  const rawItems = Array.isArray(recordValue(source, 'items')) ? (recordValue(source, 'items') as unknown[]) : []
  const items = rawItems.map(normalizeRelayEntry).filter((item): item is RelayEntryViewModel => Boolean(item))
  return { items, pagination: normalizePagination(recordValue(source, 'pagination')) }
}

export const normalizeRelayMineItem = (raw: unknown): RelayMineItemViewModel | null => {
  if (!isRecord(raw)) return null
  const relaySource = recordValue(raw, 'relay') || raw
  const relay = normalizeRelay(relaySource)
  if (!relay.id) return null
  return { relay, participant: normalizeParticipant(recordValue(raw, 'participant')) }
}

export const normalizeRelayMine = (raw: unknown): RelayListViewModel<RelayMineItemViewModel> => {
  const source = listSource(raw)
  const rawItems = Array.isArray(recordValue(source, 'items')) ? (recordValue(source, 'items') as unknown[]) : []
  const items = rawItems.map(normalizeRelayMineItem).filter((item): item is RelayMineItemViewModel => Boolean(item))
  return { items, pagination: normalizePagination(recordValue(source, 'pagination')) }
}

export const getAggregateRows = (detail: RelayDetailViewModel): RelayAggregateRowViewModel[] => {
  const fieldLabels = new Map(detail.relay.fields.map(field => [field.key, field.label]))
  return Object.entries(detail.statistics.aggregates).map(([key, aggregate]) => ({
    key,
    label: fieldLabels.get(key) || key,
    value: aggregate.value,
  }))
}

export const getEntryFieldDisplay = (field: RelayFieldViewModel, value: unknown): string => {
  if (field.type === 'image') return ''
  if (field.type === 'single_select') return field.options.find(option => option.value === value)?.label || String(value || '')
  if (field.type === 'number') return typeof value === 'number' ? String(value) : ''
  return typeof value === 'string' ? value : ''
}
