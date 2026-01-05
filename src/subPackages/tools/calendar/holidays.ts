/**
 * 法定假期数据
 * 包含休息日和调休上班日
 */

export interface HolidayInfo {
  type: 'rest' | 'work'
  name: string
}

// 法定假期标记数据
export const holidays: Record<string, HolidayInfo> = {
  // 2025年法定假期
  '2025-01-01': { type: 'rest', name: '元旦' },
  '2025-01-28': { type: 'rest', name: '除夕' },
  '2025-01-29': { type: 'rest', name: '春节' },
  '2025-01-30': { type: 'rest', name: '春节' },
  '2025-01-31': { type: 'rest', name: '春节' },
  '2025-02-01': { type: 'rest', name: '春节' },
  '2025-02-02': { type: 'rest', name: '春节' },
  '2025-02-03': { type: 'rest', name: '春节' },
  '2025-02-04': { type: 'rest', name: '春节' },
  '2025-01-26': { type: 'work', name: '春节调休' },
  '2025-02-08': { type: 'work', name: '春节调休' },
  '2025-04-04': { type: 'rest', name: '清明' },
  '2025-04-05': { type: 'rest', name: '清明' },
  '2025-04-06': { type: 'rest', name: '清明' },
  '2025-05-01': { type: 'rest', name: '劳动节' },
  '2025-05-02': { type: 'rest', name: '劳动节' },
  '2025-05-03': { type: 'rest', name: '劳动节' },
  '2025-05-04': { type: 'rest', name: '劳动节' },
  '2025-05-05': { type: 'rest', name: '劳动节' },
  '2025-04-27': { type: 'work', name: '劳动节调休' },
  '2025-05-31': { type: 'rest', name: '端午' },
  '2025-06-01': { type: 'rest', name: '端午' },
  '2025-06-02': { type: 'rest', name: '端午' },
  '2025-10-01': { type: 'rest', name: '国庆' },
  '2025-10-02': { type: 'rest', name: '国庆' },
  '2025-10-03': { type: 'rest', name: '国庆' },
  '2025-10-04': { type: 'rest', name: '国庆' },
  '2025-10-05': { type: 'rest', name: '国庆' },
  '2025-10-06': { type: 'rest', name: '中秋国庆' },
  '2025-10-07': { type: 'rest', name: '国庆' },
  '2025-10-08': { type: 'rest', name: '国庆' },
  '2025-09-28': { type: 'work', name: '国庆调休' },
  '2025-10-11': { type: 'work', name: '国庆调休' },
}

// 法定节假日列表（用于节日查询页面）
export const holidayList = [
  { name: '元旦节', date: '2025-01-01' },
  { name: '春节', date: '2025-01-29' },
  { name: '清明节', date: '2025-04-04' },
  { name: '劳动节', date: '2025-05-01' },
  { name: '端午节', date: '2025-05-31' },
  { name: '中秋节', date: '2025-10-06' },
  { name: '国庆节', date: '2025-10-01' },
]

// 二十四节气列表（2025年）
export const solarTermList = [
  { name: '小寒', date: '2025-01-05' },
  { name: '大寒', date: '2025-01-20' },
  { name: '立春', date: '2025-02-03' },
  { name: '雨水', date: '2025-02-18' },
  { name: '惊蛰', date: '2025-03-05' },
  { name: '春分', date: '2025-03-20' },
  { name: '清明', date: '2025-04-04' },
  { name: '谷雨', date: '2025-04-20' },
  { name: '立夏', date: '2025-05-05' },
  { name: '小满', date: '2025-05-21' },
  { name: '芒种', date: '2025-06-05' },
  { name: '夏至', date: '2025-06-21' },
  { name: '小暑', date: '2025-07-07' },
  { name: '大暑', date: '2025-07-22' },
  { name: '立秋', date: '2025-08-07' },
  { name: '处暑', date: '2025-08-23' },
  { name: '白露', date: '2025-09-07' },
  { name: '秋分', date: '2025-09-23' },
  { name: '寒露', date: '2025-10-08' },
  { name: '霜降', date: '2025-10-23' },
  { name: '立冬', date: '2025-11-07' },
  { name: '小雪', date: '2025-11-22' },
  { name: '大雪', date: '2025-12-07' },
  { name: '冬至', date: '2025-12-22' },
]

// 热门节日列表（2025年）
export const popularFestivalList = [
  { name: '情人节', date: '2025-02-14' },
  { name: '妇女节', date: '2025-03-08' },
  { name: '植树节', date: '2025-03-12' },
  { name: '愚人节', date: '2025-04-01' },
  { name: '母亲节', date: '2025-05-11' },
  { name: '儿童节', date: '2025-06-01' },
  { name: '父亲节', date: '2025-06-15' },
  { name: '七夕节', date: '2025-08-29' },
  { name: '教师节', date: '2025-09-10' },
  { name: '重阳节', date: '2025-10-29' },
  { name: '万圣节', date: '2025-10-31' },
  { name: '感恩节', date: '2025-11-27' },
  { name: '平安夜', date: '2025-12-24' },
  { name: '圣诞节', date: '2025-12-25' },
  { name: '腊八节', date: '2025-01-07' },
  { name: '小年', date: '2025-01-22' },
  { name: '除夕', date: '2025-01-28' },
  { name: '元宵节', date: '2025-02-12' },
]
