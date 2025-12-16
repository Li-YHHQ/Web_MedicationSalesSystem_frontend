<template>
  <div class="page">
    <h1>课程模块</h1>
    <p>已移除</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page {
  padding: 20px;
  max-width: 800px;
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

.course-detail-container {
  background: var(--bg-color);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-base);
  overflow: hidden;
}

.course-info-card {
  padding: 32px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-base);
}

.course-header h2 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.course-code {
  background: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  font-weight: 500;
}

.course-content {
  margin-bottom: 32px;
}

.info-section,
.time-section {
  margin-bottom: 32px;
}

.info-section h3,
.time-section h3 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.info-item span {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.info-item .credit {
  color: var(--warning-color);
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border-base);
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h2 {
  color: var(--text-primary);
  font-size: 24px;
  margin-bottom: 16px;
}

.not-found p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .course-detail-page {
    padding: 16px;
  }
  
  .course-info-card {
    padding: 20px;
  }
  
  .course-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
