import { LocalMetadataStore } from '../storage/LocalMetadataStore'
import { CipherContext } from './CipherContext'
import type {
  CipherEngineAPI,
  CipherMetadata,
  CipherOptions,
  CipherResult,
  CipherSource
} from '../types/index'
import { CipherFactory } from './CipherFactory'
import { readMetadataHistoryFromSource, writeMetadataHistoryToUri } from '../utils/metadataIO'

export class CipherEngine implements CipherEngineAPI {
  private readonly factory = new CipherFactory()

  async encrypt(options: CipherOptions): Promise<CipherResult> {
    return this.execute(options, 'encrypt')
  }

  async decrypt(options: CipherOptions): Promise<CipherResult> {
    return this.execute(options, 'decrypt')
  }

  async restore(metadata: CipherMetadata, source: CipherSource): Promise<CipherResult> {
    return this.execute({ source, metadata, seed: metadata.seed, metadataHistory: [metadata] }, 'decrypt')
  }

  async preview(metadata: CipherMetadata): Promise<CipherResult> {
    const uri = (metadata.extra?.uri as string) || ''
    if (!uri) {
      throw new Error('预览失败：缺少图片来源信息')
    }
    return this.restore(metadata, { uri, type: 'tempFile' })
  }

  private async execute(options: CipherOptions, mode: 'encrypt' | 'decrypt') {
    const adapter = options.adapter ?? this.factory.resolveAdapter(options)
    const renderer = this.factory.resolveRenderer(options)
    const store = new LocalMetadataStore()
    const algorithm = this.factory.resolveAlgorithm(options)
    let metadata = options.metadata ?? this.factory.createMetadata(options)
    const pathGenerator = this.factory.resolvePathGenerator(options)
    const historyBefore: CipherMetadata[] = [...(options.metadataHistory ?? [])]
    if (!historyBefore.length) {
      const embeddedHistory = await readMetadataHistoryFromSource(options.source)
      if (embeddedHistory?.length) {
        historyBefore.push(...embeddedHistory)
      }
    }
    const loaded = await adapter.loadImage(options.source)
    metadata.width = loaded.width
    metadata.height = loaded.height
    metadata.pathGenerator = pathGenerator.name
    const provider = this.factory.resolveProvider(options, loaded)
    metadata.provider = provider.name
    const outputFormat = this.resolveOutputFormat(loaded.format, options.source)
    metadata.extra = { ...(metadata.extra || {}), uri: loaded.uri, format: outputFormat }
    if (mode === 'decrypt') {
      if (!metadata) {
        metadata = historyBefore.pop()
      } else if (historyBefore.length) {
        historyBefore.pop()
      }
      if (!metadata) {
        throw new Error('解密失败：缺少匹配的元数据记录')
      }
    }
    const context = new CipherContext(
      options,
      metadata,
      historyBefore,
      adapter,
      renderer,
      provider,
      pathGenerator,
      this.factory.createPRNG(metadata.seed),
      algorithm,
      store
    )
    const execResult = await (mode === 'encrypt' ? algorithm.encrypt(context) : algorithm.decrypt(context))
    let historyAfter = historyBefore
    if (mode === 'encrypt') {
      historyAfter = [...historyBefore, execResult.metadata]
    }
    const sanitizedHistory = this.sanitizeHistory(historyAfter)
    const patchedUri = await this.embedMetadata(execResult.uri, options.source, sanitizedHistory)
    const result: CipherResult = {
      ...execResult,
      uri: patchedUri,
      metadataHistory: historyAfter
    }
    await store.save(result.metadata)
    return result
  }

  private async embedMetadata(uri: string, source: CipherSource, history: CipherMetadata[]) {
    if (!history.length) return uri
    const type = uri.startsWith('data:') ? 'base64' : source.type === 'base64' ? 'base64' : 'tempFile'
    try {
      return await writeMetadataHistoryToUri(uri, type === 'base64' ? 'base64' : 'tempFile', history)
    } catch (err) {
      console.warn('[TomatoCipher] embed metadata failed', err)
      return uri
    }
  }

  private sanitizeHistory(history: CipherMetadata[]): CipherMetadata[] {
    return history.map((item) => {
      const cleanExtra = { ...(item.extra || {}) }
      delete cleanExtra.uri
      delete cleanExtra.previewUri
      delete cleanExtra.history
      const extra = Object.keys(cleanExtra).length ? cleanExtra : undefined
      return { ...item, extra }
    })
  }

  private resolveOutputFormat(format?: string, source?: CipherSource): 'png' | 'jpg' {
    const normalized = (format || '').toLowerCase()
    if (normalized === 'jpg' || normalized === 'jpeg') return 'jpg'
    if (normalized === 'png') return 'png'
    if (source?.uri) {
      if (/\.jpe?g($|\?)/i.test(source.uri) || /^data:image\/jpeg/i.test(source.uri)) return 'jpg'
    }
    return 'png'
  }
}
