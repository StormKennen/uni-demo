import type {
  CipherAlgorithm,
  CipherLevel,
  CipherMetadata,
  CipherOptions,
  CipherResult,
  ContentProvider,
  PathGenerator,
  PlatformAdapter,
  Renderer
} from '../types/index'
import { SnakePathGenerator } from '../paths'
import { ImageContentProvider } from '../providers'
import { XorShift128Plus } from '../utils/prng'
import { getLevelConfig } from './levels'
import { TomatoCipherV1 } from '../algorithms/tomato-v1'
import { CanvasRenderer } from '../renderers/CanvasRenderer'
import { WeappAdapter } from '../adapters/weapp/WeappAdapter'
import { H5Adapter } from '../adapters/h5/H5Adapter'
import { AppAdapter } from '../adapters/app/AppAdapter'

declare const wx: any | undefined
declare const uni: any | undefined

export class CipherFactory {
  resolveAlgorithm(_options: CipherOptions): CipherAlgorithm {
    return new TomatoCipherV1()
  }

  resolveRenderer(_options: CipherOptions): Renderer {
    return new CanvasRenderer()
  }

  resolveAdapter(_options: CipherOptions): PlatformAdapter {
    return this.pickAdapter(_options)
  }

  resolvePathGenerator(_options: CipherOptions): PathGenerator {
    return new SnakePathGenerator()
  }

  resolveProvider(_options: CipherOptions, image: { width: number; height: number; uri: string }): ContentProvider {
    return new ImageContentProvider({ ...image })
  }

  createMetadata(options: CipherOptions): CipherMetadata {
    const level = options.level ?? 3
    const config = getLevelConfig(level as CipherLevel)
    const now = Date.now()
    if (!options.seed) {
      options.seed = `seed-${now}`
    }
    return {
      version: '1.0.0',
      algorithm: options.algorithm ?? 'TomatoCipherV1',
      seed: options.seed,
      level: level as CipherLevel,
      blockSize: config.blockSize,
      width: options.metadata?.width ?? 0,
      height: options.metadata?.height ?? 0,
      pathGenerator: 'SnakePath',
      provider: 'ImageProvider',
      timestamp: now,
      extra: options.metadata?.extra
    }
  }

  buildResult(_metadata: CipherMetadata): CipherResult {
    throw new Error('CipherFactory.buildResult not implemented')
  }

  createPRNG(seed: string) {
    let hash = 0n
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5n) - hash + BigInt(seed.charCodeAt(i))
    }
    return new XorShift128Plus(hash)
  }

  private pickAdapter(options: CipherOptions): PlatformAdapter {
    if (options.adapter) return options.adapter
    const platform = options.platform ?? this.detectPlatform()
    if (platform === 'h5') return new H5Adapter()
    if (platform === 'app') return new AppAdapter(options.adapterOptions)
    return new WeappAdapter(options.adapterOptions)
  }

  private detectPlatform(): 'weapp' | 'h5' | 'app' {
    if (typeof wx !== 'undefined' && typeof wx.createCanvasContext === 'function') {
      return 'weapp'
    }
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      return 'h5'
    }
    if (typeof uni !== 'undefined') {
      return 'app'
    }
    return 'h5'
  }
}
