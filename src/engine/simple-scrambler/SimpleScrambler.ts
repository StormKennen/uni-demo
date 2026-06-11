import type {
  CipherLevel,
  CipherMetadata,
  CipherOptions,
  CipherSource,
  RenderTask
} from '../tomato-cipher/types/index'
import { CipherFactory } from '../tomato-cipher/core/CipherFactory'
import { getLevelConfig } from '../tomato-cipher/core/levels'
import { forwardPermutation, reversePermutation } from '../tomato-cipher/utils/permutation'
import type { SimpleScramblerOptions, SimpleScramblerResult } from './types'

export class SimpleScrambler {
  private readonly factory = new CipherFactory()

  async encrypt(options: SimpleScramblerOptions): Promise<SimpleScramblerResult> {
    return await this.process(options, 'encrypt')
  }

  async decrypt(options: SimpleScramblerOptions): Promise<SimpleScramblerResult> {
    return await this.process(options, 'decrypt')
  }

  private async process(
    options: SimpleScramblerOptions,
    mode: 'encrypt' | 'decrypt'
  ): Promise<SimpleScramblerResult> {
    if (!options.source?.uri) {
      throw new Error('缺少图片来源')
    }
    const seed = (options.seed ?? '').trim() || 'SimpleScrambler'
    const level = this.resolveLevelFromGrid(options.grid)
    const blockSize = getLevelConfig(level).blockSize
    const cipherOptions: CipherOptions = {
      source: options.source,
      seed,
      level,
      platform: options.platform,
      adapterOptions: options.adapterOptions
    }
    const adapter = this.factory.resolveAdapter(cipherOptions)
    const renderer = this.factory.resolveRenderer(cipherOptions)
    const pathGenerator = this.factory.resolvePathGenerator(cipherOptions)
    const loaded = await adapter.loadImage(options.source)
    const provider = this.factory.resolveProvider(cipherOptions, loaded)
    const blocks = Array.from(provider.getBlocks(blockSize))
    const { rows, cols } = provider.getGridSize()
    const path = pathGenerator.generate(rows, cols).slice(0, blocks.length)
    const permutation = forwardPermutation(path.length, this.factory.createPRNG(seed))
    const mapping = mode === 'encrypt' ? permutation : reversePermutation(permutation)
    const tasks: RenderTask[] = []

    for (let i = 0; i < path.length; i++) {
      const sourceIdx = path[i]
      const targetIdx = path[mapping[i]] ?? mapping[i]
      const sourceRect = blocks[sourceIdx] ?? blocks[blocks.length - 1]
      const targetRect = blocks[targetIdx] ?? sourceRect
      tasks.push({ sourceRect, targetRect, rotation: 0, mirror: 'none' })
    }

    const metadata = this.buildMetadata({
      seed,
      level,
      blockSize,
      width: loaded.width,
      height: loaded.height,
      pathGenerator: pathGenerator.name,
      provider: provider.name,
      format: this.resolveOutputFormat(loaded.format, options.source)
    })

    const canvas = await adapter.createCanvas({ width: provider.getWidth(), height: provider.getHeight() })
    const ctx = await adapter.getCanvasContext(canvas)
    await ctx.clear()
    const source = provider.getSource()
    for (const task of tasks) {
      await ctx.drawTask(source, task)
    }
    await ctx.flush()
    const uri = await adapter.exportImage(canvas, metadata)
    return { uri }
  }

  private resolveLevelFromGrid(grid?: number): CipherLevel {
    if (!grid || grid <= 6) return 1
    if (grid <= 9) return 2
    if (grid <= 13) return 3
    if (grid <= 17) return 4
    return 5
  }

  private buildMetadata(params: {
    seed: string
    level: CipherLevel
    blockSize: number
    width: number
    height: number
    pathGenerator: string
    provider: string
    format: 'png' | 'jpg'
  }): CipherMetadata {
    return {
      version: '1.0.0',
      algorithm: 'SimpleScrambler',
      seed: params.seed,
      level: params.level,
      blockSize: params.blockSize,
      width: params.width,
      height: params.height,
      pathGenerator: params.pathGenerator,
      provider: params.provider,
      timestamp: Date.now(),
      extra: { format: params.format }
    }
  }

  private resolveOutputFormat(format: string | undefined, source: CipherSource): 'png' | 'jpg' {
    const normalized = (format || '').toLowerCase()
    if (normalized === 'jpg' || normalized === 'jpeg') return 'jpg'
    if (normalized === 'png') return 'png'
    if (source?.uri) {
      if (/\.jpe?g($|\?)/i.test(source.uri) || /^data:image\/jpeg/i.test(source.uri)) return 'jpg'
    }
    return 'png'
  }
}
