/**
 * 生成指定长度的随机字符串
 * @param len 字符串长度，默认32位
 * @returns 随机字符串
 */
export const generateRandomString = (len: number = 32): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const maxPos = chars.length
  let str = ''
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return str
}

/**
 * 生成UUID
 * @returns UUID字符串
 * @example 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成带时间戳的UID
 * @param prefix 前缀，默认为空
 * @returns 时间戳+随机字符串
 * @example 'prefix_20240314153045_abc123'
 */
export const generateTimeUID = (prefix: string = ''): string => {
  const timestamp = new Date().getTime()
  const random = Math.random().toString(36).substr(2, 6)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

/**
 * 生成递增的UID
 */
let _uid = 0
export const generateIncrementUID = (prefix: string = 'uid'): string => {
  _uid++
  return `${prefix}_${_uid}`
}

/**
 * 生成短UID（8位）
 * @returns 8位随机字符串
 */
export const generateShortUID = (): string => {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * 生成数字UID
 * @param length 长度，默认6位
 * @returns 纯数字字符串, 生成非0开头的结果
 */
export const generateNumberUID = (length: number = 6): string => {
  return Math.floor(Math.random() * 9) + 1 + Math.random().toString().slice(2, 1 + length)
}

/**
 * 检查字符串是否为有效的UUID
 * @param str 要检查的字符串
 * @returns boolean
 */
export const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
} 