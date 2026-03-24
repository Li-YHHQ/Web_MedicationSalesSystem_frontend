<template>
  <teleport to="body">
    <transition name="loading-fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-box">
          <div class="spinner"></div>
          <p class="loading-text">加载中...</p>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { isLoading } from '@/utils/loading'
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
}

.loading-box {
  background: #fff;
  border-radius: var(--border-radius-large);
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
