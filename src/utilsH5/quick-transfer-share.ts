import { buildQuickTransferPublicReceiveUrl } from '@/features/quick-transfer/public-url'

export const buildQuickTransferBrowserShareUrl = (shareToken: string): string => {
  return buildQuickTransferPublicReceiveUrl({
    baseUrl: `${window.location.origin}${window.location.pathname}#`,
    shareToken,
  })
}
