import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCourseStore = defineStore('course', () => {
  const courses = ref([] as any[])
  const currentCourse = ref(null as any)
  const loading = ref(false)
  const error = ref('')

  const reset = () => {
    courses.value = []
    currentCourse.value = null
    loading.value = false
    error.value = ''
  }

  return { courses, currentCourse, loading, error, reset }
})
