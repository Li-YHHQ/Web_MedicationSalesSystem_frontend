<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>页面不存在</h1>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <div class="actions">
        <BaseButton @click="$router.push('/')" type="primary">
          返回首页
        </BaseButton>
        <BaseButton @click="$router.go(-1)" type="secondary">
          返回上页
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 400px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 20px;
}

.not-found-content h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.not-found-content p {
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 32px;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }
  
  .not-found-content h1 {
    font-size: 20px;
  }
  
  .not-found-content p {
    font-size: 14px;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
