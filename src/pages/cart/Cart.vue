<template>
  <div class="page">
    <h1>购物车</h1>

    <div class="toolbar">
      <BaseButton type="primary" :loading="creating" :disabled="items.length === 0" @click="handleCreateOrder">
        去下单
      </BaseButton>
      <BaseButton type="secondary" :disabled="items.length === 0 || loading" @click="handleRefresh">
        刷新
      </BaseButton>
      <BaseButton type="danger" :disabled="items.length === 0 || loading" @click="handleClear">
        清空购物车
      </BaseButton>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="items.length === 0" class="empty">购物车为空</div>

    <div v-else class="list">
      <div v-for="it in items" :key="it.itemId" class="item">
        <div class="img">
          <img v-if="it.productCoverUrl" :src="it.productCoverUrl" alt="product" />
          <div v-else class="img-placeholder">无图</div>
        </div>

        <div class="info">
          <div class="name">{{ it.productName || `商品#${it.productId}` }}</div>
          <div class="meta">
            <span class="price">¥{{ it.unitPrice ?? '-' }}</span>
            <span class="sub">小计：¥{{ calcSubTotal(it) }}</span>
          </div>
        </div>

        <div class="ops">
          <div class="qty">
            <button class="qty-btn" :disabled="loading" @click="changeQty(it, -1)">-</button>
            <input class="qty-input" :value="it.quantity" readonly />
            <button class="qty-btn" :disabled="loading" @click="changeQty(it, 1)">+</button>
          </div>
          <BaseButton type="danger" size="small" :disabled="loading" @click="handleRemove(it.itemId)">
            删除
          </BaseButton>
        </div>
      </div>

      <div class="summary">
        <div>共 {{ items.length }} 件</div>
        <div class="total">合计：¥{{ totalAmount }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { cartApi, orderApi, type CartItem } from '@/api'

const router = useRouter()

const items = ref<CartItem[]>([])
const loading = ref(false)
const creating = ref(false)
const error = ref('')
const cartTotalAmount = ref(0)

const calcSubTotal = (it: CartItem) => {
  if (typeof it.amount === 'number') return it.amount.toFixed(2)
  const price = typeof it.unitPrice === 'number' ? it.unitPrice : 0
  return (price * it.quantity).toFixed(2)
}

const totalAmount = computed(() => {
  const v = Number(cartTotalAmount.value || 0)
  return v.toFixed(2)
})

const fetchCart = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await cartApi.list()
    const data: any = res.data
    items.value = Array.isArray(data?.items) ? data.items : []
    cartTotalAmount.value = typeof data?.totalAmount === 'number' ? data.totalAmount : 0
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    items.value = []
    cartTotalAmount.value = 0
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  await fetchCart()
}

const handleRemove = async (id: number) => {
  if (!confirm('确定删除该商品吗？')) return
  loading.value = true
  error.value = ''
  try {
    await cartApi.remove(id)
    await fetchCart()
  } catch (e: any) {
    error.value = e?.message || '删除失败'
  } finally {
    loading.value = false
  }
}

const handleClear = async () => {
  if (!confirm('确定清空购物车吗？')) return
  loading.value = true
  error.value = ''
  try {
    await cartApi.clear()
    await fetchCart()
  } catch (e: any) {
    error.value = e?.message || '清空失败'
  } finally {
    loading.value = false
  }
}

const changeQty = async (it: CartItem, delta: number) => {
  const next = it.quantity + delta
  if (next <= 0) return
  loading.value = true
  error.value = ''
  try {
    await cartApi.updateQuantity(it.itemId, { quantity: next })
    await fetchCart()
  } catch (e: any) {
    error.value = e?.message || '修改数量失败'
  } finally {
    loading.value = false
  }
}

const handleCreateOrder = async () => {
  if (items.value.length === 0) return
  creating.value = true
  error.value = ''
  try {
    const receiverName = window.prompt('收货人姓名：') || ''
    const receiverPhone = window.prompt('收货人电话：') || ''
    const receiverAddress = window.prompt('收货地址：') || ''

    if (!receiverName || !receiverPhone || !receiverAddress) {
      throw new Error('请填写收货人/电话/地址')
    }

    const res = await orderApi.createFromCart({ receiverName, receiverPhone, receiverAddress })
    const orderId = res.data
    if (orderId) {
      router.push(`/orders/${orderId}`)
    } else {
      router.push('/orders')
    }
  } catch (e: any) {
    error.value = e?.message || '下单失败'
  } finally {
    creating.value = false
  }
}

onMounted(fetchCart)
</script>

<style scoped>
.page { padding: 8px; }
.toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0; }
.error { color: var(--danger-color); margin-top: 8px; }
.loading, .empty { color: var(--text-secondary); margin-top: 8px; }

.list { margin-top: 12px; display: grid; gap: 12px; }
.item { display: grid; grid-template-columns: 90px 1fr auto; gap: 12px; align-items: center; border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); padding: 10px; }
.img { width: 90px; height: 90px; border-radius: var(--border-radius-base); overflow: hidden; background: var(--bg-page); display: flex; align-items: center; justify-content: center; }
.img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-placeholder { color: var(--text-placeholder); font-size: 12px; }
.name { font-weight: 600; color: var(--text-primary); }
.meta { margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; }
.price { color: var(--danger-color); font-weight: 600; }
.sub { color: var(--text-secondary); font-size: 12px; }

.ops { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
.qty { display: inline-flex; align-items: center; border: 1px solid var(--border-base); border-radius: var(--border-radius-base); overflow: hidden; }
.qty-btn { width: 32px; height: 32px; border: none; background: var(--bg-page); cursor: pointer; }
.qty-btn:disabled { cursor: not-allowed; opacity: 0.6; }
.qty-input { width: 46px; height: 32px; border: none; text-align: center; background: var(--bg-color); }

.summary { display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); }
.total { color: var(--danger-color); font-weight: 700; }

@media (max-width: 768px) {
  .item { grid-template-columns: 90px 1fr; }
  .ops { grid-column: 1 / -1; flex-direction: row; justify-content: space-between; width: 100%; }
}
</style>
