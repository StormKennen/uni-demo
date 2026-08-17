import { describe, expect, it } from 'vitest'
import { formatCount, formatRate, normalizeRtaConfig, normalizeRtaMonsterDetail, normalizeRtaRanking } from './rta-normalizers'

describe('RTA formatters', () => {
  it('formats backend 0~1 rates without reinterpreting them', () => {
    expect(formatRate(0.2884)).toBe('28.84%')
    expect(formatRate(0)).toBe('0.00%')
    expect(formatRate(1)).toBe('100.00%')
    expect(formatRate(null)).toBe('--')
    expect(formatRate(undefined)).toBe('--')
  })

  it('formats counts and preserves missing values', () => {
    expect(formatCount(245106)).toBe('245,106')
    expect(formatCount(null)).toBe('--')
  })
})

describe('RTA response normalizers', () => {
  it('normalizes config and keeps backend capabilities authoritative', () => {
    const config = normalizeRtaConfig({
      provider: 'swarena',
      seasons: [39, 38],
      defaultSeason: 39,
      tiers: [{ key: 'all', name: '全部' }],
      leagues: [{ key: 'rta', name: 'RTA' }],
      capabilities: {
        monsterDetail: true,
        positionFilter: false,
        multiPositionFilter: false,
        counters: false,
        teammates: false,
      },
      meta: { cacheStatus: 'fresh', fetchedAt: '2026-08-14T08:00:00.000Z', battleCount: null },
    })

    expect(config.defaultSeason).toBe(39)
    expect(config.capabilities.positionFilter).toBe(false)
    expect(config.meta.battleCount).toBeNull()
  })

  it('keeps an unmapped ranking row and its statistics', () => {
    const result = normalizeRtaRanking({
      items: [
        {
          rank: 8,
          character: null,
          source: { provider: 'swarena', monsterId: 101, name: 'New Monster' },
          stats: {
            pickCount: 20,
            playedCount: 16,
            banCount: 4,
            winCount: 9,
            pickRate: 0.2,
            banRate: 0.1,
            winRate: 0.5625,
            leaderRate: null,
          },
        },
      ],
      pagination: { page: 1, pageSize: 30, total: 1, hasMore: false },
      meta: { cacheStatus: 'stale' },
    })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].character).toBeNull()
    expect(result.items[0].stats.pickCount).toBe(20)
    expect(result.meta.cacheStatus).toBe('stale')
  })

  it('uses response filters and hides unsupported positions as null', () => {
    const detail = normalizeRtaMonsterDetail(
      {
        character: {
          id: 'character-1',
          name: '风熊猫',
          family: { name: '熊猫武士' },
          avatar: '/avatar.png',
          stars: 5,
          element: { key: 'wind', name: '风' },
        },
        stats: {
          pickCount: 100,
          playedCount: 80,
          banCount: 20,
          winCount: 45,
          pickRate: 0.5,
          banRate: 0.2,
          winRate: 0.5625,
          leaderRate: null,
        },
        positions: null,
        filters: { season: 39, tier: 'g3', league: 'special' },
        meta: { cacheStatus: 'fresh' },
      },
      { season: 38, tier: 'all', league: 'rta' },
    )

    expect(detail.filters).toEqual({ season: 39, tier: 'g3', league: 'special' })
    expect(detail.positions).toBeNull()
    expect(detail.stats.playedCount).toBe(80)
    expect(detail.character.family?.name).toBe('熊猫武士')
  })
})
