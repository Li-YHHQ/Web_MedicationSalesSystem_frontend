<template>
  <div class="stockin-page">

    <!-- ===== Tab 切换栏 ===== -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'records' }"
        @click="switchTab('records')"
      >
        📋 入库记录
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'warnings' }"
        @click="switchTab('warnings')"
      >
        ⚠️ 预警信息
      </button>
    </div>

    <!-- ========================================================
         Tab 1：入库记录
    ========================================================= -->
    <div v-show="activeTab === 'records'" class="tab-content">

      <!-- 筛选栏 -->
      <div class="filter-card">
        <div class="filter-row">
          <select v-model="recFilter.drugId" class="filter-select filter-select--wide">
            <option value="">全部药品</option>
            <option v-for="d in drugOptions" :key="d.id" :value="String(d.id)">
              {{ d.drugName }}{{ d.spec ? `（${d.spec}）` : '' }}
            </option>
          </select>
          <select v-model="recFilter.supplierId" class="filter-select">
            <option value="">全部供应商</option>
            <option v-for="s in supplierOptions" :key="s.id" :value="String(s.id)">
              {{ s.name }}
            </option>
          </select>
          <input
            v-model="recFilter.startDate"
            type="date"
            class="filter-input"
            placeholder="开始日期"
          />
          <input
            v-model="recFilter.endDate"
            type="date"
            class="filter-input"
            placeholder="结束日期"
          />
          <div class="filter-btns">
            <BaseButton size="small" @click="searchRecords">搜索</BaseButton>
            <BaseButton size="small" type="secondary" @click="resetRecords">重置</BaseButton>
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <BaseButton size="small" @click="openCreate">＋ 新增入库</BaseButton>
      </div>

      <!-- 加载中 -->
      <div v-if="recLoading" class="state-center">
        <div class="mini-spinner"></div>
        <span class="state-text">加载中...</span>
      </div>

      <!-- 加载失败 -->
      <div v-else-if="recError" class="state-center">
        <p class="error-icon">⚠️</p>
        <p class="error-msg">{{ recError }}</p>
        <button class="retry-btn" @click="loadRecords">重新加载</button>
      </div>

      <!-- 空数据 -->
      <EmptyState v-else-if="recList.length === 0" text="暂无入库记录" icon="📦" />

      <!-- 内容区 -->
      <template v-else>
        <!-- PC 表格 -->
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>药品名称</th>
                <th>批次号</th>
                <th>有效期</th>
                <th>入库数量</th>
                <th>进价</th>
                <th>入库总额</th>
                <th>供应商</th>
                <th>操作人</th>
                <th>入库时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in recList" :key="row.id">
                <td class="bold-cell">{{ row.drugName }}</td>
                <td class="mono">{{ row.batchNo || '—' }}</td>
                <td>{{ formatDate(row.expireDate) }}</td>
                <td class="num-cell">{{ row.quantity }}</td>
                <td class="price">{{ formatMoney(row.costPrice) }}</td>
                <td class="price primary-price">{{ formatMoney(row.totalAmount) }}</td>
                <td class="dim">{{ row.supplierName || '—' }}</td>
                <td class="dim">{{ row.operatorUsername || '—' }}</td>
                <td class="dim">{{ formatDateTime(row.createTime) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手机端卡片 -->
        <div class="card-list">
          <div v-for="row in recList" :key="row.id" class="data-card">
            <div class="card-top">
              <span class="card-name">{{ row.drugName }}</span>
              <span class="card-amount">{{ formatMoney(row.totalAmount) }}</span>
            </div>
            <div class="card-body">
              <div class="card-row">
                <span class="card-key">批次号</span>
                <span class="mono">{{ row.batchNo || '—' }}</span>
              </div>
              <div class="card-row">
                <span class="card-key">有效期</span>
                <span>{{ formatDate(row.expireDate) }}</span>
              </div>
              <div class="card-row">
                <span class="card-key">数量</span>
                <span>{{ row.quantity }}</span>
              </div>
              <div class="card-row">
                <span class="card-key">入库时间</span>
                <span class="dim">{{ formatDateTime(row.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <span class="pg-info">共 {{ recTotal }} 条</span>
          <div class="pg-btns">
            <button class="pg-btn" :disabled="recPage <= 1" @click="changeRecPage(recPage - 1)">
              ‹ 上一页
            </button>
            <span class="pg-cur">{{ recPage }} / {{ recTotalPages }}</span>
            <button class="pg-btn" :disabled="recPage >= recTotalPages" @click="changeRecPage(recPage + 1)">
              下一页 ›
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- ========================================================
         Tab 2：预警信息
    ========================================================= -->
    <div v-show="activeTab === 'warnings'" class="tab-content">

      <!-- ─── 区域 1：即将过期 ─── -->
      <div class="warning-section">
        <div class="warning-header">
          <h3 class="warning-title">⏰ 即将过期</h3>
          <div class="expire-query">
            <span class="expire-label">查询</span>
            <input
              v-model.number="expireDays"
              type="number"
              min="1"
              max="365"
              class="days-input"
            />
            <span class="expire-label">天内即将过期</span>
            <BaseButton size="small" :loading="expireLoading" @click="loadExpiring">查询</BaseButton>
          </div>
        </div>

        <div v-if="expireLoading" class="state-center state-center--sm">
          <div class="mini-spinner"></div>
        </div>
        <EmptyState v-else-if="expireList.length === 0" text="暂无即将过期药品" icon="✅" />
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>药品名称</th>
                <th>批次号</th>
                <th>有效期</th>
                <th>剩余天数</th>
                <th>库存数量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in expireList" :key="item.id">
                <td class="bold-cell">{{ item.drugName }}</td>
                <td class="mono">{{ item.batchNo }}</td>
                <td>{{ formatDate(item.expireDate) }}</td>
                <td>
                  <span class="days-badge" :class="daysClass(item.daysLeft)">
                    {{ item.daysLeft }} 天
                  </span>
                </td>
                <td class="num-cell">{{ item.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── 区域 2：库存不足 ─── -->
      <div class="warning-section">
        <div class="warning-header">
          <h3 class="warning-title">📉 库存不足</h3>
          <BaseButton size="small" type="secondary" :loading="lowLoading" @click="loadLow">
            刷新
          </BaseButton>
        </div>

        <div v-if="lowLoading" class="state-center state-center--sm">
          <div class="mini-spinner"></div>
        </div>
        <EmptyState v-else-if="lowList.length === 0" text="暂无库存不足药品" icon="✅" />
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>药品名称</th>
                <th>批次号</th>
                <th>当前库存</th>
                <th>最低库存</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowList" :key="item.id">
                <td class="bold-cell">{{ item.drugName }}</td>
                <td class="mono">{{ item.batchNo }}</td>
                <td>
                  <span class="low-stock-val">{{ item.quantity }}</span>
                </td>
                <td class="dim">{{ item.stockMin }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================
         新增入库弹窗
    ========================================================= -->
    <BaseModal
      v-model:visible="modalVisible"
      title="新增入库"
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

          <!-- 批次号 -->
          <div class="form-item">
            <label class="form-label">批次号</label>
            <input v-model="form.batchNo" class="form-input" placeholder="请输入批次号" />
          </div>

          <!-- 生产日期 -->
          <div class="form-item">
            <label class="form-label">生产日期</label>
            <input v-model="form.produceDate" type="date" class="form-input" />
          </div>

          <!-- 有效期 -->
          <div class="form-item" :class="{ 'item-error': formErrors.expireDate }">
            <label class="form-label">有效期 <span class="req">*</span></label>
            <input v-model="form.expireDate" type="date" class="form-input" />
            <span v-if="formErrors.expireDate" class="err-tip">{{ formErrors.expireDate }}</span>
          </div>

          <!-- 入库日期 -->
          <div class="form-item">
            <label class="form-label">入库日期</label>
            <input v-model="form.stockInDate" type="date" class="form-input" />
          </div>

          <!-- 入库数量 -->
          <div class="form-item" :class="{ 'item-error': formErrors.quantity }">
            <label class="form-label">入库数量 <span class="req">*</span></label>
            <input
              v-model="form.quantity"
              type="number"
              min="1"
              step="1"
              class="form-input"
              placeholder="请输入数量"
            />
            <span v-if="formErrors.quantity" class="err-tip">{{ formErrors.quantity }}</span>
          </div>

          <!-- 进价 -->
          <div class="form-item" :class="{ 'item-error': formErrors.costPrice }">
            <label class="form-label">进价（元） <span class="req">*</span></label>
            <input
              v-model="form.costPrice"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              placeholder="0.00"
            />
            <span v-if="formErrors.costPrice" class="err-tip">{{ formErrors.costPrice }}</span>
          </div>

          <!-- 供应商 -->
          <div class="form-item">
            <label class="form-label">供应商</label>
            <select v-model="form.supplierId" class="form-select">
              <option value="">请选择供应商</option>
              <option v-for="s in supplierOptions" :key="s.id" :value="String(s.id)">
                {{ s.name }}
              </option>
            </select>
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

          <!-- 小计预览 -->
          <div v-if="calcTotal > 0" class="form-item form-item--full">
            <div class="calc-total">
              入库总额预计：<span class="calc-val">{{ formatMoney(calcTotal) }}</span>
            </div>
          </div>

        </div>
      </div>
      <template #footer>
        <BaseButton type="secondary" @click="closeModal">取消</BaseButton>
        <BaseButton :loading="submitting" @click="submitForm">确认入库</BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  stockApi,
  type StockInRecord,
  type ExpireItem,
  type LowStockItem,
  type DrugOption,
  type SupplierOption,
  type StockInForm,
} from '@/api/stock'
import { formatMoney, formatDate, formatDateTime } from '@/utils/format'
import { showSuccess, showError } from '@/utils/toast'

// ── 全局选项（药品 + 供应商） ──────────────────────────────
const drugOptions     = ref<DrugOption[]>([])
const supplierOptions = ref<SupplierOption[]>([])

async function loadOptions(): Promise<void> {
  const [drugsRes, suppliersRes] = await Promise.allSettled([
    stockApi.getDrugOptions(),
    stockApi.getSupplierOptions(),
  ])
  if (drugsRes.status === 'fulfilled') drugOptions.value     = drugsRes.value.data.list
  if (suppliersRes.status === 'fulfilled') supplierOptions.value = suppliersRes.value.data
}

// ── Tab 切换 ───────────────────────────────────────────────
const activeTab      = ref<'records' | 'warnings'>('records')
const warningsLoaded = ref(false)

function switchTab(tab: 'records' | 'warnings'): void {
  activeTab.value = tab
  if (tab === 'warnings' && !warningsLoaded.value) {
    loadExpiring()
    loadLow()
    warningsLoaded.value = true
  }
}

// ── Tab1 入库记录 ──────────────────────────────────────────
const recLoading = ref(false)
const recError   = ref('')
const recList    = ref<StockInRecord[]>([])
const recTotal   = ref(0)
const recPage    = ref(1)
const PAGE_SIZE  = 20

const recTotalPages = computed(() => Math.max(1, Math.ceil(recTotal.value / PAGE_SIZE)))

const recFilter = reactive({
  drugId:      '',
  supplierId:  '',
  startDate:   '',
  endDate:     '',
})

async function loadRecords(): Promise<void> {
  recLoading.value = true
  recError.value   = ''
  try {
    const params: Record<string, unknown> = { page: recPage.value, size: PAGE_SIZE }
    if (recFilter.drugId)     params.drugId     = Number(recFilter.drugId)
    if (recFilter.supplierId) params.supplierId = Number(recFilter.supplierId)
    if (recFilter.startDate)  params.startDate  = recFilter.startDate
    if (recFilter.endDate)    params.endDate    = recFilter.endDate

    const res = await stockApi.list(params)
    recList.value  = res.data.list
    recTotal.value = res.data.total
  } catch (e: unknown) {
    recError.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    recLoading.value = false
  }
}

function searchRecords(): void { recPage.value = 1; loadRecords() }

function resetRecords(): void {
  recFilter.drugId = ''; recFilter.supplierId = ''
  recFilter.startDate = ''; recFilter.endDate = ''
  recPage.value = 1; loadRecords()
}

function changeRecPage(p: number): void { recPage.value = p; loadRecords() }

// ── Tab1 新增入库表单 ──────────────────────────────────────
interface FormState {
  drugId:      string
  batchNo:     string
  produceDate: string
  expireDate:  string
  stockInDate: string
  quantity:    string
  costPrice:   string
  supplierId:  string
  remark:      string
}

const today = new Date().toISOString().slice(0, 10)

const emptyForm = (): FormState => ({
  drugId:      '',
  batchNo:     '',
  produceDate: '',
  expireDate:  '',
  stockInDate: today,
  quantity:    '',
  costPrice:   '',
  supplierId:  '',
  remark:      '',
})

const modalVisible = ref(false)
const submitting   = ref(false)
const form         = reactive<FormState>(emptyForm())
const formErrors   = reactive({ drugId: '', expireDate: '', quantity: '', costPrice: '' })

// 实时计算入库总额预览
const calcTotal = computed(() => {
  const q = parseFloat(form.quantity)
  const p = parseFloat(form.costPrice)
  return q > 0 && p >= 0 ? q * p : 0
})

// 选择药品时自动回填进价
function onDrugChange(): void {
  if (!form.drugId) return
  const drug = drugOptions.value.find(d => d.id === Number(form.drugId))
  if (drug && drug.costPrice != null) {
    form.costPrice = String(drug.costPrice)
  }
}

function resetForm(): void {
  Object.assign(form, emptyForm())
  formErrors.drugId = ''; formErrors.expireDate = ''
  formErrors.quantity = ''; formErrors.costPrice = ''
}

function openCreate(): void { resetForm(); modalVisible.value = true }
function closeModal(): void { modalVisible.value = false; resetForm() }

function validate(): boolean {
  formErrors.drugId     = form.drugId     ? '' : '请选择药品'
  formErrors.expireDate = form.expireDate ? '' : '请填写有效期'
  formErrors.quantity   = (form.quantity && parseInt(form.quantity) >= 1)
    ? '' : '请填写入库数量（最小为1）'
  formErrors.costPrice  = (form.costPrice !== '' && parseFloat(form.costPrice) >= 0)
    ? '' : '请填写进价'
  return !formErrors.drugId && !formErrors.expireDate
      && !formErrors.quantity && !formErrors.costPrice
}

async function submitForm(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  const data: StockInForm = {
    drugId:      Number(form.drugId),
    batchNo:     form.batchNo.trim(),
    produceDate: form.produceDate,
    expireDate:  form.expireDate,
    stockInDate: form.stockInDate,
    quantity:    parseInt(form.quantity) || 0,
    costPrice:   parseFloat(form.costPrice) || 0,
    supplierId:  form.supplierId ? Number(form.supplierId) : null,
    remark:      form.remark.trim(),
  }
  try {
    await stockApi.create(data)
    showSuccess('入库成功')
    closeModal()
    loadRecords()
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '入库失败')
  } finally {
    submitting.value = false
  }
}

// ── Tab2 即将过期 ──────────────────────────────────────────
const expireDays    = ref(90)
const expireLoading = ref(false)
const expireList    = ref<ExpireItem[]>([])

async function loadExpiring(): Promise<void> {
  expireLoading.value = true
  try {
    const res = await stockApi.getExpiring(expireDays.value)
    expireList.value = res.data
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '加载过期预警失败')
  } finally {
    expireLoading.value = false
  }
}

function daysClass(days: number): string {
  if (days <= 30) return 'days-red'
  if (days <= 60) return 'days-orange'
  return 'days-normal'
}

// ── Tab2 库存不足 ──────────────────────────────────────────
const lowLoading = ref(false)
const lowList    = ref<LowStockItem[]>([])

async function loadLow(): Promise<void> {
  lowLoading.value = true
  try {
    const res = await stockApi.getLow()
    lowList.value = res.data
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '加载库存预警失败')
  } finally {
    lowLoading.value = false
  }
}

// ── 初始化 ─────────────────────────────────────────────────
onMounted(() => {
  loadOptions()
  loadRecords()
})
</script>

<style scoped>
/* ── 页面 ───────────────────────────────────────────────── */
.stockin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Tab 栏 ─────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 4px;
  background: #fff;
  border-radius: var(--border-radius-large);
  padding: 6px;
  box-shadow: var(--box-shadow-card);
  width: fit-content;
}

.tab-btn {
  padding: 8px 24px;
  border: none;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: inherit;
  white-space: nowrap;
}

.tab-btn:hover { color: var(--primary-color); background: rgba(19,194,194,.06); }

.tab-btn--active {
  background: var(--primary-gradient);
  color: #fff;
  box-shadow: 0 2px 8px rgba(19,194,194,.3);
}

/* ── Tab 内容区 ─────────────────────────────────────────── */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 筛选栏 ─────────────────────────────────────────────── */
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

.filter-input           { width: 148px; }
.filter-select          { width: 140px; }
.filter-select--wide    { width: 200px; }

.filter-input:focus,
.filter-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19,194,194,.1);
}

.filter-btns { display: flex; gap: 8px; }

/* ── 操作栏 ─────────────────────────────────────────────── */
.action-bar { display: flex; gap: 10px; flex-wrap: wrap; }

/* ── 状态区 ─────────────────────────────────────────────── */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 36vh;
  gap: 12px;
}

