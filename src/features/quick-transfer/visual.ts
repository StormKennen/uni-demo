import type { QuickTransferMode, QuickTransferReceiveState, QuickTransferSendState } from './types'

export const QUICK_SHIP_IMAGE_URL = 'https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/quick-ship.png'

export type QuickShipVisualState = 'idle' | 'loading' | 'departing' | 'traveling' | 'arrived' | 'returned' | 'cancelled'

export const getQuickShipVisualState = (
  mode: QuickTransferMode,
  sendState: QuickTransferSendState,
  receiveState: QuickTransferReceiveState,
): QuickShipVisualState => {
  if (mode === 'receive') {
    if (receiveState === 'inspecting' || receiveState === 'resolving') return 'loading'
    if (receiveState === 'received') return 'arrived'
    return 'idle'
  }
  if (sendState === 'creating' || sendState === 'uploading' || sendState === 'completing') return 'loading'
  if (sendState === 'ready') return 'departing'
  if (sendState === 'consumed') return 'arrived'
  if (sendState === 'expired') return 'returned'
  if (sendState === 'cancelled') return 'cancelled'
  return 'idle'
}
