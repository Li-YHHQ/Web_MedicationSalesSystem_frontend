import axios, { type AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const request = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: any) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      const params = (config.params as any) || {}
      config.params = {
        ...params,
        _t: Date.now()
      }
    }
    
    console.log('Request:', config)
    return config
  },
  (error: any) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: any) => {
    console.log('Response:', response)

    const payload = (response as any).data as ApiResponse<any>
    if (payload && typeof payload === 'object') {
      if (!payload.success) {
        const error = new Error(payload.message || '请求失败')
        ;(error as any).code = 'BUSINESS_ERROR'
        return Promise.reject(error)
      }
      return payload
    }

    return payload as any
  },
  (error: any) => {
    console.error('Response error:', error)
    
    // 处理 HTTP 错误
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转登录
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          error.message = '没有权限访问该资源'
          break
        case 404:
          error.message = '请求的资源不存在'
          break
        case 500:
          error.message = '服务器内部错误'
          break
        default:
          error.message = data?.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      error.message = '网络连接失败，请检查网络设置'
    } else {
      error.message = error.message || '请求配置错误'
    }
    
    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.get(url, { ...config, params })
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.put(url, data, config)
  },
  
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.patch(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.delete(url, config)
  }
}

export default request
