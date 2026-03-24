import { ref } from 'vue'

// 请求计数器（支持同时多个请求）
const loadingCount = ref(0)

// 供组件读取的是否显示 loading 状态
export const isLoading = ref(false)

export function showLoading(): void {
  loadingCount.value++
  isLoading.value = true
}

export function hideLoading(): void {
  if (loadingCount.value > 0) {
    loadingCount.value--
  }
  if (loadingCount.value === 0) {
    isLoading.value = false
  }
}
