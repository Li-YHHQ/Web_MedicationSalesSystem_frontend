<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 标题 -->
      <div class="login-header">
        <div class="login-logo">💊</div>
        <h1 class="login-title">药店管理系统</h1>
        <p class="login-subtitle">创建新账号</p>
      </div>

      <!-- 表单 -->
      <div class="login-form">
        <div class="field">
          <label class="field-label">用户名</label>
          <input
            v-model="username"
            class="field-input"
            placeholder="请输入用户名"
            autocomplete="username"
            @keyup.enter="handleRegister"
          />
        </div>

        <div class="field">
          <label class="field-label">密码</label>
          <input
            v-model="password"
            class="field-input"
            type="password"
            placeholder="请输入密码"
            autocomplete="new-password"
            @keyup.enter="handleRegister"
          />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button class="login-btn" :disabled="loading" @click="handleRegister">
          <span v-if="loading" class="btn-spinner"></span>
          <span>{{ loading ? '注册中...' : '立即注册' }}</span>
        </button>

        <p class="register-hint">
          已有账号？
          <router-link to="/login" class="register-link">返回登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api/users'

const router  = useRouter()

const username = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

async function handleRegister(): Promise<void> {
  if (!username.value.trim()) {
    error.value = '请输入用户名'
    return
  }
  if (!password.value) {
    error.value = '请输入密码'
    return
  }
  loading.value = true
  error.value   = ''
  try {
    await userApi.authRegister({ username: username.value.trim(), password: password.value })
    router.replace({ path: '/login', query: { msg: '注册成功，请登录' } })
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f7f7 0%, #f0fafa 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(19, 194, 194, 0.12);
  padding: 40px 36px 36px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 12px;
}

.login-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.field-input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  color: var(--text-primary);
  background: #fff;
  outline: none;
  font-family: inherit;
  transition: var(--transition-fast);
  box-sizing: border-box;
}

.field-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(19, 194, 194, 0.12);
}

.field-input::placeholder {
  color: var(--text-placeholder);
}

.error-msg {
  margin: 0;
  font-size: 13px;
  color: var(--danger-color);
  padding: 8px 12px;
  background: rgba(255, 77, 79, 0.06);
  border-radius: var(--border-radius-base);
}

.login-btn {
  height: 44px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-base);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.login-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.register-hint {
  text-align: center;
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.register-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
