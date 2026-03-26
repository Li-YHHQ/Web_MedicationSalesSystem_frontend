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

export interface StockOutRecord {
  id: number
  drugId: number
  drugName: string
  drugSpec: string
  batchId: number
  batchNo: string
  expireDate: string
  outType: number       // 1=销售 2=损耗 3=退货
  outTypeName: string
  quantity: number
  retailPrice: number
  costPrice: number
  totalAmount: number
  operatorUsername: string
  createTime: string
}

export interface StockOutListResult {
  total: number
  list: StockOutRecord[]
}

export interface StockOutForm {
  drugId: number
  batchId: number
  outType: number
  quantity: number
  retailPrice: number
  remark: string
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
  produceDate?: string
  expireDate: string
  stockInDate?: string
  quantity: number
  costPrice?: number
  status?: number
  daysLeft?: number
}

export interface LowStockItem {
  id: number
  drugId: number
  drugName: string
  batchNo: string
  expireDate?: string
  quantity: number
  costPrice?: number
  status?: number
  stockMin?: number
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

  // 出库
  createOut: (data: StockOutForm): Promise<ApiResponse<void>> =>
    http.post<void>('/stock/out', data),

  // 分页查询出库记录
  listOut: (params: Record<string, unknown>): Promise<ApiResponse<StockOutListResult>> =>
    http.get<StockOutListResult>('/stock/out', params),

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
