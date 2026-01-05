/**
 * @description Calendar/获取今日黄历--接口返回值
 * @url GET /calendar/today
 */
export interface getCalendarTodayRes {}

/**
 * @description Calendar/获取指定日期的黄历详情--接口请求Query参数
 * @url GET /calendar/detail
 */
export interface getCalendarDetailQuery {
  /** 日期，格式 YYYY-MM-DD */
  date: string
}

/**
 * @description Calendar/获取指定日期的黄历详情--接口返回值
 * @url GET /calendar/detail
 */
export interface getCalendarDetailRes {}

/**
 * @description Calendar/获取指定月份的日历数据--接口请求Query参数
 * @url GET /calendar/month
 */
export interface getCalendarMonthQuery {
  /** 年份，默认当前年 */
  year?: number
  /** 月份(1-12)，默认当前月 */
  month?: number
}

/**
 * @description Calendar/获取指定月份的日历数据--接口返回值
 * @url GET /calendar/month
 */
export interface getCalendarMonthRes {}

/**
 * @description Calendar/获取择吉日列表--接口请求Query参数
 * @url GET /calendar/auspicious
 */
export interface getCalendarAuspiciousQuery {
  /** 年份，默认当前年 */
  year?: number
  /** 月份(1-12)，默认当前月 */
  month?: number
  /** 事件类型，如：嫁娶、开业、搬家、出行等 */
  event: string
}

/**
 * @description Calendar/获取择吉日列表--接口返回值
 * @url GET /calendar/auspicious
 */
export interface getCalendarAuspiciousRes {}
