export const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/** 格式化日期为 "MM月DD日" */
export function formatMonthDay(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 格式化日期为 "YYYY-MM-DD" */
export function formatDateStr(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 格式化日期为 "YYYY年M月D日 周X" */
export function formatDateFull(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const w = WEEK_DAYS[d.getDay()]
  return `${y}年${m}月${day}日 ${w}`
}

/** 获取日期对应的星期名称 */
export function getWeekDay(date) {
  const d = date instanceof Date ? date : new Date(date)
  return WEEK_DAYS[d.getDay()]
}
