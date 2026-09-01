import { describe, expect, it } from 'vitest'
import {
  getQuickShipTransitionForReceive,
  getQuickShipTransitionForSend,
  isQuickShipModeSwitchLocked,
  QUICK_SHIP_IMAGE_URL,
  QUICK_SHIP_SHARE_COVER_URL,
  QUICK_SHIP_TOOL_SHARE_COVER_URL,
  QUICK_SHIP_TRANSFER_SHARE_COVER_URL,
} from './visual'

describe('quick ship transition visual', () => {
  it('uses the shared public OSS asset', () => {
    expect(QUICK_SHIP_IMAGE_URL).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/quick-ship.png')
    expect(QUICK_SHIP_SHARE_COVER_URL).toBe(QUICK_SHIP_IMAGE_URL)
    expect(QUICK_SHIP_TOOL_SHARE_COVER_URL).toBe(QUICK_SHIP_IMAGE_URL)
    expect(QUICK_SHIP_TRANSFER_SHARE_COVER_URL).toBe(QUICK_SHIP_IMAGE_URL)
  })

  it('maps sending to a departing transition', () => {
    expect(getQuickShipTransitionForSend()).toBe('depart')
  })

  it('only maps a successful receive to an arriving transition', () => {
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
