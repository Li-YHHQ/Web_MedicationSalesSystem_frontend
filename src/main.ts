import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 导入全局样式
import '@/assets/styles/variables.css'
import '@/assets/styles/global.css'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(createPinia())
app.use(router)

// 全局错误处理
app.config.errorHandler = (err: any, vm: any, info: string) => {
  console.error('Global error:', err)
  console.error('Component:', vm)
  console.error('Info:', info)
}

// 全局警告处理
app.config.warnHandler = (msg: string, vm: any, trace: string) => {
  console.warn('Global warning:', msg)
  console.warn('Component:', vm)
  console.warn('Trace:', trace)
}

// 挂载应用
app.mount('#app')
