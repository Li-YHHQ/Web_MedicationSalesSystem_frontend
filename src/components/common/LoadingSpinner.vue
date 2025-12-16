<template>
  <div class="loading-spinner" v-if="loading">
    <div class="spinner"></div>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
  message?: string
}

withDefaults(defineProps<Props>(), {
  loading: true,
  message: '加载中...'
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
