// 日期格式化
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 相对时间格式化
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date()
  const target = date instanceof Date ? date : new Date(date)
  const diff = now.getTime() - target.getTime()

  if (diff < 1000) {
    return '刚刚'
  }

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return `${seconds}秒前`
  }
}

// 文件大小格式化
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 数字格式化
export const formatNumber = (num: number, decimals = 2): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// 百分比格式化
export const formatPercent = (num: number, decimals = 1): string => {
  return (num * 100).toFixed(decimals) + '%'
}

// 货币格式化
export const formatCurrency = (amount: number, currency = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency
  }).format(amount)
}

// 手机号格式化
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length !== 11) return phone

  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
}

// 身份证号格式化
export const formatIdCard = (idCard: string): string => {
  if (idCard.length !== 18) return idCard
  return idCard.replace(/(\d{6})(\d{8})(\d{4})/, '$1********$3')
}

// 课程编码格式化
export const formatCourseCode = (code: string): string => {
  return code.toUpperCase()
}

// 学分格式化
export const formatCredit = (credit: number): string => {
  if (Number.isInteger ? Number.isInteger(credit) : credit % 1 === 0) {
    return credit.toString()
  }
  return credit.toFixed(1)
}

// 教师姓名格式化（处理多个教师的情况）
export const formatTeacher = (teachers: string | string[]): string => {
  if (Array.isArray(teachers)) {
    return teachers.join('、')
  }
  return teachers
}

// 地点格式化（统一地点名称格式）
export const formatLocation = (location: string): string => {
  // 统一地点名称格式，例如：教学楼A101 -> 教学楼 A101
  return location.replace(/([教学实验楼])([A-Z])(\d+)/, '$1 $2$3')
}

// 搜索关键词高亮
export const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword.trim()) return text
  
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 截断文本
export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

// 首字母大写
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// 驼峰转下划线
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

// 下划线转驼峰
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// 生成随机ID
export const generateId = (prefix = '', length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return prefix + result
}

// 颜色格式化（将十六进制颜色转换为RGB）
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// RGB转十六进制
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
