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

class H5CanvasContext implements PlatformCanvasContext {
  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  async clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
  }

  async drawTask(source: LoadedImage, task: RenderTask) {
    const image = (source.resource as HTMLImageElement) ?? new Image()
    if (!source.resource) {
      image.src = source.uri
    }
    const { sourceRect, targetRect } = task
    this.ctx.save()
    this.ctx.translate(targetRect.x, targetRect.y)
    this.ctx.drawImage(
      image,
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
    // no-op for DOM canvas
  }
}

export class H5Adapter implements PlatformAdapter {
  readonly name = 'H5Adapter'

  async loadImage(source: CipherSource): Promise<LoadedImage> {
    return await new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => {
        resolve({
          uri: source.uri,
          width: image.naturalWidth,
          height: image.naturalHeight,
          resource: image,
          format: guessFormatFromUri(source.uri)
        })
      }
      image.onerror = (err) => reject(err)
      image.src = source.uri
    })
  }

  async createCanvas(dim: Size): Promise<CanvasHandle> {
    const canvas = document.createElement('canvas')
    canvas.width = dim.width
    canvas.height = dim.height
    return {
      id: `h5-canvas-${Date.now()}`,
      width: dim.width,
      height: dim.height,
      resource: canvas
    }
  }

  async getCanvasContext(canvas: CanvasHandle): Promise<PlatformCanvasContext> {
    const element = canvas.resource as HTMLCanvasElement
    const context = element.getContext('2d')
    if (!context) {
      throw new Error('[H5Adapter] failed to acquire 2d context')
    }
    return new H5CanvasContext(context)
  }

  async exportImage(canvas: CanvasHandle, _metadata: CipherMetadata): Promise<string> {
    const element = canvas.resource as HTMLCanvasElement
    const format = (_metadata.extra?.format as string) || 'png'
    const mime = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const quality = mime === 'image/jpeg' ? 0.9 : undefined
    return element.toDataURL(mime, quality)
  }
}

const guessFormatFromUri = (uri: string): LoadedImage['format'] => {
  if (/data:image\/jpeg/i.test(uri) || /\.jpe?g($|\?)/i.test(uri)) return 'jpg'
  if (/data:image\/webp/i.test(uri) || /\.webp($|\?)/i.test(uri)) return 'webp'
  return 'png'
}
