import { describe, expect, it } from 'vitest'
import { buildSwcCouponDetailShare, buildSwcDetailShare } from './share'

describe('buildSwcDetailShare', () => {
  it('keeps the current character and tab in app and timeline shares', () => {
    const result = buildSwcDetailShare({
      characterId: 'character/100',
      name: '测试魔灵',
      locale: 'zh-CN',
      tab: 'equipment',
    })

    expect(result.app.path).toContain('characterId=character%2F100')
    expect(result.app.path).toContain('tab=equipment')
    expect(result.timeline.query).toContain('characterId=character%2F100')
    expect(result.timeline.query).toContain('tab=equipment')
  })
})

describe('buildSwcCouponDetailShare', () => {
  it('appends the loaded coupon code to both share titles without changing the path', () => {
    const result = buildSwcCouponDetailShare({ couponId: 'coupon-1', code: ' SW2026SEP ' })

    expect(result.app.title).toBe('好友分享了魔灵召唤兑换券给你｜SW2026SEP')
    expect(result.timeline.title).toBe(result.app.title)
    expect(result.app.path).toBe('/subPackages/tools/game-coupons/detail?couponId=coupon-1&gameId=swc&compendiumId=swc')
  })

  it('keeps the existing fallback title when the coupon code is unavailable', () => {
    const result = buildSwcCouponDetailShare({ couponId: 'coupon-1', code: '   ' })

    expect(result.app.title).toBe('好友分享了魔灵召唤兑换券给你')
    expect(result.timeline.title).toBe(result.app.title)
  })
})
