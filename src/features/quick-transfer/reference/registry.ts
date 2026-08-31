import type { QuickShipReferenceDraft, QuickTransferContentReference } from '../types'
import { QUICK_TRANSFER_SEND_CREATE_ROUTE } from '../constants'

export interface QuickTransferReferenceHandler {
  label: string
  buildRoute: (reference: QuickTransferContentReference) => string | null
}

const getReferenceId = (reference: QuickTransferContentReference): string => reference.resourceId || ''

const RTA_SORT_BY = ['pickRate', 'pickCount', 'banRate', 'winRate', 'leaderRate', 'playedCount'] as const
const RTA_SORT_ORDER = ['asc', 'desc'] as const

const getRtaQuery = (reference: QuickTransferContentReference): string => {
  const params = reference.params || {}
  const query: Record<string, string> = {}
  const season = params.season
  const minPickCount = params.minPickCount
  if (typeof season === 'number' && Number.isInteger(season) && season > 0) query.season = String(season)
  if (typeof minPickCount === 'number' && Number.isInteger(minPickCount) && minPickCount >= 0) query.minPickCount = String(minPickCount)
  if (typeof params.tier === 'string' && params.tier) query.tier = params.tier
  if (typeof params.league === 'string' && params.league) query.league = params.league
  if (typeof params.sortBy === 'string' && RTA_SORT_BY.includes(params.sortBy as (typeof RTA_SORT_BY)[number])) query.sortBy = params.sortBy
  if (typeof params.sortOrder === 'string' && RTA_SORT_ORDER.includes(params.sortOrder as (typeof RTA_SORT_ORDER)[number])) {
    query.sortOrder = params.sortOrder
  }
  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
  return queryString ? `?${queryString}` : ''
}

const REGISTRY: Record<string, QuickTransferReferenceHandler> = {
  memoDetail: {
    label: '备忘录',
    buildRoute: reference => {
      const id = getReferenceId(reference)
      return id ? `/subPackages/tools/memo/detail?id=${encodeURIComponent(id)}` : null
    },
  },
  summonersWarCharacter: {
    label: '魔灵召唤 · 人物',
    buildRoute: reference => {
      const id = getReferenceId(reference)
      return id ? `/subPackages/tools/compendium/swc/detail?characterId=${encodeURIComponent(id)}` : null
    },
  },
  rtaRanking: {
    label: '魔灵召唤 · RTA',
    buildRoute: reference => `/subPackages/tools/compendium/swc/rta/index${getRtaQuery(reference)}`,
  },
}

export const QUICK_TRANSFER_REFERENCE_REGISTRY: Readonly<Record<string, QuickTransferReferenceHandler>> = REGISTRY

export const getQuickTransferReferenceHandler = (type: string): QuickTransferReferenceHandler | undefined => REGISTRY[type]

export const toQuickTransferReference = (reference: QuickShipReferenceDraft): QuickTransferContentReference => ({
  type: reference.type,
  resourceId: reference.resourceId,
  params: reference.params,
  title: reference.title,
  subtitle: reference.subtitle,
})

export const openQuickTransferReference = (reference: QuickTransferContentReference): boolean => {
  const handler = getQuickTransferReferenceHandler(reference.type)
  const url = handler?.buildRoute(reference)
  if (!handler || !url) {
    uni.showToast({ title: '当前版本暂不支持打开该内容', icon: 'none' })
    return false
  }
  uni.navigateTo({ url })
  return true
}

let pendingReferences: QuickShipReferenceDraft[] = []

export const prepareQuickShipReference = (reference: QuickShipReferenceDraft): void => {
  pendingReferences = [reference]
}

export const appendQuickShipReference = (reference: QuickShipReferenceDraft): void => {
  pendingReferences = [...pendingReferences, reference]
}

export const consumeQuickShipReferences = (): QuickShipReferenceDraft[] => {
  const references = pendingReferences
  pendingReferences = []
  return references
}

export const openQuickShipWithReference = (reference: QuickShipReferenceDraft): void => {
  prepareQuickShipReference(reference)
  uni.navigateTo({ url: QUICK_TRANSFER_SEND_CREATE_ROUTE })
}
