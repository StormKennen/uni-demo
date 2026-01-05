/**
 * 万年历工具函数（纯前端工具，不依赖lunar-javascript）
 * 复杂计算已移至后端API
 */

/**
 * 格式化日期为 YYYY-MM-DD
 */
export const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * 获取今天的日期字符串
 */
export const getTodayStr = (): string => {
  const now = new Date()
  return formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}
