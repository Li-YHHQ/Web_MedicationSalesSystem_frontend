<template>
  <div class="page">
    <h1>用户管理（管理员）</h1>

    <div class="toolbar">
      <BaseInput v-model="keyword" label="关键词" placeholder="用户名/手机号/邮箱" />
      <div class="toolbar-actions">
        <BaseButton type="primary" :disabled="loading" @click="fetchList">查询</BaseButton>
        <BaseButton type="secondary" :disabled="loading" @click="resetAndFetch">重置</BaseButton>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="list.length === 0" class="empty">暂无用户</div>

    <div v-else class="list">
      <div v-for="u in list" :key="u.id" class="row">
        <div class="left">
          <div class="top">
            <div class="username">{{ u.username }}</div>
            <div class="role">{{ u.role || '-' }}</div>
            <div class="status">{{ formatStatus(u.status) }}</div>
          </div>
          <div class="meta">
            <span>ID：{{ u.id }}</span>
            <span>手机：{{ u.phone || '-' }}</span>
            <span>邮箱：{{ u.email || '-' }}</span>
          </div>
          <div class="times">
            <span>创建：{{ formatTime(u.createTime) }}</span>
            <span>更新：{{ formatTime(u.updateTime) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { userApi, type AdminUser } from '@/api'

const list = ref<AdminUser[]>([])
const keyword = ref('')
const loading = ref(false)
const error = ref('')

const formatTime = (t?: string) => {
  if (!t) return '-'
  return t.replace('T', ' ').replace('Z', '')
}

const formatStatus = (s?: number) => {
  if (s === 1) return '启用'
  if (s === 0) return '停用'
  if (typeof s === 'number') return String(s)
  return '-'
}

const fetchList = async () => {
  error.value = ''
  loading.value = true
  try {
    const params: any = {}
    if (keyword.value) params.keyword = keyword.value
    const res = await userApi.adminList(params)
    list.value = res.data || []
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const resetAndFetch = async () => {
  keyword.value = ''
  await fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
.page { padding: 8px; }

.toolbar {
  display: flex;
  gap: 12px;
  align-items: end;
  margin: 12px 0;
}

.toolbar-actions { display: flex; gap: 8px; }

.error { color: #d14343; margin: 8px 0; }
.loading { margin: 8px 0; }
.empty { margin: 8px 0; color: #666; }

.list { display: flex; flex-direction: column; gap: 10px; }
.row {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.top { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.username { font-weight: 600; }
.role { color: #444; }
.status { color: #666; }
.meta { margin-top: 6px; display: flex; gap: 10px; color: #666; font-size: 12px; flex-wrap: wrap; }
.times { margin-top: 6px; display: flex; gap: 10px; color: #666; font-size: 12px; flex-wrap: wrap; }

@media (max-width: 900px) {
  .toolbar { flex-direction: column; align-items: stretch; }
}
</style>