.state-center--sm { min-height: 120px; }

.mini-spinner {
  width: 34px; height: 34px;
  border: 3px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.state-text { color: var(--text-secondary); font-size: 14px; }
.error-icon { font-size: 38px; margin: 0; line-height: 1; }
.error-msg  { color: var(--danger-color); font-size: 14px; margin: 0; }

.retry-btn {
  padding: 8px 24px;
  background: var(--primary-color); color: #fff;
  border: none; border-radius: var(--border-radius-base);
  font-size: 14px; cursor: pointer; font-family: inherit;
}
.retry-btn:hover { background: var(--primary-dark); }

/* ── 表格 ───────────────────────────────────────────────── */
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
  font-size: 13px; font-weight: 600;
  padding: 11px 16px;
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

.bold-cell    { font-weight: 600; }
.mono         { font-family: 'Courier New', monospace; font-size: 13px; color: var(--text-secondary); }
.dim          { color: var(--text-secondary); }
.num-cell     { text-align: right; }
.price        { font-variant-numeric: tabular-nums; }
.primary-price{ color: var(--primary-color); font-weight: 600; }

/* ── 手机卡片 ───────────────────────────────────────────── */
.card-list { display: none; flex-direction: column; gap: 12px; }

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
  padding: 13px 16px 10px;
  border-bottom: 1px solid var(--border-extra-light);
}

