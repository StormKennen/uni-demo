import { format, formatDistance, parse } from "date-fns"

/**
 * 日期格式化函数
 * @param date Date对象或时间戳
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 * 
 * @example
 * formatDate(new Date()) // '2024-03-14 15:30:45'
 * formatDate(1647236789000, 'YYYY-MM-DD') // '2024-03-14'
 * formatDate(new Date(), 'YYYY年MM月DD日 HH时mm分ss秒') // '2024年03月14日 15时30分45秒'
 */
export const formatDate = (date: Date | number | string, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  return format(date, formatStr)
}

/**
 * 获取相对时间描述
 * @param date Date对象或时间戳
 * @returns 相对时间描述
 * 
 * @example
 * getRelativeTime(new Date()) // '刚刚'
 * getRelativeTime('2024-03-13') // '1天前'
 */
export const getFormatDistance = (laterDate: string | number | Date,
  earlierDate: string | number | Date, options?: any) => {
  return formatDistance(laterDate, earlierDate, options)
}

/**
 * 字符串转换成日期对象
 * @param string 时间字符串
 * @returns 输出时间戳，例如 1714521600000
 */
export const stringToDate = (dateStr: string, formatStr: string = 'yyyy-MM-dd') => {
  return parse(dateStr, formatStr, new Date())
}
