import { ALL_TOOLS, STORAGE_KEY_RECENT, MAX_RECENT_TOOLS } from '@/config/tools'

function resolveRecentKey(toolKey: string): string {
  const tool = ALL_TOOLS[toolKey]
  return tool?.recentAliasKey && ALL_TOOLS[tool.recentAliasKey] ? tool.recentAliasKey : toolKey
}

/**
 * 去中心化上报：子页面在 onShow 中主动调用
 * 缓存中只存放 key 数组，如 ['image-compress', 'qr-generator']
 */
export function reportToolVisit(toolKey: string): void {
  const tool = ALL_TOOLS[toolKey]
  if (!tool) {
    console.warn(`[tracker] unknown toolKey: "${toolKey}", skipped`)
    return
  }

  const recentKey = resolveRecentKey(toolKey)

  try {
    const raw = uni.getStorageSync(STORAGE_KEY_RECENT)
    const list: string[] = Array.isArray(raw)
      ? raw.reduce<string[]>((result, key) => {
          if (typeof key !== 'string' || !ALL_TOOLS[key]) return result
          const normalizedKey = resolveRecentKey(key)
          if (!result.includes(normalizedKey)) result.push(normalizedKey)
          return result
        }, [])
      : []

    const idx = list.indexOf(recentKey)
    if (idx !== -1) list.splice(idx, 1)
    list.unshift(recentKey)
    if (list.length > MAX_RECENT_TOOLS) list.length = MAX_RECENT_TOOLS

    uni.setStorageSync(STORAGE_KEY_RECENT, list)
  } catch {
    /* 静默：Storage 不可用时不影响业务 */
  }
}
