<template>
  <div class="page">
    <h1>药品详情</h1>

    <div v-if="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="product" class="detail">
      <div class="left">
        <div class="img">
          <img v-if="(product as any).coverUrl || (product as any).imageUrl" :src="(product as any).coverUrl || (product as any).imageUrl" alt="product" />
          <div v-else class="img-placeholder">无图</div>
        </div>
      </div>
      <div class="right">
        <h2 class="name">{{ product.name }}</h2>
        <div class="price">¥{{ product.price }}</div>
        <div class="row"><span class="label">库存：</span>{{ product.stock }}</div>
        <div class="row"><span class="label">分类：</span>{{ product.categoryName || product.categoryId }}</div>
        <div class="row"><span class="label">厂家：</span>{{ product.manufacturer || '-' }}</div>
        <div class="row"><span class="label">规格：</span>{{ product.specification || '-' }}</div>
        <div class="row"><span class="label">处方药：</span>{{ product.prescription ? '是' : '否' }}</div>

        <div class="desc">
          <div class="label">说明：</div>
          <div class="desc-text">{{ product.description || '-' }}</div>
        </div>

        <div class="buy">
          <div class="qty">
            <button class="qty-btn" :disabled="adding || qty <= 1" @click="qty -= 1">-</button>
            <input class="qty-input" :value="qty" readonly />
            <button class="qty-btn" :disabled="adding" @click="qty += 1">+</button>
          </div>
          <BaseButton type="primary" :loading="adding" @click="handleAddToCart">加入购物车</BaseButton>
          <BaseButton type="secondary" :disabled="adding" @click="$router.push('/cart')">去购物车</BaseButton>
        </div>

        <div v-if="addMsg" class="add-msg">{{ addMsg }}</div>
      </div>
    </div>

    <div class="section">
      <h2>评价</h2>
      <div v-if="loadingReviews">加载中...</div>
      <div v-else-if="reviews.length === 0">暂无评价</div>
      <div v-else class="review-list">
        <div v-for="(r, idx) in reviews" :key="idx" class="review-item">
          <div class="review-content">{{ r.content || '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { cartApi, productApi, type Product } from '@/api'

const route = useRoute()
const product = ref<Product | null>(null)
const reviews = ref<any[]>([])
const loading = ref(false)
const loadingReviews = ref(false)
const error = ref('')

const qty = ref(1)
const adding = ref(false)
const addMsg = ref('')

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  error.value = ''
  try {
    const res = await productApi.getById(id)
    product.value = res.data || null
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }

  loadingReviews.value = true
  try {
    const r = await productApi.reviews(id)
    reviews.value = r.data || []
  } catch {
    reviews.value = []
  } finally {
    loadingReviews.value = false
  }
})

const handleAddToCart = async () => {
  if (!product.value) return
  addMsg.value = ''
  adding.value = true
  try {
    await cartApi.add({ productId: product.value.id, quantity: qty.value })
    addMsg.value = '已加入购物车'
  } catch (e: any) {
    addMsg.value = e?.message || '加入失败'
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.page { padding: 8px; }
.error { color: var(--danger-color); }
.detail { margin-top: 12px; display: grid; grid-template-columns: 260px 1fr; gap: 16px; }
.img { height: 260px; border: 1px solid var(--border-light); border-radius: var(--border-radius-base); overflow: hidden; background: var(--bg-page); display: flex; align-items: center; justify-content: center; }
.img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-placeholder { color: var(--text-placeholder); font-size: 12px; }
.name { margin: 0; }
.price { margin-top: 8px; color: var(--danger-color); font-weight: 700; font-size: 18px; }
.row { margin-top: 6px; color: var(--text-regular); }
.label { color: var(--text-secondary); }
.desc { margin-top: 12px; }
.desc-text { margin-top: 6px; color: var(--text-regular); white-space: pre-wrap; }

.buy { margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.qty { display: inline-flex; align-items: center; border: 1px solid var(--border-base); border-radius: var(--border-radius-base); overflow: hidden; }
.qty-btn { width: 32px; height: 32px; border: none; background: var(--bg-page); cursor: pointer; }
.qty-btn:disabled { cursor: not-allowed; opacity: 0.6; }
.qty-input { width: 46px; height: 32px; border: none; text-align: center; background: var(--bg-color); }
.add-msg { margin-top: 8px; color: var(--text-secondary); }

.section { margin-top: 24px; }
.section h2 { margin: 0 0 12px; font-size: 16px; }
.review-list { display: grid; gap: 10px; }
.review-item { border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); padding: 10px; }
.review-content { color: var(--text-regular); }

@media (max-width: 768px) {
  .detail { grid-template-columns: 1fr; }
  .img { height: 220px; }
}
</style>
