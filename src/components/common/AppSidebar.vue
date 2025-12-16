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
  width: 250px;
  background: var(--bg-color);
  border-right: 1px solid var(--border-base);
  height: calc(100vh - 60px);
  position: fixed;
  left: 0;
  top: 60px;
  overflow-y: auto;
}

.sidebar-content {
  padding: 20px 0;
}

.menu-group {
  margin-bottom: 20px;
}

.menu-group h3 {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 20px;
  margin-bottom: 10px;
}

.menu-list {
  list-style: none;
}

.menu-item {
  display: block;
  padding: 12px 20px;
  color: var(--text-regular);
  text-decoration: none;
  transition: all 0.3s;
}

.menu-item:hover,
.menu-item.router-link-exact-active {
  background: var(--primary-color);
  color: white;
}
</style>
