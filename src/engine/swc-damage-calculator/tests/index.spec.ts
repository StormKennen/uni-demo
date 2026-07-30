import { describe, expect, it } from 'vitest'
import { calculateSkillDamage, parseNumber, type DamageStats } from '../index'

const stats: DamageStats = {
  hp: 28215,
  attack: 2401,
  defense: 1515,
  speed: 223,
  critRate: 100,
  critDamage: 180,
}

describe('swc damage calculator', () => {
  it('parses display numbers with units and commas', () => {
    expect(parseNumber('10,215')).toBe(10215)
    expect(parseNumber('180%')).toBe(180)
  })

  it('calculates attack based multi-hit critical damage', () => {
    const result = calculateSkillDamage(
      {
        multiplierFormula: '攻击力 380%',
        hitCount: '2',
      },
      stats,
    )

    expect(result.calculable).toBe(true)
    expect(result.singleNormal).toBe(9124)
    expect(result.totalNormal).toBe(18248)
    expect(result.totalCritical).toBe(51093)
    expect(result.totalExpected).toBe(51093)
  })

  it('sums multiple stat terms from coefficients', () => {
    const result = calculateSkillDamage(
      {
        hitCount: 1,
        coefficients: [
          { name: '攻击', value: 200, unit: '%' },
          { name: '防御', value: '3.0' },
        ],
      },
      stats,
    )

    expect(result.calculable).toBe(true)
    expect(result.totalNormal).toBe(9347)
  })

  it('returns non-calculable result when no stat coefficient is recognized', () => {
    const result = calculateSkillDamage({ multiplierFormula: '根据目标弱化效果增加伤害' }, stats)

    expect(result.calculable).toBe(false)
    expect(result.totalNormal).toBe(0)
  })
})
