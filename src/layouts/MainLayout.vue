<template>
  <div class="main-layout">
    <!-- ===== 电脑端侧边栏 ===== -->
    <aside class="sidebar">
      <!-- 系统标题 -->
      <div class="sidebar-header">
        <div class="sidebar-logo">💊</div>
        <div class="sidebar-title">药店管理系统</div>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">📊</span>
          <span class="nav-label">数据看板</span>
        </router-link>

        <router-link to="/drugs" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">💊</span>
          <span class="nav-label">药品管理</span>
        </router-link>

        <router-link to="/supplier" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">🏭</span>
          <span class="nav-label">供应商管理</span>
        </router-link>

        <!-- 库存（可展开） -->
        <div class="nav-group">
          <button
            class="nav-item nav-item--group"
            :class="{ 'nav-item--active': isStockActive }"
            @click="stockOpen = !stockOpen"
          >
            <span class="nav-icon">📦</span>
            <span class="nav-label">库存管理</span>
            <span class="nav-arrow" :class="{ 'nav-arrow--open': stockOpen }">›</span>
          </button>
          <div class="nav-sub" :class="{ 'nav-sub--open': stockOpen }">
            <router-link to="/stock/in" class="nav-sub-item" active-class="nav-sub-item--active">
              入库记录
            </router-link>
            <router-link to="/stock/out" class="nav-sub-item" active-class="nav-sub-item--active">
              出库记录
            </router-link>
          </div>
        </div>

        <router-link to="/finance" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">💰</span>
          <span class="nav-label">财务统计</span>
        </router-link>

        <router-link to="/expire" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">⏰</span>
          <span class="nav-label">效期管理</span>
        </router-link>
      </nav>

      <!-- 底部操作 -->
      <div class="sidebar-footer">
        <button class="change-pwd-btn" @click="openChangePwd">
          <span>🔒</span>
          <span>修改密码</span>
        </button>
        <button class="logout-btn" @click="handleLogout">
          <span>🚪</span>
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- ===== 右侧主内容区 ===== -->
    <div class="main-content">
      <!-- 手机端顶部栏 -->
      <header class="mobile-header">
        <span class="mobile-title">{{ currentTitle }}</span>
        <button class="mobile-logout-btn" @click="handleLogout">退出</button>
      </header>

      <!-- 页面内容 -->
      <main class="page-content">
        <router-view />
      </main>
    </div>

    <!-- ===== 手机端底部导航栏 ===== -->
    <nav class="bottom-nav">
      <router-link to="/dashboard" class="bottom-nav-item" active-class="bottom-nav-item--active">
        <span class="bottom-nav-icon">📊</span>
        <span class="bottom-nav-label">看板</span>
      </router-link>

      <router-link to="/drugs" class="bottom-nav-item" active-class="bottom-nav-item--active">
        <span class="bottom-nav-icon">💊</span>
        <span class="bottom-nav-label">药品</span>
      </router-link>

      <!-- 库存 Tab（点击弹出子菜单） -->
      <button
        class="bottom-nav-item"
        :class="{ 'bottom-nav-item--active': isStockActive }"
        @click="toggleStockMenu"
      >
        <span class="bottom-nav-icon">📦</span>
        <span class="bottom-nav-label">库存</span>
      </button>

      <router-link to="/finance" class="bottom-nav-item" active-class="bottom-nav-item--active">
        <span class="bottom-nav-icon">💰</span>
        <span class="bottom-nav-label">财务</span>
      </router-link>

      <router-link to="/expire" class="bottom-nav-item" active-class="bottom-nav-item--active">
        <span class="bottom-nav-icon">⏰</span>
        <span class="bottom-nav-label">效期</span>
      </router-link>
    </nav>

    <!-- ===== 修改密码弹窗 ===== -->
    <teleport to="body">
      <div v-if="pwdModalVisible" class="pwd-overlay" @click="closePwdModal">
        <div class="pwd-modal" @click.stop>
          <div class="pwd-modal-header">
            <span class="pwd-modal-title">修改密码</span>
            <button class="pwd-modal-close" @click="closePwdModal">×</button>
          </div>
          <div class="pwd-modal-body">
            <div class="pwd-field" :class="{ 'pwd-field--error': pwdErrors.oldPassword }">
              <label class="pwd-label">旧密码</label>
              <input
                v-model="pwdForm.oldPassword"
                type="password"
                class="pwd-input"
                placeholder="请输入旧密码"
                autocomplete="current-password"
              />
              <span v-if="pwdErrors.oldPassword" class="pwd-err">{{ pwdErrors.oldPassword }}</span>
            </div>
            <div class="pwd-field" :class="{ 'pwd-field--error': pwdErrors.newPassword }">
              <label class="pwd-label">新密码</label>
              <input
                v-model="pwdForm.newPassword"
                type="password"
                class="pwd-input"
                placeholder="请输入新密码"
                autocomplete="new-password"
              />
              <span v-if="pwdErrors.newPassword" class="pwd-err">{{ pwdErrors.newPassword }}</span>
            </div>
            <div class="pwd-field" :class="{ 'pwd-field--error': pwdErrors.confirmPassword }">
              <label class="pwd-label">确认新密码</label>
              <input
                v-model="pwdForm.confirmPassword"
                type="password"
                class="pwd-input"
                placeholder="请再次输入新密码"
                autocomplete="new-password"
              />
              <span v-if="pwdErrors.confirmPassword" class="pwd-err">{{ pwdErrors.confirmPassword }}</span>
            </div>
          </div>
          <div class="pwd-modal-footer">
            <button class="pwd-btn pwd-btn--cancel" @click="closePwdModal">取消</button>
            <button class="pwd-btn pwd-btn--confirm" :disabled="pwdSubmitting" @click="submitChangePwd">
              <span v-if="pwdSubmitting" class="pwd-spinner"></span>
              <span>{{ pwdSubmitting ? '提交中...' : '确认修改' }}</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 手机端库存子菜单遮罩 + 弹出面板 -->
    <transition name="slide-up">
      <div v-if="stockMenuVisible" class="stock-menu-overlay" @click="stockMenuVisible = false">
        <div class="stock-menu-panel" @click.stop>
          <div class="stock-menu-title">库存管理</div>
          <router-link
            to="/stock/in"
            class="stock-menu-item"
            @click="stockMenuVisible = false"
          >
            <span>📥</span>
            <span>入库管理</span>
          </router-link>
          <router-link
            to="/stock/out"
            class="stock-menu-item"
            @click="stockMenuVisible = false"
          >
            <span>📤</span>
            <span>出库管理</span>
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userApi } from '@/api/users'
import { showSuccess, showError } from '@/utils/toast'

