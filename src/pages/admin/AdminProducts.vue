<template>
  <div class="page">
    <h1>药品管理（管理员）</h1>

    <div class="toolbar">
      <BaseButton type="primary" :disabled="loading" @click="openCreate">新增药品</BaseButton>
      <BaseButton type="secondary" :disabled="loading" @click="fetchList">刷新</BaseButton>
    </div>

    <div class="filters">
      <BaseInput v-model="keyword" placeholder="关键词（名称/别名）" />
      <select v-model="categoryId" class="select">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
      </select>
      <BaseButton type="primary" :disabled="loading" @click="fetchList">搜索</BaseButton>
      <BaseButton type="secondary" :disabled="loading" @click="resetFilters">重置</BaseButton>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="list.length === 0" class="empty">暂无药品</div>

    <div v-else class="list">
      <div v-for="p in list" :key="p.id" class="row">
        <div class="img">
          <img v-if="getCoverUrl(p)" :src="getCoverUrl(p)" alt="product" />
          <div v-else class="img-placeholder">无图</div>
        </div>

        <div class="info">
          <div class="name">{{ p.name }}</div>
          <div class="sub">{{ p.subName || '' }}</div>
          <div class="meta">
            <span>ID：{{ p.id }}</span>
            <span>分类：{{ p.categoryName || p.categoryId }}</span>
            <span>价格：¥{{ p.price }}</span>
            <span>库存：{{ p.stock }}</span>
            <span>处方：{{ formatPrescription(p) }}</span>
            <span>状态：{{ formatStatus(p.status) }}</span>
          </div>
        </div>

        <div class="actions">
          <BaseButton size="small" type="secondary" :disabled="loading" @click="openEdit(p)">编辑</BaseButton>
          <BaseButton
            size="small"
            type="warning"
            :disabled="loading"
            @click="toggleStatus(p)"
          >
            {{ isEnabled(p.status) ? '下架' : '上架' }}
          </BaseButton>
          <BaseButton size="small" type="danger" :disabled="loading" @click="handleDelete(p)">删除</BaseButton>
        </div>
      </div>
    </div>

    <BaseModal v-model:visible="modalVisible" :title="modalTitle" size="large" @close="resetForm">
      <div class="form">
        <div class="grid">
          <BaseInput v-model="form.name" label="药品名称" placeholder="必填" />
          <BaseInput v-model="form.subName" label="别名" placeholder="可选" />

          <div class="field">
            <label class="label">分类</label>
            <select v-model="form.categoryId" class="select">
              <option value="">请选择分类</option>
              <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
            </select>
          </div>

          <BaseInput v-model="form.manufacturer" label="厂家" />
          <BaseInput v-model="form.specification" label="规格" />
          <BaseInput v-model="form.approvalNumber" label="批准文号" />

          <BaseInput v-model="form.price" type="number" label="价格" placeholder="必填" />
          <BaseInput v-model="form.stock" type="number" label="库存" placeholder="必填" />

          <div class="field">
            <label class="label">是否处方药</label>
            <select v-model="form.isPrescription" class="select">
              <option value="0">否</option>
              <option value="1">是</option>
            </select>
          </div>

          <BaseInput v-model="form.coverUrl" label="封面URL" placeholder="可选" />

          <div class="field field--full">
            <label class="label">封面上传（管理员）</label>
            <div class="upload-row">
              <input
                class="file"
                type="file"
                accept="image/*"
                :disabled="saving || uploadingCover"
                @change="onCoverFileChange"
              />
              <BaseButton
                type="danger"
                size="small"
                :disabled="saving || uploadingCover || !String(form.coverUrl || '').trim()"
                @click="deleteCoverFile"
              >
                删除文件
              </BaseButton>
            </div>
            <div v-if="String(form.coverUrl || '').trim()" class="preview">
              <img :src="String(form.coverUrl || '').trim()" alt="cover" />
            </div>
          </div>

          <div class="field field--full">
            <label class="label">说明</label>
            <textarea v-model="form.description" class="textarea" rows="4" placeholder="可选" />
          </div>

          <div v-if="editingId" class="field">
            <label class="label">状态</label>
            <select v-model="form.status" class="select">
              <option value="0">下架</option>
              <option value="1">上架</option>
            </select>
          </div>
        </div>
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
import { categoryApi, fileApi, productApi, type Category, type Product } from '@/api'

