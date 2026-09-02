import { ref } from 'vue'
import { normalizeRelayEntries } from '../normalizers'
import type { RelayEntryViewModel, RelayPaginationViewModel } from '../types'
import { getRelaysRelayIdEntries } from '@/services/apifox/NODEJSDEMO/RELAYS/apifox'

const DEFAULT_PAGE_SIZE = 20

export const useRelayEntries = () => {
  const entries = ref<RelayEntryViewModel[]>([])
  const pagination = ref<RelayPaginationViewModel>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  })
  const error = ref<unknown>(null)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)

  const load = async (relayId: string, reset = true): Promise<boolean> => {
    if (!relayId || (reset ? isLoading.value : isLoadingMore.value)) return false
    const nextPage = reset ? 1 : pagination.value.page + 1
    if (!reset && !pagination.value.hasNext) return true
    if (reset) isLoading.value = true
    else isLoadingMore.value = true
    error.value = null
    try {
      const raw: unknown = await getRelaysRelayIdEntries(relayId, { page: nextPage, pageSize: DEFAULT_PAGE_SIZE })
      const result = normalizeRelayEntries(raw)
      entries.value = reset ? result.items : [...entries.value, ...result.items]
      pagination.value = result.pagination
      return true
    } catch (loadError: unknown) {
      error.value = loadError
      return false
    } finally {
      if (reset) isLoading.value = false
      else isLoadingMore.value = false
    }
  }

  const loadMore = async (relayId: string): Promise<boolean> => load(relayId, false)

  return { entries, pagination, error, isLoading, isLoadingMore, load, loadMore }
}
