<template>
  <div class="supplier-page">

    <!-- ===== 搜索栏 ===== -->
    <div class="filter-card">
      <div class="filter-row">
        <input
          v-model="search.keyword"
          class="filter-input"
          placeholder="供应商名称 / 联系人 / 电话"
          @keyup.enter="handleSearch"
        />
        <select v-model="search.status" class="filter-select">
          <option value="">全部状态</option>
          <option value="1">正常</option>
          <option value="0">停用</option>
        </select>
        <div class="filter-btns">
          <BaseButton size="small" @click="handleSearch">搜索</BaseButton>
          <BaseButton size="small" type="secondary" @click="handleReset">重置</BaseButton>
        </div>
      </div>
    </div>

    <!-- ===== 操作栏 ===== -->
    <div class="action-bar">
      <BaseButton size="small" @click="openCreate">＋ 新增供应商</BaseButton>
    </div>

    <!-- ===== 加载中 ===== -->
    <div v-if="loading" class="state-center">
      <div class="mini-spinner"></div>
      <span class="state-text">加载中...</span>
    </div>

    <!-- ===== 加载失败 ===== -->
    <div v-else-if="loadError" class="state-center">
      <p class="error-icon">⚠️</p>
      <p class="error-msg">{{ loadError }}</p>
      <button class="retry-btn" @click="loadData">重新加载</button>
    </div>

    <!-- ===== 空数据 ===== -->
    <EmptyState v-else-if="list.length === 0" text="暂无供应商数据" icon="🏭" />

    <!-- ===== 内容区 ===== -->
    <template v-else>

      <!-- PC 表格 -->
      <div class="table-wrap">
        <table class="supplier-table">
          <thead>
            <tr>
              <th>供应商名称</th>
              <th>联系人</th>
              <th>联系电话</th>
              <th>地址</th>
              <th>备注</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supplier in list" :key="supplier.id">
              <td class="bold-cell">{{ supplier.name }}</td>
              <td>{{ supplier.contact || '—' }}</td>
              <td class="mono">{{ supplier.phone || '—' }}</td>
              <td class="addr-cell">{{ supplier.address || '—' }}</td>
              <td class="dim remark-cell">{{ supplier.remark || '—' }}</td>
              <td>
                <span class="status-tag" :class="supplier.status === 1 ? 'status-on' : 'status-off'">
                  {{ supplier.status === 1 ? '正常' : '停用' }}
                </span>
              </td>
              <td class="op-cell">
                <button class="op-btn op-edit" @click="openEdit(supplier)">编辑</button>
                <button class="op-btn op-del" @click="confirmDelete(supplier)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手机端卡片 -->
      <div class="card-list">
        <div v-for="supplier in list" :key="supplier.id" class="supplier-card">
          <div class="card-top">
            <span class="card-name">{{ supplier.name }}</span>
            <span class="status-tag" :class="supplier.status === 1 ? 'status-on' : 'status-off'">
              {{ supplier.status === 1 ? '正常' : '停用' }}
            </span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-key">联系人</span>
              <span>{{ supplier.contact || '—' }}</span>
            </div>
            <div class="card-row">
              <span class="card-key">电话</span>
              <span class="mono">{{ supplier.phone || '—' }}</span>
            </div>
            <div class="card-row">
              <span class="card-key">地址</span>
              <span class="card-addr">{{ supplier.address || '—' }}</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="op-btn op-edit" @click="openEdit(supplier)">编辑</button>
            <button class="op-btn op-del" @click="confirmDelete(supplier)">删除</button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <span class="pg-info">共 {{ total }} 条</span>
        <div class="pg-btns">
          <button class="pg-btn" :disabled="page <= 1" @click="changePage(page - 1)">
            ‹ 上一页
          </button>
          <span class="pg-cur">{{ page }} / {{ totalPages }}</span>
          <button class="pg-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">
            下一页 ›
          </button>
        </div>
      </div>
    </template>

    <!-- ===== 新增/编辑弹窗 ===== -->
    <BaseModal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑供应商' : '新增供应商'"
      size="medium"
      @close="resetForm"
    >
      <div class="supplier-form">
        <div class="form-grid">

          <div class="form-item form-item-full" :class="{ 'item-error': errors.name }">
            <label class="form-label">供应商名称 <span class="req">*</span></label>
            <input
              v-model="form.name"
              class="form-input"
              placeholder="请输入供应商名称"
            />
            <span v-if="errors.name" class="err-tip">{{ errors.name }}</span>
          </div>

          <div class="form-item">
            <label class="form-label">联系人</label>
            <input v-model="form.contact" class="form-input" placeholder="请输入联系人姓名" />
          </div>

          <div class="form-item">
            <label class="form-label">联系电话</label>
            <input v-model="form.phone" class="form-input" placeholder="请输入联系电话" />
          </div>

          <div class="form-item form-item-full">
            <label class="form-label">地址</label>
            <input v-model="form.address" class="form-input" placeholder="请输入供应商地址" />
          </div>

          <div class="form-item form-item-full">
            <label class="form-label">备注</label>
            <textarea
              v-model="form.remark"
              class="form-textarea"
              rows="3"
              placeholder="请输入备注信息"
            ></textarea>
          </div>

          <div class="form-item">
            <label class="form-label">状态</label>
            <select v-model="form.status" class="form-select">
              <option :value="1">正常</option>
              <option :value="0">停用</option>
            </select>
          </div>

        </div>
      </div>
      <template #footer>
        <BaseButton type="secondary" data-testid="btn-supplier-cancel" @click="closeModal">取消</BaseButton>
        <BaseButton data-testid="btn-supplier-submit" :loading="submitting" @click="submitForm">
          {{ isEdit ? '保 存' : '新 增' }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- ===== 删除确认 ===== -->
    <ConfirmDialog
      v-model:visible="deleteVisible"
      title="删除供应商"
      :content="`确定要删除「${deletingSupplier?.name ?? ''}」吗？此操作不可撤销。`"
      confirm-text="确认删除"
      @confirm="doDelete"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { supplierApi, type Supplier, type SupplierFormData } from '@/api/supplier'
import { showSuccess, showError } from '@/utils/toast'

// ── 列表状态 ──────────────────────────────────────────────
const loading   = ref(false)
const loadError = ref('')
const list      = ref<Supplier[]>([])
const total     = ref(0)
const page      = ref(1)
const PAGE_SIZE = 20

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

// ── 搜索条件 ──────────────────────────────────────────────
const search = reactive({ keyword: '', status: '' })

async function loadData(): Promise<void> {
  loading.value   = true
  loadError.value = ''
  try {
    const params: Record<string, unknown> = { page: page.value, size: PAGE_SIZE }
    if (search.keyword.trim()) params.keyword = search.keyword.trim()
    params.status = search.status !== '' ? Number(search.status) : 1

    const res   = await supplierApi.list(params)
    list.value  = res.data.list
    total.value = res.data.total
  } catch (e: unknown) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function handleSearch(): void { page.value = 1; loadData() }

function handleReset(): void {
  search.keyword = ''; search.status = ''
  page.value = 1; loadData()
}

function changePage(p: number): void { page.value = p; loadData() }

// ── 表单 ──────────────────────────────────────────────────
interface FormState {
  name: string
  contact: string
  phone: string
  address: string
  remark: string
  status: number
}

const emptyForm = (): FormState => ({
  name: '', contact: '', phone: '', address: '', remark: '', status: 1
})

const modalVisible = ref(false)
const isEdit       = ref(false)
const submitting   = ref(false)
const editId       = ref<number | null>(null)
const form         = reactive<FormState>(emptyForm())
const errors       = reactive({ name: '' })

function resetForm(): void {
  Object.assign(form, emptyForm())
  errors.name = ''
}

function closeModal(): void { modalVisible.value = false; resetForm() }

function openCreate(): void {
  isEdit.value = false; editId.value = null
  resetForm(); modalVisible.value = true
}

function openEdit(supplier: Supplier): void {
  isEdit.value = true; editId.value = supplier.id
  Object.assign(form, {
    name:    supplier.name,
    contact: supplier.contact ?? '',
    phone:   supplier.phone   ?? '',
    address: supplier.address ?? '',
    remark:  supplier.remark  ?? '',
    status:  supplier.status
  })
  errors.name = ''
  modalVisible.value = true
}

function validate(): boolean {
  errors.name = form.name.trim() ? '' : '请输入供应商名称'
  return !errors.name
}

async function submitForm(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  const data: SupplierFormData = {
    name:    form.name.trim(),
    contact: form.contact.trim(),
    phone:   form.phone.trim(),
    address: form.address.trim(),
    remark:  form.remark.trim(),
    status:  form.status
  }
  try {
    if (isEdit.value && editId.value !== null) {
      await supplierApi.update(editId.value, data)
      showSuccess('更新成功')
    } else {
      await supplierApi.create(data)
      showSuccess('新增成功')
    }
    closeModal(); loadData()
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

// ── 删除 ──────────────────────────────────────────────────
const deleteVisible      = ref(false)
const deletingSupplier   = ref<Supplier | null>(null)

function confirmDelete(supplier: Supplier): void {
  deletingSupplier.value = supplier; deleteVisible.value = true
}

async function doDelete(): Promise<void> {
  if (!deletingSupplier.value) return
  try {
    await supplierApi.remove(deletingSupplier.value.id)
    showSuccess('删除成功')
    deletingSupplier.value = null
    if (list.value.length === 1 && page.value > 1) page.value--
    loadData()
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '删除失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
/* ── 页面容器 ───────────────────────────────────────── */
.supplier-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 搜索栏 ─────────────────────────────────────────── */
.filter-card {
  background: #fff;
  border-radius: var(--border-radius-large);
  padding: 16px 20px;
  box-shadow: var(--box-shadow-card);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-input,
.filter-select {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  color: var(--text-primary);
  background: #fff;
  outline: none;
  font-family: inherit;
  transition: var(--transition-fast);
  box-sizing: border-box;
}

.filter-input        { width: 240px; }
.filter-select       { width: 130px; }
.filter-input::placeholder { color: var(--text-placeholder); }

.filter-input:focus,
.filter-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19, 194, 194, .1);
}

.filter-btns { display: flex; gap: 8px; }

/* ── 操作栏 ─────────────────────────────────────────── */
.action-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* ── 状态区 ─────────────────────────────────────────── */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  gap: 12px;
}

.mini-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.state-text { color: var(--text-secondary); font-size: 14px; }
.error-icon { font-size: 40px; margin: 0; line-height: 1; }
.error-msg  { color: var(--danger-color); font-size: 14px; margin: 0; text-align: center; }

.retry-btn {
  padding: 8px 24px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}
.retry-btn:hover { background: var(--primary-dark); }

/* ── PC 表格 ────────────────────────────────────────── */
.table-wrap {
  background: #fff;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  overflow-x: auto;
}

.supplier-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.supplier-table th {
  background: #f4fdfd;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-lighter);
  white-space: nowrap;
}

.supplier-table td {
  padding: 11px 16px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-extra-light);
  vertical-align: middle;
}

.supplier-table tbody tr:last-child td { border-bottom: none; }
.supplier-table tbody tr:hover { background: #f9fefe; }

.bold-cell  { font-weight: 600; }
.mono       { font-family: 'Courier New', monospace; font-size: 13px; color: var(--text-secondary); }
.dim        { color: var(--text-secondary); }
.addr-cell  { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.remark-cell { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── 标签 ───────────────────────────────────────────── */
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-on  { background: rgba(82, 196, 26, .1);   color: var(--success-color); }
.status-off { background: rgba(144, 147, 153, .1); color: var(--info-color); }

/* ── 操作按钮 ───────────────────────────────────────── */
.op-cell { white-space: nowrap; }

.op-btn {
  padding: 4px 12px;
  border: none;
  border-radius: var(--border-radius-small);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: inherit;
}

.op-edit       { background: rgba(19, 194, 194, .1); color: var(--primary-color); margin-right: 6px; }
.op-edit:hover { background: rgba(19, 194, 194, .22); }
.op-del        { background: rgba(255, 77, 79, .08);  color: var(--danger-color); }
.op-del:hover  { background: rgba(255, 77, 79, .18); }

/* ── 手机端卡片 ─────────────────────────────────────── */
.card-list {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.supplier-card {
  background: #fff;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  overflow: hidden;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border-extra-light);
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-body { padding: 0 16px; }

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-extra-light);
  font-size: 13px;
  gap: 8px;
}
.card-row:last-child { border-bottom: none; }
.card-key  { color: var(--text-secondary); flex-shrink: 0; }
.card-addr { text-align: right; color: var(--text-primary); word-break: break-all; }

.card-footer {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--border-lighter);
}

/* ── 分页 ───────────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 4px;
}

.pg-info { font-size: 13px; color: var(--text-secondary); }
.pg-btns { display: flex; align-items: center; gap: 8px; }

.pg-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  background: #fff;
  color: var(--text-regular);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: inherit;
}

.pg-btn:disabled             { opacity: .4; cursor: not-allowed; }
.pg-btn:not(:disabled):hover { border-color: var(--primary-color); color: var(--primary-color); }
.pg-cur { font-size: 13px; color: var(--text-primary); min-width: 56px; text-align: center; }

/* ── 表单弹窗 ───────────────────────────────────────── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-item-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.req { color: var(--danger-color); }

.form-input,
.form-select,
.form-textarea {
  padding: 0 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  color: var(--text-primary);
  background: #fff;
  outline: none;
  font-family: inherit;
  transition: var(--transition-fast);
  box-sizing: border-box;
  width: 100%;
}

.form-input,
.form-select { height: 38px; }

.form-textarea {
  padding: 8px 12px;
  resize: vertical;
  min-height: 76px;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19, 194, 194, .1);
}

.form-input::placeholder,
.form-textarea::placeholder { color: var(--text-placeholder); }

.item-error .form-input { border-color: var(--danger-color); }
.err-tip { font-size: 12px; color: var(--danger-color); margin-top: 4px; }

/* ── 响应式 ─────────────────────────────────────────── */
@media (max-width: 767px) {
  .table-wrap { display: none; }
  .card-list  { display: flex; }

  .filter-input,
  .filter-select { width: 100%; flex: 1 1 140px; }

  .form-grid { grid-template-columns: 1fr; }
  .form-item-full { grid-column: 1; }

  .pagination { flex-direction: column; gap: 10px; }
}
</style>
