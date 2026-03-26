import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

// ── 数据类型 ──────────────────────────────────────────────
export interface Drug {
  id: number
  drugCode: string
  drugName: string
  commonName: string
  category: string
  unit: string
  spec: string
  manufacturer: string
  approvalNo: string
  barcode: string
  costPrice: number
  retailPrice: number
  stockMin: number
  status: number          // 1=正常  0=停用
  createTime: string
}

export interface DrugListResult {
  total: number
  list: Drug[]
}

export type DrugFormData = Omit<Drug, 'id' | 'createTime'>

// ── API 方法 ──────────────────────────────────────────────
export const drugApi = {
  list: (params: Record<string, unknown>): Promise<ApiResponse<DrugListResult>> =>
    http.get<DrugListResult>('/drugs', params),

  getById: (id: number): Promise<ApiResponse<Drug>> =>
    http.get<Drug>(`/drugs/${id}`),

  create: (data: DrugFormData): Promise<ApiResponse<number>> =>
    http.post<number>('/drugs', data),

  update: (id: number, data: DrugFormData): Promise<ApiResponse<void>> =>
    http.put<void>(`/drugs/${id}`, data),

  remove: (id: number): Promise<ApiResponse<void>> =>
    http.delete<void>(`/drugs/${id}`),

  importExcel: (file: File): Promise<ApiResponse<void>> => {
    const fd = new FormData()
    fd.append('file', file)
    return http.post<void>('/drugs/import', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// 导出 Excel（绕过响应拦截器，直接处理 blob）
export async function exportDrugExcel(): Promise<void> {
  const token = localStorage.getItem('token') ?? ''
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const response = await fetch(`${baseUrl}/api/drugs/export`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) throw new Error('导出失败，请重试')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `药品列表_${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
