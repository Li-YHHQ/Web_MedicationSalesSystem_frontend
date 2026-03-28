/**
 * 格式化金额，输出 ¥1,234.56 格式
 * 对 null/undefined/NaN 做保护，统一显示 ¥0.00
 */
export function formatMoney(amount: number | null | undefined): string {
  const num = amount == null || isNaN(Number(amount)) ? 0 : Number(amount)
  return '¥' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化日期，输出 YYYY-MM-DD 格式
 */
export function formatDate(date: string): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * 格式化日期时间，输出 YYYY-MM-DD HH:mm 格式
 */
export function formatDateTime(date: string): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

/**
 * 格式化数字，输出千分位格式，如 1,234,567
 * 对 null/undefined 做保护，统一显示 0
 */
export function formatNumber(num: number | null | undefined): string {
  const n = num == null || isNaN(Number(num)) ? 0 : Number(num)
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
