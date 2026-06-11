import { describe, it, expect } from 'vitest'
import { XorShift128Plus } from '../utils/prng'
import { forwardPermutation, reversePermutation } from '../utils/permutation'
import { HilbertPathGenerator } from '../paths/hilbert'
import { SnakePathGenerator } from '../paths/snake'
import { TomatoCipherV1 } from '../algorithms/tomato-v1'
import { ImageContentProvider } from '../providers/ImageProvider'
import { CipherContext } from '../core/CipherContext'
import type {
  CipherContext as CipherContextType,
  CipherMetadata,
  CipherOptions,
  CipherResult,
  LoadedImage,
  PlatformAdapter,
  Renderer,
  RenderTask
} from '../types/index'

class MockRenderer implements Renderer {
  readonly name = 'MockRenderer'
  lastTasks: RenderTask[] = []

  async render(tasks: RenderTask[], context: CipherContextType): Promise<CipherResult> {
    this.lastTasks = tasks
    return {
      uri: 'mock://result',
      metadata: context.metadata
    }
  }
}

const mockAdapter: PlatformAdapter = {
  name: 'MockAdapter',
  async loadImage() {
    throw new Error('not implemented in tests')
  },
  async createCanvas() {
    return { id: 'mock', width: 0, height: 0 }
  },
  async getCanvasContext() {
    return {
      clear: async () => {},
      drawTask: async () => {},
      flush: async () => {}
    }
  },
  async exportImage() {
    return 'mock://export'
  }
}

const createContext = (width: number, height: number, level: number, renderer: Renderer, pathGenerator = new HilbertPathGenerator()) => {
  const metadata: CipherMetadata = {
    version: '1.0.0',
    algorithm: 'TomatoCipherV1',
    seed: 'UnitTestSeed',
    level: level as any,
    blockSize: level === 3 ? 32 : 16,
    width,
    height,
    pathGenerator: pathGenerator.name,
    provider: 'ImageProvider',
    timestamp: Date.now(),
    extra: { uri: 'mock://source' }
  }

  const options: CipherOptions = {
    source: { uri: 'mock://source', type: 'remote' },
    seed: metadata.seed,
    level: metadata.level
  }

  const prng = new XorShift128Plus(123n)
  const provider = new ImageContentProvider({ uri: 'mock://source', width, height })
  const algorithm = new TomatoCipherV1()

  return new CipherContext(
    options,
    metadata,
    [],
    mockAdapter,
    renderer,
    provider,
    pathGenerator,
    prng,
    algorithm,
    undefined,
    []
  )
}

describe('XorShift128Plus', () => {
  it('produces deterministic sequences for the same seed', () => {
    const a = new XorShift128Plus(42n)
    const b = new XorShift128Plus(42n)
    const seqA = Array.from({ length: 10 }, () => a.nextUint32())
    const seqB = Array.from({ length: 10 }, () => b.nextUint32())
    expect(seqA).toEqual(seqB)
  })
})

describe('Permutation helpers', () => {
  it('builds reversible permutations', () => {
    const prng = new XorShift128Plus(999n)
    const perm = forwardPermutation(128, prng)
    const inverse = reversePermutation(perm)
    for (let i = 0; i < perm.length; i++) {
      expect(inverse[perm[i]]).toBe(i)
    }
  })
})

describe('Path generators', () => {
  it('Hilbert path covers grid without duplication', () => {
    const generator = new HilbertPathGenerator()
    const rows = 7
    const cols = 5
    const path = generator.generate(rows, cols)
    expect(path.length).toBe(rows * cols)
    expect(new Set(path).size).toBe(rows * cols)
    expect(path[0]).toBe(0)
    expect(path[path.length - 1]).toBeLessThan(rows * cols)
  })

  it('Snake path alternates direction per row', () => {
    const generator = new SnakePathGenerator()
    const path = generator.generate(4, 4)
    expect(path.slice(0, 4)).toEqual([0, 1, 2, 3])
    expect(path.slice(4, 8)).toEqual([7, 6, 5, 4])
  })
})

describe('TomatoCipherV1 performance', () => {
  it('encrypts 1080x1920 level3 within 1000ms using mock renderer', async () => {
    const renderer = new MockRenderer()
    const context = createContext(1080, 1920, 3, renderer)
    const start = Date.now()
    await new TomatoCipherV1().encrypt(context)
    const duration = Date.now() - start
    expect(duration).toBeLessThan(1000)
    expect(renderer.lastTasks.length).toBeGreaterThan(0)
  })
})
