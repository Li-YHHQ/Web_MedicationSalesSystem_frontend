<template>
  <div class="page">
    <h1>分类管理（管理员）</h1>

    <div class="toolbar">
      <BaseButton type="primary" :disabled="loading" @click="openCreate">新增分类</BaseButton>
      <BaseButton type="secondary" :disabled="loading" @click="fetchList">刷新</BaseButton>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="list.length === 0" class="empty">暂无分类</div>

    <div v-else class="list">
      <div v-for="c in list" :key="c.id" class="row">
        <div class="left">
          <div class="name">{{ c.name }}</div>
          <div class="meta">
            <span>ID：{{ c.id }}</span>
            <span>排序：{{ getSortOrder(c) }}</span>
            <span>状态：{{ formatStatus(c.status) }}</span>
          </div>
        </div>
        <div class="actions">
          <BaseButton size="small" type="secondary" :disabled="loading" @click="openEdit(c)">编辑</BaseButton>
          <BaseButton size="small" type="danger" :disabled="loading" @click="handleDelete(c)">删除</BaseButton>
        </div>
      </div>
    </div>

    <BaseModal v-model:visible="modalVisible" :title="modalTitle" size="small" @close="resetForm">
      <div class="form">
        <BaseInput v-model="form.name" label="分类名称" placeholder="请输入分类名称" />
        <BaseInput v-model="form.sortOrder" type="number" label="排序" placeholder="数字越小越靠前" />
        <BaseInput v-if="editingId" v-model="form.status" type="number" label="状态" placeholder="1=启用 0=停用" />
      </div>
      <template #footer>
        <BaseButton type="secondary" :disabled="saving" @click="modalVisible = false">取消</BaseButton>
        <BaseButton type="primary" :loading="saving" @click="handleSave">保存</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { categoryApi, type Category } from '@/api'

const list = ref<Category[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const modalVisible = ref(false)
const editingId = ref<number | null>(null)
const form = ref<{ name: string; sortOrder: any; status: any }>({
  name: '',
  sortOrder: 0,
  status: 1
})

const modalTitle = computed(() => (editingId.value ? '编辑分类' : '新增分类'))

const getSortOrder = (c: any) => {
  if (typeof c?.sortOrder === 'number') return c.sortOrder
  if (typeof c?.sort === 'number') return c.sort
  return '-'
}

const formatStatus = (s: any) => {
  if (s === 1 || s === '1' || s === true) return '启用'
  if (s === 0 || s === '0' || s === false) return '停用'
  if (s == null) return '-'
  return String(s)
}

const resetForm = () => {
  editingId.value = null
  form.value = { name: '', sortOrder: 0, status: 1 }
}

const fetchList = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await categoryApi.adminList()
    list.value = res.data || []
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    list.value = []
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  resetForm()
  modalVisible.value = true
}

const openEdit = (c: Category) => {
  editingId.value = c.id
  form.value = {
    name: c.name || '',
    sortOrder: (c as any).sortOrder ?? (c as any).sort ?? 0,
    status: (c as any).status ?? 1
  }
  modalVisible.value = true
}

const handleSave = async () => {
  const name = String(form.value.name || '').trim()
  if (!name) {
    error.value = '请填写分类名称'
    return
  }

  saving.value = true
  error.value = ''
  try {
    const sortOrder = form.value.sortOrder === '' ? undefined : Number(form.value.sortOrder)
    const status = form.value.status === '' ? undefined : Number(form.value.status)

    if (editingId.value) {
      await categoryApi.adminUpdate(editingId.value, { name, sortOrder, status })
    } else {
      await categoryApi.adminCreate({ name, sortOrder })
    }

    modalVisible.value = false
    await fetchList()
  } catch (e: any) {
    error.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

const handleDelete = async (c: Category) => {
  if (!confirm(`确定删除分类「${c.name}」吗？`)) return
  loading.value = true
  error.value = ''
  try {
    await categoryApi.adminDelete(c.id)
    await fetchList()
  } catch (e: any) {
    error.value = e?.message || '删除失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
.page { padding: 8px; }
.toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0; }
.error { color: var(--danger-color); margin-top: 8px; }
.loading, .empty { color: var(--text-secondary); margin-top: 8px; }

.list { margin-top: 12px; display: grid; gap: 10px; }
.row { display: flex; justify-content: space-between; gap: 12px; align-items: center; border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); padding: 12px; }
.name { font-weight: 700; color: var(--text-primary); }
.meta { margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; color: var(--text-secondary); font-size: 12px; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
.form { padding-top: 4px; }
</style>
