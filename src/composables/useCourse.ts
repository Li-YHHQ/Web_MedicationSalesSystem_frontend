import { ref } from 'vue'

export function useCourse() {
  const courses = ref([] as any[])
  const loading = ref(false)
  const error = ref('')

  const notSupported = async () => {
    error.value = '课程模块已移除'
    return null
  }

  return {
    courses,
    loading,
    error,
    fetchCourses: async () => {
      courses.value = []
    },
    getCourseById: notSupported,
    createCourse: notSupported,
    updateCourseCredit: async () => false,
    updateCourseLocation: async () => false,
    deleteCourse: async () => false,
    getCoursesByTeacher: async () => [],
    getCoursesByCredit: async () => [],
    getCoursesByLocation: async () => [],
    searchCourses: async () => [],
    getCoursesByCode: async () => []
  }
}
