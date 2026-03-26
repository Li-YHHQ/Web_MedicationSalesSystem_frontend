<template>
  <div class="stockout-page">

    <!-- ===== 筛选栏 ===== -->
    <div class="filter-card">
      <div class="filter-row">
        <select v-model="filter.drugId" class="filter-select filter-select--wide">
          <option value="">全部药品</option>
          <option v-for="d in drugOptions" :key="d.id" :value="String(d.id)">
            {{ d.drugName }}{{ d.spec ? `（${d.spec}）` : '' }}
          </option>
        </select>
        <select v-model="filter.outType" class="filter-select">
          <option value="">全部类型</option>
          <option value="1">销售</option>
          <option value="2">损耗</option>
          <option value="3">退货</option>
        </select>
        <input v-model="filter.startDate" type="date" class="filter-input" />
        <input v-model="filter.endDate" type="date" class="filter-input" />
        <div class="filter-btns">
          <BaseButton size="small" @click="handleSearch">搜索</BaseButton>
          <BaseButton size="small" type="secondary" @click="handleReset">重置</BaseButton>
        </div>
      </div>
    </div>

    <!-- ===== 操作栏 ===== -->
    <div class="action-bar">
      <BaseButton size="small" @click="openCreate">＋ 新增出库</BaseButton>
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
    <EmptyState v-else-if="list.length === 0" text="暂无出库记录" icon="📤" />

    <!-- ===== 内容区 ===== -->
    <template v-else>

      <!-- PC 表格 -->
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>药品名称</th>
              <th>规格</th>
              <th>批次号</th>
              <th>有效期</th>
              <th>出库类型</th>
              <th>数量</th>
              <th>零售价</th>
              <th>成本价</th>
              <th>销售总额</th>
              <th>操作人</th>
              <th>出库时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in list" :key="row.id">
              <td class="bold-cell">{{ row.drugName }}</td>
              <td class="dim">{{ row.drugSpec || '—' }}</td>
              <td class="mono">{{ row.batchNo || '—' }}</td>
              <td>{{ formatDate(row.expireDate) }}</td>
              <td>
                <span class="type-tag" :class="outTypeClass(row.outType)">
                  {{ row.outTypeName || outTypeLabel(row.outType) }}
                </span>
              </td>
              <td class="num-cell">{{ row.quantity }}</td>
              <td class="price">{{ formatMoney(row.retailPrice) }}</td>
              <td class="price dim">{{ formatMoney(row.costPrice) }}</td>
              <td class="price primary-price">{{ formatMoney(row.totalAmount) }}</td>
              <td class="dim">{{ row.operatorUsername || '—' }}</td>
              <td class="dim">{{ formatDateTime(row.createTime) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手机端卡片 -->
      <div class="card-list">
        <div v-for="row in list" :key="row.id" class="data-card">
          <div class="card-top">
            <span class="card-name">{{ row.drugName }}</span>
            <span class="type-tag" :class="outTypeClass(row.outType)">
              {{ row.outTypeName || outTypeLabel(row.outType) }}
            </span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-key">批次号</span>
              <span class="mono">{{ row.batchNo || '—' }}</span>
            </div>
            <div class="card-row">
              <span class="card-key">数量</span>
              <span>{{ row.quantity }}</span>
            </div>
            <div class="card-row">
              <span class="card-key">销售总额</span>
              <span class="primary-price">{{ formatMoney(row.totalAmount) }}</span>
            </div>
            <div class="card-row">
              <span class="card-key">出库时间</span>
              <span class="dim">{{ formatDateTime(row.createTime) }}</span>
            </div>
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

    <!-- ===== 新增出库弹窗 ===== -->
    <BaseModal
      v-model:visible="modalVisible"
      title="新增出库"
      size="large"
      @close="resetForm"
    >
      <div class="stock-form">
        <div class="form-grid">

          <!-- 药品选择 -->
          <div class="form-item form-item--full" :class="{ 'item-error': formErrors.drugId }">
            <label class="form-label">药品 <span class="req">*</span></label>
            <select v-model="form.drugId" class="form-select" @change="onDrugChange">
              <option value="">请选择药品</option>
              <option v-for="d in drugOptions" :key="d.id" :value="String(d.id)">
                {{ d.drugName }}{{ d.spec ? `（${d.spec}）` : '' }}
              </option>
            </select>
            <span v-if="formErrors.drugId" class="err-tip">{{ formErrors.drugId }}</span>
          </div>

          <!-- 批次选择 -->
          <div class="form-item form-item--full" :class="{ 'item-error': formErrors.batchId }">
            <label class="form-label">批次 <span class="req">*</span></label>
            <div v-if="batchLoading" class="batch-loading">
              <div class="mini-spinner mini-spinner--sm"></div>
              <span>批次加载中...</span>
            </div>
            <select
              v-else
              v-model="form.batchId"
              class="form-select"
              :disabled="!form.drugId || batchList.length === 0"
            >
              <option value="">
                {{ !form.drugId ? '请先选择药品' : batchList.length === 0 ? '暂无可用批次' : '请选择批次' }}
              </option>
              <option v-for="b in batchList" :key="b.id" :value="String(b.id)">
                {{ b.batchNo }} — 效期 {{ formatDate(b.expireDate) }} — 库存 {{ b.quantity }}
              </option>
            </select>
            <span v-if="formErrors.batchId" class="err-tip">{{ formErrors.batchId }}</span>
          </div>

          <!-- 出库类型 -->
          <div class="form-item" :class="{ 'item-error': formErrors.outType }">
            <label class="form-label">出库类型 <span class="req">*</span></label>
            <select v-model="form.outType" class="form-select">
              <option value="">请选择类型</option>
              <option value="1">销售</option>
              <option value="2">损耗</option>
              <option value="3">退货</option>
            </select>
            <span v-if="formErrors.outType" class="err-tip">{{ formErrors.outType }}</span>
          </div>

          <!-- 出库数量 -->
          <div class="form-item" :class="{ 'item-error': formErrors.quantity }">
            <label class="form-label">出库数量 <span class="req">*</span></label>
            <input
              v-model="form.quantity"
              type="number"
              min="1"
              :max="selectedBatchStock"
              step="1"
              class="form-input"
              placeholder="请输入数量"
            />
            <span v-if="formErrors.quantity" class="err-tip">{{ formErrors.quantity }}</span>
          </div>

          <!-- 零售价（仅销售类型显示） -->
          <div
            v-if="form.outType === '1'"
            class="form-item"
            :class="{ 'item-error': formErrors.retailPrice }"
          >
            <label class="form-label">零售价（元） <span class="req">*</span></label>
            <input
              v-model="form.retailPrice"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              placeholder="0.00"
            />
            <span v-if="formErrors.retailPrice" class="err-tip">{{ formErrors.retailPrice }}</span>
          </div>

          <!-- 备注 -->
          <div class="form-item form-item--full">
            <label class="form-label">备注</label>
            <textarea
              v-model="form.remark"
              class="form-textarea"
              rows="2"
              placeholder="选填备注信息"
            ></textarea>
          </div>

          <!-- 总额预览（仅销售类型且有有效值时显示） -->
          <div v-if="calcTotal > 0" class="form-item form-item--full">
            <div class="calc-total">
              预计销售总额：<span class="calc-val">{{ formatMoney(calcTotal) }}</span>
            </div>
          </div>

        </div>
      </div>
      <template #footer>
        <BaseButton type="secondary" @click="closeModal">取消</BaseButton>
        <BaseButton :loading="submitting" @click="submitForm">确认出库</BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  stockApi,
  type StockOutRecord,
  type StockBatch,
  type DrugOption,
  type StockOutForm,
} from '@/api/stock'
import { formatMoney, formatDate, formatDateTime } from '@/utils/format'
import { showSuccess, showError } from '@/utils/toast'

// ── 药品选项 ───────────────────────────────────────────────
const drugOptions = ref<DrugOption[]>([])

async function loadDrugOptions(): Promise<void> {
  try {
    const res = await stockApi.getDrugOptions()
    drugOptions.value = res.data.list
  } catch {
    // 选项加载失败不影响列表显示
  }
}

// ── 列表状态 ──────────────────────────────────────────────
const loading   = ref(false)
const loadError = ref('')
const list      = ref<StockOutRecord[]>([])
const total     = ref(0)
const page      = ref(1)
const PAGE_SIZE = 20

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

const filter = reactive({ drugId: '', outType: '', startDate: '', endDate: '' })

async function loadData(): Promise<void> {
  loading.value   = true
  loadError.value = ''
  try {
    const params: Record<string, unknown> = { page: page.value, size: PAGE_SIZE }
    if (filter.drugId)    params.drugId    = Number(filter.drugId)
    if (filter.outType)   params.outType   = Number(filter.outType)
    if (filter.startDate) params.startDate = filter.startDate
    if (filter.endDate)   params.endDate   = filter.endDate

    const res   = await stockApi.listOut(params)
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
  filter.drugId = ''; filter.outType = ''
  filter.startDate = ''; filter.endDate = ''
  page.value = 1; loadData()
}

function changePage(p: number): void { page.value = p; loadData() }

// ── 出库类型工具 ───────────────────────────────────────────
function outTypeLabel(type: number): string {
  return type === 1 ? '销售' : type === 2 ? '损耗' : type === 3 ? '退货' : '—'
}

function outTypeClass(type: number): string {
  return type === 1 ? 'type-sale' : type === 2 ? 'type-loss' : type === 3 ? 'type-return' : ''
}

// ── 表单状态 ──────────────────────────────────────────────
interface FormState {
  drugId:      string
  batchId:     string
  outType:     string
  quantity:    string
  retailPrice: string
  remark:      string
}

const emptyForm = (): FormState => ({
  drugId: '', batchId: '', outType: '', quantity: '', retailPrice: '', remark: ''
})

const modalVisible = ref(false)
const submitting   = ref(false)
const form         = reactive<FormState>(emptyForm())
const formErrors   = reactive({
  drugId: '', batchId: '', outType: '', quantity: '', retailPrice: ''
})

const batchLoading = ref(false)
const batchList    = ref<StockBatch[]>([])

const selectedBatchStock = computed((): number => {
  if (!form.batchId) return Infinity
  const b = batchList.value.find(x => x.id === Number(form.batchId))
  return b ? b.quantity : Infinity
})

// 计算预计总额（仅销售类型）
const calcTotal = computed((): number => {
  if (form.outType !== '1') return 0
  const q = parseFloat(form.quantity)
  const p = parseFloat(form.retailPrice)
  return q > 0 && p >= 0 ? q * p : 0
})

async function onDrugChange(): Promise<void> {
  form.batchId = ''
  batchList.value = []
  if (!form.drugId) return
  batchLoading.value = true
  try {
    const res = await stockApi.getBatches(Number(form.drugId))
    batchList.value = res.data.filter(b => b.status === 1 && b.quantity > 0)
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '批次加载失败')
  } finally {
    batchLoading.value = false
  }
}

function resetForm(): void {
  Object.assign(form, emptyForm())
  batchList.value = []
  Object.assign(formErrors, { drugId: '', batchId: '', outType: '', quantity: '', retailPrice: '' })
}

function openCreate(): void { resetForm(); modalVisible.value = true }
function closeModal(): void { modalVisible.value = false; resetForm() }

function validate(): boolean {
  formErrors.drugId  = form.drugId  ? '' : '请选择药品'
  formErrors.batchId = form.batchId ? '' : '请选择批次'
  formErrors.outType = form.outType ? '' : '请选择出库类型'

  const qty = parseInt(form.quantity)
  if (!form.quantity || qty < 1) {
    formErrors.quantity = '请填写出库数量（最小为1）'
  } else if (qty > selectedBatchStock.value) {
    formErrors.quantity = `出库数量不能超过批次库存（${selectedBatchStock.value}）`
  } else {
    formErrors.quantity = ''
  }

  if (form.outType === '1') {
    formErrors.retailPrice = (form.retailPrice !== '' && parseFloat(form.retailPrice) >= 0)
      ? '' : '请填写零售价'
  } else {
    formErrors.retailPrice = ''
  }

  return !formErrors.drugId && !formErrors.batchId && !formErrors.outType
    && !formErrors.quantity && !formErrors.retailPrice
}

async function submitForm(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  const data: StockOutForm = {
    drugId:      Number(form.drugId),
    batchId:     Number(form.batchId),
    outType:     Number(form.outType),
    quantity:    parseInt(form.quantity) || 0,
    retailPrice: form.outType === '1' ? parseFloat(form.retailPrice) || 0 : 0,
    remark:      form.remark.trim(),
  }
  try {
    await stockApi.createOut(data)
    showSuccess('出库成功')
    closeModal()
    loadData()
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '出库失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadDrugOptions()
  loadData()
})
</script>

<style scoped>
/* ── 页面容器 ───────────────────────────────────────── */
.stockout-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 筛选栏 ─────────────────────────────────────────── */
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

.filter-select       { width: 130px; }
.filter-select--wide { width: 190px; }
.filter-input        { width: 140px; }

.filter-input:focus,
.filter-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19, 194, 194, .1);
}

