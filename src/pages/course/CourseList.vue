<template>
  <div class="page">
    <h1>课程模块</h1>
    <p>已移除</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.course-list-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.course-detail {
  padding: 20px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.detail-item label {
  width: 100px;
  color: var(--text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.detail-item span {
  color: var(--text-primary);
  flex: 1;
  word-break: break-all;
}
</style>
