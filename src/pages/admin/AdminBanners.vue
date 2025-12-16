<template>
  <div class="page">
    <h1>轮播图管理（管理员）</h1>

    <div class="toolbar">
      <BaseButton type="primary" :disabled="loading" @click="openCreate">新增轮播</BaseButton>
      <BaseButton type="secondary" :disabled="loading" @click="fetchList">刷新</BaseButton>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="list.length === 0" class="empty">暂无轮播图</div>

    <div v-else class="list">
      <div v-for="b in list" :key="b.id" class="row">
        <div class="left">
          <div class="preview">
            <img :src="b.imageUrl" alt="banner" />
          </div>
          <div class="info">
            <div class="title">{{ b.title || '-' }}</div>
            <div class="meta">
              <span>ID：{{ b.id }}</span>
              <span>排序：{{ getSortOrder(b) }}</span>
              <span>状态：{{ formatEnabled(b) }}</span>
            </div>
            <div v-if="b.linkUrl" class="link">链接：{{ b.linkUrl }}</div>
          </div>
        </div>
        <div class="actions">
          <BaseButton size="small" type="secondary" :disabled="loading" @click="openEdit(b)">编辑</BaseButton>
          <BaseButton
            size="small"
            :type="isEnabled(b) ? 'warning' : 'primary'"
            :disabled="loading"
            @click="toggleEnabled(b)"
          >{{ isEnabled(b) ? '停用' : '启用' }}</BaseButton>
          <BaseButton size="small" type="danger" :disabled="loading" @click="handleDelete(b)">删除</BaseButton>
        </div>
      </div>
    </div>

    <BaseModal v-model:visible="modalVisible" :title="modalTitle" size="small" @close="resetForm">
      <div class="form">
        <BaseInput v-model="form.title" label="标题" placeholder="可选" />
        <BaseInput v-model="form.imageUrl" label="图片地址" placeholder="https://..." />
        <div class="field">
          <label class="label">图片上传（管理员）</label>
          <div class="upload-row">
            <input
              class="file"
              type="file"
              accept="image/*"
              :disabled="saving || uploadingImage"
              @change="onImageFileChange"
            />
            <BaseButton
              type="danger"
              size="small"
              :disabled="saving || uploadingImage || !String(form.imageUrl || '').trim()"
              @click="deleteImageFile"
            >
              删除文件
            </BaseButton>
          </div>
          <div v-if="String(form.imageUrl || '').trim()" class="preview">
            <img :src="String(form.imageUrl || '').trim()" alt="banner" />
          </div>
        </div>
        <BaseInput v-model="form.linkUrl" label="跳转链接" placeholder="可选 https://..." />
        <BaseInput v-model="form.sortOrder" type="number" label="排序" placeholder="数字越小越靠前" />
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
import { bannerApi, fileApi, type Banner } from '@/api'

const list = ref<Banner[]>([])
const loading = ref(false)
const saving = ref(false)
const uploadingImage = ref(false)
const error = ref('')

const modalVisible = ref(false)
const editingId = ref<number | null>(null)
const form = ref<{ title: string; imageUrl: string; linkUrl: string; sortOrder: any; status: any }>({
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  status: 1
})

const modalTitle = computed(() => (editingId.value ? '编辑轮播图' : '新增轮播图'))

const getSortOrder = (b: any) => {
  if (typeof b?.sortOrder === 'number') return b.sortOrder
  return 0
}

const onImageFileChange = async (evt: Event) => {
  const input = evt.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  uploadingImage.value = true
  error.value = ''
  try {
    const res = await fileApi.adminUploadImage(file)
    const url = (res as any)?.data?.url
    if (!url) {
      throw new Error('上传失败：未返回url')
    }
    form.value.imageUrl = url
  } catch (e: any) {
    error.value = e?.message || '上传失败'
  } finally {
    uploadingImage.value = false
    if (input) input.value = ''
  }
}

