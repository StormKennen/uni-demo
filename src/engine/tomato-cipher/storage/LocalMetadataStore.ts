import type { CipherMetadata, MetadataStore } from '../types/index'

const STORAGE_KEY = 'tomato_cipher_metadata_records'

declare const uni: any

defaultExportGuard()

function defaultExportGuard() {
  if (typeof uni === 'undefined') {
    // noop for non-uni environments (e.g., unit tests)
  }
}

const readRecords = (): CipherMetadata[] => {
  try {
    const raw = uni?.getStorageSync?.(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CipherMetadata[]
  } catch (err) {
    console.warn('[TomatoCipher] read metadata failed', err)
    return []
  }
}

const writeRecords = (records: CipherMetadata[]) => {
  try {
    uni?.setStorageSync?.(STORAGE_KEY, JSON.stringify(records))
  } catch (err) {
    console.warn('[TomatoCipher] write metadata failed', err)
  }
}

const buildId = (metadata: CipherMetadata) => `${metadata.algorithm}-${metadata.seed}-${metadata.timestamp}`

export class LocalMetadataStore implements MetadataStore {
  async save(metadata: CipherMetadata): Promise<void> {
    const records = readRecords()
    const id = buildId(metadata)
    const idx = records.findIndex((record) => buildId(record) === id)
    if (idx >= 0) {
      records[idx] = metadata
    } else {
      records.unshift(metadata)
    }
    writeRecords(records)
  }

  async get(id: string): Promise<CipherMetadata | null> {
    const records = readRecords()
    return records.find((record) => buildId(record) === id) ?? null
  }

  async list(): Promise<CipherMetadata[]> {
    return readRecords()
  }
}
