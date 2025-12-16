// 课程实体类型
export interface Course {
  id?: number
  courseName: string
  credit: number
  teacher: string
  location: string
  courseCode: string
  createTime?: string
  updateTime?: string
}

// 创建课程请求类型
export interface CreateCourseRequest {
  courseName: string
  credit: number
  teacher: string
  location: string
  courseCode: string
}

// 更新学分请求类型
export interface UpdateCreditRequest {
  credit: number
}

// 更新地点请求类型
export interface UpdateLocationRequest {
  location: string
}

// 课程查询参数类型
export interface CourseQueryParams {
  keyword?: string
  teacher?: string
  credit?: number
  location?: string
  courseCode?: string
}

// 课程统计类型
export interface CourseStats {
  totalCourses: number
  totalTeachers: number
  totalLocations: number
  avgCredits: number
}

// 课程选项类型（用于下拉框等）
export interface CourseOption {
  label: string
  value: string | number
}

// 课程表单验证类型
export interface CourseFormRule {
  field: keyof Course | keyof CreateCourseRequest
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message: string
}

// 课程过滤器类型
export interface CourseFilter {
  teachers: string[]
  credits: number[]
  locations: string[]
}

// 课程排序类型
export type CourseSortField = 'courseName' | 'credit' | 'teacher' | 'location' | 'createTime' | 'updateTime'
export type SortOrder = 'asc' | 'desc'

export interface CourseSort {
  field: CourseSortField
  order: SortOrder
}
