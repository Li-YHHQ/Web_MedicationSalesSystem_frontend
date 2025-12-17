<template>
  <button 
    :class="buttonClass" 
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-icon">⟳</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  block: false
})

const emit = defineEmits<{
  click: []
}>()

const buttonClass = computed(() => {
  return [
    'base-button',
    `base-button--${props.type}`,
    `base-button--${props.size}`,
    {
      'base-button--block': props.block,
      'base-button--loading': props.loading
    }
  ]
})

const handleClick = () => {
  if (!props.disabled && !props.loading) {
    emit('click')
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: var(--transition-fast);
  user-select: none;
  white-space: nowrap;
  box-shadow: var(--box-shadow-card);
}

.base-button:active:not(:disabled) {
  transform: translateY(1px);
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

/* 尺寸 */
.base-button--small {
  padding: 6px 16px;
  font-size: 13px;
  height: 32px;
}

.base-button--medium {
  padding: 10px 24px;
  font-size: 14px;
  height: 42px;
}

.base-button--large {
  padding: 14px 32px;
  font-size: 16px;
  height: 48px;
}

/* 类型 */
.base-button--primary {
  background: var(--primary-gradient);
  color: white;
  border: none;
}

.base-button--primary:hover:not(:disabled) {
  box-shadow: var(--box-shadow-hover);
  transform: translateY(-2px);
}

.base-button--secondary {
  background: var(--bg-color);
  color: var(--text-regular);
  border: 1px solid var(--border-light);
}

.base-button--secondary:hover:not(:disabled) {
  background: var(--bg-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.base-button--success {
  background: var(--success-color);
  color: white;
}

.base-button--success:hover:not(:disabled) {
  background: #73d13d;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
  transform: translateY(-2px);
}

.base-button--warning {
  background: var(--warning-color);
  color: white;
}

.base-button--warning:hover:not(:disabled) {
  background: #ffc53d;
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
  transform: translateY(-2px);
}

.base-button--danger {
  background: var(--danger-color);
  color: white;
}

.base-button--danger:hover:not(:disabled) {
  background: #ff7875;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
  transform: translateY(-2px);
}

.base-button--info {
  background: var(--info-color);
  color: white;
}

.base-button--info:hover:not(:disabled) {
  background: #a6a9ad;
  transform: translateY(-2px);
}

/* 块级 */
.base-button--block {
  width: 100%;
}

/* 加载状态 */
.base-button--loading {
  cursor: not-allowed;
  pointer-events: none;
}

.loading-icon {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
