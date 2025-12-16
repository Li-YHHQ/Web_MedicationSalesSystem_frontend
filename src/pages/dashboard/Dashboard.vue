<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1>系统概览</h1>
      <p class="subtitle">课程模块已移除</p>
    </div>

    <div class="content-grid">
      <div class="quick-actions">
        <div class="section-header">
          <h2>快速入口</h2>
        </div>

        <div class="action-grid">
          <div class="action-item" @click="$router.push('/')">
            <div class="action-icon">🏠</div>
            <h4>首页</h4>
            <p>查看轮播与推荐药品</p>
          </div>

          <div class="action-item" @click="$router.push('/products')">
            <div class="action-icon">🧾</div>
            <h4>药品列表</h4>
            <p>浏览与搜索药品</p>
          </div>

          <div class="action-item" @click="$router.push('/orders')">
            <div class="action-icon">�</div>
            <h4>我的订单</h4>
            <p>查看订单与状态</p>
          </div>

          <div class="action-item" @click="$router.push('/me')">
            <div class="action-icon">�</div>
            <h4>个人中心</h4>
            <p>更新个人资料</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  color: var(--text-primary);
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.quick-actions {
  background: var(--bg-color);
  border-radius: var(--border-radius-base);
  padding: 24px;
  box-shadow: var(--box-shadow-base);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.action-item {
  padding: 20px;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  border-color: var(--primary-color);
  background: var(--border-extra-light);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.action-item h4 {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.action-item p {
  color: var(--text-secondary);
  font-size: 12px;
  margin: 0;
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
