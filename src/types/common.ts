// 通用类型定义

// 基础实体接口
export interface BaseEntity {
  id?: number
  createTime?: string
  updateTime?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页数据
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 选择器选项
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// 表格列配置
export interface TableColumn {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message: string
  trigger?: 'blur' | 'change' | 'submit'
}

// 表单字段配置
export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea'
  placeholder?: string
  options?: SelectOption[]
  rules?: ValidationRule[]
  disabled?: boolean
  readonly?: boolean
}

// 模态框配置
export interface ModalConfig {
  title?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  showClose?: boolean
  closeOnClickOverlay?: boolean
  maskClosable?: boolean
}

// 通知类型
export type NotificationType = 'success' | 'warning' | 'error' | 'info'

// 通知配置
export interface NotificationConfig {
  type: NotificationType
  title?: string
  message: string
  duration?: number
  closable?: boolean
}

// 加载状态
export interface LoadingState {
  loading: boolean
  message?: string
}

// 错误状态
export interface ErrorState {
  hasError: boolean
  message?: string
  code?: string | number
}

// 操作结果
export interface OperationResult<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 文件上传类型
export interface FileUpload {
  file: File
  name: string
  size: number
  type: string
  url?: string
  status?: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
}

// 主题配置
export interface ThemeConfig {
  primaryColor: string
  darkMode: boolean
  fontSize: 'small' | 'medium' | 'large'
  language: 'zh-CN' | 'en-US'
}

// 菜单项
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
}

// 面包屑项
export interface BreadcrumbItem {
  title: string
  path?: string
}

// 用户权限
export interface Permission {
  resource: string
  actions: string[]
}

// 角色类型
export type Role = 'admin' | 'teacher' | 'student' | 'guest'

// 状态类型
export type Status = 'active' | 'inactive' | 'pending' | 'deleted'

// 性别类型
export type Gender = 'male' | 'female' | 'other'

// 时间范围
export interface DateRange {
  start: string
  end: string
}
