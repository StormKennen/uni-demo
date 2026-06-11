import type { CipherSource } from '../tomato-cipher/types'

export interface SimpleScramblerOptions {
  source: CipherSource
  seed?: string
  grid?: number
  platform?: 'weapp' | 'h5' | 'app'
  adapterOptions?: Record<string, unknown>
}

export interface SimpleScramblerResult {
  uri: string
}
