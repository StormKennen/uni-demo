import { computed, ref } from 'vue'
import { normalizeRelayDetail } from '../normalizers'
import type { RelayDetailViewModel } from '../types'
import { getRelaysRelayId, getRelaysSharedShareCode } from '@/services/apifox/NODEJSDEMO/RELAYS/apifox'

export const useRelayDetail = () => {
  const detail = ref<RelayDetailViewModel | null>(null)
  const error = ref<unknown>(null)
  const isLoading = ref(false)
  const isNotFound = computed(() => {
    if (!error.value || typeof error.value !== 'object') return false
    const source = error.value as { code?: unknown; statusCode?: unknown }
    return source.code === 404 || source.statusCode === 404
  })

  const load = async (options: { id?: string; shareCode?: string }): Promise<RelayDetailViewModel | null> => {
    const id = options.id?.trim() || ''
    const shareCode = options.shareCode?.trim() || ''
    if (!id && !shareCode) {
      error.value = new Error('接龙参数无效')
      return null
    }
    isLoading.value = true
    error.value = null
    try {
      const raw: unknown = shareCode ? await getRelaysSharedShareCode(shareCode) : await getRelaysRelayId(id)
      detail.value = normalizeRelayDetail(raw)
      return detail.value
    } catch (loadError: unknown) {
      error.value = loadError
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { detail, error, isLoading, isNotFound, load }
}
