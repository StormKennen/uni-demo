import { describe, expect, it } from 'vitest'
import {
  getQuickShipAnimationFinishTimeoutMs,
  getQuickShipAnimationForInspectSuccess,
  getQuickShipAnimationForReceiveSuccess,
  getQuickShipAnimationForReceiverEntry,
  getQuickShipAnimationForSend,
  getQuickShipAnimationForSendResultEntry,
  getQuickShipAnimationLayout,
  getQuickShipTransitionForReceive,
  getQuickShipTransitionForSend,
  isQuickShipModeSwitchLocked,
  QUICK_SHIP_ANIMATION_DURATION_MS,
  QUICK_SHIP_ANIMATION_END_GUARD_MS,
  QUICK_SHIP_ANIMATION_PLAY_DELAY_MS,
  QUICK_SHIP_IMAGE_URL,
  QUICK_SHIP_SHARE_COVER_URL,
  QUICK_SHIP_TOOL_SHARE_COVER_URL,
  QUICK_SHIP_TRANSFER_SHARE_COVER_URL,
} from './visual'

describe('quick ship transition visual', () => {
  it('uses the shared public OSS asset', () => {
    expect(QUICK_SHIP_IMAGE_URL).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/quick-ship.png')
    expect(QUICK_SHIP_SHARE_COVER_URL).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/quick-ship-share.jpg')
    expect(QUICK_SHIP_TOOL_SHARE_COVER_URL).toBe(QUICK_SHIP_SHARE_COVER_URL)
    expect(QUICK_SHIP_TRANSFER_SHARE_COVER_URL).toBe(QUICK_SHIP_SHARE_COVER_URL)
  })

  it('maps sending to a departing overlay animation', () => {
    expect(getQuickShipAnimationForSend()).toBe('depart')
    expect(getQuickShipTransitionForSend()).toBe('depart')
    expect(getQuickShipAnimationLayout('depart')).toBe('overlay')
    expect(QUICK_SHIP_ANIMATION_DURATION_MS.depart).toBeGreaterThanOrEqual(2200)
    expect(QUICK_SHIP_ANIMATION_DURATION_MS.depart).toBeLessThanOrEqual(2800)
    expect(getQuickShipAnimationFinishTimeoutMs('depart')).toBeGreaterThan(QUICK_SHIP_ANIMATION_DURATION_MS.depart)
    expect(QUICK_SHIP_ANIMATION_PLAY_DELAY_MS).toBeGreaterThan(0)
    expect(QUICK_SHIP_ANIMATION_END_GUARD_MS).toBeGreaterThan(QUICK_SHIP_ANIMATION_PLAY_DELAY_MS)
  })

  it('maps send-result entry and inspect success to a one-shot arrive overlay', () => {
    expect(getQuickShipAnimationForSendResultEntry()).toBe('arrive')
    expect(getQuickShipAnimationForInspectSuccess(true)).toBe('arrive')
    expect(getQuickShipAnimationForInspectSuccess(false)).toBeNull()
    expect(getQuickShipAnimationLayout('arrive')).toBe('overlay')
    expect(getQuickShipAnimationLayout('arrive', { hold: true })).toBe('inline')
    expect(QUICK_SHIP_ANIMATION_DURATION_MS.arrive).toBeGreaterThanOrEqual(2200)
    expect(QUICK_SHIP_ANIMATION_DURATION_MS.arrive).toBeLessThanOrEqual(2800)
  })

  it('keeps the manual receiver entry in a quiet inline standby state', () => {
    expect(getQuickShipAnimationForReceiverEntry(false)).toBe('standby')
    expect(getQuickShipAnimationForReceiverEntry(true)).toBeNull()
    expect(getQuickShipAnimationLayout('standby')).toBe('inline')
    expect(getQuickShipAnimationFinishTimeoutMs('standby')).toBe(0)
  })

  it('only maps a successful receive to an arriving transition once', () => {
    expect(getQuickShipAnimationForReceiveSuccess(true)).toBe('arrive')
    expect(getQuickShipAnimationForReceiveSuccess(true, false)).toBe('arrive')
    expect(getQuickShipAnimationForReceiveSuccess(true, true)).toBeNull()
    expect(getQuickShipAnimationForReceiveSuccess(false)).toBeNull()
    expect(getQuickShipTransitionForReceive(true)).toBe('arrive')
    expect(getQuickShipTransitionForReceive(false)).toBeNull()
  })

  it('locks mode switching while either flow is active', () => {
    expect(isQuickShipModeSwitchLocked(false, false)).toBe(false)
    expect(isQuickShipModeSwitchLocked(true, false)).toBe(true)
    expect(isQuickShipModeSwitchLocked(false, true)).toBe(true)
    expect(isQuickShipModeSwitchLocked(true, true)).toBe(true)
  })
})
