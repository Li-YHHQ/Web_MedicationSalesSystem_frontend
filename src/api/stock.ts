import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

// ── 数据类型 ──────────────────────────────────────────────
export interface StockInRecord {
  id: number
  drugId: number
  drugName: string
  batchId: number
  batchNo: string
  expireDate: string
  quantity: number
  costPrice: number
  totalAmount: number
  supplierName: string
  operatorUsername: string
  createTime: string
}

export interface StockInListResult {
  total: number
  list: StockInRecord[]
}

export interface StockBatch {
  id: number
  drugId: number
  batchNo: string
  produceDate: string
  expireDate: string
  stockInDate: string
  quantity: number
  costPrice: number
  status: number
}

export interface ExpireItem {
  id: number
  drugId: number
  drugName: string
  batchNo: string
  expireDate: string
  quantity: number
  daysLeft: number
}

export interface LowStockItem {
  id: number
  drugId: number
  drugName: string
  batchNo: string
  quantity: number
  stockMin: number
}

export interface StockInForm {
  drugId: number
  batchNo: string
  produceDate: string
  expireDate: string
  stockInDate: string
  quantity: number
  costPrice: number
  supplierId: number | null
  remark: string
}

export interface DrugOption {
  id: number
  drugName: string
  spec: string
  costPrice: number
}

export interface SupplierOption {
  id: number
  name: string
}

// ── API 方法 ──────────────────────────────────────────────
export const stockApi = {
  // 入库
  create: (data: StockInForm): Promise<ApiResponse<void>> =>
    http.post<void>('/stock/in', data),

  // 分页查询入库记录
  list: (params: Record<string, unknown>): Promise<ApiResponse<StockInListResult>> =>
    http.get<StockInListResult>('/stock/in', params),

  // 查询药品批次
  getBatches: (drugId: number): Promise<ApiResponse<StockBatch[]>> =>
    http.get<StockBatch[]>(`/stock/batches/${drugId}`),

  // 即将过期
  getExpiring: (days: number): Promise<ApiResponse<ExpireItem[]>> =>
    http.get<ExpireItem[]>('/stock/expire', { days }),

  // 库存不足
  getLow: (): Promise<ApiResponse<LowStockItem[]>> =>
    http.get<LowStockItem[]>('/stock/low'),

  // 药品下拉（全量，仅正常状态）
  getDrugOptions: (): Promise<ApiResponse<{ total: number; list: DrugOption[] }>> =>
    http.get<{ total: number; list: DrugOption[] }>('/drugs', { page: 1, size: 9999, status: 1 }),

  // 供应商下拉（全量）
  getSupplierOptions: (): Promise<ApiResponse<SupplierOption[]>> =>
    http.get<SupplierOption[]>('/suppliers/all'),
}
