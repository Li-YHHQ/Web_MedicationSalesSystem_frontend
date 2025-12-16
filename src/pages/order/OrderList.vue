<template>
  <div class="page">
    <h1>我的订单</h1>

    <div class="toolbar">
      <BaseButton type="secondary" :disabled="loading" @click="fetchOrders">刷新</BaseButton>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="orders.length === 0" class="empty">暂无订单</div>

    <div v-else class="list">
      <div v-for="o in orders" :key="o.id" class="card">
        <div class="row">
          <div class="title" @click="$router.push(`/orders/${o.id}`)">订单 #{{ o.id }}</div>
          <div class="status">{{ o.status }}</div>
        </div>
        <div class="row meta">
          <div>金额：<span class="amount">¥{{ o.totalAmount ?? '-' }}</span></div>
          <div class="time">{{ o.createTime || '' }}</div>
        </div>
        <div class="actions">
          <BaseButton type="primary" size="small" @click="$router.push(`/orders/${o.id}`)">查看</BaseButton>
          <BaseButton
            v-if="o.status === 'PENDING_PAY'"
            type="success"
            size="small"
            :loading="actingId === o.id"
            @click="handlePay(o.id)"
          >
            支付
          </BaseButton>
          <BaseButton
            v-if="o.status === 'PENDING_PAY'"
            type="danger"
            size="small"
            :loading="actingId === o.id"
            @click="handleCancel(o.id)"
          >
            取消
          </BaseButton>
          <BaseButton
            v-if="o.status === 'PENDING_RECEIVE'"
            type="success"
            size="small"
            :loading="actingId === o.id"
            @click="handleConfirm(o.id)"
          >
            确认收货
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { orderApi, type Order } from '@/api'

const orders = ref<Order[]>([])
const loading = ref(false)
const error = ref('')
const actingId = ref<number | null>(null)

const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await orderApi.listMine()
    orders.value = res.data || []
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    orders.value = []
  } finally {
    loading.value = false
  }
}

const handlePay = async (id: number) => {
  actingId.value = id
  error.value = ''
  try {
    await orderApi.pay(id)
    await fetchOrders()
  } catch (e: any) {
    error.value = e?.message || '支付失败'
  } finally {
    actingId.value = null
  }
}

const handleCancel = async (id: number) => {
  if (!confirm('确定取消该订单吗？')) return
  actingId.value = id
  error.value = ''
  try {
    await orderApi.cancel(id)
    await fetchOrders()
  } catch (e: any) {
    error.value = e?.message || '取消失败'
  } finally {
    actingId.value = null
  }
}

const handleConfirm = async (id: number) => {
  if (!confirm('确认已收到货吗？')) return
  actingId.value = id
  error.value = ''
  try {
    await orderApi.confirmReceive(id)
    await fetchOrders()
  } catch (e: any) {
    error.value = e?.message || '操作失败'
  } finally {
    actingId.value = null
  }
}

onMounted(fetchOrders)
</script>

<style scoped>
.page { padding: 8px; }
.toolbar { margin: 12px 0; display: flex; gap: 10px; }
.error { color: var(--danger-color); margin-top: 8px; }
.loading, .empty { color: var(--text-secondary); margin-top: 8px; }

.list { margin-top: 12px; display: grid; gap: 12px; }
.card { border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); padding: 12px; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.title { font-weight: 700; color: var(--text-primary); cursor: pointer; }
.title:hover { color: var(--primary-color); }
.status { color: var(--text-secondary); }
.meta { margin-top: 8px; color: var(--text-regular); }
.amount { color: var(--danger-color); font-weight: 700; }
.time { color: var(--text-secondary); font-size: 12px; }
.actions { margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap; }
</style>