const router = useRouter()
const route = useRoute()

// 当前页面标题（手机端顶部栏使用）
const currentTitle = computed(() => {
  return (route.meta?.title as string) ?? '药店管理系统'
})

// 库存菜单展开状态（PC侧边栏）
const stockOpen = ref(false)

// 是否当前在库存相关路由
const isStockActive = computed(() =>
  route.path.startsWith('/stock')
)

// 监听路由变化，若进入库存子路由则自动展开侧边栏
watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/stock')) {
      stockOpen.value = true
    }
  },
  { immediate: true }
)

// 手机端库存子菜单
const stockMenuVisible = ref(false)

function toggleStockMenu(): void {
  stockMenuVisible.value = !stockMenuVisible.value
}

// 登出
function handleLogout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.replace('/login')
}

// ── 修改密码 ───────────────────────────────────────────────
const pwdModalVisible = ref(false)
const pwdSubmitting   = ref(false)

const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdErrors = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

function openChangePwd(): void {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdErrors.oldPassword = ''
  pwdErrors.newPassword = ''
  pwdErrors.confirmPassword = ''
  pwdModalVisible.value = true
}

function closePwdModal(): void {
  pwdModalVisible.value = false
}

function validatePwd(): boolean {
  pwdErrors.oldPassword     = pwdForm.oldPassword     ? '' : '请输入旧密码'
  pwdErrors.newPassword     = pwdForm.newPassword     ? '' : '请输入新密码'
  pwdErrors.confirmPassword = pwdForm.confirmPassword ? '' : '请再次输入新密码'
  if (!pwdErrors.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword) {
    pwdErrors.confirmPassword = '两次密码不一致'
  }
  return !pwdErrors.oldPassword && !pwdErrors.newPassword && !pwdErrors.confirmPassword
}

async function submitChangePwd(): Promise<void> {
  if (!validatePwd()) return
  pwdSubmitting.value = true
  try {
    await userApi.changePassword({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    })
    showSuccess('密码修改成功')
    closePwdModal()
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '修改失败')
  } finally {
    pwdSubmitting.value = false
  }
}
</script>

<style scoped>
/* ========== 整体布局 ========== */
.main-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}

/* ========== 侧边栏（仅电脑端显示） ========== */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid var(--border-lighter);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  box-shadow: var(--box-shadow-card);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-lighter);
}

.sidebar-logo {
  font-size: 28px;
  line-height: 1;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--border-radius-base);
  color: var(--text-regular);
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition-fast);
  width: 100%;
  border: none;
  background: none;
  text-align: left;
  box-sizing: border-box;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: var(--bg-page);
  color: var(--primary-color);
}

.nav-item--active {
  background: rgba(19, 194, 194, 0.1);
  color: var(--primary-color);
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-arrow {
  font-size: 18px;
  color: var(--text-placeholder);
  transition: transform 0.25s ease;
  display: inline-block;
}

.nav-arrow--open {
  transform: rotate(90deg);
}

/* 子菜单 */
.nav-group {
  margin-bottom: 2px;
}

.nav-item--group {
  margin-bottom: 0;
}

.nav-sub {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease;
}

.nav-sub--open {
  max-height: 200px;
}

.nav-sub-item {
  display: block;
  padding: 8px 12px 8px 44px;
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--border-radius-base);
  transition: var(--transition-fast);
  margin-bottom: 2px;
}

