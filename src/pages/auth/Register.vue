<template>
  <div class="auth-page">
    <h1>注册</h1>

    <div class="form">
      <BaseInput v-model="username" label="用户名" placeholder="请输入用户名" />
      <BaseInput v-model="password" label="密码" type="password" placeholder="请输入密码" />

      <BaseButton :loading="loading" block @click="handleRegister">注册</BaseButton>
      <p v-if="error" class="error">{{ error }}</p>

      <p class="hint">
        已有账号？
        <router-link to="/login">去登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')

const loading = userStore.loading
const error = userStore.error

const handleRegister = async () => {
  const ok = await userStore.register({ username: username.value, password: password.value })
  if (ok) {
    router.replace('/login')
  }
}
</script>

<style scoped>
.auth-page { max-width: 420px; margin: 40px auto; padding: 16px; }
.form { margin-top: 16px; }
.error { color: var(--danger-color); margin-top: 8px; }
.hint { margin-top: 12px; color: var(--text-secondary); }
</style>
