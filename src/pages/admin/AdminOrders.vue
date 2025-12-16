<template>
  <div class="page">
    <h1>订单管理（管理员）</h1>

    <div class="toolbar">
      <BaseInput v-model="filters.keyword" label="关键词" placeholder="订单号/收货人/手机号" />
      <BaseInput v-model="filters.status" label="状态" placeholder="PENDING_PAY/PENDING_SHIP/..." />
      <div class="toolbar-actions">
        <BaseButton type="primary" :disabled="loading" @click="fetchList">查询</BaseButton>
        <BaseButton type="secondary" :disabled="loading" @click="resetAndFetch">重置</BaseButton>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="list.length === 0" class="empty">暂无订单</div>

    <div v-else class="list">
      <div v-for="o in list" :key="o.id" class="row">
        <div class="left">
          <div class="top">
            <div class="order-no">订单号：{{ o.orderNo || '-' }}</div>
            <div class="status">状态：{{ o.status || '-' }}</div>
          </div>
          <div class="meta">
            <span>ID：{{ o.id }}</span>
            <span>用户ID：{{ o.userId ?? '-' }}</span>
            <span>金额：{{ o.totalAmount ?? '-' }}</span>
          </div>
          <div class="receiver">
            <div>收货人：{{ o.receiverName || '-' }} / {{ o.receiverPhone || '-' }}</div>
            <div>地址：{{ o.receiverAddress || '-' }}</div>
          </div>
          <div class="times">
            <span>下单：{{ formatTime(o.createTime) }}</span>
            <span>支付：{{ formatTime(o.payTime) }}</span>
            <span>发货：{{ formatTime(o.shipTime) }}</span>
            <span>收货：{{ formatTime(o.receiveTime) }}</span>
          </div>
        </div>

        <div class="actions">
          <BaseButton
            size="small"
            type="primary"
            :disabled="shipping || loading || o.status !== 'PENDING_SHIP'"
            :loading="shippingId === o.id"
            @click="handleShip(o.id)"
          >发货</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { orderApi, type AdminOrder } from '@/api'

const list = ref<AdminOrder[]>([])
const loading = ref(false)
const shipping = ref(false)
const shippingId = ref<number | null>(null)
const error = ref('')

const filters = ref<{ status: string; keyword: string }>({
  status: '',
  keyword: ''
})

const formatTime = (t?: string) => {
  if (!t) return '-'
  return t.replace('T', ' ').replace('Z', '')
}

const fetchList = async () => {
  error.value = ''
  loading.value = true
  try {
    const params: any = {}
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.keyword) params.keyword = filters.value.keyword
    const res = await orderApi.adminList(params)
    list.value = res.data || []
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const resetAndFetch = async () => {
  filters.value = { status: '', keyword: '' }
  await fetchList()
}

const handleShip = async (id: number) => {
  if (!confirm(`确认对订单 ID=${id} 执行发货吗？`)) return
  error.value = ''
  shipping.value = true
  shippingId.value = id
  try {
    await orderApi.adminShip(id)
    await fetchList()
  } catch (e: any) {
    error.value = e?.message || '发货失败'
  } finally {
    shipping.value = false
    shippingId.value = null
  }
}

onMounted(fetchList)
</script>

<style scoped>
.page { padding: 8px; }

.toolbar {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: end;
  margin: 12px 0;
}

.toolbar-actions { display: flex; gap: 8px; }

.error { color: #d14343; margin: 8px 0; }
.loading { margin: 8px 0; }
.empty { margin: 8px 0; color: #666; }

.list { display: flex; flex-direction: column; gap: 10px; }
.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.left { min-width: 0; flex: 1 1 auto; }
.top { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 6px; }
.order-no { font-weight: 600; }
.status { color: #444; }
.meta { display: flex; gap: 10px; color: #666; font-size: 12px; flex-wrap: wrap; }
.receiver { margin-top: 8px; color: #444; font-size: 12px; }
.times { margin-top: 8px; display: flex; gap: 10px; color: #666; font-size: 12px; flex-wrap: wrap; }
.actions { flex: 0 0 auto; }

@media (max-width: 900px) {
  .toolbar { grid-template-columns: 1fr; }
}
</style>
