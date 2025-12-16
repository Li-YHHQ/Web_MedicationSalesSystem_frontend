import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

export type OrderStatus = 'PENDING_PAY' | 'PENDING_SHIP' | 'PENDING_RECEIVE' | 'COMPLETED' | 'CANCELED'

export interface OrderItem {
  id?: number
  orderId?: number
  productId: number
  productName?: string
  quantity?: number
}

export interface Order {
  id: number
  orderNo?: string
  userId?: number
  totalAmount?: any
  status: OrderStatus
  receiverName?: string
  receiverPhone?: string
  receiverAddress?: string
  payTime?: string
  shipTime?: string
  receiveTime?: string
  createTime?: string
  updateTime?: string
}

export interface OrderDetailData {
  order: Order
  items: OrderItem[]
}

export interface AdminOrder {
  id: number
  orderNo?: string
  userId?: number
  status?: string
  totalAmount?: any
  receiverName?: string
  receiverPhone?: string
  receiverAddress?: string
  payTime?: string
  shipTime?: string
  receiveTime?: string
  createTime?: string
  updateTime?: string
}

export const orderApi = {
  createFromCart: (data: { receiverName: string; receiverPhone: string; receiverAddress: string }) =>
    http.post<number>('/orders', data) as unknown as Promise<ApiResponse<number>>,

  listMine: (params?: { status?: string }) =>
    http.get<Order[]>('/orders', params) as unknown as Promise<ApiResponse<Order[]>>,

  detail: (id: number) => http.get<OrderDetailData>(`/orders/${id}`) as unknown as Promise<ApiResponse<OrderDetailData>>,

  pay: (id: number) => http.post<string>(`/orders/${id}/pay`, {}) as unknown as Promise<ApiResponse<string>>,

  confirmReceive: (id: number) => http.post<string>(`/orders/${id}/receive`, {}) as unknown as Promise<ApiResponse<string>>,

  cancel: (id: number) => http.post<string>(`/orders/${id}/cancel`, {}) as unknown as Promise<ApiResponse<string>>,

  adminList: (params?: { status?: string; keyword?: string }) =>
    http.get<AdminOrder[]>('/admin/orders', params) as unknown as Promise<ApiResponse<AdminOrder[]>>,

  adminShip: (id: number) => http.post<string>(`/admin/orders/${id}/ship`, {}) as unknown as Promise<ApiResponse<string>>
}
