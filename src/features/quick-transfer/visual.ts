export const QUICK_SHIP_IMAGE_URL = 'https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/quick-ship.png'

export type QuickShipTransitionType = 'depart' | 'arrive'

export const getQuickShipTransitionForSend = (): QuickShipTransitionType => 'depart'

export const getQuickShipTransitionForReceive = (success: boolean): QuickShipTransitionType | null => (success ? 'arrive' : null)

export const isQuickShipModeSwitchLocked = (isSending: boolean, isReceiving: boolean): boolean => isSending || isReceiving
