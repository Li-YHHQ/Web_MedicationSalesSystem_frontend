<template>
  <div class="dashboard">
    <!-- 加载中 -->
    <div v-if="loading" class="state-center">
      <div class="mini-spinner"></div>
      <span class="state-text">数据加载中...</span>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="error" class="state-center">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button class="retry-btn" @click="fetchData">重新加载</button>
    </div>

    <!-- 空数据 -->
    <EmptyState v-else-if="!data" text="暂无统计数据" icon="📊" />

    <!-- 正常内容 -->
    <template v-else>

      <!-- ===== 统计卡片 ===== -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-wrap--primary">💊</div>
          <div class="stat-body">
            <div class="stat-value">{{ formatNumber(data.totalDrugCount) }}</div>
            <div class="stat-label">药品总数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-wrap--info">📦</div>
          <div class="stat-body">
            <div class="stat-value">{{ formatNumber(data.totalStock) }}</div>
            <div class="stat-label">总库存（件）</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-wrap--warning">⏰</div>
          <div class="stat-body">
            <div
              class="stat-value"
              :class="{ 'stat-value--warning': data.expiringSoonCount > 0 }"
            >{{ data.expiringSoonCount }}</div>
            <div class="stat-label">即将过期（种）</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-wrap--danger">⚠️</div>
          <div class="stat-body">
            <div
              class="stat-value"
              :class="{ 'stat-value--danger': data.lowStockCount > 0 }"
            >{{ data.lowStockCount }}</div>
            <div class="stat-label">库存不足（种）</div>
          </div>
        </div>
      </div>

      <!-- ===== 财务卡片 ===== -->
      <div class="finance-grid">
        <div class="finance-card">
          <div class="finance-header">
            <span class="finance-tag">📅 今日</span>
            <span class="finance-title">今日营收</span>
          </div>
          <div class="finance-row">
            <span class="finance-label">销售额</span>
            <span class="finance-amount finance-amount--primary">
              {{ formatMoney(data.todaySalesAmount) }}
            </span>
          </div>
          <div class="finance-row">
            <span class="finance-label">利润</span>
            <span class="finance-amount finance-amount--success">
              {{ formatMoney(data.todayProfitAmount) }}
            </span>
          </div>
        </div>

        <div class="finance-card">
          <div class="finance-header">
            <span class="finance-tag">📆 本月</span>
            <span class="finance-title">本月营收</span>
          </div>
          <div class="finance-row">
            <span class="finance-label">销售额</span>
            <span class="finance-amount finance-amount--primary">
              {{ formatMoney(data.monthSalesAmount) }}
            </span>
          </div>
          <div class="finance-row">
            <span class="finance-label">利润</span>
            <span class="finance-amount finance-amount--success">
              {{ formatMoney(data.monthProfitAmount) }}
            </span>
          </div>
        </div>
      </div>

      <!-- ===== 折线图 ===== -->
      <div v-if="data.recentFinanceList.length > 0" class="chart-card">
        <div class="chart-header">
          <span class="chart-title">近期财务趋势</span>
          <div class="chart-legend">
            <span class="legend-dot legend-dot--sales"></span>
            <span class="legend-label">销售额</span>
            <span class="legend-dot legend-dot--profit"></span>
            <span class="legend-label">利润</span>
          </div>
        </div>
        <div class="chart-scroll">
          <svg
            :viewBox="`0 0 ${SVG_W} ${SVG_H}`"
            class="chart-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- Y 轴网格线 + 标签 -->
            <g v-for="(yv, i) in yGridValues" :key="`yg-${i}`">
              <line
                :x1="PAD_L"
                :y1="toY(yv)"
                :x2="SVG_W - PAD_R"
                :y2="toY(yv)"
                stroke="#f0f0f0"
                stroke-width="1"
              />
              <text
                :x="PAD_L - 6"
                :y="toY(yv)"
                text-anchor="end"
                dominant-baseline="middle"
                font-size="11"
                fill="#8c8c8c"
              >{{ yLabel(yv) }}</text>
            </g>

            <!-- X 轴基线 -->
            <line
              :x1="PAD_L"
              :y1="SVG_H - PAD_B"
              :x2="SVG_W - PAD_R"
              :y2="SVG_H - PAD_B"
              stroke="#e8e8e8"
              stroke-width="1"
            />

            <!-- X 轴日期标签 -->
            <text
              v-for="(item, i) in data.recentFinanceList"
              :key="`xl-${i}`"
              :x="toX(i)"
              :y="SVG_H - PAD_B + 16"
              text-anchor="middle"
              font-size="11"
              fill="#8c8c8c"
            >{{ shortDate(item.statDate) }}</text>

            <!-- 销售额面积填充 -->
            <path
              :d="salesAreaPath"
              fill="rgba(19,194,194,0.08)"
            />

            <!-- 利润面积填充 -->
            <path
              :d="profitAreaPath"
              fill="rgba(82,196,26,0.08)"
            />

            <!-- 销售额折线 -->
            <polyline
              v-if="data.recentFinanceList.length > 1"
              :points="salesPoints"
              fill="none"
              stroke="#13C2C2"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- 利润折线 -->
            <polyline
              v-if="data.recentFinanceList.length > 1"
              :points="profitPoints"
              fill="none"
              stroke="#52c41a"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- 销售额数据点 -->
            <g v-for="(item, i) in data.recentFinanceList" :key="`sd-${i}`">
              <circle
                :cx="toX(i)"
                :cy="toY(item.salesAmount)"
                r="5"
                fill="#fff"
                stroke="#13C2C2"
                stroke-width="2"
              />
            </g>

            <!-- 利润数据点 -->
            <g v-for="(item, i) in data.recentFinanceList" :key="`pd-${i}`">
              <circle
                :cx="toX(i)"
                :cy="toY(item.profitAmount)"
                r="5"
                fill="#fff"
                stroke="#52c41a"
                stroke-width="2"
              />
            </g>
          </svg>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getDashboard, type DashboardData } from '@/api/dashboard'
