import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface LoginResponse {
  token: string
  role: string
}

export interface UserProfile {
  id: number
  username: string
  role: string
  phone?: string
  email?: string
  realName?: string
  avatarUrl?: string
  createTime?: string
  updateTime?: string
}

export interface AdminUser {
  id: number
  username: string
  passwordHash?: string
  role?: string
  phone?: string
  email?: string
  avatarUrl?: string
  status?: number
  createTime?: string
  updateTime?: string
}

export const userApi = {
  register: (data: { username: string; password: string }) =>
    http.post<number>('/users/register', data) as unknown as Promise<ApiResponse<number>>,

  login: (data: { username: string; password: string }) =>
    http.post<LoginResponse>('/users/login', data) as unknown as Promise<ApiResponse<LoginResponse>>,

  me: () => http.get<UserProfile>('/users/me') as unknown as Promise<ApiResponse<UserProfile>>,

  updateMe: (data: { phone: string; email?: string; realName?: string; avatarUrl?: string }) =>
    http.put<string>('/users/me', data) as unknown as Promise<ApiResponse<string>>,

  adminList: (params?: { keyword?: string }) =>
    http.get<AdminUser[]>('/admin/users', params) as unknown as Promise<ApiResponse<AdminUser[]>>
}
