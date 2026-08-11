import type { SwcCharacterView } from '../utils'
import { getStorageSync, removeStorageSync, setStorageSync } from '@/utils/storage'

export interface SwcCharacterPageQuery {
  [key: string]: string | number | undefined
}

export interface SwcCharacterPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SwcCharacterPage {
  items: SwcCharacterView[]
  pagination: SwcCharacterPagination
}

interface MemoryCacheEntry extends SwcCharacterPage {
  cacheKey: string
  savedAt: number
  lastAccessedAt: number
  itemCount: number
  size: number
}

interface PersistedCacheEntry {
  cacheKey: string
  storageKey: string
  savedAt: number
  size: number
}

interface PersistedPagePayload {
  version: 1
  cacheKey: string
  savedAt: number
  page: SwcCharacterPage
}

const CACHE_VERSION = 1
const CACHE_TTL_MS = 12 * 60 * 60 * 1000
const MAX_MEMORY_PAGES = 40
const MAX_MEMORY_CHARACTERS = 1_500
const MAX_MEMORY_BYTES = 2_000_000
const MAX_PERSISTED_PAGES = 24
const MAX_PERSISTED_BYTES = 1_500_000
const MAX_PAGE_BYTES = 180_000
const CACHE_INDEX_KEY = 'compendium:swc:character-cache:index:v1'
const CACHE_PAGE_PREFIX = 'compendium:swc:character-cache:page:v1:'

const memoryCache = new Map<string, MemoryCacheEntry>()

const clonePage = (page: SwcCharacterPage): SwcCharacterPage => ({
  items: page.items.map(item => ({ ...item })),
  pagination: { ...page.pagination },
})

const normalizeQuery = (query: SwcCharacterPageQuery): string => {
  const entries = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))

  return JSON.stringify(entries)
}

const hashCacheKey = (value: string): string => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

const getUtf8ByteLength = (value: string): number => {
  let bytes = 0
  for (const character of value) {
    const codePoint = character.codePointAt(0) || 0
    if (codePoint <= 0x7f) bytes += 1
    else if (codePoint <= 0x7ff) bytes += 2
    else if (codePoint <= 0xffff) bytes += 3
    else bytes += 4
  }
  return bytes
}

const getPageStorageKey = (cacheKey: string): string => `${CACHE_PAGE_PREFIX}${hashCacheKey(cacheKey)}`

const isFresh = (savedAt: number): boolean => savedAt > 0 && Date.now() - savedAt < CACHE_TTL_MS

const normalizePagination = (pagination: Partial<SwcCharacterPagination> | undefined): SwcCharacterPagination => ({
  page: Number(pagination?.page) || 1,
  limit: Number(pagination?.limit) || 50,
  total: Number(pagination?.total) || 0,
  totalPages: Number(pagination?.totalPages) || 0,
  hasNext: Boolean(pagination?.hasNext),
  hasPrev: Boolean(pagination?.hasPrev),
})

const normalizePage = (page: unknown): SwcCharacterPage | null => {
  if (!page || typeof page !== 'object') return null
  const source = page as { items?: unknown; pagination?: Partial<SwcCharacterPagination> }
  if (!Array.isArray(source.items)) return null

  const items = source.items.filter((item): item is SwcCharacterView => {
    if (!item || typeof item !== 'object') return false
    const character = item as Partial<SwcCharacterView>
    return typeof character.characterId === 'string' && Boolean(character.characterId)
  })

  return {
    items: items.map(item => ({ ...item })),
    pagination: normalizePagination(source.pagination),
  }
}

const readPersistedIndex = (): PersistedCacheEntry[] => {
  // #ifdef MP-WEIXIN
  const raw = getStorageSync(CACHE_INDEX_KEY)
  if (!Array.isArray(raw)) return []

  return raw
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const source = item as Partial<PersistedCacheEntry>
      return {
        cacheKey: typeof source.cacheKey === 'string' ? source.cacheKey : '',
        storageKey: typeof source.storageKey === 'string' ? source.storageKey : '',
        savedAt: Number(source.savedAt) || 0,
        size: Number(source.size) || 0,
      }
    })
    .filter(item => Boolean(item.cacheKey && item.storageKey && item.savedAt && item.size > 0))
  // #endif

  return []
}

let persistedIndex = readPersistedIndex()

const persistIndex = () => {
  // #ifdef MP-WEIXIN
  setStorageSync(
    CACHE_INDEX_KEY,
    persistedIndex.map(item => ({ ...item })),
  )
  // #endif
}

const removePersistedPage = (entry: PersistedCacheEntry) => {
  // #ifdef MP-WEIXIN
  removeStorageSync(entry.storageKey)
  // #endif
}

const prunePersistedPages = () => {
  let totalBytes = persistedIndex.reduce((sum, item) => sum + item.size, 0)
  while (persistedIndex.length > MAX_PERSISTED_PAGES || totalBytes > MAX_PERSISTED_BYTES) {
    const removed = persistedIndex.shift()
    if (!removed) break
    totalBytes -= removed.size
    removePersistedPage(removed)
  }
  persistIndex()
}

