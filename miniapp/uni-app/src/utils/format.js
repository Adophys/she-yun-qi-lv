/**
 * 通用格式化工具。
 */

/** 分 → 元（保留两位，去掉多余 0） */
export function formatPrice(fen) {
  if (fen === null || fen === undefined || fen === '') return '0.00'
  const yuan = Number(fen) / 100
  return Number.isInteger(yuan) ? String(yuan) : yuan.toFixed(2)
}

/** 金额显示为「¥xx.xx」 */
export function formatPriceWithSymbol(fen) {
  return `¥${formatPrice(fen)}`
}

/** ISO 时间 → YYYY-MM-DD HH:mm */
export function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 16)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** ISO 时间 → YYYY-MM-DD */
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 相对时间：刚刚 / x 分钟前 / x 小时前 / x 天前 */
export function timeAgo(iso) {
  if (!iso) return ''
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return ''
  const diff = Date.now() - time
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  return `${Math.floor(diff / day)} 天前`
}

/** 数字千分位 */
export function formatNumber(n) {
  if (n === null || n === undefined) return '0'
  return Number(n).toLocaleString('en-US')
}
