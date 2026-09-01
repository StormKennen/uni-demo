import {
  isLocalQuickTransferPublicH5BaseUrl,
  isValidQuickTransferPublicH5BaseUrl,
  normalizeQuickTransferPublicH5BaseUrl,
} from '@/features/quick-transfer/public-url'

export const resolveQuickTransferConfiguredPublicH5BaseUrl = (): string => {
  const baseUrl = normalizeQuickTransferPublicH5BaseUrl(String(import.meta.env.VITE_PUBLIC_THIS_H5_URL || ''))
  if (!isValidQuickTransferPublicH5BaseUrl(baseUrl) || isLocalQuickTransferPublicH5BaseUrl(baseUrl)) return ''
  return baseUrl
}
