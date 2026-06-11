import type {
  CanvasHandle,
  CipherMetadata,
  CipherSource,
  LoadedImage,
  PlatformAdapter,
  PlatformCanvasContext,
  RenderTask,
  Size
} from '../../types/index'

declare const uni: any

type AdapterConfig = {
  canvasId?: string
}

class UniCanvasContext implements PlatformCanvasContext {
  constructor(private readonly ctx: any, private readonly width: number, private readonly height: number) {}

  async clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  async drawTask(source: LoadedImage, task: RenderTask) {
    const { sourceRect, targetRect } = task
    this.ctx.save()
    this.ctx.translate(targetRect.x, targetRect.y)
    this.ctx.drawImage(
      source.resource ?? source.uri,
      sourceRect.x,
      sourceRect.y,
      sourceRect.width,
      sourceRect.height,
      0,
      0,
      targetRect.width,
      targetRect.height
    )
    this.ctx.restore()
  }

  async flush() {
    await new Promise<void>((resolve) => this.ctx.draw(false, resolve))
  }
}

export class AppAdapter implements PlatformAdapter {
  readonly name = 'AppAdapter'

  constructor(private readonly config: AdapterConfig = {}) {}

  private get canvasId() {
    return this.config.canvasId ?? 'tomatoCipherCanvas'
  }

  async loadImage(source: CipherSource): Promise<LoadedImage> {
    return await new Promise((resolve, reject) => {
      uni.getImageInfo({
        src: source.uri,
        success: (info: any) => {
          resolve({ uri: info.path, width: info.width, height: info.height, resource: info.path, format: info.type })
        },
        fail: reject
      })
    })
  }

  async createCanvas(dim: Size): Promise<CanvasHandle> {
    return {
      id: this.canvasId,
      width: dim.width,
      height: dim.height
    }
  }

  async getCanvasContext(canvas: CanvasHandle): Promise<PlatformCanvasContext> {
    const ctx = uni.createCanvasContext(canvas.id)
    return new UniCanvasContext(ctx, canvas.width, canvas.height)
  }

  async exportImage(canvas: CanvasHandle, metadata: CipherMetadata): Promise<string> {
    return await new Promise((resolve, reject) => {
      const format = (metadata.extra?.format as string) || 'png'
      const fileType = format === 'jpg' || format === 'jpeg' ? 'jpg' : 'png'
      uni.canvasToTempFilePath({
        canvasId: canvas.id,
        width: canvas.width,
        height: canvas.height,
        destWidth: canvas.width,
        destHeight: canvas.height,
        fileType,
        quality: fileType === 'jpg' ? 0.9 : undefined,
        success: (res: any) => resolve(res.tempFilePath),
        fail: reject
      })
    })
  }
}
