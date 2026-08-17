import { nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchRtaConfig, fetchRtaMonsterDetail } from './rta-api'
import type { RtaConfig, RtaMonsterDetail } from './rta-types'
import { useRtaCharacterDetail } from './use-rta-character-detail'

vi.mock('./rta-api', () => ({
  fetchRtaConfig: vi.fn(),
  fetchRtaMonsterDetail: vi.fn(),
}))

const configFixture: RtaConfig = {
  provider: 'swarena',
  seasons: [38, 37],
  defaultSeason: 38,
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

const detailFixture: RtaMonsterDetail = {
  character: { id: 'character-1', code: 'monster-1', name: 'Stark', avatar: '', stars: 5, element: null, awaken: null, family: null },
  stats: { pickCount: 100, playedCount: 80, banCount: 20, winCount: 40, pickRate: 0.2, banRate: 0.1, winRate: 0.5, leaderRate: null },
  positions: null,
  filters: { season: 38, tier: 'all', league: 'rta' },
  meta: { provider: 'swarena', fetchedAt: '', cacheStatus: 'fresh', battleCount: null },
}

const flush = async () => {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('useRtaCharacterDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchRtaConfig).mockResolvedValue(configFixture)
    vi.mocked(fetchRtaMonsterDetail).mockResolvedValue(detailFixture)
  })

  it('does not request until enabled, then loads the default context once', async () => {
    const enabled = ref(false)
    const state = useRtaCharacterDetail({
      characterId: ref('character-1'),
      enabled,
      initialSeason: ref(undefined),
      initialTier: ref(undefined),
      initialLeague: ref(undefined),
    })

    await flush()
    expect(fetchRtaConfig).not.toHaveBeenCalled()
    expect(fetchRtaMonsterDetail).not.toHaveBeenCalled()

    enabled.value = true
    await flush()
    await flush()

    expect(fetchRtaConfig).toHaveBeenCalledTimes(1)
    expect(fetchRtaMonsterDetail).toHaveBeenCalledTimes(1)
    expect(vi.mocked(fetchRtaMonsterDetail).mock.calls[0][0]).toMatchObject({
      characterId: 'character-1',
      season: 38,
      tier: 'all',
      league: 'rta',
    })
    expect(state.detail.value?.character.id).toBe('character-1')

    await state.load()
    expect(fetchRtaMonsterDetail).toHaveBeenCalledTimes(1)
  })

  it('inherits ranking context and reloads with the same context after character changes', async () => {
    const characterId = ref('character-1')
    const state = useRtaCharacterDetail({
      characterId,
      enabled: ref(true),
      initialSeason: ref(37),
      initialTier: ref('g3'),
      initialLeague: ref('special'),
    })

    await state.load()
    expect(vi.mocked(fetchRtaMonsterDetail).mock.calls[0][0]).toMatchObject({
      characterId: 'character-1',
      season: 37,
      tier: 'g3',
      league: 'special',
    })

    characterId.value = 'character-2'
    await flush()
    await flush()

    expect(vi.mocked(fetchRtaMonsterDetail).mock.calls[1][0]).toMatchObject({
      characterId: 'character-2',
      season: 37,
      tier: 'g3',
      league: 'special',
    })
    expect(state.detail.value).not.toBeNull()
  })
})
