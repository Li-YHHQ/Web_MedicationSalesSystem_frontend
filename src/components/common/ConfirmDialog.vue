<template>
  <BaseModal
    :visible="visible"
    :title="title"
    size="small"
    :show-close="false"
    :close-on-click-overlay="false"
    @update:visible="handleCancel"
  >
    <p class="confirm-content">{{ content }}</p>
    <template #footer>
      <button class="btn btn-cancel" @click="handleCancel">{{ cancelText }}</button>
      <button class="btn btn-confirm" :class="`btn-confirm--${type}`" @click="handleConfirm">
        {{ confirmText }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'

interface Props {
  visible?: boolean
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'primary'
}

withDefaults(defineProps<Props>(), {
  visible: false,
  title: '确认操作',
  content: '确定要执行此操作吗？',
  confirmText: '确定',
  cancelText: '取消',
  type: 'danger'
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
  cancel: []
}>()

function handleConfirm(): void {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel(): void {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.confirm-content {
  margin: 0;
  color: var(--text-regular);
  font-size: 15px;
  line-height: 1.6;
}

.btn {
  padding: 8px 20px;
  border-radius: var(--border-radius-base);
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition-fast);
}

.btn-cancel {
  background: var(--bg-page);
  color: var(--text-regular);
  border: 1px solid var(--border-base);
}

.btn-cancel:hover {
  background: var(--border-extra-light);
}

.btn-confirm {
  color: #fff;
}

.btn-confirm--danger {
  background: var(--danger-color);
}

.btn-confirm--danger:hover {
  background: #e84040;
}

.btn-confirm--warning {
  background: var(--warning-color);
}

.btn-confirm--warning:hover {
  background: #e09a00;
}

.btn-confirm--primary {
  background: var(--primary-color);
}

.btn-confirm--primary:hover {
  background: var(--primary-dark);
}
</style>
