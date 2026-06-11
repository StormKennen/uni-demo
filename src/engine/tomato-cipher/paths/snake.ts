import { BasePathGenerator } from './base'

export class SnakePathGenerator extends BasePathGenerator {
  readonly name = 'SnakePath'

  generate(rows: number, cols: number): Uint32Array {
    this.clampGrid(rows, cols)
    const result = new Uint32Array(rows * cols)
    let ptr = 0
    for (let y = 0; y < rows; y++) {
      if (y % 2 === 0) {
        for (let x = 0; x < cols; x++) {
          result[ptr++] = y * cols + x
        }
      } else {
        for (let x = cols - 1; x >= 0; x--) {
          result[ptr++] = y * cols + x
        }
      }
    }
    return result
  }
}
