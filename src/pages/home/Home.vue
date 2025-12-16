<template>
  <div class="page">
    <h1>首页</h1>
    <p>药品销售系统（用户端）</p>

    <div class="actions">
      <BaseButton type="primary" @click="$router.push('/products')">去逛药品</BaseButton>
      <BaseButton type="secondary" @click="$router.push('/cart')">查看购物车</BaseButton>
    </div>

    <div class="section">
      <h2>轮播</h2>
      <div v-if="loadingBanners">加载中...</div>
      <div v-else-if="banners.length === 0">暂无轮播</div>
      <div v-else class="banner-list">
        <div v-for="b in banners" :key="b.id" class="banner-item">
          <img :src="b.imageUrl" alt="banner" />
          <div class="banner-title">{{ b.title || '-' }}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>分类</h2>
      <div v-if="loadingCategories">加载中...</div>
      <div v-else-if="categories.length === 0">暂无分类</div>
      <div v-else class="chip-list">
        <button
          v-for="c in categories"
          :key="c.id"
          class="chip"
          @click="$router.push({ name: 'ProductList', query: { categoryId: String(c.id) } })"
        >
          {{ c.name }}
        </button>
      </div>
    </div>

    <div class="section">
      <h2>推荐药品</h2>
      <div v-if="loadingProducts">加载中...</div>
      <div v-else-if="products.length === 0">暂无药品</div>
      <div v-else class="product-grid">
        <div
          v-for="p in products"
          :key="p.id"
          class="product-card"
          @click="$router.push(`/products/${p.id}`)"
        >
          <div class="product-img">
            <img v-if="(p as any).coverUrl || (p as any).imageUrl" :src="(p as any).coverUrl || (p as any).imageUrl" alt="product" />
            <div v-else class="img-placeholder">无图</div>
          </div>
          <div class="product-name">{{ p.name }}</div>
          <div class="product-meta">
            <span class="price">¥{{ p.price }}</span>
            <span v-if="p.prescription" class="tag">处方</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { bannerApi, categoryApi, productApi, type Banner, type Category, type Product } from '@/api'

const banners = ref<Banner[]>([])
const categories = ref<Category[]>([])
const products = ref<Product[]>([])

const loadingBanners = ref(false)
const loadingCategories = ref(false)
const loadingProducts = ref(false)
const error = ref('')

onMounted(async () => {
  error.value = ''

  loadingBanners.value = true
  loadingCategories.value = true
  loadingProducts.value = true

  try {
    const [bRes, cRes, pRes] = await Promise.all([
      bannerApi.list(),
      categoryApi.list(),
      productApi.list({ page: 1, pageSize: 8 })
    ])
    banners.value = bRes.data || []
    categories.value = cRes.data || []
    products.value = pRes.data || []
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loadingBanners.value = false
    loadingCategories.value = false
    loadingProducts.value = false
  }
})
</script>

<style scoped>
.page { padding: 8px; }
.actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }

.section { margin-top: 24px; }
.section h2 { margin: 0 0 12px; font-size: 16px; }

.banner-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.banner-item { border: 1px solid var(--border-light); border-radius: var(--border-radius-base); overflow: hidden; background: var(--bg-color); }
.banner-item img { width: 100%; height: 120px; object-fit: cover; display: block; }
.banner-title { padding: 8px 10px; color: var(--text-regular); font-size: 13px; }

.chip-list { display: flex; gap: 10px; flex-wrap: wrap; }
.chip { border: 1px solid var(--border-base); background: var(--bg-color); color: var(--text-regular); border-radius: 999px; padding: 6px 10px; cursor: pointer; }
.chip:hover { border-color: var(--primary-color); color: var(--primary-color); }

.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.product-card { border: 1px solid var(--border-light); border-radius: var(--border-radius-base); background: var(--bg-color); padding: 10px; cursor: pointer; transition: box-shadow 0.2s; }
.product-card:hover { box-shadow: var(--box-shadow-light); }
.product-img { height: 120px; border-radius: var(--border-radius-base); overflow: hidden; background: var(--bg-page); display: flex; align-items: center; justify-content: center; }
.product-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-placeholder { color: var(--text-placeholder); font-size: 12px; }
.product-name { margin-top: 8px; font-weight: 600; color: var(--text-primary); }
.product-meta { margin-top: 6px; display: flex; gap: 8px; align-items: center; }
.price { color: var(--danger-color); font-weight: 600; }
.tag { font-size: 12px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--warning-color); color: var(--warning-color); }

.error { margin-top: 16px; color: var(--danger-color); }
</style>