import { formatMoney, formatDate, formatNumber } from '@/utils/format'

// ── 状态 ──────────────────────────────────────────────
const loading = ref(false)
const error = ref('')
const data = ref<DashboardData | null>(null)

async function fetchData(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const res = await getDashboard()
    data.value = res.data
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '数据加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// ── SVG 图表常量 ───────────────────────────────────────
const SVG_W = 580
const SVG_H = 260
const PAD_L = 62  // 左边距（Y轴标签）
const PAD_R = 20  // 右边距
const PAD_T = 16  // 上边距
const PAD_B = 36  // 下边距（X轴标签）

const CHART_W = SVG_W - PAD_L - PAD_R
const CHART_H = SVG_H - PAD_T - PAD_B

// ── 图表计算 ───────────────────────────────────────────
const yMax = computed((): number => {
  const list = data.value?.recentFinanceList
  if (!list || list.length === 0) return 100
  const max = Math.max(...list.map((r) => r.salesAmount))
  return max === 0 ? 100 : max * 1.15
})

function toX(i: number): number {
  const n = data.value?.recentFinanceList.length ?? 1
  if (n <= 1) return PAD_L + CHART_W / 2
  return PAD_L + (i / (n - 1)) * CHART_W
}

function toY(val: number): number {
  return PAD_T + CHART_H - (val / yMax.value) * CHART_H
}

const salesPoints = computed((): string => {
  return (data.value?.recentFinanceList ?? [])
    .map((item, i) => `${toX(i)},${toY(item.salesAmount)}`)
    .join(' ')
})

const profitPoints = computed((): string => {
  return (data.value?.recentFinanceList ?? [])
    .map((item, i) => `${toX(i)},${toY(item.profitAmount)}`)
    .join(' ')
})

// 面积填充路径（折线 + 底边闭合）
const salesAreaPath = computed((): string => {
  const list = data.value?.recentFinanceList ?? []
  if (list.length < 2) return ''
  const pts = list.map((item, i) => `${toX(i)},${toY(item.salesAmount)}`).join(' L')
  const lastX = toX(list.length - 1)
  const baseline = SVG_H - PAD_B
  return `M ${pts} L${lastX},${baseline} L${PAD_L},${baseline} Z`
})

const profitAreaPath = computed((): string => {
  const list = data.value?.recentFinanceList ?? []
  if (list.length < 2) return ''
  const pts = list.map((item, i) => `${toX(i)},${toY(item.profitAmount)}`).join(' L')
  const lastX = toX(list.length - 1)
  const baseline = SVG_H - PAD_B
  return `M ${pts} L${lastX},${baseline} L${PAD_L},${baseline} Z`
})

// Y 轴网格值（5条）
const yGridValues = computed((): number[] => {
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => (yMax.value / steps) * i)
})

