<template>
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" :class="modalClass" @click.stop>
        <div class="modal-header" v-if="title || showClose">
          <h3 v-if="title" class="modal-title">{{ title }}</h3>
          <button v-if="showClose" class="modal-close" @click="handleClose">×</button>
        </div>
        
        <div class="modal-body">
          <slot />
        </div>
        
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  visible?: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  showClose?: boolean
  closeOnClickOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  size: 'medium',
  showClose: true,
  closeOnClickOverlay: true
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  close: []
}>()

const modalClass = computed(() => {
  return [
    'modal-container',
    `modal-container--${props.size}`
  ]
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

// ESC键关闭
watch(() => props.visible, (visible) => {
  if (visible) {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    
    // 组件销毁时移除监听
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: var(--bg-color);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-dark);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 尺寸 */
.modal-container--small {
  width: 400px;
}

.modal-container--medium {
  width: 600px;
}

.modal-container--large {
  width: 800px;
}

.modal-container--full {
  width: 100%;
  max-width: 1200px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-base);
}

.modal-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-base);
  transition: all 0.3s;
}

.modal-close:hover {
  background: var(--border-extra-light);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-base);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container--small,
  .modal-container--medium,
  .modal-container--large,
  .modal-container--full {
    width: 100%;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
}
</style>
