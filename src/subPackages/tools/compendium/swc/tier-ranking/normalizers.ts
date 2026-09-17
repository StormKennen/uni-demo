import type { TierRankingCharacter, TierRankingConfig, TierRankingItem, TierRankingOption, TierRankingReport } from './types'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null && !Array.isArray(value)

const toRecord = (value: unknown): UnknownRecord => (isRecord(value) ? value : {})

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const unwrapBusinessData = (response: unknown): UnknownRecord => {
  const root = toRecord(response)
  return isRecord(root.data) ? root.data : root
}

const normalizeOption = (source: unknown, fallbackKey = ''): TierRankingOption => {
  const record = toRecord(source)
  const key = toText(record.key ?? record.value) || fallbackKey
  const sortOrder = toNumber(record.sortOrder)
  return {
    key,
    name: toText(record.name ?? record.label) || key,
    ...(sortOrder === null ? {} : { sortOrder }),
  }
}

const normalizeCharacter = (source: unknown): TierRankingCharacter | null => {
  const record = toRecord(source)
  const id = toText(record.id ?? record._id ?? record.characterId)
  if (!id) return null
  const stars = toNumber(record.stars)
  return {
    id,
    code: toText(record.code),
    name: toText(record.name) || toText(record.code),
    avatar: toText(record.avatar),
    stars,
    element: record.element ? normalizeOption(record.element) : null,
  }
}

const normalizeItem = (source: unknown, index: number): TierRankingItem => {
  const record = toRecord(source)
  const tier = normalizeOption(record.tier)
  const sourceRecord = toRecord(record.source)
  return {
    id: toText(record.id) || `${tier.key}:${index}`,
    rank: toNumber(record.rank) ?? toNumber(record.sortOrder) ?? index + 1,
    character: normalizeCharacter(record.character),
    tier,
    sortOrder: toNumber(record.sortOrder) ?? index + 1,
    score: toNumber(record.score),
    source: {
      externalKey: toText(sourceRecord.externalKey),
      name: toText(sourceRecord.name),
    },
  }
}

export const normalizeTierRankingConfig = (response: unknown): TierRankingConfig => {
  const data = unwrapBusinessData(response)
  const rawProviders = Array.isArray(data.providers) ? data.providers : []
  const rawRegions = Array.isArray(data.regions) ? data.regions : []
  const rawTiers = Array.isArray(data.tiers) ? data.tiers : []
  const rawElements = Array.isArray(data.elements) ? data.elements : []
  const capabilities = toRecord(data.capabilities)
  return {
    provider: toText(data.provider),
    providers: rawProviders.map(toText).filter(Boolean),
    regions: rawRegions.map(toText).filter(Boolean),
    tiers: rawTiers.map(item => normalizeOption(item)).filter(item => Boolean(item.key)),
    elements: rawElements.map(item => normalizeOption(item)).filter(item => Boolean(item.key)),
    capabilities: {
      tierRanking: capabilities.tierRanking === true,
      mapping: capabilities.mapping === true,
      import: capabilities.import === true,
      publish: capabilities.publish === true,
      history: capabilities.history === true,
    },
  }
}

export const normalizeTierRankingReport = (response: unknown): TierRankingReport => {
  const data = unwrapBusinessData(response)
  const rawItems = Array.isArray(data.items) ? data.items : []
  const region = normalizeOption(data.region)
  return {
    id: toText(data.id),
    reportDate: toText(data.reportDate),
    season: Math.floor(toNumber(data.season) ?? 0),
    gameVersion: toText(data.gameVersion),
    region,
    provider: toText(data.provider),
    revision: Math.floor(toNumber(data.revision) ?? 1),
    items: rawItems.map(normalizeItem),
  }
}

export const getTierRankingErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message
  if (isRecord(error) && typeof error.message === 'string' && error.message) return error.message
  return fallback
}

export const formatReportDate = (value: string): string => {
  if (!value) return '--'
  const date = value.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : value
}
