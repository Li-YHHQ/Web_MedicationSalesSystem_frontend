import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface FinanceRecord {
  statDate: string
  salesAmount: number
  costAmount: number
  profitAmount: number
  salesCount: number
}

export interface DashboardData {
  totalDrugCount: number
  totalStock: number
  expiringSoonCount: number
  lowStockCount: number
  todaySalesAmount: number
  todayProfitAmount: number
  monthSalesAmount: number
  monthProfitAmount: number
  recentFinanceList: FinanceRecord[]
}

export const getDashboard = (): Promise<ApiResponse<DashboardData>> =>
  http.get<DashboardData>('/dashboard')
