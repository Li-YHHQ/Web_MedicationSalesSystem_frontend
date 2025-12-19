<template>
  <div class="home-page">
    <!-- Hero Section with Carousel -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-main">专业可信赖的</span>
            <span class="title-highlight">在线药品商城</span>
          </h1>
          <p class="hero-subtitle">正品保障 · 快速配送 · 专业咨询</p>
          <div class="hero-actions">
            <BaseButton type="primary" size="large" @click="$router.push('/products')">
              <span class="btn-icon">🏥</span>
              立即选购
            </BaseButton>
            <BaseButton type="secondary" size="large" @click="$router.push('/cart')">
              <span class="btn-icon">🛒</span>
              购物车
            </BaseButton>
          </div>
        </div>

        <!-- Carousel -->
        <div v-if="banners.length > 0" class="carousel-container">
          <div class="carousel" @mouseenter="pauseAutoPlay" @mouseleave="resumeAutoPlay">
            <transition name="slide">
              <div :key="currentSlide" class="carousel-slide">
                <img
                  :src="banners[currentSlide].imageUrl"
                  :alt="banners[currentSlide].title || '轮播图'"
                  class="carousel-image"
                  @click="handleBannerClick(banners[currentSlide])"
                  :style="{ cursor: banners[currentSlide].linkUrl ? 'pointer' : 'default' }"
                />
                <div v-if="banners[currentSlide].title" class="carousel-caption">
                  <h3>{{ banners[currentSlide].title }}</h3>
                </div>
              </div>
            </transition>

            <!-- Navigation Arrows -->
            <button
              class="carousel-arrow carousel-arrow-left"
              @click="prevSlide"
              aria-label="上一张"
            >
              ‹
            </button>
            <button
              class="carousel-arrow carousel-arrow-right"
              @click="nextSlide"
              aria-label="下一张"
            >
              ›
            </button>

            <!-- Indicators -->
            <div class="carousel-indicators">
              <button
                v-for="(banner, index) in banners"
                :key="banner.id"
                :class="['indicator', { active: index === currentSlide }]"
                @click="goToSlide(index)"
                :aria-label="`跳转到第 ${index + 1} 张`"
              ></button>
            </div>
          </div>
        </div>
        <div v-else-if="!loadingBanners" class="carousel-placeholder">
          <p>暂无轮播图</p>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="section categories-section">
      <div class="section-header">
        <h2 class="section-title">药品分类</h2>
        <p class="section-subtitle">快速找到您需要的药品类型</p>
      </div>

      <div v-if="loadingCategories" class="loading">加载中...</div>
      <div v-else-if="categories.length === 0" class="empty">暂无分类</div>
      <div v-else class="categories-grid">
        <div
          v-for="c in categories"
          :key="c.id"
          class="category-card"
          @click="$router.push({ name: 'ProductList', query: { categoryId: String(c.id) } })"
        >
          <div class="category-icon">💊</div>
          <div class="category-name">{{ c.name }}</div>
        </div>
      </div>
    </section>

    <!-- Products Section -->
    <section class="section products-section">
      <div class="section-header">
        <h2 class="section-title">热门推荐</h2>
        <p class="section-subtitle">精选优质药品，满足您的健康需求</p>
      </div>

      <div v-if="loadingProducts" class="loading">加载中...</div>
      <div v-else-if="products.length === 0" class="empty">暂无推荐药品</div>
      <div v-else class="products-grid">
        <div
          v-for="p in products"
          :key="p.id"
          class="product-card"
          @click="$router.push(`/products/${p.id}`)"
        >
          <div class="product-badge" v-if="p.prescription">Rx</div>
          <div class="product-image">
            <img
              v-if="(p as any).coverUrl || (p as any).imageUrl"
              :src="(p as any).coverUrl || (p as any).imageUrl"
              :alt="p.name"
            />
            <div v-else class="image-placeholder">
              <span>📦</span>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ p.name }}</h3>
            <div class="product-meta">
              <span class="product-price">¥{{ p.price }}</span>
              <span class="product-stock">库存 {{ p.stock }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { bannerApi, categoryApi, productApi, type Banner, type Category, type Product } from '@/api'

const router = useRouter()

const banners = ref<Banner[]>([])
const categories = ref<Category[]>([])
const products = ref<Product[]>([])

const currentSlide = ref(0)
const autoPlayInterval = ref<number | null>(null)

const loadingBanners = ref(false)
const loadingCategories = ref(false)
const loadingProducts = ref(false)
const error = ref('')

// Carousel functions
const nextSlide = () => {
  if (banners.value.length > 0) {
    currentSlide.value = (currentSlide.value + 1) % banners.value.length
  }
}

const prevSlide = () => {
  if (banners.value.length > 0) {
    currentSlide.value = (currentSlide.value - 1 + banners.value.length) % banners.value.length
  }
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const startAutoPlay = () => {
  if (banners.value.length > 1) {
    autoPlayInterval.value = window.setInterval(() => {
      nextSlide()
    }, 5000) // 5 seconds
  }
}

const stopAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
    autoPlayInterval.value = null
  }
}

