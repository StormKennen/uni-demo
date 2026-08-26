import { describe, expect, it } from 'vitest'
import { getQuickTransferReferenceHandler, toQuickTransferReference } from './registry'

describe('quick transfer reference registry', () => {
  it('only builds routes for registered reference types', () => {
    const handler = getQuickTransferReferenceHandler('memoDetail')
    expect(handler).toBeDefined()
    expect(handler?.buildRoute({ type: 'memoDetail', resourceId: 'memo/1', title: '旅行计划' })).toBe(
      '/subPackages/tools/memo/detail?id=memo%2F1',
    )
    expect(
      getQuickTransferReferenceHandler('rtaRanking')?.buildRoute({
        type: 'rtaRanking',
        title: 'RTA 榜单',
        params: { season: 38, tier: 'g3', league: 'special', minPickCount: 500, sortOrder: 'asc', unsupported: 'ignored' },
      }),
    ).toBe('/subPackages/tools/compendium/swc/rta/index?season=38&minPickCount=500&tier=g3&league=special&sortOrder=asc')
    expect(getQuickTransferReferenceHandler('unknown')).toBeUndefined()
  })

  it('converts local draft references without adding a path field', () => {
    expect(
      toQuickTransferReference({
        localId: 'local-1',
        type: 'memoDetail',
        resourceId: 'memo-1',
        title: '旅行计划',
      }),
    ).toEqual({ type: 'memoDetail', resourceId: 'memo-1', title: '旅行计划', subtitle: undefined, params: undefined })
  })
})
