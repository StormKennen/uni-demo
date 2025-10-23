// 香港法定节假日和周末不可预约

const disableDate = [
    '2025-01-01', // 元旦
    '2025-01-29', // 农历新年
    '2025-01-30', // 农历新年初二
    '2025-01-31', // 农历新年初三
    '2025-04-04', // 清明节
    '2025-04-18', // 耶稣受难节
    '2025-04-19', // 耶稣受难节翌日
    '2025-04-21', // 复活节星期一
    '2025-05-01', // 劳动节
    '2025-05-05', // 佛诞
    '2025-05-31', // 端午
    '2025-07-01', // 香港特别行政区成立纪念日
    '2025-10-07', // 中秋节翌日
    '2025-10-01', // 国庆节
    '2025-10-29', // 重阳节
    '2025-12-25', // 圣诞节
    '2025-12-26'  // 圣诞节后第一个周日
]


/**
 * 判断是否是周末
 * @param date 日期 格式：2025-01-01
 * @returns 是否是周末
 */
const isWeekend = (date: string) => {
    const day = new Date(date).getDay()
    return day === 0 || day === 6
}

/**
 * 判断是否是法定节假日
 * @param date 日期 格式：2025-01-01
 * @returns 是否是法定节假日
 */
const isHoliday = (date: string) => {
    return disableDate.includes(date)
}

/**
 * 判断是否是周末或法定节假日
 * @param date 日期 格式：2025-01-01
 * @returns 是否是周末或法定节假日
 */
export const isWeekendOrHoliday = (date: string) => {
    return isWeekend(date) || isHoliday(date)
}

/**
 * 判断一个时间范围内是否包含周末或法定节假日
 * @param startDate 开始日期 格式：2025-01-01
 * @param endDate 结束日期 格式：2025-01-01
 * @returns 是否包含周末或法定节假日
 */
export const isWeekendOrHolidayInRange = (startDate: string, endDate: string) => {
    for (let date = new Date(startDate); date <= new Date(endDate); date.setDate(date.getDate() + 1)) {
        if (isWeekendOrHoliday(date.toISOString().split('T')[0])) {
            return true
        }
    }
    return false
}
