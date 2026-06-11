import type { ContentProvider, LoadedImage, Rect } from '../types/index'

export class ImageContentProvider implements ContentProvider {
  readonly name = 'ImageProvider'
  private lastBlockSize: number

  constructor(private readonly image: LoadedImage, defaultBlockSize = 32) {
    this.lastBlockSize = defaultBlockSize
  }

  getWidth() {
    return this.image.width
  }

  getHeight() {
    return this.image.height
  }

  getBlocks(blockSize: number): Iterable<Rect> {
    this.lastBlockSize = blockSize
    const rows = Math.ceil(this.image.height / blockSize)
    const cols = Math.ceil(this.image.width / blockSize)
    const blocks: Rect[] = []
    for (let row = 0; row < rows; row++) {
      const y = row * blockSize
      const height = Math.min(blockSize, this.image.height - y)
      for (let col = 0; col < cols; col++) {
        const x = col * blockSize
        const width = Math.min(blockSize, this.image.width - x)
        blocks.push({ x, y, width, height })
      }
    }
    return blocks
  }

  getGridSize() {
    const size = this.lastBlockSize || 1
    return {
      rows: Math.ceil(this.image.height / size),
      cols: Math.ceil(this.image.width / size)
    }
  }

  getSource(): LoadedImage {
    return this.image
  }
}
