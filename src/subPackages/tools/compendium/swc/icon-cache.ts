import { getStorageSync, setStorageSync } from '@/utils/storage'
import { getSwcIconObjectKey, resolveSwcSquareIcon, type SwcSquareIconKind } from './icon-assets'

const CACHE_KEY = 'swc:icon-cache:index'
const MAX_CACHE_ENTRIES = 120

interface SwcIconCacheEntry {
  objectKey: string
  path: string
  updatedAt: number
}

const pendingObjectKeys = new Set<string>()

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

const toText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return 0
}

const loadSwcIconCacheIndex = (): SwcIconCacheEntry[] => {
  const raw = getStorageSync(CACHE_KEY)
  if (!Array.isArray(raw)) return []

  return raw
    .map(item => {
      if (!isRecord(item)) return null
      const objectKey = toText(item.objectKey)
      const path = toText(item.path)
      const updatedAt = toNumber(item.updatedAt)
      if (!objectKey || !path) return null
      return { objectKey, path, updatedAt }
    })
    .filter((item): item is SwcIconCacheEntry => Boolean(item))
    .sort((a, b) => a.updatedAt - b.updatedAt)
}

let swcIconCacheIndex = loadSwcIconCacheIndex()

const persistSwcIconCacheIndex = () => {
  setStorageSync(
    CACHE_KEY,
    swcIconCacheIndex.map(item => ({ ...item })),
  )
}

const removeSavedFile = (filePath: string): Promise<void> =>
  new Promise(resolve => {
    uni.removeSavedFile({
      filePath,
      success: () => resolve(),
      fail: () => resolve(),
    })
  })

const pruneSwcIconCacheIndex = async () => {
  while (swcIconCacheIndex.length > MAX_CACHE_ENTRIES) {
    const removed = swcIconCacheIndex.shift()
    if (!removed) continue
    await removeSavedFile(removed.path)
  }
  persistSwcIconCacheIndex()
}

const upsertSwcIconCacheEntry = async (entry: SwcIconCacheEntry) => {
  const existingIndex = swcIconCacheIndex.findIndex(item => item.objectKey === entry.objectKey)
  if (existingIndex >= 0) {
    const existing = swcIconCacheIndex[existingIndex]
    swcIconCacheIndex.splice(existingIndex, 1)
    if (existing.path && existing.path !== entry.path) {
      await removeSavedFile(existing.path)
    }
  }
  swcIconCacheIndex.push(entry)
  await pruneSwcIconCacheIndex()
}

const removeSwcIconCacheEntry = async (objectKey: string) => {
  const index = swcIconCacheIndex.findIndex(item => item.objectKey === objectKey)
  if (index < 0) return

  const [removed] = swcIconCacheIndex.splice(index, 1)
  persistSwcIconCacheIndex()
  if (removed?.path) {
    await removeSavedFile(removed.path)
  }
}

const downloadAndSaveSwcIcon = async (objectKey: string, remoteUrl: string): Promise<string> =>
  new Promise(resolve => {
    uni.downloadFile({
      url: remoteUrl,
      success: downloadResult => {
        if (downloadResult.statusCode !== 200 || !downloadResult.tempFilePath) {
          resolve('')
          return
        }

        uni.saveFile({
          tempFilePath: downloadResult.tempFilePath,
          success: async saveResult => {
            await upsertSwcIconCacheEntry({
              objectKey,
              path: saveResult.savedFilePath,
              updatedAt: Date.now(),
            })
            resolve(saveResult.savedFilePath)
          },
          fail: () => resolve(''),
        })
      },
      fail: () => resolve(''),
    })
  })

export const resolveSwcCachedIcon = (kind: SwcSquareIconKind, iconKey?: string): string => {
  const remoteUrl = resolveSwcSquareIcon(kind, iconKey)
  if (!remoteUrl) return ''

  // #ifdef MP-WEIXIN
  const objectKey = getSwcIconObjectKey(kind, iconKey)
  if (!objectKey) return remoteUrl
  const cached = swcIconCacheIndex.find(item => item.objectKey === objectKey)
  return cached?.path || remoteUrl
  // #endif

  return remoteUrl
}

export const ensureSwcIconCached = async (kind: SwcSquareIconKind, iconKey?: string): Promise<string> => {
  const remoteUrl = resolveSwcSquareIcon(kind, iconKey)
  if (!remoteUrl) return ''

  // #ifdef H5
  return remoteUrl
  // #endif

  // #ifdef MP-WEIXIN
  const objectKey = getSwcIconObjectKey(kind, iconKey)
  if (!objectKey) return remoteUrl

  const cached = swcIconCacheIndex.find(item => item.objectKey === objectKey)
  if (cached?.path) {
    cached.updatedAt = Date.now()
    swcIconCacheIndex = [...swcIconCacheIndex].sort((a, b) => a.updatedAt - b.updatedAt)
    persistSwcIconCacheIndex()
    return cached.path
  }

  if (pendingObjectKeys.has(objectKey)) return remoteUrl

  pendingObjectKeys.add(objectKey)
  try {
    const savedPath = await downloadAndSaveSwcIcon(objectKey, remoteUrl)
    return savedPath || remoteUrl
  } finally {
    pendingObjectKeys.delete(objectKey)
  }
  // #endif

  return remoteUrl
}

export const invalidateSwcIconCache = async (kind: SwcSquareIconKind, iconKey?: string) => {
  // #ifdef MP-WEIXIN
  const objectKey = getSwcIconObjectKey(kind, iconKey)
  if (!objectKey) return
  await removeSwcIconCacheEntry(objectKey)
  // #endif
}