const deleteImageFile = async () => {
  const url = String(form.value.imageUrl || '').trim()
  if (!url) return
  if (!confirm('确认删除该文件吗？此操作只删除文件，不会修改轮播记录。')) return

  uploadingImage.value = true
  error.value = ''
  try {
    await fileApi.adminDeleteFile(url)
  } catch (e: any) {
    error.value = e?.message || '删除文件失败'
  } finally {
    uploadingImage.value = false
  }
}

const isEnabled = (b: any) => (typeof b?.status === 'number' ? b.status === 1 : true)

const formatEnabled = (b: any) => (isEnabled(b) ? '启用' : '停用')

const resetForm = () => {
  editingId.value = null
  form.value = { title: '', imageUrl: '', linkUrl: '', sortOrder: 0, status: 1 }
}

const fetchList = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await bannerApi.adminList()
    const arr = res.data || []
    list.value = [...arr].sort((a: any, b: any) => (getSortOrder(a) ?? 0) - (getSortOrder(b) ?? 0))
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  resetForm()
  modalVisible.value = true
}

const openEdit = (b: Banner) => {
  editingId.value = b.id
  form.value = {
    title: (b.title as any) || '',
    imageUrl: b.imageUrl || '',
    linkUrl: (b.linkUrl as any) || '',
    sortOrder: (b.sortOrder as any) ?? 0,
    status: (b.status as any) ?? 1
  }
  modalVisible.value = true
}

const handleSave = async () => {
  if (!form.value.imageUrl) {
    error.value = '图片地址不能为空'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const payload: any = {
      title: form.value.title || undefined,
      imageUrl: form.value.imageUrl,
      linkUrl: form.value.linkUrl || undefined,
      sortOrder: Number(form.value.sortOrder || 0)
    }

    if (editingId.value) {
      payload.status = Number(form.value.status ?? 1)
      await bannerApi.adminUpdate(editingId.value, payload)
    } else {
      await bannerApi.adminCreate(payload)
    }

    modalVisible.value = false
    resetForm()
    await fetchList()
  } catch (e: any) {
    error.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

const toggleEnabled = async (b: Banner) => {
  const next = isEnabled(b) ? 0 : 1
  loading.value = true
  error.value = ''
  try {
    await bannerApi.adminUpdateStatus(b.id, next)
    await fetchList()
  } catch (e: any) {
    error.value = e?.message || '操作失败'
  } finally {
    loading.value = false
  }
}

const handleDelete = async (b: Banner) => {
  if (!confirm(`确认删除轮播图 ID=${b.id} 吗？`)) return
  loading.value = true
  error.value = ''
  try {
    await bannerApi.adminDelete(b.id)
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

.toolbar {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.error { color: #d14343; margin: 8px 0; }
.loading { margin: 8px 0; }
.empty { margin: 8px 0; color: #666; }

.list { display: flex; flex-direction: column; gap: 10px; }
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.left { display: flex; gap: 10px; align-items: center; min-width: 0; }
.preview {
  width: 120px;
  height: 64px;
  overflow: hidden;
  border-radius: 6px;
  background: #f6f6f6;
  flex: 0 0 auto;
}
.preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.info { min-width: 0; }
.title { font-weight: 600; margin-bottom: 6px; }
.meta { display: flex; gap: 10px; color: #666; font-size: 12px; flex-wrap: wrap; }
.link { margin-top: 4px; color: #666; font-size: 12px; word-break: break-all; }
.actions { display: flex; gap: 8px; flex: 0 0 auto; }
.form { display: flex; flex-direction: column; gap: 10px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.label { color: var(--text-primary); font-weight: 500; font-size: 14px; }
.upload-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.file { height: 40px; }
.preview { margin-top: 8px; width: 240px; height: 128px; border-radius: 6px; overflow: hidden; background: #f6f6f6; border: 1px solid #eee; }
.preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
