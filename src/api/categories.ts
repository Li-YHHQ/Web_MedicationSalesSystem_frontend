import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface Category {
  id: number
  name: string
  sort?: number
  sortOrder?: number
  status?: any
  createTime?: string
  updateTime?: string
}

export const categoryApi = {
  list: () => http.get<Category[]>('/categories') as unknown as Promise<ApiResponse<Category[]>>,

  adminList: () => http.get<Category[]>('/admin/categories') as unknown as Promise<ApiResponse<Category[]>>,

  adminCreate: (data: { name: string; sortOrder?: number }) =>
    http.post<number>('/admin/categories', data) as unknown as Promise<ApiResponse<number>>,

  adminUpdate: (id: number, data: { name: string; sortOrder?: number; status?: number }) =>
    http.put<string>(`/admin/categories/${id}`, data) as unknown as Promise<ApiResponse<string>>,

  adminDelete: (id: number) => http.delete<string>(`/admin/categories/${id}`) as unknown as Promise<ApiResponse<string>>
}
