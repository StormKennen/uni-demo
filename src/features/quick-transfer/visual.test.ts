import { describe, expect, it } from 'vitest'
import { QUICK_SHIP_IMAGE_URL } from './visual'

describe('quick ship transition visual', () => {
  it('uses the shared public OSS asset', () => {
    expect(QUICK_SHIP_IMAGE_URL).toBe('https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/quick-ship.png')
  })
})
