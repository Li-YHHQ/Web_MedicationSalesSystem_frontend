import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { userApi, type UserProfile } from '@/api'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref('')

  const saveAuth = (u: UserProfile | null, t: string | null) => {
    ;(user as any).value = u
    ;(token as any).value = t
    if (u && t) {
      localStorage.setItem('user', JSON.stringify(u))
      localStorage.setItem('token', t)
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }

  // 注册
  const register = async (payload: { username: string; password: string }) => {
    loading.value = true
    error.value = ''

    try {
      await userApi.register(payload)
      return true
    } catch (err) {
      error.value = (err as any)?.message || '注册失败'
      console.error('Register error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // 登录
  const login = async (credentials: { username: string; password: string }) => {
    loading.value = true
    error.value = ''

    try {
      const res = await userApi.login(credentials)
      const t = res.data?.token
      if (!t) {
        throw new Error('登录失败：未返回token')
      }
      localStorage.setItem('token', t)

      const meRes = await userApi.me()
      saveAuth(meRes.data, t)
      return true
    } catch (err) {
      error.value = (err as any)?.message || '登录失败'
      console.error('Login error:', err)
      saveAuth(null, null)
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    saveAuth(null, null)
  }

  // 检查登录状态
  const checkAuth = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      try {
        ;(user as any).value = JSON.parse(savedUser)
        ;(token as any).value = savedToken
        return true
      } catch (err) {
        console.error('Parse saved user error:', err)
        logout()
        return false
      }
    }
    
    return false
  }

  const refreshMe = async () => {
    const t = localStorage.getItem('token')
    if (!t) return false

    loading.value = true
    error.value = ''
    try {
      const meRes = await userApi.me()
      saveAuth(meRes.data, t)
      return true
    } catch (err) {
      saveAuth(null, null)
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  const updateUser = (userData: Partial<UserProfile>) => {
    const u = (user as any).value as UserProfile | null
    if (u) {
      ;(user as any).value = { ...u, ...userData }
      localStorage.setItem('user', JSON.stringify((user as any).value))
    }
  }

  // 清空错误
  const clearError = () => {
    error.value = ''
  }

  // 重置状态
  const reset = () => {
    user.value = null
    token.value = null
    loading.value = false
    error.value = ''
  }

  // 初始化时检查登录状态
  checkAuth()

  return {
    // 状态
    user,
    token,
    loading,
    error,
    
    // 计算属性
    isAuthenticated: computed(() => !!(token as any).value),
    isAdmin: computed(() => ((user as any).value as UserProfile | null)?.role === 'ADMIN'),
    
    // 方法
    register,
    login,
    logout,
    checkAuth,
    refreshMe,
    updateUser,
    clearError,
    reset
  }
})
