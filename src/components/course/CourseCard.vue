<template>
  <div class="page">
    <p>课程模块已移除</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.course-card {
  background: var(--bg-color);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--box-shadow-base);
  transition: all 0.3s;
}

.course-card:hover {
  box-shadow: var(--box-shadow-light);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.course-name {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.course-code {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: var(--border-radius-small);
  font-size: 12px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.label {
  color: var(--text-secondary);
  width: 80px;
  flex-shrink: 0;
}

.value {
  color: var(--text-regular);
  flex: 1;
}

.credit {
  font-weight: 600;
  color: var(--warning-color);
}

.card-footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius-base);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--info-color);
  color: white;
}

.btn-secondary:hover {
  background: #73767a;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: #f78989;
}
</style>
