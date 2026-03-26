import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

// ── 数据类型 ──────────────────────────────────────────────
export interface DailyFinance {
  statDate: string
  salesAmount: number
  costAmount: number
  profitAmount: number
  salesCount: number
}

export interface FinanceSummary {
  totalSalesAmount: number
  totalCostAmount: number
  totalProfitAmount: number
  totalSalesCount: number
  dailyList: DailyFinance[]
}

// ── API 方法 ──────────────────────────────────────────────
export const financeApi = {
  getSummary: (params: Record<string, unknown>): Promise<ApiResponse<FinanceSummary>> =>
    http.get<FinanceSummary>('/finance/summary', params),

  getDaily: (params: Record<string, unknown>): Promise<ApiResponse<DailyFinance[]>> =>
    http.get<DailyFinance[]>('/finance/daily', params),

  sync: (): Promise<ApiResponse<void>> =>
    http.post<void>('/finance/sync', {}),
}
