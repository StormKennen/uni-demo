import { getStorageSync, setStorageSync } from '@/utils/storage'

const CACHE_KEY = 'compendium:avatar-cache:index'
const MAX_CACHE_ENTRIES = 300
const PREFETCH_CONCURRENCY = 5
const MAX_TRACKED_PREFETCH_URLS = 600

interface AvatarCacheEntry {
  url: string
  path: string
  updatedAt: number
}

const prefetchedUrls = new Set<string>()
const prefetchingUrls = new Set<string>()

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

const avatarCacheIndex = loadAvatarCacheIndex()

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

const preloadWithLimit = async (urls: string[], limit: number, loader: (url: string) => Promise<boolean>): Promise<string[]> => {
  const failedUrls: string[] = []
  for (let index = 0; index < urls.length; index += limit) {
    const batch = urls.slice(index, index + limit)
    const results = await Promise.all(batch.map(url => loader(url)))
    results.forEach((succeeded, resultIndex) => {
      if (!succeeded) failedUrls.push(batch[resultIndex])
    })
  }
  return failedUrls
}

const preloadWebImage = (url: string): Promise<boolean> =>
  new Promise(resolve => {
    uni.getImageInfo({
      src: url,
      success: () => resolve(true),
      fail: () => resolve(false),
    })
  })

const downloadAndSaveAvatar = (url: string): Promise<boolean> =>
  new Promise(resolve => {
    uni.downloadFile({
      url,
      success: downloadResult => {
        if (downloadResult.statusCode !== 200 || !downloadResult.tempFilePath) {
          resolve(false)
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
            resolve(true)
          },
          fail: () => resolve(false),
        })
      },
      fail: () => resolve(false),
    })
  })

const rememberPrefetchedUrls = (urls: string[]) => {
  urls.forEach(url => prefetchedUrls.add(url))
  while (prefetchedUrls.size > MAX_TRACKED_PREFETCH_URLS) {
    const oldest = prefetchedUrls.values().next().value
    if (typeof oldest !== 'string') break
    prefetchedUrls.delete(oldest)
  }
}

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
  const pendingUrls = uniqueUrls.filter(url => !prefetchedUrls.has(url) && !prefetchingUrls.has(url))
  pendingUrls.forEach(url => prefetchingUrls.add(url))

  if (!pendingUrls.length) return

  // #ifdef WEB
  const webFailedUrls = await preloadWithLimit(pendingUrls, PREFETCH_CONCURRENCY, preloadWebImage)
  const webFailedUrlSet = new Set(webFailedUrls)
  rememberPrefetchedUrls(pendingUrls.filter(url => !webFailedUrlSet.has(url)))
  pendingUrls.forEach(url => prefetchingUrls.delete(url))
  return
  // #endif

  // #ifdef MP-WEIXIN
  const cachedUrls = new Set(avatarCacheIndex.map(item => item.url))
  const downloadTargets = pendingUrls.filter(url => !cachedUrls.has(url))
  const mpFailedUrls = await preloadWithLimit(downloadTargets, PREFETCH_CONCURRENCY, downloadAndSaveAvatar)
  const mpFailedUrlSet = new Set(mpFailedUrls)
  rememberPrefetchedUrls(pendingUrls.filter(url => !mpFailedUrlSet.has(url)))
  pendingUrls.forEach(url => prefetchingUrls.delete(url))
  // #endif
}
