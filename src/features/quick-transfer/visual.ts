import { QUICK_SHIP_IMAGE_URL } from '../../config/tool-assets'

export { QUICK_SHIP_IMAGE_URL }
export const QUICK_SHIP_SHARE_COVER_URL = 'https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/quick-ship-share.jpg'
export const QUICK_SHIP_TOOL_SHARE_COVER_URL = QUICK_SHIP_SHARE_COVER_URL
export const QUICK_SHIP_TRANSFER_SHARE_COVER_URL = QUICK_SHIP_SHARE_COVER_URL

export type QuickShipTransitionType = 'depart' | 'arrive'

export const getQuickShipTransitionForSend = (): QuickShipTransitionType => 'depart'

export const getQuickShipTransitionForReceive = (success: boolean): QuickShipTransitionType | null => (success ? 'arrive' : null)

export const isQuickShipModeSwitchLocked = (isSending: boolean, isReceiving: boolean): boolean => isSending || isReceiving
