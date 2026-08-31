import { QUICK_TRANSFER_RECEIVE_ROUTE } from '@/features/quick-transfer/constants'

export const buildQuickTransferBrowserShareUrl = (shareToken: string): string => {
  const query = `shareToken=${encodeURIComponent(shareToken)}`
  const hash = window.location.hash
  if (hash.startsWith('#/')) {
    return `${window.location.origin}${window.location.pathname}#${QUICK_TRANSFER_RECEIVE_ROUTE}?${query}`
  }
  return `${window.location.origin}${QUICK_TRANSFER_RECEIVE_ROUTE}?${query}`
}
