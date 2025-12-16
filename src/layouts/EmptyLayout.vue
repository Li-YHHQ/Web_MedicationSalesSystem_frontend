<template>
  <div class="empty-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 空白布局组件，用于登录页等不需要侧边栏的页面
</script>

<style scoped>
.empty-layout {
  min-height: 100vh;
  background: var(--bg-page);
}
</style>
