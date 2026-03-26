<template>
  <div class="finance-page">

    <!-- ===== 顶部筛选栏 ===== -->
    <div class="filter-card">
      <div class="filter-top">
        <!-- 快捷按钮 -->
        <div class="shortcut-btns">
          <button
            v-for="s in shortcuts"
            :key="s.key"
            class="shortcut-btn"
            :class="{ 'shortcut-btn--active': activeShortcut === s.key }"
            @click="applyShortcut(s.key)"
          >
            {{ s.label }}
          </button>
        </div>
        <!-- 同步按钮 -->
        <BaseButton size="small" type="secondary" :loading="syncing" @click="handleSync">
          同步今日数据
        </BaseButton>
      </div>
      <div class="filter-bottom">
        <input v-model="dateRange.start" type="date" class="filter-input" />
        <span class="date-sep">至</span>
        <input v-model="dateRange.end" type="date" class="filter-input" />
        <BaseButton size="small" @click="handleQuery">查询</BaseButton>
      </div>
    </div>

    <!-- ===== 加载中 ===== -->
    <div v-if="loading" class="state-center">
      <div class="mini-spinner"></div>
      <span class="state-text">数据加载中...</span>
    </div>

    <!-- ===== 加载失败 ===== -->
    <div v-else-if="loadError" class="state-center">
      <p class="error-icon">⚠️</p>
      <p class="error-msg">{{ loadError }}</p>
      <button class="retry-btn" @click="loadData">重新加载</button>
    </div>

    <!-- ===== 内容区 ===== -->
    <template v-else-if="summary">

      <!-- ===== 汇总卡片 ===== -->
      <div class="summary-grid">
        <div class="summary-card summary-card--primary">
          <div class="summary-icon">💰</div>
          <div class="summary-body">
            <div class="summary-value">{{ formatMoney(summary.totalSalesAmount) }}</div>
            <div class="summary-label">销售总额</div>
          </div>
        </div>
        <div class="summary-card summary-card--warning">
          <div class="summary-icon">📦</div>
          <div class="summary-body">
            <div class="summary-value">{{ formatMoney(summary.totalCostAmount) }}</div>
            <div class="summary-label">成本总额</div>
          </div>
        </div>
        <div class="summary-card summary-card--success">
          <div class="summary-icon">📈</div>
          <div class="summary-body">
            <div class="summary-value">{{ formatMoney(summary.totalProfitAmount) }}</div>
            <div class="summary-label">利润总额</div>
          </div>
        </div>
        <div class="summary-card summary-card--info">
          <div class="summary-icon">🧾</div>
          <div class="summary-body">
            <div class="summary-value">{{ formatNumber(summary.totalSalesCount) }}</div>
            <div class="summary-label">销售笔数</div>
          </div>
        </div>
      </div>

      <!-- ===== 趋势折线图 ===== -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">收益趋势</span>
          <div class="chart-legend">
            <span class="legend-dot legend-dot--sales"></span>
            <span class="legend-label">销售额</span>
            <span class="legend-dot legend-dot--profit"></span>
            <span class="legend-label">利润</span>
          </div>
        </div>
        <EmptyState v-if="summary.dailyList.length === 0" text="暂无趋势数据" icon="📊" />
        <div v-else class="chart-scroll">
          <svg
            :viewBox="`0 0 ${SVG_W} ${SVG_H}`"
            class="chart-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- Y 轴网格线 + 标签 -->
            <g v-for="(yv, i) in yGridValues" :key="`yg-${i}`">
              <line
                :x1="PAD_L" :y1="toY(yv)"
                :x2="SVG_W - PAD_R" :y2="toY(yv)"
                stroke="#f0f0f0" stroke-width="1"
              />
              <text
                :x="PAD_L - 6" :y="toY(yv)"
                text-anchor="end" dominant-baseline="middle"
                font-size="11" fill="#8c8c8c"
              >{{ yLabel(yv) }}</text>
            </g>

            <!-- X 轴基线 -->
            <line
              :x1="PAD_L" :y1="SVG_H - PAD_B"
              :x2="SVG_W - PAD_R" :y2="SVG_H - PAD_B"
              stroke="#e8e8e8" stroke-width="1"
            />

            <!-- X 轴日期标签 -->
            <text
              v-for="(item, i) in summary.dailyList"
              :key="`xl-${i}`"
              :x="toX(i)" :y="SVG_H - PAD_B + 16"
              text-anchor="middle" font-size="11" fill="#8c8c8c"
            >{{ shortDate(item.statDate) }}</text>

            <!-- 销售额面积填充 -->
            <path :d="salesAreaPath" fill="rgba(19,194,194,0.08)" />
            <!-- 利润面积填充 -->
            <path :d="profitAreaPath" fill="rgba(82,196,26,0.08)" />

            <!-- 销售额折线 -->
            <polyline
              v-if="summary.dailyList.length > 1"
              :points="salesPoints"
              fill="none" stroke="#13C2C2" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round"
            />

            <!-- 利润折线 -->
            <polyline
              v-if="summary.dailyList.length > 1"
              :points="profitPoints"
              fill="none" stroke="#52c41a" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round"
            />

            <!-- 销售额数据点 -->
            <circle
              v-for="(item, i) in summary.dailyList"
              :key="`sd-${i}`"
              :cx="toX(i)" :cy="toY(item.salesAmount)"
              r="5" fill="#fff" stroke="#13C2C2" stroke-width="2"
            />

            <!-- 利润数据点 -->
            <circle
              v-for="(item, i) in summary.dailyList"
              :key="`pd-${i}`"
              :cx="toX(i)" :cy="toY(item.profitAmount)"
              r="5" fill="#fff" stroke="#52c41a" stroke-width="2"
            />
          </svg>
        </div>
      </div>

      <!-- ===== 每日明细表格 ===== -->
      <div class="detail-section">
        <div class="section-header">
          <span class="section-title">每日明细</span>
        </div>

        <EmptyState v-if="summary.dailyList.length === 0" text="暂无明细数据" icon="📋" />

        <template v-else>
          <!-- PC 表格 -->
          <div class="table-wrap">
            <table class="daily-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>销售额</th>
                  <th>成本</th>
                  <th>利润</th>
                  <th>销售笔数</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in summary.dailyList" :key="row.statDate">
                  <td>{{ formatDate(row.statDate) }}</td>
                  <td class="price primary-price">{{ formatMoney(row.salesAmount) }}</td>
                  <td class="price dim">{{ formatMoney(row.costAmount) }}</td>
                  <td class="price success-price">{{ formatMoney(row.profitAmount) }}</td>
                  <td class="num-cell">{{ row.salesCount }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td class="total-label">合计</td>
                  <td class="price primary-price">{{ formatMoney(summary.totalSalesAmount) }}</td>
                  <td class="price dim">{{ formatMoney(summary.totalCostAmount) }}</td>
                  <td class="price success-price">{{ formatMoney(summary.totalProfitAmount) }}</td>
                  <td class="num-cell">{{ formatNumber(summary.totalSalesCount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- 手机端卡片 -->
          <div class="card-list">
            <div v-for="row in summary.dailyList" :key="row.statDate" class="daily-card">
              <div class="card-top">
                <span class="card-date">{{ formatDate(row.statDate) }}</span>
                <span class="card-sales">{{ formatMoney(row.salesAmount) }}</span>
              </div>
              <div class="card-body">
                <div class="card-row">
                  <span class="card-key">利润</span>
                  <span class="success-price">{{ formatMoney(row.profitAmount) }}</span>
                </div>
                <div class="card-row">
                  <span class="card-key">销售笔数</span>
                  <span>{{ row.salesCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

    </template>

    <!-- ===== 初始空状态 ===== -->
    <EmptyState v-else text="暂无财务数据" icon="💰" />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { financeApi, type FinanceSummary } from '@/api/finance'
import { formatMoney, formatDate, formatNumber } from '@/utils/format'
import { showSuccess, showError } from '@/utils/toast'

// ── 日期工具 ───────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function getShortcutRange(key: string): { start: string; end: string } {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  if (key === 'today') {
    return { start: today, end: today }
  } else if (key === 'week') {
    const day = now.getDay() === 0 ? 7 : now.getDay()
    const mon = new Date(now)
    mon.setDate(now.getDate() - day + 1)
    return { start: mon.toISOString().slice(0, 10), end: today }
  } else if (key === 'month') {
    return { start: `${today.slice(0, 7)}-01`, end: today }
  } else {
    // quarter
    const q = Math.floor(now.getMonth() / 3)
    const start = new Date(now.getFullYear(), q * 3, 1)
    return { start: start.toISOString().slice(0, 10), end: today }
  }
}

// ── 快捷按钮 ───────────────────────────────────────────────
const shortcuts = [
  { key: 'today', label: '今天' },
  { key: 'week',  label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季度' },
]

const activeShortcut = ref('month')
const dateRange = reactive(getShortcutRange('month'))

function applyShortcut(key: string): void {
  activeShortcut.value = key
  const range = getShortcutRange(key)
  dateRange.start = range.start
  dateRange.end   = range.end
  loadData()
}

// ── 数据状态 ──────────────────────────────────────────────
const loading   = ref(false)
const loadError = ref('')
const summary   = ref<FinanceSummary | null>(null)

async function loadData(): Promise<void> {
  loading.value   = true
  loadError.value = ''
  try {
    const params: Record<string, unknown> = {}
    if (dateRange.start) params.startDate = dateRange.start
    if (dateRange.end)   params.endDate   = dateRange.end
    const res    = await financeApi.getSummary(params)
    summary.value = res.data
  } catch (e: unknown) {
    loadError.value = e instanceof Error ? e.message : '数据加载失败'
  } finally {
    loading.value = false
  }
}

function handleQuery(): void {
  activeShortcut.value = ''
  loadData()
}

// ── 同步今日数据 ───────────────────────────────────────────
const syncing = ref(false)

async function handleSync(): Promise<void> {
  syncing.value = true
  try {
    await financeApi.sync()
    showSuccess('同步成功')
    loadData()
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '同步失败')
  } finally {
    syncing.value = false
  }
}

onMounted(loadData)

// ── SVG 图表 ──────────────────────────────────────────────
const SVG_W = 580
const SVG_H = 240
const PAD_L = 64
const PAD_R = 20
const PAD_T = 16
const PAD_B = 36

const CHART_W = SVG_W - PAD_L - PAD_R
const CHART_H = SVG_H - PAD_T - PAD_B

const yMax = computed((): number => {
  const list = summary.value?.dailyList
  if (!list || list.length === 0) return 100
  const max = Math.max(...list.map(r => r.salesAmount))
  return max === 0 ? 100 : max * 1.15
})

function toX(i: number): number {
  const n = summary.value?.dailyList.length ?? 1
  if (n <= 1) return PAD_L + CHART_W / 2
  return PAD_L + (i / (n - 1)) * CHART_W
}

function toY(val: number): number {
  return PAD_T + CHART_H - (val / yMax.value) * CHART_H
}

const salesPoints = computed((): string =>
  (summary.value?.dailyList ?? [])
    .map((item, i) => `${toX(i)},${toY(item.salesAmount)}`)
    .join(' ')
)

const profitPoints = computed((): string =>
  (summary.value?.dailyList ?? [])
    .map((item, i) => `${toX(i)},${toY(item.profitAmount)}`)
    .join(' ')
)

const salesAreaPath = computed((): string => {
  const list = summary.value?.dailyList ?? []
  if (list.length < 2) return ''
  const pts = list.map((item, i) => `${toX(i)},${toY(item.salesAmount)}`).join(' L')
  const lastX = toX(list.length - 1)
  const baseline = SVG_H - PAD_B
  return `M ${pts} L${lastX},${baseline} L${PAD_L},${baseline} Z`
})

const profitAreaPath = computed((): string => {
  const list = summary.value?.dailyList ?? []
  if (list.length < 2) return ''
  const pts = list.map((item, i) => `${toX(i)},${toY(item.profitAmount)}`).join(' L')
  const lastX = toX(list.length - 1)
  const baseline = SVG_H - PAD_B
  return `M ${pts} L${lastX},${baseline} L${PAD_L},${baseline} Z`
})

const yGridValues = computed((): number[] => {
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => (yMax.value / steps) * i)
})

function yLabel(val: number): string {
  if (val >= 10000) return `${(val / 10000).toFixed(1)}万`
  if (val >= 1000)  return `${(val / 1000).toFixed(1)}k`
  return String(Math.round(val))
}

function shortDate(date: string): string {
  // 返回 MM-DD
  return date ? date.slice(5) : ''
}

// 未使用的 todayStr，保留用于默认值
void todayStr
</script>

<style scoped>
/* ── 页面容器 ───────────────────────────────────────── */
.finance-page {
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.shortcut-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.shortcut-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  background: #fff;
  color: var(--text-regular);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: inherit;
}

.shortcut-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }

.shortcut-btn--active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

.filter-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-input {
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
  width: 148px;
}

.filter-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19, 194, 194, .1);
}

