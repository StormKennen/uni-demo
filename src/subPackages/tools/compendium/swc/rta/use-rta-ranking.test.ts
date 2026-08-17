import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchRtaConfig, fetchRtaRanking } from './rta-api'
import type { RtaConfig, RtaRankingResult } from './rta-types'
import { useRtaRanking } from './use-rta-ranking'

vi.mock('./rta-api', () => ({
  fetchRtaConfig: vi.fn(),
  fetchRtaRanking: vi.fn(),
}))

const configFixture: RtaConfig = {
  provider: 'swarena',
  seasons: [39, 38],
  defaultSeason: 39,
  tiers: [
    { key: 'all', name: '全部' },
    { key: 'g3', name: 'G3' },
  ],
  leagues: [
    { key: 'rta', name: 'RTA' },
    { key: 'special', name: 'Special League' },
  ],
  capabilities: { monsterDetail: true, positionFilter: false, multiPositionFilter: false, counters: false, teammates: false },
  meta: { provider: 'swarena', fetchedAt: '', cacheStatus: 'fresh', battleCount: null },
}

const rankingFixture = (name: string, page = 1, hasMore = false): RtaRankingResult => ({
  items: [
    {
      rank: page,
      character: { id: `character-${name}`, code: name, name, avatar: '', stars: 5, element: null, awaken: null, family: null },
      stats: { pickCount: 10, playedCount: 8, banCount: 2, winCount: 5, pickRate: 0.5, banRate: 0.2, winRate: 0.625, leaderRate: null },
      source: { provider: 'swarena', monsterId: page, name },
    },
  ],
  pagination: { page, pageSize: 30, total: hasMore ? 60 : page, hasMore },
  meta: { provider: 'swarena', fetchedAt: '', cacheStatus: 'fresh', battleCount: null },
})

describe('useRtaRanking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchRtaConfig).mockResolvedValue(configFixture)
    vi.mocked(fetchRtaRanking).mockResolvedValue(rankingFixture('initial'))
  })

  it('initializes with exactly one config and one ranking request', async () => {
    const state = useRtaRanking()
    await state.initialize()

    expect(fetchRtaConfig).toHaveBeenCalledTimes(1)
    expect(fetchRtaRanking).toHaveBeenCalledTimes(1)
    expect(vi.mocked(fetchRtaRanking).mock.calls[0][0]).toMatchObject({
      season: 39,
      tier: 'all',
      league: 'rta',
      minPickCount: 100,
      page: 1,
    })
    expect(state.items.value[0].character?.name).toBe('initial')
  })

  it('uses shared minimum-pick-count state and reloads once when changed', async () => {
    const state = useRtaRanking()
    await state.initialize({ season: 38, tier: 'g3', league: 'special', minPickCount: 500 })

    expect(vi.mocked(fetchRtaRanking).mock.calls[0][0]).toMatchObject({
      season: 38,
      tier: 'g3',
      league: 'special',
      minPickCount: 500,
      page: 1,
    })

    await state.selectMinPickCount(1000)

    expect(fetchRtaRanking).toHaveBeenCalledTimes(2)
    expect(vi.mocked(fetchRtaRanking).mock.calls[1][0]).toMatchObject({ minPickCount: 1000, page: 1 })
    expect(state.minPickCount.value).toBe(1000)
  })

  it('keeps minimum pick count on pagination and sorting', async () => {
    vi.mocked(fetchRtaRanking)
      .mockResolvedValueOnce(rankingFixture('page-1', 1, true))
      .mockResolvedValueOnce(rankingFixture('page-1-filtered', 1, true))
      .mockResolvedValueOnce(rankingFixture('page-2-filtered', 2, false))
      .mockResolvedValueOnce(rankingFixture('sorted-filtered', 1, false))

    const state = useRtaRanking()
    await state.initialize()
    await state.selectMinPickCount(1000)
    await state.loadMore()
    await state.selectSort('banRate')

    expect(vi.mocked(fetchRtaRanking).mock.calls[2][0]).toMatchObject({ minPickCount: 1000, page: 2 })
    expect(vi.mocked(fetchRtaRanking).mock.calls[3][0]).toMatchObject({ minPickCount: 1000, sortBy: 'banRate', page: 1 })
  })

  it('sends one request for a sort action and toggles its direction', async () => {
    const state = useRtaRanking()
    await state.initialize()
    await state.selectSort('winRate')
    await state.selectSort('winRate')

    expect(fetchRtaRanking).toHaveBeenCalledTimes(3)
    expect(vi.mocked(fetchRtaRanking).mock.calls[1][0]).toMatchObject({ sortBy: 'winRate', sortOrder: 'desc' })
    expect(vi.mocked(fetchRtaRanking).mock.calls[2][0]).toMatchObject({ sortBy: 'winRate', sortOrder: 'asc' })
  })

  it('prevents duplicate next-page requests', async () => {
    let resolveNext: ((value: RtaRankingResult) => void) | undefined
    vi.mocked(fetchRtaRanking)
      .mockResolvedValueOnce(rankingFixture('page-1', 1, true))
      .mockImplementationOnce(() => new Promise(resolve => (resolveNext = resolve)))

    const state = useRtaRanking()
    await state.initialize()
    const first = state.loadMore()
    const duplicate = state.loadMore()
    expect(fetchRtaRanking).toHaveBeenCalledTimes(2)
    resolveNext?.(rankingFixture('page-2', 2, false))
    await Promise.all([first, duplicate])

    expect(state.items.value).toHaveLength(2)
    expect(state.hasMore.value).toBe(false)
  })

  it('does not let an older filter response overwrite the newest state', async () => {
    let resolveOlder: ((value: RtaRankingResult) => void) | undefined
    vi.mocked(fetchRtaRanking)
      .mockResolvedValueOnce(rankingFixture('initial'))
      .mockImplementationOnce(() => new Promise(resolve => (resolveOlder = resolve)))
      .mockResolvedValueOnce(rankingFixture('newest'))

    const state = useRtaRanking()
    await state.initialize()
    const older = state.selectTier('g3')
    const newest = state.selectLeague('special')
    await newest
    resolveOlder?.(rankingFixture('older'))
    await older

    expect(state.items.value[0].character?.name).toBe('newest')
    expect(state.tier.value).toBe('g3')
    expect(state.league.value).toBe('special')
  })
})