const categories = ref<Category[]>([])
const list = ref<Product[]>([])
const loading = ref(false)
const saving = ref(false)
const uploadingCover = ref(false)
const error = ref('')

const keyword = ref('')
const categoryId = ref('')

const modalVisible = ref(false)
const editingId = ref<number | null>(null)

const form = ref<any>({
  categoryId: '',
  name: '',
  subName: '',
  manufacturer: '',
  specification: '',
  approvalNumber: '',
  isPrescription: '0',
  price: 0,
  stock: 0,
  coverUrl: '',
  description: '',
  status: '1'
})

const modalTitle = computed(() => (editingId.value ? '编辑药品' : '新增药品'))

const getCoverUrl = (p: any) => p?.coverUrl || p?.imageUrl || ''

const isEnabled = (s: any) => s === 1 || s === '1' || s === true || s === 'ENABLED'

const formatStatus = (s: any) => (isEnabled(s) ? '上架' : '下架')

const formatPrescription = (p: any) => {
  const v = p?.isPrescription ?? p?.prescription
  if (v === 1 || v === '1' || v === true) return '是'
  return '否'
}

const resetForm = () => {
  editingId.value = null
  form.value = {
    categoryId: '',
    name: '',
    subName: '',
    manufacturer: '',
    specification: '',
    approvalNumber: '',
    isPrescription: '0',
    price: 0,
    stock: 0,
    coverUrl: '',
    description: '',
    status: '1'
  }
}

const loadCategories = async () => {
  try {
    const res = await categoryApi.adminList()
    categories.value = res.data || []
  } catch {
    categories.value = []
  }
}

const fetchList = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await productApi.adminList({
      keyword: keyword.value || undefined,
      categoryId: categoryId.value ? Number(categoryId.value) : undefined
    })
    list.value = res.data || []
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    list.value = []
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  keyword.value = ''
  categoryId.value = ''
  await fetchList()
}

const openCreate = () => {
  resetForm()
  modalVisible.value = true
}

const openEdit = (p: Product) => {
  editingId.value = p.id
  form.value = {
    categoryId: String((p as any).categoryId ?? ''),
    name: (p as any).name ?? '',
    subName: (p as any).subName ?? '',
    manufacturer: (p as any).manufacturer ?? '',
    specification: (p as any).specification ?? '',
    approvalNumber: (p as any).approvalNumber ?? '',
    isPrescription: String((p as any).isPrescription ?? ((p as any).prescription ? 1 : 0)),
    price: Number((p as any).price ?? 0),
    stock: Number((p as any).stock ?? 0),
    coverUrl: (p as any).coverUrl ?? (p as any).imageUrl ?? '',
    description: (p as any).description ?? '',
    status: String((p as any).status ?? (isEnabled((p as any).status) ? 1 : 0))
  }
  modalVisible.value = true
}