const persistPage = (cacheKey: string, page: SwcCharacterPage, savedAt: number) => {
  // #ifdef MP-WEIXIN
  const payload: PersistedPagePayload = {
    version: CACHE_VERSION,
    cacheKey,
    savedAt,
    page: clonePage(page),
  }
  const serialized = JSON.stringify(payload)
  const size = getUtf8ByteLength(serialized)
  if (size > MAX_PAGE_BYTES) return

  const storageKey = getPageStorageKey(cacheKey)
  const previous = persistedIndex.find(item => item.storageKey === storageKey)
  if (previous && previous.savedAt > savedAt) return
  if (previous) {
    persistedIndex = persistedIndex.filter(item => item.storageKey !== storageKey)
  }

  setStorageSync(storageKey, payload)
  persistedIndex.push({ cacheKey, storageKey, savedAt, size })
  prunePersistedPages()
  // #endif
}

const readPersistedPage = (cacheKey: string): MemoryCacheEntry | null => {
  // #ifdef MP-WEIXIN
  const indexEntry = persistedIndex.find(item => item.cacheKey === cacheKey)
  if (!indexEntry) return null
  if (!isFresh(indexEntry.savedAt)) {
    persistedIndex = persistedIndex.filter(item => item.cacheKey !== cacheKey)
    removePersistedPage(indexEntry)
    persistIndex()
    return null
  }

  const raw = getStorageSync(indexEntry.storageKey) as Partial<PersistedPagePayload> | undefined
  const page = raw?.version === CACHE_VERSION && raw.cacheKey === cacheKey ? normalizePage(raw.page) : null
  if (!page) return null

  const now = Date.now()
  return {
    ...page,
    cacheKey,
    savedAt: indexEntry.savedAt,
    lastAccessedAt: now,
    itemCount: page.items.length,
    size: indexEntry.size,
  }
  // #endif

  return null
}

const setMemoryPage = (cacheKey: string, page: SwcCharacterPage, savedAt: number): MemoryCacheEntry => {
  const now = Date.now()
  const size = getUtf8ByteLength(JSON.stringify(page))
  const entry: MemoryCacheEntry = {
    ...clonePage(page),
    cacheKey,
    savedAt,
    lastAccessedAt: now,
    itemCount: page.items.length,
    size,
  }

  if (entry.itemCount > MAX_MEMORY_CHARACTERS || entry.size > MAX_MEMORY_BYTES) {
    memoryCache.delete(cacheKey)
    return entry
  }

  memoryCache.set(cacheKey, entry)

  const exceedsMemoryLimit = () => {
    const entries = [...memoryCache.values()]
    const totalCharacters = entries.reduce((sum, item) => sum + item.itemCount, 0)
    const totalBytes = entries.reduce((sum, item) => sum + item.size, 0)
    return memoryCache.size > MAX_MEMORY_PAGES || totalCharacters > MAX_MEMORY_CHARACTERS || totalBytes > MAX_MEMORY_BYTES
  }

  while (memoryCache.size > 0 && exceedsMemoryLimit()) {
    const oldest = [...memoryCache.values()].sort((left, right) => left.lastAccessedAt - right.lastAccessedAt)[0]
    if (!oldest) break
    memoryCache.delete(oldest.cacheKey)
  }

  return entry
}

const readMemoryPage = (cacheKey: string): SwcCharacterPage | null => {
  const entry = memoryCache.get(cacheKey)
  if (!entry) return null
  if (!isFresh(entry.savedAt)) {
    memoryCache.delete(cacheKey)
    return null
  }
  entry.lastAccessedAt = Date.now()
  return clonePage(entry)
}

export const getCachedSwcCharacterPage = async (
  query: SwcCharacterPageQuery,
  loader: () => Promise<SwcCharacterPage>,
  options: { force?: boolean } = {},
): Promise<SwcCharacterPage> => {
  const cacheKey = normalizeQuery(query)

  if (!options.force) {
    const memoryPage = readMemoryPage(cacheKey)
    if (memoryPage) return memoryPage

    const persistedPage = readPersistedPage(cacheKey)
    if (persistedPage) {
      setMemoryPage(cacheKey, persistedPage, persistedPage.savedAt)
      return clonePage(persistedPage)
    }
  }

  const loadedPage = await loader()
  const savedAt = Date.now()
  setMemoryPage(cacheKey, loadedPage, savedAt)

  // 持久化写入放到当前渲染任务之后，避免 setStorageSync 阻塞首屏反馈。
  // #ifdef MP-WEIXIN
  setTimeout(() => persistPage(cacheKey, loadedPage, savedAt), 0)
  // #endif

  return clonePage(loadedPage)
}

export const clearSwcCharacterCache = () => {
  memoryCache.clear()

  // #ifdef MP-WEIXIN
  persistedIndex.forEach(removePersistedPage)
  persistedIndex = []
  removeStorageSync(CACHE_INDEX_KEY)
  // #endif
}