.card-name   { font-size: 15px; font-weight: 600; color: var(--text-primary); flex: 1; margin-right: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-amount { font-size: 15px; font-weight: 700; color: var(--primary-color); white-space: nowrap; }

.card-body { padding: 0 16px; }

.card-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 0; border-bottom: 1px solid var(--border-extra-light);
  font-size: 13px;
}
.card-row:last-child { border-bottom: none; }
.card-key { color: var(--text-secondary); }

/* ── 分页 ───────────────────────────────────────────────── */
.pagination {
  display: flex; align-items: center;
  justify-content: space-between; padding: 8px 0 4px;
}

.pg-info { font-size: 13px; color: var(--text-secondary); }
.pg-btns { display: flex; align-items: center; gap: 8px; }

.pg-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  background: #fff; color: var(--text-regular);
  font-size: 13px; cursor: pointer;
  transition: var(--transition-fast);
  font-family: inherit;
}
.pg-btn:disabled { opacity: .4; cursor: not-allowed; }
.pg-btn:not(:disabled):hover { border-color: var(--primary-color); color: var(--primary-color); }
.pg-cur { font-size: 13px; color: var(--text-primary); min-width: 56px; text-align: center; }

/* ── 预警区域 ───────────────────────────────────────────── */
.warning-section {
  background: #fff;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  overflow: hidden;
}

