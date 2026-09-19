import { describe, expect, it } from 'vitest'
import { normalizeTierRankingConfig, normalizeTierRankingReport } from './normalizers'

describe('tier ranking character normalizers', () => {
  it('normalizes character archetypes for list mode display', () => {
    const report = normalizeTierRankingReport({
      items: [
        {
          character: { id: 'character-1', name: '测试魔灵', archetype: '体力型' },
          tier: { key: 'S', name: 'S' },
          source: { name: '测试魔灵' },
        },
      ],
    })

    expect(report.items[0]?.character?.archetype).toBe('hp')
  })

  it('normalizes backend archetype objects and supplies filter options for older configs', () => {
    const config = normalizeTierRankingConfig({
      data: {
        providers: ['rta-ai'],
        regions: ['red'],
        tiers: [{ key: 'SSS', name: 'SSS' }],
        elements: [{ key: 'fire', name: '火' }],
        capabilities: { tierRanking: true },
      },
    })
    const report = normalizeTierRankingReport({
      items: [
        {
          character: { id: 'character-2', stars: 6, archetype: { key: 'attack', name: '攻击型' } },
          tier: { key: 'SSS', name: 'SSS' },
          source: { name: '测试魔灵' },
        },
      ],
    })

    expect(config.stars.map(option => option.key)).toEqual(['6', '5', '4', '3', '2', '1'])
    expect(config.archetypes.map(option => option.key)).toEqual(['attack', 'defense', 'hp', 'support'])
    expect(report.items[0]?.character).toMatchObject({ stars: 6, archetype: 'attack' })
  })
})
