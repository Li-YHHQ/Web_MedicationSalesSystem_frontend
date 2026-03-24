import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

// 全局 toast 列表，供 Toast.vue 读取
export const toastList = ref<ToastItem[]>([])

let _id = 0

function addToast(type: ToastType, message: string): void {
  const id = ++_id
  toastList.value.push({ id, type, message })
  // 3 秒后自动移除
  setTimeout(() => {
    removeToast(id)
  }, 3000)
}

export function removeToast(id: number): void {
  const idx = toastList.value.findIndex((t) => t.id === id)
  if (idx !== -1) {
    toastList.value.splice(idx, 1)
  }
}

export function showSuccess(message: string): void {
  addToast('success', message)
}

export function showError(message: string): void {
  addToast('error', message)
}

export function showWarning(message: string): void {
  addToast('warning', message)
}
