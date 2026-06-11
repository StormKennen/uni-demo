export type CipherLevel = 1 | 2 | 3 | 4 | 5

export interface CipherSource {
  uri: string
  type: 'tempFile' | 'base64' | 'remote'
}

export interface CipherMetadata {
  version: string
  algorithm: string
  seed: string
  level: CipherLevel
  blockSize: number
  width: number
  height: number
  pathGenerator: string
  provider: string
  timestamp: number
  seedHash?: string
  extra?: Record<string, unknown>
}

export interface CipherOptions {
  source: CipherSource
  level?: CipherLevel
  algorithm?: string
  seed?: string
  metadata?: CipherMetadata
  extras?: Record<string, unknown>
  adapter?: PlatformAdapter
  platform?: 'weapp' | 'h5' | 'app'
  adapterOptions?: Record<string, unknown>
  metadataHistory?: CipherMetadata[]
}

export interface CipherResult {
  uri: string
  metadata: CipherMetadata
  duration?: number
  previewUri?: string
  metadataHistory?: CipherMetadata[]
}

export interface CipherAlgorithm {
  name: string
  encrypt(context: CipherContext): Promise<CipherResult>
  decrypt(context: CipherContext): Promise<CipherResult>
}

export interface RenderTask {
  sourceRect: Rect
  targetRect: Rect
  rotation: 0 | 90 | 180 | 270
  mirror: 'none' | 'horizontal' | 'vertical'
}

export interface PathGenerator {
  readonly name: string
  generate(rows: number, cols: number): Uint32Array
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Renderer {
  readonly name: string
  render(tasks: RenderTask[], context: CipherContext): Promise<CipherResult>
}

export interface PlatformAdapter {
  readonly name: string
  loadImage(source: CipherSource): Promise<LoadedImage>
  createCanvas(dim: Size): Promise<CanvasHandle>
  getCanvasContext(canvas: CanvasHandle): Promise<PlatformCanvasContext>
  exportImage(canvas: CanvasHandle, metadata: CipherMetadata): Promise<string>
}

export interface LoadedImage {
  width: number
  height: number
  uri: string
  resource?: unknown
  metadataHistory?: CipherMetadata[]
  format?: 'png' | 'jpg' | 'jpeg' | 'webp'
}

export interface Size {
  width: number
  height: number
}

export interface CanvasHandle {
  id: string
  width: number
  height: number
  resource?: unknown
}

export interface PlatformCanvasContext {
  clear(): Promise<void>
  drawTask(source: LoadedImage, task: RenderTask): Promise<void>
  flush(): Promise<void>
}

export interface ContentProvider {
  readonly name: string
  getWidth(): number
  getHeight(): number
  getBlocks(blockSize: number): Iterable<Rect>
  getGridSize(): { rows: number; cols: number }
  getSource(): LoadedImage
}

export interface MetadataStore {
  save(metadata: CipherMetadata): Promise<void>
  get(id: string): Promise<CipherMetadata | null>
  list(): Promise<CipherMetadata[]>
}

export interface PRNG {
  clone(): PRNG
  nextUint32(): number
  nextFloat(): number
}

export interface CipherPlugin {
  name: string
  supports?(algorithm: string): boolean
}

export interface CipherContext {
  readonly options: CipherOptions
  readonly metadata: CipherMetadata
  readonly metadataHistory: CipherMetadata[]
  readonly adapter: PlatformAdapter
  readonly renderer: Renderer
  readonly provider: ContentProvider
  readonly pathGenerator: PathGenerator
  readonly store?: MetadataStore
  readonly plugins: CipherPlugin[]
  readonly prng: PRNG
  readonly algorithm: CipherAlgorithm
  getLevel(): CipherLevel
  getRenderTasks(blocks: Rect[]): RenderTask[]
}

export interface CipherEngineAPI {
  encrypt(options: CipherOptions): Promise<CipherResult>
  decrypt(options: CipherOptions): Promise<CipherResult>
  restore(metadata: CipherMetadata, source: CipherSource): Promise<CipherResult>
  preview(metadata: CipherMetadata): Promise<CipherResult>
}
