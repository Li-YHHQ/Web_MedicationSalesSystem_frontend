import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface Product {
  id: number
  name: string
  categoryId: number
  categoryName?: string
  price: any
  stock: number
  status?: any
  imageUrl?: string
  coverUrl?: string
  description?: string
  manufacturer?: string
  specification?: string
  approvalNumber?: string
  subName?: string
  prescription?: boolean
  isPrescription?: any
  createTime?: string
  updateTime?: string
}

export interface ProductQuery {
  keyword?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  prescription?: boolean
  page?: number
  pageSize?: number
}

export const productApi = {
  list: (params?: ProductQuery) => http.get<Product[]>('/products', params) as unknown as Promise<ApiResponse<Product[]>>,
  getById: (id: number) => http.get<Product>(`/products/${id}`) as unknown as Promise<ApiResponse<Product>>,
  reviews: (id: number) => http.get<any[]>(`/products/${id}/reviews`) as unknown as Promise<ApiResponse<any[]>>,

  adminList: (params?: { categoryId?: number; keyword?: string }) =>
    http.get<Product[]>('/admin/products', params) as unknown as Promise<ApiResponse<Product[]>>,

  adminCreate: (data: {
    categoryId: number
    name: string
    subName?: string
    manufacturer?: string
    specification?: string
    approvalNumber?: string
    isPrescription: number
    price: number
    stock: number
    coverUrl?: string
    description?: string
  }) => http.post<number>('/admin/products', data) as unknown as Promise<ApiResponse<number>>,

  adminUpdate: (
    id: number,
    data: {
      categoryId: number
      name: string
      subName?: string
      manufacturer?: string
      specification?: string
      approvalNumber?: string
      isPrescription: number
      price: number
      stock: number
      coverUrl?: string
      description?: string
      status: number
    }
  ) => http.put<string>(`/admin/products/${id}` , data) as unknown as Promise<ApiResponse<string>>,

  adminUpdateStatus: (id: number, data: { status: number }) =>
    http.patch<string>(`/admin/products/${id}/status`, data) as unknown as Promise<ApiResponse<string>>,

  adminDelete: (id: number) => http.delete<string>(`/admin/products/${id}`) as unknown as Promise<ApiResponse<string>>
}
