import type { CipherAlgorithm, CipherContext, CipherResult, RenderTask } from '../../types/index'
import { forwardPermutation, reversePermutation } from '../../utils/permutation'

export class TomatoCipherV1 implements CipherAlgorithm {
  readonly name = 'TomatoCipherV1'

  async encrypt(context: CipherContext): Promise<CipherResult> {
    return this.process(context, 'encrypt')
  }

  async decrypt(context: CipherContext): Promise<CipherResult> {
    return this.process(context, 'decrypt')
  }

  private async process(context: CipherContext, mode: 'encrypt' | 'decrypt') {
    const { provider, metadata, pathGenerator, prng } = context
    const blockSize = metadata.blockSize
    const blocks = Array.from(provider.getBlocks(blockSize))
    const { rows, cols } = provider.getGridSize()
    const path = pathGenerator.generate(rows, cols).slice(0, blocks.length)
    const permutation = forwardPermutation(path.length, prng.clone())
    const inverse = reversePermutation(permutation)
    const mapping = mode === 'encrypt' ? permutation : inverse
    const tasks: RenderTask[] = []

    for (let i = 0; i < path.length; i++) {
      const sourceIdx = path[i]
      const targetIdx = path[mapping[i]] ?? mapping[i]
      const sourceRect = blocks[sourceIdx] ?? blocks[blocks.length - 1]
      const targetRect = blocks[targetIdx] ?? sourceRect
      tasks.push({ sourceRect, targetRect, rotation: 0, mirror: 'none' })
    }

    return context.renderer.render(tasks, context)
  }
}
