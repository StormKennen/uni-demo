import { computed, ref } from 'vue'
import { cancelQuickTransfer } from './api'
import {
  accessQuickTransferSentRecordFile,
  deleteQuickTransferSentRecord,
  getQuickTransferSentRecord,
  listQuickTransferSentRecords,
} from './sentRecordApi'
import { toQuickTransferErrorInfo } from './errors'
import type {
  QuickTransferErrorInfo,
  QuickTransferFileAccessResult,
  QuickTransferSentRecordDetail,
  QuickTransferSentRecordListItem,
  QuickTransferSentRecordListResult,
  QuickTransferReceiptPagination,
} from './types'

const DEFAULT_PAGE_SIZE = 20

const initialPagination = (): QuickTransferReceiptPagination => ({
  page: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  hasNext: true,
})

export const useQuickTransferSentRecords = () => {
  const items = ref<QuickTransferSentRecordListItem[]>([])
  const detail = ref<QuickTransferSentRecordDetail | null>(null)
  const pagination = ref<QuickTransferReceiptPagination>(initialPagination())
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const deletingIds = ref<Set<string>>(new Set())
  const isDeleting = computed(() => deletingIds.value.size > 0)
  const isRecalling = ref(false)
  const isDownloading = ref(false)
  const error = ref<QuickTransferErrorInfo | null>(null)
  const loadMoreError = ref<QuickTransferErrorInfo | null>(null)
  const hiddenRecordIds = new Set<string>()

  const isDeletingRecord = (sentRecordId: string): boolean => deletingIds.value.has(sentRecordId)

  const setDeleting = (sentRecordId: string, deleting: boolean): void => {
    const next = new Set(deletingIds.value)
    if (deleting) next.add(sentRecordId)
    else next.delete(sentRecordId)
    deletingIds.value = next
  }

  const applyListResult = (result: QuickTransferSentRecordListResult, reset: boolean) => {
    if (reset) {
      items.value = result.items.filter(item => !hiddenRecordIds.has(item.sentRecordId))
    } else {
      const existingIds = new Set(items.value.map(item => item.sentRecordId))
      items.value = [
        ...items.value,
        ...result.items.filter(item => !existingIds.has(item.sentRecordId) && !hiddenRecordIds.has(item.sentRecordId)),
      ]
    }
    pagination.value = result.pagination
  }

  const loadSentRecords = async (reset = true): Promise<boolean> => {
    if (isLoading.value || isLoadingMore.value) return false
    isLoading.value = true
    error.value = null
    if (reset) loadMoreError.value = null
    try {
      const result = await listQuickTransferSentRecords(reset ? 1 : pagination.value.page + 1, DEFAULT_PAGE_SIZE)
      applyListResult(result, reset)
      return true
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '我发送的加载失败，请稍后重试')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const loadMore = async (): Promise<boolean> => {
    if (!pagination.value.hasNext || isLoading.value || isLoadingMore.value) return false
    isLoadingMore.value = true
    loadMoreError.value = null
    error.value = null
    try {
      const result = await listQuickTransferSentRecords(pagination.value.page + 1, pagination.value.pageSize || DEFAULT_PAGE_SIZE)
      applyListResult(result, false)
      return true
    } catch (cause) {
      const info = toQuickTransferErrorInfo(cause, '更多发送记录加载失败，请稍后重试')
      error.value = info
      loadMoreError.value = info
      return false
    } finally {
      isLoadingMore.value = false
    }
  }

  const loadSentRecordDetail = async (sentRecordId: string): Promise<boolean> => {
    if (!sentRecordId || isLoading.value) return false
    isLoading.value = true
    detail.value = null
    error.value = null
    try {
      detail.value = await getQuickTransferSentRecord(sentRecordId)
      return true
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '发送记录详情加载失败，请稍后重试')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const refreshSentRecordDetail = async (): Promise<boolean> => {
    const sentRecordId = detail.value?.sentRecordId
    if (!sentRecordId || isLoading.value) return false
    try {
      detail.value = await getQuickTransferSentRecord(sentRecordId)
      error.value = null
      return true
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '发送记录详情加载失败，请稍后重试')
      return false
    }
  }

  const deleteSentRecord = async (sentRecordId: string): Promise<boolean> => {
    if (!sentRecordId || isDeletingRecord(sentRecordId) || isRecalling.value || isLoading.value) return false
    setDeleting(sentRecordId, true)
    error.value = null
    try {
      await deleteQuickTransferSentRecord(sentRecordId)
      hiddenRecordIds.add(sentRecordId)
      items.value = items.value.filter(item => item.sentRecordId !== sentRecordId)
      if (detail.value?.sentRecordId === sentRecordId) detail.value = null
      return true
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '删除失败，请重试')
      return false
    } finally {
      setDeleting(sentRecordId, false)
    }
  }

  const recallSentRecord = async (): Promise<boolean> => {
    const current = detail.value
    if (!current?.canRecall || isRecalling.value || isDeleting.value || isLoading.value) return false
    isRecalling.value = true
    error.value = null
    try {
      await cancelQuickTransfer(current.transferId, current.maxClaims)
      return await refreshSentRecordDetail()
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '飞船召回失败，请稍后重试')
      return false
    } finally {
      isRecalling.value = false
    }
  }

  const accessSentRecordFile = async (sentRecordId: string, fileId: string): Promise<QuickTransferFileAccessResult | null> => {
    if (!sentRecordId || !fileId || isDownloading.value) return null
    const file = detail.value?.sentRecordId === sentRecordId ? detail.value.content.files.find(item => item.fileId === fileId) : undefined
    if (file?.available === false) return null
    isDownloading.value = true
    error.value = null
    try {
      return await accessQuickTransferSentRecordFile(sentRecordId, fileId)
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '文件暂时无法访问，请稍后重试')
      return null
    } finally {
      isDownloading.value = false
    }
  }

  const markFileUnavailable = (fileId: string): boolean => {
    const file = detail.value?.content.files.find(item => item.fileId === fileId)
    if (!file) return false
    file.available = false
    return true
  }

  return {
    items,
    detail,
    pagination,
    isLoading,
    isLoadingMore,
    isDeleting,
    deletingIds,
    isDeletingRecord,
    isRecalling,
    isDownloading,
    error,
    loadMoreError,
    loadSentRecords,
    loadMore,
    loadSentRecordDetail,
    refreshSentRecordDetail,
    deleteSentRecord,
    recallSentRecord,
    accessSentRecordFile,
    markFileUnavailable,
  }
}