.filter-btns { display: flex; gap: 8px; }

/* ── 操作栏 ─────────────────────────────────────────── */
.action-bar { display: flex; gap: 10px; flex-wrap: wrap; }

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

.mini-spinner--sm {
  width: 18px;
  height: 18px;
  border-width: 2px;
  flex-shrink: 0;
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
  font-size: 14px;
}

.data-table th {
  background: #f4fdfd;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-lighter);
}

.data-table td {
  padding: 11px 16px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-extra-light);
  vertical-align: middle;
}

.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #f9fefe; }

.bold-cell     { font-weight: 600; }
.dim           { color: var(--text-secondary); }
.mono          { font-family: 'Courier New', monospace; font-size: 13px; color: var(--text-secondary); }
.price         { font-variant-numeric: tabular-nums; }
.primary-price { color: var(--primary-color); font-weight: 600; }
.num-cell      { font-variant-numeric: tabular-nums; }

/* ── 出库类型标签 ────────────────────────────────────── */
.type-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.type-sale   { background: rgba(82, 196, 26, .1);   color: var(--success-color); }
.type-loss   { background: rgba(250, 140, 22, .12);  color: var(--warning-color); }
.type-return { background: rgba(255, 77, 79, .1);   color: var(--danger-color); }

/* ── 手机端卡片 ─────────────────────────────────────── */
.card-list {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.data-card {
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

.form-item { display: flex; flex-direction: column; }
.form-item--full { grid-column: 1 / -1; }

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
  min-height: 64px;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19, 194, 194, .1);
}

.form-input::placeholder,
.form-textarea::placeholder { color: var(--text-placeholder); }
.form-select:disabled { background: var(--bg-light); color: var(--text-secondary); }

.item-error .form-input,
.item-error .form-select { border-color: var(--danger-color); }
.err-tip { font-size: 12px; color: var(--danger-color); margin-top: 4px; }

.batch-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  color: var(--text-secondary);
  font-size: 14px;
}

.calc-total {
  padding: 10px 16px;
  background: rgba(19, 194, 194, .06);
  border: 1px solid rgba(19, 194, 194, .2);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  color: var(--text-regular);
}

.calc-val {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
  margin-left: 4px;
}

/* ── 响应式 ─────────────────────────────────────────── */
@media (max-width: 767px) {
  .table-wrap { display: none; }
  .card-list  { display: flex; }

  .filter-input,
  .filter-select,
  .filter-select--wide { width: 100%; flex: 1 1 140px; }

  .form-grid { grid-template-columns: 1fr; }
  .form-item--full { grid-column: 1; }

  .pagination { flex-direction: column; gap: 10px; }
}
</style>
