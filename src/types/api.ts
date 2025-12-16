// API 响应通用类型
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 错误响应类型
export interface ApiError {
  code: string
  message: string
  details?: any
}

// HTTP 方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// 请求配置类型
export interface RequestConfig {
  method?: HttpMethod
  url?: string
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
}

// API 状态类型
export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}
