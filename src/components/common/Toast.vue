<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast" tag="div">
        <div
          v-for="item in toastList"
          :key="item.id"
          class="toast-item"
          :class="`toast-item--${item.type}`"
          @click="removeToast(item.id)"
        >
          <span class="toast-icon">
            <template v-if="item.type === 'success'">✓</template>
            <template v-else-if="item.type === 'error'">✕</template>
            <template v-else>!</template>
          </span>
          <span class="toast-message">{{ item.message }}</span>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { toastList, removeToast } from '@/utils/toast'
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--border-radius-base);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
  min-width: 240px;
  max-width: 400px;
  pointer-events: all;
  cursor: pointer;
  background: #fff;
}

.toast-item--success {
  border-left: 4px solid var(--success-color);
  color: var(--success-color);
}

.toast-item--error {
  border-left: 4px solid var(--danger-color);
  color: var(--danger-color);
}

.toast-item--warning {
  border-left: 4px solid var(--warning-color);
  color: var(--warning-color);
}

.toast-icon {
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: currentColor;
  color: #fff;
  font-size: 12px;
}

.toast-message {
  color: var(--text-primary);
  flex: 1;
}

/* 动画 */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
