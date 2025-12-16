<template>
  <div class="page">
    <p>课程模块已移除</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page {
  background: var(--bg-page);
  min-height: calc(100vh - 120px);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 20px;
}

.list-header h2 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
}

.search-bar {
  display: flex;
  gap: 12px;
}

.search-bar input {
  width: 300px;
  padding: 10px 16px;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  font-size: 14px;
}

.btn-search {
  padding: 10px 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: background 0.3s;
}

.btn-search:hover {
  background: var(--primary-dark);
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 0 20px;
}

.filter-bar select {
  padding: 10px 16px;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  background: var(--bg-color);
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.btn-primary {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.courses-container {
  padding: 0 20px;
}
</style>
