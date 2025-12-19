<template>
  <div class="default-layout">
    <AppHeader />
    <div class="layout-main">
      <AppSidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-main {
  display: flex;
  flex: 1;
  margin-top: 64px; /* Header height */
}

.main-content {
  flex: 1;
  margin-left: 240px; /* Sidebar width */
  background: var(--bg-page);
  min-height: calc(100vh - 64px);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .layout-main {
    flex-direction: column;
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
