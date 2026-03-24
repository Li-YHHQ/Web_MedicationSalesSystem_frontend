<template>
  <div id="app">
    <!-- 断网提示条 -->
    <transition name="banner-fade">
      <div v-if="!isOnline" class="network-banner network-banner--offline">
        🔴 网络已断开，请检查网络连接
      </div>
    </transition>

    <router-view />

    <!-- 全局 Toast -->
    <Toast />

    <!-- 全局 Loading -->
    <LoadingSpinner />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Toast from '@/components/common/Toast.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { showSuccess } from '@/utils/toast'

const isOnline = ref(navigator.onLine)

function handleOnline(): void {
  isOnline.value = true
  showSuccess('网络已恢复')
}

function handleOffline(): void {
  isOnline.value = false
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  document.body.style.margin = '0'
  document.body.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
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

::selection {
  background: var(--primary-color);
  color: white;
}

:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

[disabled] {
  cursor: not-allowed;
  opacity: 0.6;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: var(--primary-dark);
}

button {
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
}

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
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.flex-1 { flex: 1; }

.w-full { width: 100%; }
.h-full { height: 100%; }

.text-primary { color: var(--text-primary); }
.text-regular { color: var(--text-regular); }
.text-secondary { color: var(--text-secondary); }

.rounded { border-radius: var(--border-radius-base); }
.shadow { box-shadow: var(--box-shadow-base); }
</style>

<style scoped>
/* 断网提示条 */
.network-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  text-align: center;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
}

.network-banner--offline {
  background: var(--danger-color);
  color: #fff;
}

.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
