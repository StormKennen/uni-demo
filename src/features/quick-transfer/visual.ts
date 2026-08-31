export const QUICK_SHIP_IMAGE_URL = 'https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/quick-ship.png'
// 目前先复用已验证可公开访问的 OSS 素材；常量已拆开，后续可独立替换为分享卡片封面。
export const QUICK_SHIP_SHARE_COVER_URL = QUICK_SHIP_IMAGE_URL
export const QUICK_SHIP_TOOL_SHARE_COVER_URL = QUICK_SHIP_SHARE_COVER_URL
export const QUICK_SHIP_TRANSFER_SHARE_COVER_URL = QUICK_SHIP_SHARE_COVER_URL

export type QuickShipTransitionType = 'depart' | 'arrive'

export const getQuickShipTransitionForSend = (): QuickShipTransitionType => 'depart'

export const getQuickShipTransitionForReceive = (success: boolean): QuickShipTransitionType | null => (success ? 'arrive' : null)

export const isQuickShipModeSwitchLocked = (isSending: boolean, isReceiving: boolean): boolean => isSending || isReceiving
