import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface Banner {
  id: number
  title?: string
  imageUrl: string
  linkUrl?: string
  sortOrder?: number
  status?: number
  createTime?: string
  updateTime?: string
}

export const bannerApi = {
  list: () => http.get<Banner[]>('/banners') as unknown as Promise<ApiResponse<Banner[]>>,

  adminList: () => http.get<Banner[]>('/admin/banners') as unknown as Promise<ApiResponse<Banner[]>>,

  adminCreate: (data: { title?: string; imageUrl: string; linkUrl?: string; sortOrder?: number }) =>
    http.post<number>('/admin/banners', data) as unknown as Promise<ApiResponse<number>>,

  adminUpdate: (id: number, data: { title?: string; imageUrl: string; linkUrl?: string; sortOrder?: number; status?: number }) =>
    http.put<string>(`/admin/banners/${id}`, data) as unknown as Promise<ApiResponse<string>>,

  adminUpdateStatus: (id: number, status: number) =>
    http.patch<string>(`/admin/banners/${id}/status`, { status }) as unknown as Promise<ApiResponse<string>>,

  adminDelete: (id: number) => http.delete<string>(`/admin/banners/${id}`) as unknown as Promise<ApiResponse<string>>
}
