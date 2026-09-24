import { describe, expect, it } from 'vitest'
import {
  buildSwcCouponDetailShare,
  buildSwcDetailShare,
  buildSwcLineupsShare,
  buildSwcLineupCounterShare,
  buildSwcRtaShare,
  buildSwcTierRankingShare,
  getSwcTierRankingShareTitle,
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
      filterExpanded: '1',
      showTierCount: '0',
      showAvatarElementBadge: '1',
      showScore: '1',
    })

    expect(result.app.title).toBe('魔灵强度榜')
    expect(result.timeline.title).toBe(result.app.title)
    expect(result.app.imageUrl).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/swc.jpg')
    expect(result.timeline.imageUrl).toBe(result.app.imageUrl)
    expect(result.app.path).toContain('region=c1')
    expect(result.app.path).toContain('elements=fire%2Cwater')
    expect(result.app.path).toContain('tiers=SSS%2CSS')
    expect(result.app.path).toContain('stars=6%2C5')
    expect(result.app.path).toContain('archetypes=attack%2Chp')
    expect(result.app.path).toContain('viewMode=list')
    expect(result.app.path).toContain('filterExpanded=1')
    expect(result.app.path).toContain('showTierCount=0')
    expect(result.app.path).toContain('showAvatarElementBadge=1')
    expect(result.app.path).toContain('showScore=1')
    expect(result.timeline.query).toContain('keyword=%E5%A5%A5%E5%88%A9%E5%BC%97')
  })

  it('keeps the normal title for hidden mock selections', () => {
    expect(getSwcTierRankingShareTitle({ phantomCharacterIds: 'character-1' })).toBe('魔灵强度榜')
    expect(getSwcTierRankingShareTitle({ godCharacterIds: 'character-2' })).toBe('魔灵强度榜')
    expect(getSwcTierRankingShareTitle({ phantomCharacterIds: 'character-1', godCharacterIds: 'character-2' })).toBe('魔灵强度榜')
  })

  it('allows the tier ranking page to provide a current visible-state title', () => {
    const result = buildSwcTierRankingShare({ phantomCharacterIds: 'character-1' }, '这是幻神')

    expect(result.app.title).toBe('这是幻神')
    expect(result.timeline.title).toBe('这是幻神')
  })

  it('keeps the default message card cover when no custom share state is provided', () => {
    const result = buildSwcTierRankingShare({})

    expect(result.app.title).toBe('魔灵强度榜')
    expect(result.app.imageUrl).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/swc.jpg')
  })

  it('carries hidden character payloads into both share targets', () => {
    const result = buildSwcTierRankingShare({
      phantomCharacterIds: 'character-1',
      phantomTierTitle: '幻神榜',
      godCharacterIds: 'character-2',
      laCharacterIds: 'character-3',
      laTierTitle: '特别LA',
      phantomCharacters: '[{"characterId":"character-1","avatar":"avatar-1"}]',
      godCharacters: '[{"characterId":"character-2","avatar":"avatar-2"}]',
      laCharacters: '[{"characterId":"character-3","avatar":"avatar-3"}]',
    })

    expect(result.app.path).toContain('phantomCharacterIds=character-1')
    expect(result.app.path).toContain('phantomTierTitle=%E5%B9%BB%E7%A5%9E%E6%A6%9C')
    expect(result.app.path).toContain('godCharacterIds=character-2')
    expect(result.app.path).toContain('laCharacterIds=character-3')
    expect(result.app.path).toContain('laTierTitle=%E7%89%B9%E5%88%ABLA')
    expect(result.timeline.query).toContain('phantomCharacters=')
    expect(result.timeline.query).toContain('godCharacters=')
    expect(result.timeline.query).toContain('laCharacters=')
  })
})

describe('buildSwcLineupsShare', () => {
  it('preserves selected character filters in the shared route and timeline query', () => {
    const result = buildSwcLineupsShare({
      compendiumId: 'swc',
      locale: 'zh-CN',
      characterIds: 'character-1,character-2',
    })

    expect(result.app.path).toContain('characterIds=character-1%2Ccharacter-2')
    expect(result.timeline.query).toContain('characterIds=character-1%2Ccharacter-2')
  })
})

describe('buildSwcLineupCounterShare', () => {
  it('preserves the counter mode and selected character filters', () => {
    const result = buildSwcLineupCounterShare({
      compendiumId: 'swc',
      locale: 'zh-CN',
      type: '占领战防守',
      characterIds: 'character-1,character-2',
    })

    expect(result.app.path).toContain('type=%E5%8D%A0%E9%A2%86%E6%88%98%E9%98%B2%E5%AE%88')
    expect(result.app.path).toContain('characterIds=character-1%2Ccharacter-2')
    expect(result.timeline.query).toContain('characterIds=character-1%2Ccharacter-2')
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