.nav-sub-item:hover {
  background: var(--bg-page);
  color: var(--primary-color);
}

.nav-sub-item--active {
  color: var(--primary-color);
  background: rgba(19, 194, 194, 0.08);
  font-weight: 600;
}

/* 底部按钮区 */
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--border-lighter);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.change-pwd-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: var(--border-radius-base);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: inherit;
}

.change-pwd-btn:hover {
  background: rgba(19, 194, 194, 0.08);
  color: var(--primary-color);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: var(--border-radius-base);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.logout-btn:hover {
  background: rgba(255, 77, 79, 0.08);
  color: var(--danger-color);
}

/* ========== 主内容区 ========== */
.main-content {
  flex: 1;
  margin-left: 220px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 手机端顶部栏（PC端隐藏） */
.mobile-header {
  display: none;
}

/* 页面内容 */
.page-content {
  flex: 1;
  padding: 24px;
}

/* ========== 手机端底部导航（PC端隐藏） ========== */
.bottom-nav {
  display: none;
}

/* ========== 手机端库存子菜单 ========== */
.stock-menu-overlay {
  display: none;
}

/* ========== 响应式：手机端 ========== */
@media (max-width: 767px) {
  /* 隐藏侧边栏 */
  .sidebar {
    display: none;
  }

  /* 内容区不留侧边栏空间 */
  .main-content {
    margin-left: 0;
    padding-bottom: 64px; /* 底部导航高度 */
  }

  /* 显示手机端顶部栏 */
  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 52px;
    background: #fff;
    border-bottom: 1px solid var(--border-lighter);
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: var(--box-shadow-card);
  }

  .mobile-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .mobile-logout-btn {
    padding: 6px 12px;
    border: 1px solid var(--border-base);
    border-radius: var(--border-radius-base);
    background: none;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
  }

  .mobile-logout-btn:active {
    background: var(--bg-page);
  }

  /* 页面内容内边距 */
  .page-content {
    padding: 16px;
  }

  /* 显示底部导航 */
  .bottom-nav {
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: #fff;
    border-top: 1px solid var(--border-lighter);
    z-index: 100;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  }

  .bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    text-decoration: none;
    color: var(--text-secondary);
    font-size: 10px;
    border: none;
    background: none;
    cursor: pointer;
    padding: 6px 0;
    transition: color 0.2s;
  }

  .bottom-nav-item--active {
    color: var(--primary-color);
  }

  .bottom-nav-icon {
    font-size: 22px;
    line-height: 1;
  }

  .bottom-nav-label {
    font-size: 10px;
  }

  /* 库存子菜单 */
  .stock-menu-overlay {
    display: flex;
    align-items: flex-end;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 200;
  }

  .stock-menu-panel {
    width: 100%;
    background: #fff;
    border-radius: 16px 16px 0 0;
    padding: 20px 16px calc(env(safe-area-inset-bottom, 0px) + 16px);
  }

  .stock-menu-title {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    text-align: center;
  }

  .stock-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: var(--border-radius-base);
    font-size: 15px;
    color: var(--text-primary);
    text-decoration: none;
    border-bottom: 1px solid var(--border-lighter);
    transition: background 0.2s;
  }

  .stock-menu-item:last-child {
    border-bottom: none;
  }

  .stock-menu-item:active {
    background: var(--bg-page);
  }
}

/* ── 修改密码弹窗 ────────────────────────────────────────── */
.pwd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.pwd-modal {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

.pwd-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-lighter);
}

.pwd-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.pwd-modal-close {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-base);
  transition: var(--transition-fast);
}

.pwd-modal-close:hover {
  background: var(--bg-page);
  color: var(--text-primary);
}

.pwd-modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pwd-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pwd-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.pwd-input {
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  color: var(--text-primary);
  background: #fff;
  outline: none;
  font-family: inherit;
  transition: var(--transition-fast);
  box-sizing: border-box;
}

.pwd-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(19, 194, 194, 0.12);
}

.pwd-input::placeholder {
  color: var(--text-placeholder);
}

.pwd-field--error .pwd-input {
  border-color: var(--danger-color);
}

.pwd-err {
  font-size: 12px;
  color: var(--danger-color);
}

.pwd-modal-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--border-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pwd-btn {
  height: 36px;
  padding: 0 20px;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pwd-btn--cancel {
  background: #fff;
  border: 1px solid var(--border-base);
  color: var(--text-regular);
}

.pwd-btn--cancel:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.pwd-btn--confirm {
  background: var(--primary-color);
  border: none;
  color: #fff;
}

.pwd-btn--confirm:hover:not(:disabled) {
  background: var(--primary-dark);
}

.pwd-btn--confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.pwd-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.25s ease;
}

.slide-up-enter-active .stock-menu-panel,
.slide-up-leave-active .stock-menu-panel {
  transition: transform 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from .stock-menu-panel,
.slide-up-leave-to .stock-menu-panel {
  transform: translateY(100%);
}
</style>
