<template>
  <div class="page">
    <h1>订单详情</h1>

    <div class="toolbar">
      <BaseButton type="secondary" :disabled="loading" @click="fetchDetail">刷新</BaseButton>
      <BaseButton v-if="order && order.status === 'PENDING_PAY'" type="success" :loading="acting" @click="handlePay">
        支付
      </BaseButton>
      <BaseButton v-if="order && order.status === 'PENDING_PAY'" type="danger" :loading="acting" @click="handleCancel">
        取消订单
      </BaseButton>
      <BaseButton v-if="order && order.status === 'PENDING_RECEIVE'" type="success" :loading="acting" @click="handleConfirm">
        确认收货
      </BaseButton>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="order" class="card">
      <div class="row"><span class="label">订单ID：</span>{{ order.id }}</div>
      <div class="row"><span class="label">状态：</span>{{ order.status }}</div>
      <div class="row"><span class="label">金额：</span><span class="amount">¥{{ order.totalAmount ?? '-' }}</span></div>
      <div class="row"><span class="label">创建时间：</span>{{ order.createTime || '-' }}</div>
      <div class="row"><span class="label">收货人：</span>{{ order.receiverName || '-' }}</div>
      <div class="row"><span class="label">电话：</span>{{ order.receiverPhone || '-' }}</div>
      <div class="row"><span class="label">地址：</span>{{ order.receiverAddress || '-' }}</div>

      <h2 class="h2">商品明细</h2>
      <div v-if="items.length === 0" class="empty">暂无明细</div>
      <div v-else class="items">
        <div v-for="(it, idx) in items" :key="idx" class="item">
          <div class="name">{{ it.productName || `商品#${it.productId}` }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { orderApi, type Order, type OrderItem } from '@/api'

const route = useRoute()
const router = useRouter()

const order = ref<Order | null>(null)
const items = ref<OrderItem[]>([])
const loading = ref(false)
const acting = ref(false)
const error = ref('')

const fetchDetail = async () => {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  error.value = ''
  try {
    const res = await orderApi.detail(id)
    const data: any = res.data
    order.value = data?.order || null
    items.value = Array.isArray(data?.items) ? data.items : []
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    order.value = null
    items.value = []
  } finally {
    loading.value = false
  }
}

const handlePay = async () => {
  if (!order.value) return
  acting.value = true
  error.value = ''
  try {
    await orderApi.pay(order.value.id)
    await fetchDetail()
  } catch (e: any) {
    error.value = e?.message || '支付失败'
  } finally {
    acting.value = false
  }
}

const handleCancel = async () => {
  if (!order.value) return
  if (!confirm('确定取消该订单吗？')) return
  acting.value = true
  error.value = ''
  try {
    await orderApi.cancel(order.value.id)
    await fetchDetail()
  } catch (e: any) {
    error.value = e?.message || '取消失败'
  } finally {
    acting.value = false
  }
}

const handleConfirm = async () => {
  if (!order.value) return
  if (!confirm('确认已收到货吗？')) return
  acting.value = true
  error.value = ''
  try {
    await orderApi.confirmReceive(order.value.id)
    await fetchDetail()
  } catch (e: any) {
    error.value = e?.message || '操作失败'
  } finally {
    acting.value = false
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.page { padding: 8px; }
.toolbar { margin: 12px 0; display: flex; gap: 10px; flex-wrap: wrap; }
.error { color: var(--danger-color); margin-top: 8px; }
.loading { color: var(--text-secondary); margin-top: 8px; }
.card { margin-top: 12px; border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); padding: 12px; }
.row { margin-top: 6px; color: var(--text-regular); }
.label { color: var(--text-secondary); }
.amount { color: var(--danger-color); font-weight: 700; }
.h2 { margin: 14px 0 10px; font-size: 16px; }
.items { display: grid; gap: 10px; }
.item { border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); padding: 10px; }
.name { font-weight: 600; color: var(--text-primary); }
.meta { margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; color: var(--text-secondary); font-size: 12px; }
.empty { color: var(--text-secondary); }
</style>
