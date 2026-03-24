<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <p class="empty-text">{{ text }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  text: '暂无数据',
  icon: '📭'
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 56px;
  line-height: 1;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
