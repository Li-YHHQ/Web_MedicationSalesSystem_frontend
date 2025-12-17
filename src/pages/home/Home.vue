<template>
  <div class="page">
    <h1>首页</h1>
    <p>药品销售系统（用户端）</p>

    <div class="actions">
      <BaseButton type="primary" @click="$router.push('/products')">去逛药品</BaseButton>
      <BaseButton type="secondary" @click="$router.push('/cart')">查看购物车</BaseButton>
    </div>

    <div class="section">
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
.page {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-top: var(--spacing-lg);
}

.section {
  margin-top: var(--spacing-xl);
}

.section h2 {
  margin: 0 0 var(--spacing-lg);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  position: relative;
  padding-left: 12px;
}

.section h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: var(--primary-gradient);
  border-radius: 2px;
}

/* 轮播图样式优化 */
.banner-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.banner-item {
  border-radius: var(--border-radius-large);
  overflow: hidden;
  background: var(--bg-color);
  box-shadow: var(--box-shadow-card);
  transition: var(--transition-base);
  cursor: pointer;
}

.banner-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--box-shadow-hover);
}

.banner-item img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}

.banner-title {
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text-regular);
  font-size: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(247,248,250,0.5) 100%);
}

/* 分类样式优化 */
.chip-list {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.chip {
  border: 1px solid var(--border-light);
  background: var(--bg-color);
  color: var(--text-regular);
  border-radius: var(--border-radius-round);
  padding: 8px 20px;
  cursor: pointer;
  transition: var(--transition-fast);
  box-shadow: var(--box-shadow-card);
  font-weight: 500;
}

.chip:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--bg-light);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

/* 药品卡片样式优化 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-lg);
}

.product-card {
  border-radius: var(--border-radius-large);
  background: var(--bg-color);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--box-shadow-card);
  border: 1px solid var(--border-lighter);
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--box-shadow-hover);
  border-color: var(--primary-light);
}

.product-img {
  height: 200px;
  border-radius: var(--border-radius-base);
  overflow: hidden;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.product-img::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-extra-light);
  pointer-events: none;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.img-placeholder {
  color: var(--text-placeholder);
  font-size: 12px;
}

.product-name {
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

.product-meta {
  margin-top: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
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

.error {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  color: var(--danger-color);
  background: #FFF1F0;
  border-radius: var(--border-radius-base);
  border-left: 4px solid var(--danger-color);
}
</style>