const pauseAutoPlay = () => {
  stopAutoPlay()
}

const resumeAutoPlay = () => {
  startAutoPlay()
}

const handleBannerClick = (banner: Banner) => {
  if (banner.linkUrl) {
    // Check if it's an external URL
    if (banner.linkUrl.startsWith('http://') || banner.linkUrl.startsWith('https://')) {
      window.open(banner.linkUrl, '_blank')
    } else {
      // Internal route
      router.push(banner.linkUrl)
    }
  }
}

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

    // Start carousel auto-play
    if (banners.value.length > 1) {
      startAutoPlay()
    }
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loadingBanners.value = false
    loadingCategories.value = false
    loadingProducts.value = false
  }
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #E6FFFB 0%, #F0F5FF 100%);
  padding: var(--spacing-xxl) var(--spacing-xl);
  border-bottom: 1px solid var(--border-lighter);
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: var(--spacing-xxl);
  align-items: center;
}

.hero-text {
  padding: var(--spacing-lg);
}

.hero-title {
  margin: 0 0 var(--spacing-lg);
  line-height: 1.3;
}

.title-main {
  display: block;
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.title-highlight {
  display: block;
  font-size: 42px;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl);
  letter-spacing: 0.5px;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.btn-icon {
  font-size: 18px;
  margin-right: 4px;
}

/* Carousel */
.carousel-container {
  position: relative;
  height: 400px;
}

.carousel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius-xlarge);
  overflow: hidden;
  box-shadow: var(--box-shadow-dark);
}

.carousel-slide {
  position: absolute;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.carousel-caption h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* Carousel Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 32px;
  color: var(--primary-color);
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: var(--box-shadow-card);
}

.carousel-arrow:hover {
  background: white;
  box-shadow: var(--box-shadow-hover);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow-left {
  left: var(--spacing-md);
}

.carousel-arrow-right {
  right: var(--spacing-md);
}

/* Carousel Indicators */
.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  z-index: 10;
}

.indicator {
  width: 32px;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

.indicator.active {
  background: white;
  width: 48px;
}

/* Carousel Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.5s ease;
}

.slide-enter-from {
  opacity: 0;
}

.slide-leave-to {
  opacity: 0;
}

.carousel-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: var(--bg-light);
  border-radius: var(--border-radius-xlarge);
  border: 2px dashed var(--border-light);
  color: var(--text-placeholder);
}

/* Section Styles */
.section {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xxl) var(--spacing-xl);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: var(--primary-gradient);
  border-radius: 2px;
}

.section-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: var(--spacing-md) 0 0;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-lg);
}

.category-card {
  background: var(--bg-color);
  border-radius: var(--border-radius-large);
  padding: var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--box-shadow-card);
  border: 1px solid var(--border-lighter);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--box-shadow-hover);
  border-color: var(--primary-light);
}

.category-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  filter: grayscale(0.3);
  transition: var(--transition-fast);
}

.category-card:hover .category-icon {
  filter: grayscale(0);
  transform: scale(1.1);
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-xl);
}

.product-card {
  background: var(--bg-color);
  border-radius: var(--border-radius-large);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--box-shadow-card);
  border: 1px solid var(--border-lighter);
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--box-shadow-hover);
  border-color: var(--primary-light);
}

.product-badge {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: linear-gradient(135deg, #FFF7E6 0%, #FFE7BA 100%);
  color: var(--warning-color);
  padding: 4px 12px;
  border-radius: var(--border-radius-base);
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--warning-color);
  z-index: 1;
}

.product-image {
  width: 100%;
  height: 240px;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.image-placeholder {
  font-size: 64px;
  color: var(--text-placeholder);
}

.product-info {
  padding: var(--spacing-lg);
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md);
  line-height: 1.5;
  height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-color);
}

.product-stock {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Loading & Empty States */
.loading,
.empty {
  text-align: center;
  padding: var(--spacing-xxl);
  color: var(--text-secondary);
  font-size: 16px;
}

.error-message {
  max-width: 1400px;
  margin: var(--spacing-xl) auto;
  padding: var(--spacing-lg);
  background: #FFF1F0;
  border-left: 4px solid var(--danger-color);
  border-radius: var(--border-radius-base);
  color: var(--danger-color);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .hero-content {
    grid-template-columns: 1fr;
  }

  .carousel-container {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .section {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .title-main {
    font-size: 22px;
  }

  .title-highlight {
    font-size: 32px;
  }

  .section-title {
    font-size: 24px;
  }

  .carousel-container {
    height: 250px;
  }

  .carousel-arrow {
    width: 36px;
    height: 36px;
    font-size: 24px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--spacing-md);
  }

  .product-image {
    height: 180px;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--spacing-md);
  }
}
</style>
