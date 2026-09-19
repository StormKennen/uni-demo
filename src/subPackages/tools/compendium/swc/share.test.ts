import { describe, expect, it } from 'vitest'
import {
  buildSwcCouponDetailShare,
  buildSwcDetailShare,
  buildSwcRtaShare,
  buildSwcTierRankingShare,
  SWC_RTA_SCORE_SHARE_IMAGE,
} from './share'

describe('RTA score forecast share cover', () => {
  it('uses the RTA cover', () => {
    expect(SWC_RTA_SCORE_SHARE_IMAGE).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/swc-rta.jpg')
  })
})

describe('buildSwcRtaShare', () => {
  it('uses the RTA ranking cover for both WeChat share targets', () => {
    const result = buildSwcRtaShare({ season: 42, tier: 'g3' })

    expect(result.app.imageUrl).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/swc-rta.jpg')
    expect(result.timeline.imageUrl).toBe(result.app.imageUrl)
    expect(result.app.path).toContain('season=42')
    expect(result.app.path).toContain('tier=g3')
  })
})

describe('buildSwcTierRankingShare', () => {
  it('uses the SWC cover and preserves filters and display controls for both WeChat share targets', () => {
    const result = buildSwcTierRankingShare({
      region: 'c1',
      elements: 'fire,water',
      tiers: 'SSS,SS',
      stars: '6,5',
      archetypes: 'attack,hp',
      keyword: '奥利弗',
      viewMode: 'list',
      showTierCount: '0',
      showAvatarElementBadge: '1',
      showScore: '1',
    })

    expect(result.app.title).toBe('魔灵强度榜：查看区域与属性评级')
    expect(result.timeline.title).toBe(result.app.title)
    expect(result.app.imageUrl).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/swc.jpg')
    expect(result.timeline.imageUrl).toBe(result.app.imageUrl)
    expect(result.app.path).toContain('region=c1')
    expect(result.app.path).toContain('elements=fire%2Cwater')
    expect(result.app.path).toContain('tiers=SSS%2CSS')
    expect(result.app.path).toContain('stars=6%2C5')
    expect(result.app.path).toContain('archetypes=attack%2Chp')
    expect(result.app.path).toContain('viewMode=list')
    expect(result.app.path).toContain('showTierCount=0')
    expect(result.app.path).toContain('showAvatarElementBadge=1')
    expect(result.app.path).toContain('showScore=1')
    expect(result.timeline.query).toContain('keyword=%E5%A5%A5%E5%88%A9%E5%BC%97')
  })
})

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
