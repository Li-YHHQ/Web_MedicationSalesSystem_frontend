<template>
  <div class="expire-page">

    <!-- ===== Tab 切换栏 ===== -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'expire' }"
        @click="switchTab('expire')"
      >
        ⏰ 效期预警
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'low' }"
        @click="switchTab('low')"
      >
        📉 库存预警
      </button>
    </div>

    <!-- =====================================================
         Tab 1：效期预警
    ====================================================== -->
    <div v-show="activeTab === 'expire'" class="tab-content">

      <!-- 操作栏 -->
      <div class="query-bar">
        <span class="query-label">查询</span>
        <input
          v-model.number="expireDays"
          type="number"
          min="1"
          max="365"
          class="days-input"
        />
        <span class="query-label">天内即将过期的药品</span>
        <BaseButton size="small" :loading="expireLoading" @click="loadExpiring">查询</BaseButton>
        <BaseButton size="small" type="secondary" @click="loadExpiring">刷新</BaseButton>
      </div>

      <!-- 统计概览 -->
      <div v-if="expireList.length > 0" class="stat-row">
        <div class="mini-stat mini-stat--danger">
          <div class="mini-stat-val">{{ expireCount30 }}</div>
          <div class="mini-stat-label">30天内过期</div>
        </div>
        <div class="mini-stat mini-stat--warning">
          <div class="mini-stat-val">{{ expireCount60 }}</div>
          <div class="mini-stat-label">31—60天过期</div>
        </div>
        <div class="mini-stat mini-stat--yellow">
          <div class="mini-stat-val">{{ expireCountRest }}</div>
          <div class="mini-stat-label">61天以上过期</div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="expireLoading" class="state-center">
        <div class="mini-spinner"></div>
        <span class="state-text">加载中...</span>
      </div>

      <!-- 空数据 -->
      <EmptyState
        v-else-if="expireList.length === 0"
        text="暂无预警数据，库存状态良好"
        icon="✅"
      />

      <!-- 内容区 -->
      <template v-else>

        <!-- PC 表格 -->
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>药品名称</th>
                <th>批次号</th>
                <th>生产日期</th>
                <th>有效期</th>
                <th>入库日期</th>
                <th>剩余天数</th>
                <th>库存数量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in sortedExpireList" :key="item.id">
                <td class="bold-cell">{{ item.drugName }}</td>
                <td class="mono">{{ item.batchNo || '—' }}</td>
                <td class="dim">{{ item.produceDate ? formatDate(item.produceDate) : '—' }}</td>
                <td>{{ formatDate(item.expireDate) }}</td>
                <td class="dim">{{ item.stockInDate ? formatDate(item.stockInDate) : '—' }}</td>
                <td>
                  <span class="days-badge" :class="daysClass(calcDaysLeft(item.expireDate))">
                    {{ calcDaysLeft(item.expireDate) }} 天
                  </span>
                </td>
                <td class="num-cell">{{ item.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手机端卡片 -->
        <div class="card-list">
          <div v-for="item in sortedExpireList" :key="item.id" class="data-card">
            <div class="card-top">
              <span class="card-name">{{ item.drugName }}</span>
              <span class="days-badge" :class="daysClass(calcDaysLeft(item.expireDate))">
                {{ calcDaysLeft(item.expireDate) }} 天
              </span>
            </div>
            <div class="card-body">
              <div class="card-row">
                <span class="card-key">批次号</span>
                <span class="mono">{{ item.batchNo || '—' }}</span>
              </div>
              <div class="card-row">
                <span class="card-key">有效期</span>
                <span>{{ formatDate(item.expireDate) }}</span>
              </div>
              <div class="card-row">
                <span class="card-key">库存数量</span>
                <span>{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- =====================================================
         Tab 2：库存预警
    ====================================================== -->
    <div v-show="activeTab === 'low'" class="tab-content">

      <!-- 操作栏 -->
      <div class="query-bar">
        <BaseButton size="small" type="secondary" :loading="lowLoading" @click="loadLow">
          刷新
        </BaseButton>
      </div>

      <!-- 统计概览 -->
      <div v-if="lowList.length > 0" class="stat-row">
        <div class="mini-stat mini-stat--danger">
          <div class="mini-stat-val">{{ lowList.length }}</div>
          <div class="mini-stat-label">库存不足批次</div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="lowLoading" class="state-center">
        <div class="mini-spinner"></div>
        <span class="state-text">加载中...</span>
      </div>

      <!-- 空数据 -->
      <EmptyState
        v-else-if="lowList.length === 0"
        text="暂无预警数据，库存状态良好"
        icon="✅"
      />

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
                <th>当前库存</th>
                <th>最低库存</th>
                <th>缺口数量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowList" :key="item.id">
                <td class="bold-cell">{{ item.drugName }}</td>
                <td class="mono">{{ item.batchNo || '—' }}</td>
                <td class="dim">{{ item.expireDate ? formatDate(item.expireDate) : '—' }}</td>
                <td>
                  <span class="low-stock-val">{{ item.quantity }}</span>
                </td>
                <td class="dim">{{ item.stockMin ?? '—' }}</td>
                <td>
                  <span v-if="item.stockMin != null" class="gap-val">
                    {{ Math.max(0, item.stockMin - item.quantity) }}
                  </span>
                  <span v-else class="dim">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手机端卡片 -->
        <div class="card-list">
          <div v-for="item in lowList" :key="item.id" class="data-card">
            <div class="card-top">
              <span class="card-name">{{ item.drugName }}</span>
              <span class="low-stock-val">{{ item.quantity }}</span>
            </div>
            <div class="card-body">
              <div class="card-row">
                <span class="card-key">批次号</span>
                <span class="mono">{{ item.batchNo || '—' }}</span>
              </div>
              <div class="card-row">
                <span class="card-key">当前库存</span>
                <span class="low-stock-val">{{ item.quantity }}</span>
              </div>
              <div class="card-row">
                <span class="card-key">最低库存</span>
                <span>{{ item.stockMin ?? '—' }}</span>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { stockApi, type ExpireItem, type LowStockItem } from '@/api/stock'
import { formatDate } from '@/utils/format'
import { showError } from '@/utils/toast'

// ── Tab 切换 ───────────────────────────────────────────────
const activeTab  = ref<'expire' | 'low'>('expire')
const lowLoaded  = ref(false)

function switchTab(tab: 'expire' | 'low'): void {
  activeTab.value = tab
  if (tab === 'low' && !lowLoaded.value) {
    loadLow()
    lowLoaded.value = true
  }
}

// ── 工具函数 ──────────────────────────────────────────────
function calcDaysLeft(expireDate: string): number {
  if (!expireDate) return 0
  const diff = new Date(expireDate).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

function daysClass(days: number): string {
  if (days <= 30) return 'days-red'
  if (days <= 60) return 'days-orange'
  return 'days-green'
}

// ── Tab1 效期预警 ──────────────────────────────────────────
const expireDays    = ref(90)
const expireLoading = ref(false)
const expireList    = ref<ExpireItem[]>([])

// 按剩余天数升序排列
const sortedExpireList = computed(() =>
  [...expireList.value].sort(
    (a, b) => calcDaysLeft(a.expireDate) - calcDaysLeft(b.expireDate)
  )
)

const expireCount30   = computed(() => expireList.value.filter(i => calcDaysLeft(i.expireDate) <= 30).length)
const expireCount60   = computed(() => expireList.value.filter(i => { const d = calcDaysLeft(i.expireDate); return d > 30 && d <= 60 }).length)
const expireCountRest = computed(() => expireList.value.filter(i => calcDaysLeft(i.expireDate) > 60).length)

async function loadExpiring(): Promise<void> {
  expireLoading.value = true
  try {
    const res = await stockApi.getExpiring(expireDays.value)
    expireList.value = res.data
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '效期预警加载失败')
  } finally {
    expireLoading.value = false
  }
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
    showError(e instanceof Error ? e.message : '库存预警加载失败')
  } finally {
    lowLoading.value = false
  }
}

onMounted(loadExpiring)
</script>

<style scoped>
/* ── 页面容器 ───────────────────────────────────────── */
.expire-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Tab 栏 ─────────────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 0;
  background: #fff;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  padding: 6px;
  width: fit-content;
}

.tab-btn {
  padding: 8px 20px;
  border: none;
  border-radius: var(--border-radius-base);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: inherit;
  white-space: nowrap;
}

.tab-btn:hover { color: var(--primary-color); background: rgba(19, 194, 194, .06); }

.tab-btn--active {
  background: var(--primary-color);
  color: #fff;
}

/* ── Tab 内容 ───────────────────────────────────────── */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 查询栏 ─────────────────────────────────────────── */
.query-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.query-label {
  font-size: 14px;
  color: var(--text-regular);
}

.days-input {
  width: 72px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  color: var(--text-primary);
  background: #fff;
  outline: none;
  font-family: inherit;
  text-align: center;
  transition: var(--transition-fast);
}

.days-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19, 194, 194, .1);
}

