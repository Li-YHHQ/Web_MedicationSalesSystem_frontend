/// <reference types="vite/client" />

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
