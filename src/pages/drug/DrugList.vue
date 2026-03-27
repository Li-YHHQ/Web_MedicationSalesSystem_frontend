<template>
  <div class="drug-page">

    <!-- ===== 搜索栏 ===== -->
    <div class="filter-card">
      <div class="filter-row">
        <input
          v-model="search.keyword"
          class="filter-input"
          placeholder="药品名称 / 通用名称"
          @keyup.enter="handleSearch"
        />
        <select v-model="search.category" class="filter-select">
          <option value="">全部类别</option>
          <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
        </select>
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
      <BaseButton size="small" @click="openCreate">＋ 新增药品</BaseButton>
      <BaseButton size="small" type="secondary" :loading="importing" @click="triggerImport">
        导入 Excel
      </BaseButton>
      <BaseButton size="small" type="secondary" :loading="exporting" @click="handleExport">
        导出 Excel
      </BaseButton>
      <input
        ref="fileInputEl"
        type="file"
        accept=".xlsx,.xls"
        style="display:none"
        @change="handleImportFile"
      />
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
    <EmptyState v-else-if="list.length === 0" text="暂无药品数据" icon="💊" />

    <!-- ===== 内容区 ===== -->
    <template v-else>

      <!-- PC 表格 -->
      <div class="table-wrap">
        <table class="drug-table">
          <thead>
            <tr>
              <th>药品编码</th>
              <th>药品名称</th>
              <th>通用名称</th>
              <th>规格</th>
              <th>单位</th>
              <th>类别</th>
              <th>成本价</th>
              <th>零售价</th>
              <th>库存下限</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="drug in list" :key="drug.id">
              <td class="mono">{{ drug.drugCode }}</td>
              <td class="bold-cell">{{ drug.drugName }}</td>
              <td class="dim">{{ drug.commonName || '—' }}</td>
              <td>{{ drug.spec || '—' }}</td>
              <td>{{ drug.unit || '—' }}</td>
              <td>
                <span v-if="drug.category" class="category-tag">{{ drug.category }}</span>
                <span v-else class="dim">—</span>
              </td>
              <td class="price">{{ formatMoney(drug.costPrice) }}</td>
              <td class="price primary-price">{{ formatMoney(drug.retailPrice) }}</td>
              <td>{{ drug.stockMin }}</td>
              <td>
                <span class="status-tag" :class="drug.status === 1 ? 'status-on' : 'status-off'">
                  {{ drug.status === 1 ? '正常' : '停用' }}
                </span>
              </td>
              <td class="op-cell">
                <button class="op-btn op-edit" @click="openEdit(drug)">编辑</button>
                <button class="op-btn op-del" @click="confirmDelete(drug)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手机端卡片 -->
      <div class="card-list">
        <div v-for="drug in list" :key="drug.id" class="drug-card">
          <div class="card-top">
            <span class="card-name">{{ drug.drugName }}</span>
            <span class="status-tag" :class="drug.status === 1 ? 'status-on' : 'status-off'">
              {{ drug.status === 1 ? '正常' : '停用' }}
            </span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-key">规格</span>
              <span>{{ drug.spec || '—' }}</span>
            </div>
            <div class="card-row">
              <span class="card-key">成本价</span>
              <span>{{ formatMoney(drug.costPrice) }}</span>
            </div>
            <div class="card-row">
              <span class="card-key">零售价</span>
              <span class="primary-price">{{ formatMoney(drug.retailPrice) }}</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="op-btn op-edit" @click="openEdit(drug)">编辑</button>
            <button class="op-btn op-del" @click="confirmDelete(drug)">删除</button>
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
      :title="isEdit ? '编辑药品' : '新增药品'"
      size="large"
      @close="resetForm"
    >
      <div class="drug-form">
        <div class="form-grid">

          <div class="form-item" :class="{ 'item-error': errors.drugCode }">
            <label class="form-label">药品编码 <span class="req">*</span></label>
            <input
              v-model="form.drugCode"
              class="form-input"
              :class="{ 'input-readonly': isEdit }"
              :readonly="isEdit"
              placeholder="请输入药品编码"
            />
            <span v-if="errors.drugCode" class="err-tip">{{ errors.drugCode }}</span>
          </div>

          <div class="form-item" :class="{ 'item-error': errors.drugName }">
            <label class="form-label">药品名称 <span class="req">*</span></label>
            <input
              v-model="form.drugName"
              class="form-input"
              placeholder="请输入药品名称"
            />
            <span v-if="errors.drugName" class="err-tip">{{ errors.drugName }}</span>
          </div>

          <div class="form-item">
            <label class="form-label">通用名称</label>
            <input v-model="form.commonName" class="form-input" placeholder="请输入通用名称" />
          </div>

          <div class="form-item">
            <label class="form-label">类别</label>
            <input
              v-model="form.category"
              class="form-input"
              placeholder="请输入或选择类别"
              list="drug-category-datalist"
            />
            <datalist id="drug-category-datalist">
              <option v-for="c in categoryOptions" :key="c" :value="c" />
            </datalist>
          </div>

          <div class="form-item">
            <label class="form-label">单位</label>
            <input v-model="form.unit" class="form-input" placeholder="如：盒、瓶、片" />
          </div>

          <div class="form-item">
            <label class="form-label">规格</label>
            <input v-model="form.spec" class="form-input" placeholder="如：100mg×24片" />
          </div>

          <div class="form-item">
            <label class="form-label">生产厂家</label>
            <input v-model="form.manufacturer" class="form-input" placeholder="请输入生产厂家" />
          </div>

          <div class="form-item">
            <label class="form-label">批准文号</label>
            <input v-model="form.approvalNo" class="form-input" placeholder="如：国药准字H12345678" />
          </div>

          <div class="form-item">
            <label class="form-label">条码</label>
            <input v-model="form.barcode" class="form-input" placeholder="请输入条码" />
          </div>

          <div class="form-item">
            <label class="form-label">成本价（元）</label>
            <input
              v-model="form.costPrice"
              class="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div class="form-item">
            <label class="form-label">零售价（元）</label>
            <input
              v-model="form.retailPrice"
              class="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div class="form-item">
            <label class="form-label">库存下限</label>
            <input
              v-model="form.stockMin"
              class="form-input"
              type="number"
              min="0"
              step="1"
              placeholder="0"
            />
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
        <BaseButton type="secondary" @click="closeModal">取消</BaseButton>
        <BaseButton :loading="submitting" @click="submitForm">
          {{ isEdit ? '保 存' : '新 增' }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- ===== 删除确认 ===== -->
    <ConfirmDialog
      v-model:visible="deleteVisible"
      title="删除药品"
      :content="`确定要删除「${deletingDrug?.drugName ?? ''}」吗？此操作不可撤销。`"
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
import { drugApi, exportDrugExcel, type Drug, type DrugFormData } from '@/api/drug'
import { formatMoney } from '@/utils/format'
import { showSuccess, showError } from '@/utils/toast'

// ── 列表状态 ──────────────────────────────────────────────
const loading    = ref(false)
const loadError  = ref('')
const list       = ref<Drug[]>([])
const total      = ref(0)
const page       = ref(1)
const PAGE_SIZE  = 20

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

// 从已加载数据动态收集类别（持久化，防止过滤后丢失）
const categorySet     = ref(new Set<string>())
const categoryOptions = computed(() =>
  Array.from(categorySet.value).filter(Boolean).sort()
)

// ── 搜索条件 ──────────────────────────────────────────────
const search = reactive({ keyword: '', category: '', status: '' })

async function loadData(): Promise<void> {
  loading.value   = true
  loadError.value = ''
  try {
    const params: Record<string, unknown> = { page: page.value, size: PAGE_SIZE }
    if (search.keyword.trim()) params.keyword  = search.keyword.trim()
    if (search.category)       params.category = search.category
    if (search.status !== '')  params.status   = Number(search.status)

    const res = await drugApi.list(params)
    list.value  = res.data.list
    total.value = res.data.total
    res.data.list.forEach(d => { if (d.category) categorySet.value.add(d.category) })
  } catch (e: unknown) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function handleSearch(): void { page.value = 1; loadData() }

function handleReset(): void {
  search.keyword = ''; search.category = ''; search.status = ''
  page.value = 1; loadData()
}

function changePage(p: number): void { page.value = p; loadData() }

// ── 表单 ──────────────────────────────────────────────────
interface FormState {
  drugCode: string; drugName: string; commonName: string; category: string
  unit: string; spec: string; manufacturer: string; approvalNo: string
  barcode: string; costPrice: string; retailPrice: string; stockMin: string
  status: number
}

const emptyForm = (): FormState => ({
  drugCode: '', drugName: '', commonName: '', category: '',
  unit: '', spec: '', manufacturer: '', approvalNo: '',
  barcode: '', costPrice: '', retailPrice: '', stockMin: '',
  status: 1
})

const modalVisible = ref(false)
const isEdit       = ref(false)
const submitting   = ref(false)
const editId       = ref<number | null>(null)
const form         = reactive<FormState>(emptyForm())
const errors       = reactive({ drugCode: '', drugName: '' })

function resetForm(): void {
  Object.assign(form, emptyForm())
  errors.drugCode = ''; errors.drugName = ''
}

function closeModal(): void { modalVisible.value = false; resetForm() }

function openCreate(): void {
  isEdit.value = false; editId.value = null
  resetForm(); modalVisible.value = true
}

function openEdit(drug: Drug): void {
  isEdit.value = true; editId.value = drug.id
  Object.assign(form, {
    drugCode:     drug.drugCode,
    drugName:     drug.drugName,
    commonName:   drug.commonName   ?? '',
    category:     drug.category     ?? '',
    unit:         drug.unit         ?? '',
    spec:         drug.spec         ?? '',
    manufacturer: drug.manufacturer ?? '',
    approvalNo:   drug.approvalNo   ?? '',
    barcode:      drug.barcode      ?? '',
    costPrice:    String(drug.costPrice),
    retailPrice:  String(drug.retailPrice),
    stockMin:     String(drug.stockMin),
    status:       drug.status
  })
  errors.drugCode = ''; errors.drugName = ''
  modalVisible.value = true
}

function validate(): boolean {
  errors.drugCode = form.drugCode.trim() ? '' : '请输入药品编码'
  errors.drugName = form.drugName.trim() ? '' : '请输入药品名称'
  return !errors.drugCode && !errors.drugName
}

async function submitForm(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  const data: DrugFormData = {
    drugCode:     form.drugCode.trim(),
    drugName:     form.drugName.trim(),
    commonName:   form.commonName.trim(),
    category:     form.category.trim(),
    unit:         form.unit.trim(),
    spec:         form.spec.trim(),
    manufacturer: form.manufacturer.trim(),
    approvalNo:   form.approvalNo.trim(),
    barcode:      form.barcode.trim(),
    costPrice:    parseFloat(form.costPrice)  || 0,
    retailPrice:  parseFloat(form.retailPrice) || 0,
    stockMin:     parseInt(form.stockMin)      || 0,
    status:       form.status
  }
  try {
    if (isEdit.value && editId.value !== null) {
      await drugApi.update(editId.value, data)
      showSuccess('更新成功')
    } else {
      await drugApi.create(data)
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
const deleteVisible = ref(false)
const deletingDrug  = ref<Drug | null>(null)

function confirmDelete(drug: Drug): void {
  deletingDrug.value = drug; deleteVisible.value = true
}

async function doDelete(): Promise<void> {
  if (!deletingDrug.value) return
  try {
    await drugApi.remove(deletingDrug.value.id)
    showSuccess('删除成功')
    deletingDrug.value = null
    if (list.value.length === 1 && page.value > 1) page.value--
    loadData()
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '删除失败')
  }
}

// ── 导入 ──────────────────────────────────────────────────
const fileInputEl = ref<HTMLInputElement | null>(null)
const importing   = ref(false)

function triggerImport(): void { fileInputEl.value?.click() }

async function handleImportFile(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  if (!file) return
  input.value = ''   // 允许重复选同一文件
  importing.value = true
  try {
    await drugApi.importExcel(file)
    showSuccess('导入成功')
    loadData()
  } catch (err: unknown) {
    showError(err instanceof Error ? err.message : '导入失败')
  } finally {
    importing.value = false
  }
}

// ── 导出 ──────────────────────────────────────────────────
const exporting = ref(false)

async function handleExport(): Promise<void> {
  exporting.value = true
  try {
    await exportDrugExcel()
    showSuccess('导出成功')
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
/* ── 页面容器 ───────────────────────────────────────── */
.drug-page {
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

.filter-input        { width: 210px; }
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

.drug-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
  font-size: 14px;
}

.drug-table th {
  background: #f4fdfd;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-lighter);
}

.drug-table td {
  padding: 11px 16px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-extra-light);
  vertical-align: middle;
}

.drug-table tbody tr:last-child td { border-bottom: none; }
.drug-table tbody tr:hover { background: #f9fefe; }

.mono        { font-family: 'Courier New', monospace; font-size: 13px; color: var(--text-secondary); }
.bold-cell   { font-weight: 600; }
.dim         { color: var(--text-secondary); }
.price       { font-variant-numeric: tabular-nums; }
.primary-price { color: var(--primary-color); font-weight: 600; }

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

.category-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(19, 194, 194, .1);
  color: var(--primary-color);
  border-radius: var(--border-radius-small);
  font-size: 12px;
}

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

.op-edit                { background: rgba(19, 194, 194, .1); color: var(--primary-color); margin-right: 6px; }
.op-edit:hover          { background: rgba(19, 194, 194, .22); }
.op-del                 { background: rgba(255, 77, 79, .08);  color: var(--danger-color); }
.op-del:hover           { background: rgba(255, 77, 79, .18); }

/* ── 手机端卡片 ─────────────────────────────────────── */
.card-list {
  display: none;          /* PC 端隐藏 */
  flex-direction: column;
  gap: 12px;
}

.drug-card {
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
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-extra-light);
  font-size: 13px;
}
.card-row:last-child { border-bottom: none; }
.card-key { color: var(--text-secondary); }

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

.pg-btn:disabled                { opacity: .4; cursor: not-allowed; }
.pg-btn:not(:disabled):hover    { border-color: var(--primary-color); color: var(--primary-color); }
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

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.req { color: var(--danger-color); }

.form-input,
.form-select {
  height: 38px;
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

.form-input:focus,
.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19, 194, 194, .1);
}

.form-input::placeholder { color: var(--text-placeholder); }

.input-readonly {
  background: var(--bg-light);
  color: var(--text-secondary);
  cursor: default;
}

.item-error .form-input { border-color: var(--danger-color); }
.err-tip { font-size: 12px; color: var(--danger-color); margin-top: 4px; }

/* ── 响应式 ─────────────────────────────────────────── */
@media (max-width: 767px) {
  /* 隐藏表格，显示卡片 */
  .table-wrap { display: none; }
  .card-list  { display: flex; }

  /* 搜索栏 */
  .filter-input,
  .filter-select { width: 100%; flex: 1 1 140px; }

  /* 表单 */
  .form-grid { grid-template-columns: 1fr; }

  /* 分页 */
  .pagination { flex-direction: column; gap: 10px; }
}
</style>
