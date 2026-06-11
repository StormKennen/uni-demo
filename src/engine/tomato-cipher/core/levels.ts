import type { CipherLevel } from '../types/index'

export const LEVEL_CONFIG: Record<CipherLevel, { blockSize: number }> = {
  1: { blockSize: 64 },
  2: { blockSize: 48 },
  3: { blockSize: 32 },
  4: { blockSize: 24 },
  5: { blockSize: 16 }
}

export const getLevelConfig = (level: CipherLevel) => LEVEL_CONFIG[level]
