import { ref } from 'vue'

export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const state = ref<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = async (apiCall: () => Promise<T>): Promise<T | null> => {
    state.value.loading = true
    state.value.error = null
    
    try {
      const result = await apiCall()
      state.value.data = result
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '请求失败'
      state.value.error = errorMessage
      console.error('API Error:', err)
      return null
    } finally {
      state.value.loading = false
    }
  }

  const reset = () => {
    state.value = {
      data: null,
      loading: false,
      error: null
    }
  }

  return {
    state,
    execute,
    reset
  }
}

// 批量API调用的hook
export function useBatchApi<T>() {
  const results = ref<T[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const executeAll = async (apiCalls: (() => Promise<T>)[]): Promise<T[]> => {
    loading.value = true
    error.value = null
    results.value = []

    try {
      const promises = apiCalls.map(call => call())
      const resolvedResults = await Promise.all(promises)
      results.value = resolvedResults
      return resolvedResults
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '批量请求失败'
      error.value = errorMessage
      console.error('Batch API Error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    results.value = []
    loading.value = false
    error.value = null
  }

  return {
    results,
    loading,
    error,
    executeAll,
    reset
  }
}

// 分页API hook
export function usePaginatedApi<T>() {
  const data = ref<T[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  const execute = async (
    apiCall: (page: number, size: number) => Promise<{ data: T[]; total: number }>
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result = await apiCall(currentPage.value, pageSize.value)
      data.value = result.data
      total.value = result.total
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '请求失败'
      error.value = errorMessage
      console.error('Paginated API Error:', err)
    } finally {
      loading.value = false
    }
  }

  const nextPage = () => {
    if (currentPage.value * pageSize.value < total.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= Math.ceil(total.value / pageSize.value)) {
      currentPage.value = page
    }
  }

  const reset = () => {
    data.value = []
    loading.value = false
    error.value = null
    currentPage.value = 1
    total.value = 0
  }

  return {
    data,
    loading,
    error,
    currentPage,
    pageSize,
    total,
    execute,
    nextPage,
    prevPage,
    goToPage,
    reset
  }
}
