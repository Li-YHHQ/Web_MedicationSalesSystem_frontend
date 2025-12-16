<template>
  <div class="page">
    <h1>课程模块</h1>
    <p>已移除</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.course-create-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: var(--border-radius-base);
  transition: all 0.3s;
}

.back-button:hover {
  background: var(--border-extra-light);
  color: var(--text-primary);
}

.page-header h1 {
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.form-container {
  background: var(--bg-color);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-base);
  padding: 32px;
}

@media (max-width: 768px) {
  .course-create-page {
    padding: 16px;
  }
  
  .form-container {
    padding: 20px;
  }
}
</style>
