import type { PRNG } from '../types/index'

export class XorShift128Plus implements PRNG {
  private seed0: bigint
  private seed1: bigint

  constructor(seed: bigint | [bigint, bigint]) {
    if (Array.isArray(seed)) {
      ;[this.seed0, this.seed1] = seed
    } else {
      this.seed0 = seed || 0xdeadbeefn
      this.seed1 = (seed << 1n) ^ 0x12345678n
    }
    if (this.seed0 === 0n && this.seed1 === 0n) {
      this.seed1 = 1n
    }
  }

  clone() {
    return new XorShift128Plus([this.seed0, this.seed1])
  }

  nextUint32(): number {
    const result = this.nextBigInt() & 0xffffffffn
    return Number(result)
  }

  nextFloat(): number {
    return Number(this.nextBigInt() & 0xffffffn) / 0x1000000
  }

  private nextBigInt(): bigint {
    let x = this.seed0
    const y = this.seed1
    this.seed0 = y
    x ^= x << 23n
    x ^= x >> 17n
    x ^= y ^ (y >> 26n)
    this.seed1 = x
    const result = x + y
    return result & 0xffffffffffffffffn
  }
}