const handleSave = async () => {
  const name = String(form.value.name || '').trim()
  const cid = form.value.categoryId ? Number(form.value.categoryId) : 0
  const price = Number(form.value.price)
  const stock = Number(form.value.stock)
  const isPrescription = Number(form.value.isPrescription)

  if (!name) {
    error.value = '请填写药品名称'
    return
  }
  if (!cid) {
    error.value = '请选择分类'
    return
  }
  if (!Number.isFinite(price)) {
    error.value = '价格不合法'
    return
  }
  if (!Number.isFinite(stock) || stock < 0) {
    error.value = '库存不合法'
    return
  }

  saving.value = true
  error.value = ''
  try {
    const payloadBase: any = {
      categoryId: cid,
      name,
      subName: String(form.value.subName || '').trim() || undefined,
      manufacturer: String(form.value.manufacturer || '').trim() || undefined,
      specification: String(form.value.specification || '').trim() || undefined,
      approvalNumber: String(form.value.approvalNumber || '').trim() || undefined,
      isPrescription,
      price,
      stock,
      coverUrl: String(form.value.coverUrl || '').trim() || undefined,
      description: String(form.value.description || '').trim() || undefined
    }

    if (editingId.value) {
      const status = Number(form.value.status)
      await productApi.adminUpdate(editingId.value, { ...payloadBase, status })
    } else {
      await productApi.adminCreate(payloadBase)
    }

    modalVisible.value = false
    await fetchList()
  } catch (e: any) {
    error.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

const onCoverFileChange = async (evt: Event) => {
  const input = evt.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  uploadingCover.value = true
  error.value = ''
  try {
    const res = await fileApi.adminUploadImage(file)
    const url = (res as any)?.data?.url
    if (!url) {
      throw new Error('上传失败：未返回url')
    }
    form.value.coverUrl = url
  } catch (e: any) {
    error.value = e?.message || '上传失败'
  } finally {
    uploadingCover.value = false
    if (input) input.value = ''
  }
}

const deleteCoverFile = async () => {
  const url = String(form.value.coverUrl || '').trim()
  if (!url) return
  if (!confirm('确认删除该文件吗？此操作只删除文件，不会修改商品记录。')) return

  uploadingCover.value = true
  error.value = ''
  try {
    await fileApi.adminDeleteFile(url)
  } catch (e: any) {
    error.value = e?.message || '删除文件失败'
  } finally {
    uploadingCover.value = false
  }
}

const toggleStatus = async (p: Product) => {
  const next = isEnabled((p as any).status) ? 0 : 1
  loading.value = true
  error.value = ''
  try {
    await productApi.adminUpdateStatus(p.id, { status: next })
    await fetchList()
  } catch (e: any) {
    error.value = e?.message || '操作失败'
  } finally {
    loading.value = false
  }
}

const handleDelete = async (p: Product) => {
  if (!confirm(`确定删除药品「${(p as any).name}」吗？`)) return
  loading.value = true
  error.value = ''
  try {
    await productApi.adminDelete(p.id)
    await fetchList()
  } catch (e: any) {
    error.value = e?.message || '删除失败'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await fetchList()
})
</script>

<style scoped>
.page { padding: 8px; }
.toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0; }
.filters { display: grid; grid-template-columns: 1fr 200px auto auto; gap: 12px; align-items: end; margin-top: 12px; }
.select { height: 40px; border: 1px solid var(--border-base); border-radius: var(--border-radius-base); padding: 0 10px; background: var(--bg-color); }
.error { color: var(--danger-color); margin-top: 8px; }
.loading, .empty { color: var(--text-secondary); margin-top: 8px; }

.list { margin-top: 12px; display: grid; gap: 10px; }
.row { display: grid; grid-template-columns: 80px 1fr auto; gap: 12px; align-items: center; border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); padding: 12px; }
.img { width: 80px; height: 80px; border-radius: var(--border-radius-base); overflow: hidden; background: var(--bg-page); display: flex; align-items: center; justify-content: center; }
.img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-placeholder { color: var(--text-placeholder); font-size: 12px; }
.name { font-weight: 700; color: var(--text-primary); }
.sub { margin-top: 4px; color: var(--text-secondary); font-size: 12px; }
.meta { margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; color: var(--text-secondary); font-size: 12px; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

.form { padding-top: 4px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field--full { grid-column: 1 / -1; }
.label { color: var(--text-primary); font-weight: 500; font-size: 14px; }
.upload-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.file { height: 40px; }
.preview { margin-top: 8px; width: 160px; height: 160px; border-radius: var(--border-radius-base); overflow: hidden; background: var(--bg-page); border: 1px solid var(--border-light); }
.preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.textarea { width: 100%; border: 1px solid var(--border-base); border-radius: var(--border-radius-base); padding: 10px 12px; font-size: 14px; background: var(--bg-color); outline: none; resize: vertical; }
.textarea:focus { border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2); }

@media (max-width: 768px) {
  .filters { grid-template-columns: 1fr; }
  .row { grid-template-columns: 80px 1fr; }
  .actions { grid-column: 1 / -1; justify-content: flex-start; }
  .grid { grid-template-columns: 1fr; }
}
</style>
