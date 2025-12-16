import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface CartItem {
  itemId: number
  productId: number
  productName?: string
  productCoverUrl?: string
  unitPrice?: number
  quantity: number
  amount?: number
  createTime?: string
  updateTime?: string
}

export interface CartData {
  items: CartItem[]
  totalAmount: number
}

export const cartApi = {
  list: () => http.get<CartData>('/cart') as unknown as Promise<ApiResponse<CartData>>,

  add: (data: { productId: number; quantity: number }) =>
    http.post<string>('/cart/items', data) as unknown as Promise<ApiResponse<string>>,

  updateQuantity: (itemId: number, data: { quantity: number }) =>
    http.patch<string>(`/cart/items/${itemId}`, data) as unknown as Promise<ApiResponse<string>>,

  remove: (itemId: number) =>
    http.delete<string>(`/cart/items/${itemId}`) as unknown as Promise<ApiResponse<string>>,

  clear: () => http.delete<string>('/cart') as unknown as Promise<ApiResponse<string>>
}
