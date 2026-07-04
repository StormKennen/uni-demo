import { getStorageSync, setStorageSync } from '@/utils/storage'

const CACHE_KEY = 'compendium:avatar-cache:index'
const MAX_CACHE_ENTRIES = 300
const PREFETCH_CONCURRENCY = 5

interface AvatarCacheEntry {
  url: string
  path: string
  updatedAt: number
}

const prefetchedUrls = new Set<string>()

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

const loadAvatarCacheIndex = (): AvatarCacheEntry[] => {
  const raw = getStorageSync(CACHE_KEY)
  if (!Array.isArray(raw)) return []

  return raw
    .map(item => {
      if (!isRecord(item)) return null
      const url = toText(item.url)
      const path = toText(item.path)
      const updatedAt = toNumber(item.updatedAt)
      if (!url || !path) return null
      return { url, path, updatedAt }
    })
    .filter((item): item is AvatarCacheEntry => Boolean(item))
    .sort((a, b) => a.updatedAt - b.updatedAt)
}

let avatarCacheIndex = loadAvatarCacheIndex()

const persistAvatarCacheIndex = () => {
  setStorageSync(
    CACHE_KEY,
    avatarCacheIndex.map(item => ({ ...item })),
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

const pruneAvatarCacheIndex = async () => {
  while (avatarCacheIndex.length > MAX_CACHE_ENTRIES) {
    const removed = avatarCacheIndex.shift()
    if (!removed) continue
    await removeSavedFile(removed.path)
  }
  persistAvatarCacheIndex()
}

const upsertAvatarCacheEntry = async (entry: AvatarCacheEntry) => {
  const existingIndex = avatarCacheIndex.findIndex(item => item.url === entry.url)
  if (existingIndex >= 0) {
    avatarCacheIndex.splice(existingIndex, 1)
  }
  avatarCacheIndex.push(entry)
  await pruneAvatarCacheIndex()
}

const preloadWithLimit = async (urls: string[], limit: number, loader: (url: string) => Promise<void>) => {
  for (let index = 0; index < urls.length; index += limit) {
    const batch = urls.slice(index, index + limit)
    await Promise.all(batch.map(url => loader(url)))
  }
}

const preloadWebImage = (url: string): Promise<void> =>
  new Promise(resolve => {
    uni.getImageInfo({
      src: url,
      success: () => resolve(),
      fail: () => resolve(),
    })
  })

const downloadAndSaveAvatar = (url: string): Promise<void> =>
  new Promise(resolve => {
    uni.downloadFile({
      url,
      success: downloadResult => {
        if (downloadResult.statusCode !== 200 || !downloadResult.tempFilePath) {
          resolve()
          return
        }

        uni.saveFile({
          tempFilePath: downloadResult.tempFilePath,
          success: async saveResult => {
            await upsertAvatarCacheEntry({
              url,
              path: saveResult.savedFilePath,
              updatedAt: Date.now(),
            })
            resolve()
          },
          fail: () => resolve(),
        })
      },
      fail: () => resolve(),
    })
  })

export const resolveAvatar = (url: string): string => {
  if (!url) return ''

  // #ifdef MP-WEIXIN
  const cached = avatarCacheIndex.find(item => item.url === url)
  return cached?.path || url
  // #endif

  return url
}

export const preloadAvatars = async (urls: string[]): Promise<void> => {
  const uniqueUrls = Array.from(new Set(urls.map(toText).filter(Boolean)))
  const pendingUrls = uniqueUrls.filter(url => !prefetchedUrls.has(url))
  pendingUrls.forEach(url => prefetchedUrls.add(url))

  if (!pendingUrls.length) return

  // #ifdef WEB
  await Promise.allSettled(pendingUrls.map(url => preloadWebImage(url)))
  return
  // #endif

  // #ifdef MP-WEIXIN
  const cachedUrls = new Set(avatarCacheIndex.map(item => item.url))
  const downloadTargets = pendingUrls.filter(url => !cachedUrls.has(url))
  await preloadWithLimit(downloadTargets, PREFETCH_CONCURRENCY, downloadAndSaveAvatar)
  // #endif
}
