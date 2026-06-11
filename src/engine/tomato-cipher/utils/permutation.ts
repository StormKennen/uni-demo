import type { PRNG } from '../types/index'

export const forwardPermutation = (count: number, prng: PRNG): Uint32Array => {
  const perm = new Uint32Array(count)
  for (let i = 0; i < count; i++) perm[i] = i
  for (let i = count - 1; i > 0; i--) {
    const j = prng.nextUint32() % (i + 1)
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  return perm
}

export const reversePermutation = (perm: Uint32Array): Uint32Array => {
  const inv = new Uint32Array(perm.length)
  for (let i = 0; i < perm.length; i++) {
    inv[perm[i]] = i
  }
  return inv
}