function yLabel(val: number): string {
  if (val >= 10000) return `${(val / 10000).toFixed(1)}万`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
  return val.toFixed(0)
}

function shortDate(dateStr: string): string {
  // 返回 MM-DD
  return formatDate(dateStr).slice(5)
}
</script>

<style scoped>
.dashboard {
  max-width: 900px;
}

/* ── 状态区 ────────────────── */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  gap: 12px;
}

.state-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.mini-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-icon { font-size: 40px; line-height: 1; }

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  margin: 0;
  text-align: center;
}

.retry-btn {
  padding: 8px 24px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.retry-btn:hover { background: var(--primary-dark); }

/* ── 统计卡片 ────────────────── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: var(--border-radius-large);
  padding: 20px 20px;
  box-shadow: var(--box-shadow-card);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-base);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-icon-wrap--primary { background: rgba(19, 194, 194, 0.12); }
.stat-icon-wrap--info    { background: rgba(144, 147, 153, 0.12); }
.stat-icon-wrap--warning { background: rgba(250, 173, 20, 0.12); }
.stat-icon-wrap--danger  { background: rgba(255, 77, 79, 0.12); }

.stat-body { flex: 1; min-width: 0; }

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-value--warning { color: var(--warning-color); }
.stat-value--danger  { color: var(--danger-color); }

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* ── 财务卡片 ────────────────── */
.finance-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.finance-card {
  background: #fff;
  border-radius: var(--border-radius-large);
  padding: 20px 24px;
  box-shadow: var(--box-shadow-card);
}

.finance-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.finance-tag {
  font-size: 12px;
  color: var(--text-secondary);
}

.finance-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.finance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-extra-light);
}

.finance-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.finance-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.finance-amount {
  font-size: 18px;
  font-weight: 700;
}

.finance-amount--primary { color: var(--primary-color); }
.finance-amount--success { color: var(--success-color); }

/* ── 折线图 ────────────────── */
.chart-card {
  background: #fff;
  border-radius: var(--border-radius-large);
  padding: 20px 24px;
  box-shadow: var(--box-shadow-card);
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
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot--sales  { background: #13C2C2; }
.legend-dot--profit { background: #52c41a; }

.legend-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 8px;
}

.chart-scroll {
  overflow-x: auto;
}

.chart-svg {
  display: block;
  width: 100%;
  min-width: 320px;
  height: auto;
}

/* ── 响应式 ────────────────── */
@media (max-width: 640px) {
  .stat-grid,
  .finance-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 14px 14px;
    gap: 12px;
  }

  .stat-icon-wrap {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stat-value {
    font-size: 22px;
  }

  .finance-card {
    padding: 16px;
  }

  .finance-amount {
    font-size: 15px;
  }

  .chart-card {
    padding: 16px;
  }
}

@media (max-width: 400px) {
  .stat-grid,
  .finance-grid {
    grid-template-columns: 1fr;
  }
}
</style>
