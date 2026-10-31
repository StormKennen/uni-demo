import { QUICK_SHIP_IMAGE_URL } from '../../config/tool-assets'

export { QUICK_SHIP_IMAGE_URL }
export const QUICK_SHIP_SHARE_COVER_URL = 'https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/quick-ship-share.jpg'
export const QUICK_SHIP_TOOL_SHARE_COVER_URL = QUICK_SHIP_SHARE_COVER_URL
export const QUICK_SHIP_TRANSFER_SHARE_COVER_URL = QUICK_SHIP_SHARE_COVER_URL

export type QuickShipAnimationType = 'depart' | 'arrive' | 'standby'
export type QuickShipAnimationLayout = 'overlay' | 'inline'
export type QuickShipTransitionType = QuickShipAnimationType

export const QUICK_SHIP_ANIMATION_DURATION_MS = {
  depart: 2400,
  arrive: 2400,
  standby: 3600,
} as const

export const QUICK_SHIP_ANIMATION_FINISH_BUFFER_MS = 80
export const QUICK_SHIP_REDUCED_MOTION_FINISH_MS = 360
export const QUICK_SHIP_ANIMATION_PLAY_DELAY_MS = 120
export const QUICK_SHIP_ANIMATION_END_GUARD_MS = 400

export const getQuickShipAnimationLayout = (type: QuickShipAnimationType, options: { hold?: boolean } = {}): QuickShipAnimationLayout => {
  if (type === 'standby' || (type === 'arrive' && options.hold)) return 'inline'
  return 'overlay'
}

export const getQuickShipAnimationFinishTimeoutMs = (type: QuickShipAnimationType): number => {
  if (type === 'standby') return 0
  return QUICK_SHIP_ANIMATION_DURATION_MS[type] + QUICK_SHIP_ANIMATION_FINISH_BUFFER_MS
}

export const getQuickShipAnimationForSend = (): QuickShipAnimationType => 'depart'

export const getQuickShipAnimationForSendResultEntry = (): QuickShipAnimationType => 'arrive'

export const getQuickShipAnimationForReceiverEntry = (hasShareToken: boolean): QuickShipAnimationType | null =>
  hasShareToken ? null : 'standby'

export const getQuickShipAnimationForInspectSuccess = (success: boolean): QuickShipAnimationType | null => (success ? 'arrive' : null)

export const getQuickShipAnimationForReceiveSuccess = (success: boolean, alreadyPlayedArrive = false): QuickShipAnimationType | null =>
  success && !alreadyPlayedArrive ? 'arrive' : null

export const getQuickShipTransitionForSend = getQuickShipAnimationForSend

export const getQuickShipTransitionForReceive = (success: boolean): QuickShipAnimationType | null =>
  getQuickShipAnimationForReceiveSuccess(success)

export const isQuickShipModeSwitchLocked = (isSending: boolean, isReceiving: boolean): boolean => isSending || isReceiving
