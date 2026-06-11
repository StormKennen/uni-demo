import { BasePathGenerator } from './base'

const pow2Ceil = (value: number) => {
  let power = 1
  while (power < value) power <<= 1
  return power
}

const rot = (n: number, x: number, y: number, rx: number, ry: number) => {
  if (ry === 0) {
    if (rx === 1) {
      x = n - 1 - x
      y = n - 1 - y
    }
    ;[x, y] = [y, x]
  }
  return { x, y }
}

const hilbertIndexToXY = (index: number, orderSize: number) => {
  let rx: number
  let ry: number
  let x = 0
  let y = 0
  let t = index
  for (let s = 1; s < orderSize; s <<= 1) {
    rx = 1 & (t >> 1)
    ry = 1 & (t ^ rx)
    const rotated = rot(s, x, y, rx, ry)
    x = rotated.x
    y = rotated.y
    x += s * rx
    y += s * ry
    t >>= 2
  }
  return { x, y }
}

export class HilbertPathGenerator extends BasePathGenerator {
  readonly name = 'HilbertPath'

  generate(rows: number, cols: number): Uint32Array {
    this.clampGrid(rows, cols)
    const total = rows * cols
    const size = pow2Ceil(Math.max(rows, cols))
    const order = size * size
    const result = new Uint32Array(total)
    let count = 0
    for (let i = 0; i < order && count < total; i++) {
      const { x, y } = hilbertIndexToXY(i, size)
      if (x < cols && y < rows) {
        result[count++] = y * cols + x
      }
    }
    // Fallback to sequential scan if Hilbert didn't fill everything (should not happen)
    for (let idx = count; idx < total; idx++) {
      result[idx] = idx
    }
    return result
  }
}
