import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

// ── 数据类型 ──────────────────────────────────────────────
export interface Supplier {
  id: number
  name: string
  contact: string
  phone: string
  address: string
  remark: string
  status: number        // 1=正常  0=停用
  createTime: string
}

export interface SupplierListResult {
  total: number
  list: Supplier[]
}

export type SupplierFormData = Omit<Supplier, 'id' | 'createTime'>

// ── API 方法 ──────────────────────────────────────────────
export const supplierApi = {
  list: (params: Record<string, unknown>): Promise<ApiResponse<SupplierListResult>> =>
    http.get<SupplierListResult>('/suppliers', params),

  all: (): Promise<ApiResponse<Supplier[]>> =>
    http.get<Supplier[]>('/suppliers/all'),

  getById: (id: number): Promise<ApiResponse<Supplier>> =>
    http.get<Supplier>(`/suppliers/${id}`),

  create: (data: SupplierFormData): Promise<ApiResponse<number>> =>
    http.post<number>('/suppliers', data),

  update: (id: number, data: SupplierFormData): Promise<ApiResponse<void>> =>
    http.put<void>(`/suppliers/${id}`, data),

  remove: (id: number): Promise<ApiResponse<void>> =>
    http.delete<void>(`/suppliers/${id}`),
}
