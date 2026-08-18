import { describe, expect, it } from 'vitest'
import { normalizeEquipmentRecommendations } from './equipment-normalizers'

describe('normalizeEquipmentRecommendations', () => {
  it('normalizes rune sets, slots, priority stats and artifact effects', () => {
    const result = normalizeEquipmentRecommendations({
      character: { id: 'character-1', code: '14713', name: 'Argen' },
      equipmentRecommendations: {
        runes: [
          {
            context: 'rta',
            label: 'RTA',
            labelZh: '实时竞技场',
            sets: [
              {
                rank: 1,
                sets: ['Blade', 'Fatal'],
                setsZh: ['刀刃', '猛攻'],
                setKey: 'blade-fatal',
                usage: { count: 27, rate: 0.375 },
              },
            ],
            slots: {
              '2': [{ rank: 1, stat: 'ATK%', statZh: '攻击%', usage: { count: 131, rate: 0.7443 } }],
              '4': [{ rank: 1, stat: 'CD', statZh: '暴击伤害' }],
              '6': [],
            },
            priorityStats: [{ priority: 1, stat: 'CR', statZh: '暴击率', usage: { count: 750, rate: 0.167 } }],
          },
        ],
        artifacts: [
          {
            context: 'rta',
            labelZh: '实时竞技场',
            attribute: {
              primaries: [{ effectId: 101, property: 'ATK+', propertyZh: '攻击增加', rank: 1 }],
              preferredEffects: [
                {
                  effectId: 219,
                  property: 'Addl. DMG by ATK',
                  propertyZh: '按攻击追加伤害',
                  rank: 1,
                  usage: { count: 45, rate: 0.1197 },
                },
              ],
            },
          },
        ],
      },
    })

    expect(result.runes[0].label).toBe('实时竞技场')
    expect(result.runes[0].sets[0]).toMatchObject({
      key: 'blade-fatal',
      runes: [
        { key: 'Blade', label: '刀刃' },
        { key: 'Fatal', label: '猛攻' },
      ],
    })
    expect(result.runes[0].sets[0].usage.text).toBe('37.5% · 27 次')
    expect(result.runes[0].slots[0].stats[0].label).toBe('攻击%')
    expect(result.runes[0].priorityStats[0].label).toBe('暴击率')
    expect(result.artifacts[0].groups[0].primaries[0].label).toBe('攻击增加')
    expect(result.artifacts[0].groups[0].preferredEffects[0].label).toBe('按攻击追加伤害')
  })

  it('returns stable empty lists for absent recommendations', () => {
    expect(normalizeEquipmentRecommendations({})).toEqual({ runes: [], artifacts: [] })
  })
})