/* ── 统计小卡片 ─────────────────────────────────────── */
.stat-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mini-stat {
  flex: 1;
  min-width: 120px;
  padding: 14px 20px;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  text-align: center;
}

.mini-stat-val {
  font-size: 26px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.mini-stat-label {
  font-size: 12px;
  margin-top: 4px;
}

.mini-stat--danger  { background: rgba(255, 77, 79, .07); }
.mini-stat--danger  .mini-stat-val   { color: var(--danger-color); }
.mini-stat--danger  .mini-stat-label { color: var(--danger-color); opacity: .8; }

.mini-stat--warning { background: rgba(250, 140, 22, .08); }
.mini-stat--warning .mini-stat-val   { color: var(--warning-color); }
.mini-stat--warning .mini-stat-label { color: var(--warning-color); opacity: .8; }

.mini-stat--yellow  { background: rgba(250, 219, 20, .1); }
.mini-stat--yellow  .mini-stat-val   { color: #d4b106; }
.mini-stat--yellow  .mini-stat-label { color: #d4b106; opacity: .8; }

/* ── 状态区 ─────────────────────────────────────────── */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 30vh;
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

.bold-cell { font-weight: 600; }
.dim       { color: var(--text-secondary); }
.mono      { font-family: 'Courier New', monospace; font-size: 13px; color: var(--text-secondary); }
.num-cell  { font-variant-numeric: tabular-nums; }

/* ── 天数徽章 ───────────────────────────────────────── */
.days-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.days-red    { background: rgba(255, 77, 79, .1);   color: var(--danger-color); }
.days-orange { background: rgba(250, 140, 22, .1);  color: var(--warning-color); }
.days-green  { background: rgba(82, 196, 26, .1);   color: var(--success-color); }

/* ── 库存标记 ───────────────────────────────────────── */
.low-stock-val {
  color: var(--danger-color);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.gap-val {
  color: var(--danger-color);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

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

/* ── 响应式 ─────────────────────────────────────────── */
@media (max-width: 767px) {
  .table-wrap { display: none; }
  .card-list  { display: flex; }

  .tab-btn   { padding: 8px 14px; font-size: 13px; }
  .stat-row  { gap: 8px; }
  .mini-stat { min-width: 80px; padding: 12px 10px; }
}
</style>
