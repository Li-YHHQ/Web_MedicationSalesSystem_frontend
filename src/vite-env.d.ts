// 临时类型声明 - 安装依赖后会自动被替换
declare module '*.vue' {
  export default {}
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_UPLOAD_URL: string
  readonly VITE_APP_ENV: 'development' | 'production'
  readonly VITE_MOCK_API: boolean
  readonly VITE_SHOW_DEVTOOLS: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 临时声明缺失的模块
declare module 'vue' {
  export const createApp: (component: any) => any
  export const ref: (value: any) => any
  export const reactive: (obj: any) => any
  export const computed: (fn: () => any) => any
  export const watch: (source: any, fn: () => void) => any
  export const onMounted: (fn: () => void) => any
  export const defineComponent: (options: any) => any
}

declare module 'vue-router' {
  export const createRouter: (options: any) => any
  export const createWebHistory: (base?: string) => any
}

declare module 'pinia' {
  export const createPinia: () => any
  export const defineStore: (id: string, setup: () => any) => any
}

declare module 'axios' {
  const axios: any
  export default axios
  export interface AxiosInstance {}
  export interface AxiosRequestConfig {}
  export interface AxiosResponse<T = any> {}
}

declare module 'vite' {
  export const defineConfig: (config: any) => any
}

declare module '@vitejs/plugin-vue' {
  const pluginVue: any
  export default pluginVue
}

declare module 'node:url' {
  export const fileURLToPath: (url: string) => string
  export const URL: any
}

// 通用类型声明
declare type AnyType = any
