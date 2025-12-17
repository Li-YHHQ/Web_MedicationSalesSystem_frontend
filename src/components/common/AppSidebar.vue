<template>
  <aside class="app-sidebar">
    <div class="sidebar-content">
      <div class="menu-group">
        <h3>用户端</h3>
        <ul class="menu-list">
          <li>
            <router-link to="/" class="menu-item"><span>首页</span></router-link>
          </li>
          <li>
            <router-link to="/products" class="menu-item"><span>药品列表</span></router-link>
          </li>
          <li>
            <router-link to="/cart" class="menu-item"><span>购物车</span></router-link>
          </li>
          <li>
            <router-link to="/orders" class="menu-item"><span>我的订单</span></router-link>
          </li>
          <li>
            <router-link to="/me" class="menu-item"><span>个人中心</span></router-link>
          </li>
        </ul>
      </div>

      <div v-if="isAdmin" class="menu-group">
        <h3>后台管理</h3>
        <ul class="menu-list">
          <li><router-link to="/admin/categories" class="menu-item"><span>分类管理</span></router-link></li>
          <li><router-link to="/admin/products" class="menu-item"><span>药品管理</span></router-link></li>
          <li><router-link to="/admin/banners" class="menu-item"><span>轮播管理</span></router-link></li>
          <li><router-link to="/admin/orders" class="menu-item"><span>订单管理</span></router-link></li>
          <li><router-link to="/admin/users" class="menu-item"><span>用户管理</span></router-link></li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const role = ref<string | null>(null)
try {
  const u = localStorage.getItem('user')
  role.value = u ? JSON.parse(u)?.role : null
} catch {
  role.value = null
}

const isAdmin = computed(() => role.value === 'ADMIN')
</script>

<style scoped>
.app-sidebar {
  width: 240px;
  background: var(--bg-color);
  border-right: 1px solid var(--border-lighter);
  height: calc(100vh - 64px);
  position: fixed;
  left: 0;
  top: 64px;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
}

.sidebar-content {
  padding: var(--spacing-lg) var(--spacing-md);
}

.menu-group {
  margin-bottom: var(--spacing-xl);
}

.menu-group h3 {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.menu-list {
  list-style: none;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px var(--spacing-md);
  margin: 4px 0;
  color: var(--text-regular);
  text-decoration: none;
  transition: var(--transition-fast);
  border-radius: var(--border-radius-base);
  font-weight: 500;
  position: relative;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--primary-gradient);
  border-radius: 0 2px 2px 0;
  transition: height 0.3s ease;
}

.menu-item:hover {
  background: var(--bg-light);
  color: var(--primary-color);
  transform: translateX(2px);
}

.menu-item.router-link-exact-active {
  background: linear-gradient(90deg, rgba(19, 194, 194, 0.1) 0%, rgba(19, 194, 194, 0.05) 100%);
  color: var(--primary-color);
  font-weight: 600;
}

.menu-item.router-link-exact-active::before {
  height: 20px;
}
</style>
