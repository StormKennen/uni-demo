import { describe, expect, it } from 'vitest'
import { buildSwcDetailShare } from './share'

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
