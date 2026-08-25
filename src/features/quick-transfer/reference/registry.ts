import type { QuickShipReferenceDraft, QuickTransferContentReference } from '../types'

export interface QuickTransferReferenceHandler {
  label: string
  buildRoute: (reference: QuickTransferContentReference) => string | null
}

const getReferenceId = (reference: QuickTransferContentReference): string => reference.resourceId || ''

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
    buildRoute: () => '/subPackages/tools/compendium/swc/rta/index',
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
  uni.navigateTo({ url: '/subPackages/tools/quick-transfer/index?mode=send' })
}
