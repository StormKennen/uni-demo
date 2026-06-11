import type { PathGenerator } from '../types/index'

export abstract class BasePathGenerator implements PathGenerator {
  abstract readonly name: string
  abstract generate(rows: number, cols: number): Uint32Array

  protected clampGrid(rows: number, cols: number) {
    if (rows <= 0 || cols <= 0) {
      throw new Error(`[${this.name}] invalid grid: ${rows}x${cols}`)
    }
  }
}
