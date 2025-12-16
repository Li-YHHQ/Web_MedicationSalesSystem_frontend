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
  border: none;
  border-radius: var(--border-radius-base);
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
  white-space: nowrap;
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 尺寸 */
.base-button--small {
  padding: 8px 16px;
  font-size: 12px;
}

.base-button--medium {
  padding: 12px 24px;
  font-size: 14px;
}

.base-button--large {
  padding: 16px 32px;
  font-size: 16px;
}

/* 类型 */
.base-button--primary {
  background: var(--primary-color);
  color: white;
}

.base-button--primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.base-button--secondary {
  background: var(--bg-page);
  color: var(--text-regular);
  border: 1px solid var(--border-base);
}

.base-button--secondary:hover:not(:disabled) {
  background: var(--border-extra-light);
}

.base-button--success {
  background: var(--success-color);
  color: white;
}

.base-button--success:hover:not(:disabled) {
  background: #85ce61;
}

.base-button--warning {
  background: var(--warning-color);
  color: white;
}

.base-button--warning:hover:not(:disabled) {
  background: #ebb563;
}

.base-button--danger {
  background: var(--danger-color);
  color: white;
}

.base-button--danger:hover:not(:disabled) {
  background: #f78989;
}

.base-button--info {
  background: var(--info-color);
  color: white;
}

.base-button--info:hover:not(:disabled) {
  background: #a6a9ad;
}

/* 块级 */
.base-button--block {
  width: 100%;
}

/* 加载状态 */
.base-button--loading {
  cursor: not-allowed;
}

.loading-icon {
  display: inline-block;
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
