import axios, { type AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types'
import { showLoading, hideLoading } from '@/utils/loading'
import { showError } from '@/utils/toast'

// 创建 axios 实例
const request = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 显示全局 Loading（计数器模式）
    showLoading()

    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加时间戳防止 GET 缓存
    if (config.method === 'get') {
      config.params = { ...(config.params as Record<string, unknown>), _t: Date.now() }
    }

    // FormData 请求删除默认的 Content-Type，让浏览器自动设置 multipart/form-data + boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error: unknown) => {
    hideLoading()
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    hideLoading()

    const payload = response.data as ApiResponse<unknown>

    if (payload && typeof payload === 'object') {
      if (!payload.success) {
        const msg = payload.message || '操作失败'
        showError(msg)
        return Promise.reject(new Error(msg))
      }
      return payload as never
    }

    return payload as never
  },
  (error: unknown) => {
    hideLoading()

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const { status, data } = error.response as { status: number; data: { message?: string } }

        if (status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          showError('登录已过期，请重新登录')
          window.location.href = '/login'
          return Promise.reject(error)
        }

        if (status === 500) {
          showError('服务器错误，请稍后重试')
          return Promise.reject(error)
        }

        const msg = data?.message || '操作失败'
        showError(msg)
        return Promise.reject(new Error(msg))
      }

      // 网络错误（无 response）
      if (error.message?.toLowerCase().includes('network')) {
        showError('网络连接失败，请检查网络')
      } else {
        showError(error.message || '操作失败')
      }
    }

    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.get(url, { ...config, params }) as unknown as Promise<ApiResponse<T>>
  },

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.post(url, data, config) as unknown as Promise<ApiResponse<T>>
  },

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.put(url, data, config) as unknown as Promise<ApiResponse<T>>
  },

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.patch(url, data, config) as unknown as Promise<ApiResponse<T>>
  },

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.delete(url, config) as unknown as Promise<ApiResponse<T>>
  }
}

export default request
