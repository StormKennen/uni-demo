interface ApiErrorRecord {
  code?: number | string
  statusCode?: number
  message?: string
  msg?: string
  data?: {
    message?: string
    msg?: string
  }
  errMsg?: string
}

const readErrorRecord = (error: unknown): ApiErrorRecord => {
  if (!error || typeof error !== 'object') return {}
  return error as ApiErrorRecord
}

export const readSettingErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string' && error.trim()) return error.trim()
  const detail = readErrorRecord(error)
  return (
    detail.message?.trim() ||
    detail.msg?.trim() ||
    detail.data?.message?.trim() ||
    detail.data?.msg?.trim() ||
    detail.errMsg?.trim() ||
    fallback
  )
}

export const showSettingError = (error: unknown, fallback: string): void => {
  const detail = readErrorRecord(error)
  if (detail.code === 429 || detail.statusCode === 429) return
  uni.showToast({
    title: readSettingErrorMessage(error, fallback),
    icon: 'none',
    duration: 3000,
  })
}

export const isSelectionCancelled = (error: unknown): boolean => {
  return readSettingErrorMessage(error, '').toLowerCase().includes('cancel')
}
