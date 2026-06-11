import { BasePathGenerator } from './base'

export class SpiralPathGenerator extends BasePathGenerator {
  readonly name = 'SpiralPath'

  generate(rows: number, cols: number): Uint32Array {
    this.clampGrid(rows, cols)
    const total = rows * cols
    const result = new Uint32Array(total)
    let left = 0
    let right = cols - 1
    let top = 0
    let bottom = rows - 1
    let idx = 0

    while (left <= right && top <= bottom) {
      for (let x = left; x <= right && idx < total; x++) result[idx++] = top * cols + x
      top++
      for (let y = top; y <= bottom && idx < total; y++) result[idx++] = y * cols + right
      right--
      for (let x = right; x >= left && idx < total; x--) result[idx++] = bottom * cols + x
      bottom--
      for (let y = bottom; y >= top && idx < total; y--) result[idx++] = y * cols + left
      left++
    }

    return result
  }
}
