import type {
  CipherAlgorithm,
  CipherContext as CipherContextType,
  CipherMetadata,
  CipherOptions,
  CipherPlugin,
  ContentProvider,
  MetadataStore,
  PathGenerator,
  PlatformAdapter,
  PRNG,
  Renderer,
  Rect,
  RenderTask
} from '../types/index'

export class CipherContext implements CipherContextType {
  constructor(
    public readonly options: CipherOptions,
    public readonly metadata: CipherMetadata,
    public readonly metadataHistory: CipherMetadata[],
    public readonly adapter: PlatformAdapter,
    public readonly renderer: Renderer,
    public readonly provider: ContentProvider,
    public readonly pathGenerator: PathGenerator,
    public readonly prng: PRNG,
    public readonly algorithm: CipherAlgorithm,
    public readonly store?: MetadataStore,
    public readonly plugins: CipherPlugin[] = []
  ) {}

  getLevel() {
    return this.metadata.level
  }

  getRenderTasks(blocks: Rect[]): RenderTask[] {
    // TODO: link to algorithm/renderer instructions in Stage 2
    return blocks.map((block) => ({
      sourceRect: block,
      targetRect: block,
      rotation: 0,
      mirror: 'none'
    }))
  }
}
