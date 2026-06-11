import { BasePathGenerator } from './base'
import { XorShift128Plus } from '../utils/prng'

export class RandomPathGenerator extends BasePathGenerator {
  readonly name = 'RandomPath'

  constructor(private seed: bigint = 0xabcdefn) {
    super()
  }

  generate(rows: number, cols: number): Uint32Array {
    this.clampGrid(rows, cols)
    const result = new Uint32Array(rows * cols)
    for (let i = 0; i < result.length; i++) result[i] = i
    const prng = new XorShift128Plus(this.seed)
    for (let i = result.length - 1; i > 0; i--) {
      const j = prng.nextUint32() % (i + 1)
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}
