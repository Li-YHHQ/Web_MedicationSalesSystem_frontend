import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import EmptyLayout from '@/layouts/EmptyLayout.vue'

const APP_TITLE = import.meta.env.VITE_APP_TITLE || '药品销售系统'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/pages/home/Home.vue'),
          meta: {
            title: '首页'
          }
        },
        {
          path: 'products',
          name: 'ProductList',
          component: () => import('@/pages/product/ProductList.vue'),
          meta: {
            title: '药品列表'
          }
        },
        {
          path: 'products/:id',
          name: 'ProductDetail',
          component: () => import('@/pages/product/ProductDetail.vue'),
          meta: {
            title: '药品详情'
          }
        },
        {
          path: 'cart',
          name: 'Cart',
          component: () => import('@/pages/cart/Cart.vue'),
          meta: {
            title: '购物车',
            requiresAuth: true
          }
        },
        {
          path: 'orders',
          name: 'OrderList',
          component: () => import('@/pages/order/OrderList.vue'),
          meta: {
            title: '我的订单',
            requiresAuth: true
          }
        },
        {
          path: 'orders/:id',
          name: 'OrderDetail',
          component: () => import('@/pages/order/OrderDetail.vue'),
          meta: {
            title: '订单详情',
            requiresAuth: true
          }
        },
        {
          path: 'me',
          name: 'Profile',
          component: () => import('@/pages/me/Profile.vue'),
          meta: {
            title: '个人中心',
            requiresAuth: true
          }
        },

        {
          path: 'admin/categories',
          name: 'AdminCategories',
          component: () => import('@/pages/admin/AdminCategories.vue'),
          meta: {
            title: '分类管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'admin/products',
          name: 'AdminProducts',
          component: () => import('@/pages/admin/AdminProducts.vue'),
          meta: {
            title: '药品管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'admin/banners',
          name: 'AdminBanners',
          component: () => import('@/pages/admin/AdminBanners.vue'),
          meta: {
            title: '轮播图管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'admin/orders',
          name: 'AdminOrders',
          component: () => import('@/pages/admin/AdminOrders.vue'),
          meta: {
            title: '订单管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'admin/users',
          name: 'AdminUsers',
          component: () => import('@/pages/admin/AdminUsers.vue'),
          meta: {
            title: '用户管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        }
      ]
    },
    {
      path: '/',
      component: EmptyLayout,
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('@/pages/auth/Login.vue'),
          meta: { title: '登录' }
        },
        {
          path: 'register',
          name: 'Register',
          component: () => import('@/pages/auth/Register.vue'),
          meta: { title: '注册' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      component: EmptyLayout,
      children: [
        {
          path: '',
          name: 'NotFound',
          component: () => import('@/pages/NotFound.vue'),
          meta: {
            title: '页面不存在'
          }
        }
      ]
    }
  ]
})

// 路由守卫 - 设置页面标题
router.beforeEach((to: any, from: any, next: any) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - ${APP_TITLE}`
  } else {
    document.title = APP_TITLE
  }

  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')
  const role = savedUser ? (() => {
    try {
      return JSON.parse(savedUser)?.role
    } catch {
      return null
    }
  })() : null

  const requiresAuth = !!to.meta?.requiresAuth
  const requiresAdmin = !!to.meta?.requiresAdmin

  if (requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  if (requiresAdmin && role !== 'ADMIN') {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
