<template>
  <div class="not-found">
    <div class="not-found-icon">🔍</div>
    <h1 class="not-found-code">404</h1>
    <p class="not-found-text">抱歉，您访问的页面不存在</p>
    <button class="not-found-btn" @click="goHome">返回首页</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome(): void {
  router.replace('/dashboard')
}
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-page);
  text-align: center;
  padding: 24px;
}
.not-found-icon {
  font-size: 72px;
  line-height: 1;
  margin-bottom: 16px;
}
.not-found-code {
  font-size: 72px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 12px;
  line-height: 1;
}
.not-found-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 32px;
}
.not-found-btn {
  padding: 10px 32px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-base);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.not-found-btn:hover {
  background: var(--primary-dark);
}
</style>
