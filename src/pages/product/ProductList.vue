<template>
  <div class="page">
    <h1>药品列表</h1>

    <div class="filters">
      <BaseInput v-model="keyword" placeholder="搜索药品（名称/关键词）" />
      <select v-model="categoryId" class="select">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
      </select>
      <BaseButton type="primary" :loading="loading" @click="fetchProducts">搜索</BaseButton>
      <BaseButton type="secondary" :disabled="loading" @click="resetFilters">重置</BaseButton>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="products.length === 0" class="empty">暂无药品</div>

    <div v-else class="grid">
      <div
        v-for="p in products"
        :key="p.id"
        class="card"
        @click="$router.push(`/products/${p.id}`)"
      >
        <div class="img">
          <img v-if="(p as any).coverUrl || (p as any).imageUrl" :src="(p as any).coverUrl || (p as any).imageUrl" alt="product" />
          <div v-else class="img-placeholder">无图</div>
        </div>
        <div class="name">{{ p.name }}</div>
        <div class="meta">
          <span class="price">¥{{ p.price }}</span>
          <span v-if="p.prescription" class="tag">处方</span>
          <span class="stock">库存：{{ p.stock }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { categoryApi, productApi, type Category, type Product } from '@/api'

const route = useRoute()
const router = useRouter()

const categories = ref<Category[]>([])
const products = ref<Product[]>([])

const keyword = ref('')
const categoryId = ref('')

const loading = ref(false)
const error = ref('')

const loadCategories = async () => {
  try {
    const res = await categoryApi.list()
    categories.value = res.data || []
  } catch {
    categories.value = []
  }
}

const syncFromQuery = () => {
  const q = route.query
  keyword.value = (q.keyword as string) || ''
  categoryId.value = (q.categoryId as string) || ''
}

const updateQuery = () => {
  router.replace({
    name: 'ProductList',
    query: {
      keyword: keyword.value || undefined,
      categoryId: categoryId.value || undefined
    }
  })
}

const fetchProducts = async () => {
  loading.value = true
  error.value = ''
  try {
    updateQuery()
    const res = await productApi.list({
      keyword: keyword.value || undefined,
      categoryId: categoryId.value ? Number(categoryId.value) : undefined
    })
    products.value = res.data || []
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    products.value = []
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  keyword.value = ''
  categoryId.value = ''
  await fetchProducts()
}

onMounted(async () => {
  syncFromQuery()
  await loadCategories()
  await fetchProducts()
})
</script>

<style scoped>
.page { padding: 8px; }
.filters { display: grid; grid-template-columns: 1fr 200px auto auto; gap: 12px; align-items: end; margin-top: 12px; }
.select { height: 40px; border: 1px solid var(--border-base); border-radius: var(--border-radius-base); padding: 0 10px; background: var(--bg-color); }

.error { margin-top: 12px; color: var(--danger-color); }
.loading { margin-top: 12px; color: var(--text-secondary); }
.empty { margin-top: 12px; color: var(--text-secondary); }

.grid { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.card { border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); padding: 10px; cursor: pointer; transition: box-shadow 0.2s; }
.card:hover { box-shadow: var(--box-shadow-light); }
.img { height: 140px; border-radius: var(--border-radius-base); overflow: hidden; background: var(--bg-page); display: flex; align-items: center; justify-content: center; }
.img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-placeholder { color: var(--text-placeholder); font-size: 12px; }
.name { margin-top: 8px; font-weight: 600; color: var(--text-primary); }
.meta { margin-top: 6px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.price { color: var(--danger-color); font-weight: 600; }
.tag { font-size: 12px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--warning-color); color: var(--warning-color); }
.stock { color: var(--text-secondary); font-size: 12px; }

@media (max-width: 768px) {
  .filters { grid-template-columns: 1fr; }
}
</style>
