import { describe, expect, it } from 'vitest'
import { getQuickShipVisualState, QUICK_SHIP_IMAGE_URL } from './visual'

describe('quick ship visual mapping', () => {
  it('uses one public asset for every visual state', () => {
    expect(QUICK_SHIP_IMAGE_URL).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/quick-ship.png')
  })

  it('maps business states without creating a second business state machine', () => {
    expect(getQuickShipVisualState('send', 'idle', 'idle')).toBe('idle')
    expect(getQuickShipVisualState('send', 'uploading', 'idle')).toBe('loading')
    expect(getQuickShipVisualState('send', 'ready', 'idle')).toBe('departing')
    expect(getQuickShipVisualState('send', 'expired', 'idle')).toBe('returned')
    expect(getQuickShipVisualState('receive', 'idle', 'inspecting')).toBe('loading')
    expect(getQuickShipVisualState('receive', 'idle', 'received')).toBe('arrived')
  })
})
