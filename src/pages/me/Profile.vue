<template>
  <div class="page">
    <h1>个人中心</h1>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="content">
      <div class="card">
        <div class="section-title">账号信息</div>
        <div class="kv">
          <div class="k">用户名</div>
          <div class="v">{{ profile?.username || '-' }}</div>
        </div>
        <div class="kv">
          <div class="k">角色</div>
          <div class="v">{{ profile?.role || '-' }}</div>
        </div>
        <div class="kv">
          <div class="k">状态</div>
          <div class="v">{{ formatStatus((profile as any)?.status) }}</div>
        </div>
      </div>

      <div class="card">
        <div class="section-title">资料编辑</div>
        <div class="form">
          <BaseInput v-model="form.phone" label="手机号" placeholder="请输入手机号" required />
          <BaseInput v-model="form.email" type="email" label="邮箱" placeholder="可选" />
          <BaseInput v-model="form.realName" label="真实姓名" placeholder="可选" />
          <BaseInput v-model="form.avatarUrl" label="头像URL" placeholder="可选 https://..." />
        </div>

        <div class="actions">
          <BaseButton type="secondary" :disabled="saving" @click="resetForm">重置</BaseButton>
          <BaseButton type="primary" :loading="saving" @click="handleSave">保存</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { userApi, type UserProfile } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const profile = ref<UserProfile | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const form = ref<{ phone: string; email: string; realName: string; avatarUrl: string }>({
  phone: '',
  email: '',
  realName: '',
  avatarUrl: ''
})

const formatStatus = (s?: number) => {
  if (s === 1) return '启用'
  if (s === 0) return '停用'
  if (typeof s === 'number') return String(s)
  return '-'
}

const applyProfileToForm = (p: any) => {
  form.value = {
    phone: p?.phone || '',
    email: p?.email || '',
    realName: p?.realName || '',
    avatarUrl: p?.avatarUrl || ''
  }
}

const fetchMe = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await userApi.me()
    profile.value = res.data || null
    applyProfileToForm(profile.value)
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  applyProfileToForm(profile.value)
}

const handleSave = async () => {
  if (!form.value.phone) {
    error.value = '手机号不能为空'
    return
  }
  saving.value = true
  error.value = ''

  try {
    await userApi.updateMe({
      phone: form.value.phone,
      email: form.value.email || undefined,
      realName: form.value.realName || undefined,
      avatarUrl: form.value.avatarUrl || undefined
    })

    // 更新页面展示 + 同步本地用户信息
    await fetchMe()
    userStore.updateUser({
      phone: form.value.phone,
      email: form.value.email || undefined,
      realName: form.value.realName || undefined,
      avatarUrl: form.value.avatarUrl || undefined
    })
  } catch (e: any) {
    error.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

onMounted(fetchMe)
</script>

<style scoped>
.page { padding: 8px; }

.error { color: #d14343; margin: 8px 0; }
.loading { margin: 8px 0; }

.content {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 12px;
  align-items: start;
  margin-top: 12px;
}

.card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}

.section-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.kv {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 8px;
  padding: 6px 0;
}

.k { color: #666; }
.v { color: #333; word-break: break-all; }

.form { margin-top: 4px; }

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .content { grid-template-columns: 1fr; }
}
</style>
