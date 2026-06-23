import { ALL_TOOLS, STORAGE_KEY_RECENT, MAX_RECENT_TOOLS } from '@/config/tools'

/**
 * 去中心化上报：子页面在 onShow 中主动调用
 * 缓存中只存放 key 数组，如 ['image-compress', 'qr-generator']
 */
export function reportToolVisit(toolKey: string): void {
  if (!ALL_TOOLS[toolKey]) {
    console.warn(`[tracker] unknown toolKey: "${toolKey}", skipped`)
    return
  }

  try {
    const raw = uni.getStorageSync(STORAGE_KEY_RECENT)
    const list: string[] = Array.isArray(raw) ? raw : []

    const idx = list.indexOf(toolKey)
    if (idx !== -1) list.splice(idx, 1)
    list.unshift(toolKey)
    if (list.length > MAX_RECENT_TOOLS) list.length = MAX_RECENT_TOOLS

    uni.setStorageSync(STORAGE_KEY_RECENT, list)
  } catch {
    /* 静默：Storage 不可用时不影响业务 */
  }
}
