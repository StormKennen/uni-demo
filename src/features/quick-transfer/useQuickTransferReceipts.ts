import { ref } from 'vue'
import {
  accessQuickTransferReceiptFile,
  deleteQuickTransferReceipt,
  getQuickTransferReceipt,
  listQuickTransferReceipts,
} from './receiptApi'
import { toQuickTransferErrorInfo } from './errors'
import type {
  QuickTransferErrorInfo,
  QuickTransferFileAccessResult,
  QuickTransferReceiptDetail,
  QuickTransferReceiptListItem,
  QuickTransferReceiptListResult,
  QuickTransferReceiptPagination,
} from './types'

const DEFAULT_PAGE_SIZE = 20

const initialPagination = (): QuickTransferReceiptPagination => ({
  page: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  hasNext: true,
})

export const useQuickTransferReceipts = () => {
  const items = ref<QuickTransferReceiptListItem[]>([])
  const pagination = ref<QuickTransferReceiptPagination>(initialPagination())
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const detail = ref<QuickTransferReceiptDetail | null>(null)
  const error = ref<QuickTransferErrorInfo | null>(null)

  const applyListResult = (result: QuickTransferReceiptListResult, reset: boolean) => {
    items.value = reset ? result.items : [...items.value, ...result.items]
    pagination.value = result.pagination
  }

  const loadReceipts = async (reset = true): Promise<boolean> => {
    if (isLoading.value || isLoadingMore.value) return false
    isLoading.value = true
    error.value = null
    try {
      const result = await listQuickTransferReceipts(reset ? 1 : pagination.value.page + 1, DEFAULT_PAGE_SIZE)
      applyListResult(result, reset)
      return true
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '已收飞船加载失败，请稍后重试')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const loadMore = async (): Promise<boolean> => {
    if (!pagination.value.hasNext || isLoading.value || isLoadingMore.value) return false
    isLoadingMore.value = true
    error.value = null
    try {
      const result = await listQuickTransferReceipts(pagination.value.page + 1, pagination.value.pageSize || DEFAULT_PAGE_SIZE)
      applyListResult(result, false)
      return true
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '更多已收飞船加载失败，请稍后重试')
      return false
    } finally {
      isLoadingMore.value = false
    }
  }

  const loadReceiptDetail = async (receiptId: string): Promise<boolean> => {
    if (!receiptId || isLoading.value) return false
    isLoading.value = true
    detail.value = null
    error.value = null
    try {
      detail.value = await getQuickTransferReceipt(receiptId)
      return true
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '已收飞船详情加载失败，请稍后重试')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteReceipt = async (receiptId: string): Promise<boolean> => {
    if (!receiptId || isLoading.value) return false
    isLoading.value = true
    error.value = null
    try {
      await deleteQuickTransferReceipt(receiptId)
      items.value = items.value.filter(item => item.receiptId !== receiptId)
      if (detail.value?.receiptId === receiptId) detail.value = null
      return true
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '已收飞船删除失败，请稍后重试')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const accessReceiptFile = async (receiptId: string, fileId: string): Promise<QuickTransferFileAccessResult | null> => {
    if (!receiptId || !fileId || isLoading.value) return null
    const file = detail.value?.receiptId === receiptId ? detail.value.content.files.find(item => item.fileId === fileId) : undefined
    if (file?.available === false) return null
    isLoading.value = true
    error.value = null
    try {
      return await accessQuickTransferReceiptFile(receiptId, fileId)
    } catch (cause) {
      error.value = toQuickTransferErrorInfo(cause, '文件暂时无法访问，请稍后重试')
      return null
    } finally {
      isLoading.value = false
    }
  }

  const markDetailFileUnavailable = (fileId: string): boolean => {
    const file = detail.value?.content.files.find(item => item.fileId === fileId)
    if (!file) return false
    file.available = false
    return true
  }

  return {
    items,
    pagination,
    isLoading,
    isLoadingMore,
    detail,
    error,
    loadReceipts,
    loadMore,
    loadReceiptDetail,
    deleteReceipt,
    accessReceiptFile,
    markDetailFileUnavailable,
  }
}
