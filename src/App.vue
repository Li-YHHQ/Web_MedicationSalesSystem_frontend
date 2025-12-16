<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// 应用初始化
onMounted(() => {
  // 检查用户登录状态
  const token = localStorage.getItem('token')
  if (!token) {
    // 如果没有token，可以根据需要跳转到登录页
    // router.push('/login')
  }

  // 设置全局样式
  document.body.style.margin = '0'
  document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
})
</script>

<style>
/* 全局样式 */
@import '@/assets/styles/variables.css';
@import '@/assets/styles/global.css';

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--border-extra-light);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--border-base);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-placeholder);
}

/* 选择文本样式 */
::selection {
  background: var(--primary-color);
  color: white;
}

/* 焦点样式 */
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* 禁用状态 */
[disabled] {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 链接样式 */
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: var(--primary-dark);
}

/* 按钮基础样式 */
button {
  font-family: inherit;
}

/* 输入框基础样式 */
input, textarea, select {
  font-family: inherit;
}

/* 图片样式 */
img {
  max-width: 100%;
  height: auto;
}

/* 表格样式 */
table {
  border-collapse: collapse;
  width: 100%;
}

/* 代码样式 */
code {
  background: var(--border-extra-light);
  padding: 2px 4px;
  border-radius: 2px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

/* 分割线样式 */
hr {
  border: none;
  height: 1px;
  background: var(--border-base);
  margin: 16px 0;
}

/* 工具类 */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.flex { display: flex; }
.flex-column { flex-direction: column; }
.flex-row { flex-direction: row; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.flex-1 { flex: 1; }

.hidden { display: none; }
.visible { visibility: visible; }
.invisible { visibility: hidden; }

.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }

.w-full { width: 100%; }
.h-full { height: 100%; }

.m-0 { margin: 0; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }

.p-0 { padding: 0; }
.p-1 { padding: 4px; }
.p-2 { padding: 8px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }

.text-primary { color: var(--text-primary); }
.text-regular { color: var(--text-regular); }
.text-secondary { color: var(--text-secondary); }
.text-placeholder { color: var(--text-placeholder); }

.bg-primary { background-color: var(--primary-color); }
.bg-success { background-color: var(--success-color); }
.bg-warning { background-color: var(--warning-color); }
.bg-danger { background-color: var(--danger-color); }
.bg-info { background-color: var(--info-color); }

.border { border: 1px solid var(--border-base); }
.border-light { border: 1px solid var(--border-light); }
.border-lighter { border: 1px solid var(--border-lighter); }

.rounded { border-radius: var(--border-radius-base); }
.rounded-sm { border-radius: var(--border-radius-small); }
.rounded-lg { border-radius: var(--border-radius-large); }
.rounded-full { border-radius: 50%; }

.shadow { box-shadow: var(--box-shadow-base); }
.shadow-lg { box-shadow: var(--box-shadow-light); }

.transition { transition: all 0.3s ease; }
.transition-fast { transition: all 0.15s ease; }
.transition-slow { transition: all 0.5s ease; }

/* 响应式工具类 */
@media (max-width: 768px) {
  .md-hidden { display: none; }
  .md-flex { display: flex; }
}

@media (max-width: 480px) {
  .sm-hidden { display: none; }
  .sm-flex { display: flex; }
}
</style>
