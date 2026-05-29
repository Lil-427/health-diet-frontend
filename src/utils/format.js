// 日期格式化
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 数字千分位格式化
export function formatNumber(num) {
  if (num == null) return ''
  return Number(num).toLocaleString('zh-CN')
}

// 卡路里单位格式化
export function formatCalorie(cal) {
  if (cal == null) return ''
  return `${cal} kcal`
}