.date-sep { color: var(--text-secondary); font-size: 14px; }

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

.state-text  { color: var(--text-secondary); font-size: 14px; }
.error-icon  { font-size: 40px; margin: 0; line-height: 1; }
.error-msg   { color: var(--danger-color); font-size: 14px; margin: 0; text-align: center; }

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

/* ── 汇总卡片 ───────────────────────────────────────── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  background: #fff;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.summary-body { flex: 1; min-width: 0; }

.summary-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.summary-card--primary .summary-value { color: var(--primary-color); }
.summary-card--warning .summary-value  { color: var(--warning-color); }
.summary-card--success .summary-value  { color: var(--success-color); }
.summary-card--info    .summary-value  { color: var(--info-color); }

/* ── 折线图 ─────────────────────────────────────────── */
.chart-card {
  background: #fff;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  padding: 20px 20px 16px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-label { margin-left: -6px; }
.legend-dot--sales  { background: #13C2C2; }
.legend-dot--profit { background: #52c41a; }

.chart-scroll {
  overflow-x: auto;
}

.chart-svg {
  width: 100%;
  min-width: 380px;
  max-height: 260px;
  display: block;
}

/* ── 每日明细 ───────────────────────────────────────── */
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.table-wrap {
  background: #fff;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  overflow-x: auto;
}

.daily-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
  font-size: 14px;
}

.daily-table th {
  background: #f4fdfd;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  padding: 12px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-lighter);
}

.daily-table td {
  padding: 11px 20px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-extra-light);
  vertical-align: middle;
}

.daily-table tbody tr:last-child td { border-bottom: none; }
.daily-table tbody tr:hover { background: #f9fefe; }

.total-row td {
  border-top: 2px solid var(--border-lighter);
  border-bottom: none;
  font-weight: 700;
  background: #fafcff;
  padding: 12px 20px;
}

.total-label { color: var(--text-primary); font-weight: 700; }

.dim           { color: var(--text-secondary); }
.price         { font-variant-numeric: tabular-nums; }
.primary-price { color: var(--primary-color); font-weight: 600; }
.success-price { color: var(--success-color); font-weight: 600; }
.num-cell      { font-variant-numeric: tabular-nums; }

/* ── 手机端卡片 ─────────────────────────────────────── */
.card-list {
  display: none;
  flex-direction: column;
  gap: 10px;
}

.daily-card {
  background: #fff;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  overflow: hidden;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-extra-light);
}

.card-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-sales {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-color);
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

/* ── 响应式 ─────────────────────────────────────────── */
@media (max-width: 767px) {
  .summary-grid { grid-template-columns: 1fr 1fr; }

  .table-wrap { display: none; }
  .card-list  { display: flex; }

  .filter-input { width: 100%; flex: 1 1 130px; }
}

@media (max-width: 480px) {
  .summary-grid { grid-template-columns: 1fr; }
  .summary-value { font-size: 17px; }
}
</style>
