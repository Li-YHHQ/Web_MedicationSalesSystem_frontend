import { createRouter, createWebHistory } from 'vue-router'
import EmptyLayout from '@/layouts/EmptyLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'

const APP_TITLE = import.meta.env.VITE_APP_TITLE || '药店管理系统'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 登录页（无需认证）
    {
      path: '/login',
      component: EmptyLayout,
      children: [
        {
          path: '',
          name: 'Login',
          component: () => import('@/pages/auth/Login.vue'),
          meta: { title: '登录' }
        }
      ]
    },

    // 注册页（无需认证）
    {
      path: '/register',
      component: EmptyLayout,
      children: [
        {
          path: '',
          name: 'Register',
          component: () => import('@/pages/auth/Register.vue'),
          meta: { title: '注册' }
        }
      ]
    },

    // 主布局路由（需要认证）
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/pages/dashboard/Dashboard.vue'),
          meta: { requiresAuth: true, title: '数据看板' }
        },
        {
          path: 'drugs',
          name: 'DrugList',
          component: () => import('@/pages/drug/DrugList.vue'),
          meta: { requiresAuth: true, title: '药品管理' }
        },
        {
          path: 'supplier',
          name: 'SupplierList',
          component: () => import('@/pages/supplier/SupplierList.vue'),
          meta: { requiresAuth: true, title: '供应商管理' }
        },
        {
          path: 'stock/in',
          name: 'StockIn',
          component: () => import('@/pages/stock/StockIn.vue'),
          meta: { requiresAuth: true, title: '入库管理' }
        },
        {
          path: 'stock/out',
          name: 'StockOut',
          component: () => import('@/pages/stock/StockOut.vue'),
          meta: { requiresAuth: true, title: '出库管理' }
        },
        {
          path: 'expire',
          name: 'ExpireList',
          component: () => import('@/pages/expire/ExpireList.vue'),
          meta: { requiresAuth: true, title: '效期管理' }
        },
        {
          path: 'finance',
          name: 'Finance',
          component: () => import('@/pages/finance/Finance.vue'),
          meta: { requiresAuth: true, title: '财务统计' }
        }
      ]
    },

    // 404 页面
    {
      path: '/404',
      component: EmptyLayout,
      children: [
        {
          path: '',
          name: 'NotFound',
          component: () => import('@/pages/error/NotFound.vue'),
          meta: { title: '页面不存在' }
        }
      ]
    },

    // 捕获所有未匹配路由，重定向到 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  const title = to.meta?.title as string | undefined
  document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE

  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth)

  if (requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 已登录时访问登录页，跳转到看板
  if (to.path === '/login' && token) {
    next('/dashboard')
    return
  }

  next()
})

export default router