.warning-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-lighter);
}

.warning-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.expire-query {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.expire-label { font-size: 13px; color: var(--text-secondary); }

.days-input {
  width: 72px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
  text-align: center;
  transition: var(--transition-fast);
}
.days-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(19,194,194,.1); }

/* 剩余天数徽章 */
.days-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}
.days-red    { background: rgba(255,77,79,.1);   color: var(--danger-color); }
.days-orange { background: rgba(250,173,20,.1);  color: var(--warning-color); }
.days-normal { background: rgba(82,196,26,.1);   color: var(--success-color); }

/* 库存不足数值 */
.low-stock-val { color: var(--danger-color); font-weight: 700; }

/* ── 表单弹窗 ───────────────────────────────────────────── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.form-item { display: flex; flex-direction: column; }

.form-item--full { grid-column: 1 / -1; }

.form-label {
  font-size: 13px; font-weight: 600;
  color: var(--text-primary); margin-bottom: 6px;
}

.req { color: var(--danger-color); }

.form-input,
.form-select {
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  font-size: 14px; color: var(--text-primary);
  background: #fff; outline: none;
  font-family: inherit;
  transition: var(--transition-fast);
  box-sizing: border-box; width: 100%;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19,194,194,.1);
}

.form-input::placeholder { color: var(--text-placeholder); }

.form-textarea {
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  font-size: 14px; color: var(--text-primary);
  background: #fff; outline: none;
  font-family: inherit; resize: vertical;
  transition: var(--transition-fast);
  width: 100%; box-sizing: border-box;
}
.form-textarea:focus { border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(19,194,194,.1); }
.form-textarea::placeholder { color: var(--text-placeholder); }

.item-error .form-input,
.item-error .form-select { border-color: var(--danger-color); }

.err-tip { font-size: 12px; color: var(--danger-color); margin-top: 4px; }

.calc-total {
  padding: 10px 16px;
  background: rgba(19,194,194,.06);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  color: var(--text-regular);
}
.calc-val { color: var(--primary-color); font-weight: 700; font-size: 16px; }

/* ── 响应式 ─────────────────────────────────────────────── */
@media (max-width: 767px) {
  .table-wrap { display: none; }
  .card-list  { display: flex; }

  .filter-input,
  .filter-select,
  .filter-select--wide { width: 100%; flex: 1 1 140px; }

  .tab-btn { padding: 8px 16px; font-size: 13px; }

  .form-grid { grid-template-columns: 1fr; }

  .pagination { flex-direction: column; gap: 10px; }

  .warning-header { padding: 14px 16px; }

  .expire-query { width: 100%; }
}
</style>
