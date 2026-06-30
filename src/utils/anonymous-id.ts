import { getStorageSync, setStorageSync } from '@/utils/storage'

const ANONYMOUS_ID_KEY = 'compendium:anonymousId'

// 简单 UUID v4（兼容小程序，无需依赖 crypto）
const genUuid = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })

/** 获取（或首次生成并持久化）游客设备标识，同一设备稳定。 */
export const getAnonymousId = (): string => {
  let id = getStorageSync(ANONYMOUS_ID_KEY)
  if (!id || typeof id !== 'string') {
    id = genUuid()
    setStorageSync(ANONYMOUS_ID_KEY, id)
  }
  return id
}
