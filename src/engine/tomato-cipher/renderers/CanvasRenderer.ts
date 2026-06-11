import type { CipherContext, CipherResult, RenderTask, Renderer } from '../types/index'

export class CanvasRenderer implements Renderer {
  readonly name = 'CanvasRenderer'

  async render(tasks: RenderTask[], context: CipherContext): Promise<CipherResult> {
    const adapter = context.adapter
    const provider = context.provider
    const canvas = await adapter.createCanvas({ width: provider.getWidth(), height: provider.getHeight() })
    const ctx = await adapter.getCanvasContext(canvas)
    await ctx.clear()
    const source = provider.getSource()
    for (const task of tasks) {
      await ctx.drawTask(source, task)
    }
    await ctx.flush()
    const uri = await adapter.exportImage(canvas, context.metadata)
    return {
      uri,
      metadata: context.metadata,
      previewUri: uri
    }
  }
}
