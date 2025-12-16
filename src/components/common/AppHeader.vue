<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <h1>{{ appTitle }}</h1>
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/products" class="nav-item">药品</router-link>
        <router-link to="/cart" class="nav-item">购物车</router-link>
        <router-link to="/orders" class="nav-item">订单</router-link>
        <router-link v-if="isAdmin" to="/admin/products" class="nav-item">后台</router-link>
        <router-link v-if="isAuthed" to="/me" class="nav-item">我的</router-link>
        <a v-if="isAuthed" class="nav-item" href="#" @click.prevent="logout">退出</a>
        <router-link v-else to="/login" class="nav-item">登录</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const appTitle = import.meta.env.VITE_APP_TITLE || '药品销售系统'

const token = ref(localStorage.getItem('token'))
const role = ref<string | null>(null)

try {
  const u = localStorage.getItem('user')
  role.value = u ? JSON.parse(u)?.role : null
} catch {
  role.value = null
}

const isAuthed = computed(() => !!token.value)
const isAdmin = computed(() => role.value === 'ADMIN')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  token.value = null
  role.value = null
  window.location.href = '/'
}
</script>

<style scoped>
.app-header {
  background: var(--bg-color);
  box-shadow: var(--box-shadow-base);
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo h1 {
  color: var(--primary-color);
  font-size: 20px;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: var(--text-regular);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: var(--primary-color);
}
</style>
