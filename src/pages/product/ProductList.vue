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
.page {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.filters {
  display: grid;
  grid-template-columns: 1fr 220px auto auto;
  gap: var(--spacing-md);
  align-items: end;
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  border: 1px solid var(--border-lighter);
}

.select {
  height: 42px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  padding: 0 var(--spacing-md);
  background: var(--bg-color);
  color: var(--text-regular);
  font-size: 14px;
  transition: var(--transition-fast);
  cursor: pointer;
}

.select:hover {
  border-color: var(--primary-color);
}

.select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(19, 194, 194, 0.1);
}

.error {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  color: var(--danger-color);
  background: #FFF1F0;
  border-radius: var(--border-radius-base);
  border-left: 4px solid var(--danger-color);
}

.loading {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
}

.empty {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-xxl);
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg-color);
  border-radius: var(--border-radius-large);
  border: 2px dashed var(--border-light);
}

.grid {
  margin-top: var(--spacing-lg);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-lg);
}

.card {
  border-radius: var(--border-radius-large);
  background: var(--bg-color);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--box-shadow-card);
  border: 1px solid var(--border-lighter);
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: var(--box-shadow-hover);
  border-color: var(--primary-light);
}

.img {
  height: 180px;
  border-radius: var(--border-radius-base);
  overflow: hidden;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.img::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-extra-light);
  pointer-events: none;
}

.img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.img-placeholder {
  color: var(--text-placeholder);
  font-size: 12px;
}

.name {
  margin-top: var(--spacing-md);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  margin-top: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.price {
  color: var(--accent-color);
  font-weight: 700;
  font-size: 18px;
}

.tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: var(--border-radius-small);
  background: linear-gradient(135deg, #FFF7E6 0%, #FFE7BA 100%);
  border: 1px solid var(--warning-color);
  color: var(--warning-color);
  font-weight: 500;
}

.stock {
  color: var(--text-secondary);
  font-size: 12px;
  margin-left: auto;
}

@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }
}
</style>
