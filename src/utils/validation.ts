import type { ValidationRule } from '@/types/common'

// 通用验证规则
export const validationRules = {
  // 必填验证
  required: (message = '此字段为必填项'): ValidationRule => ({
    required: true,
    message
  }),

  // 最小长度验证
  minLength: (min: number, message?: string): ValidationRule => ({
    min,
    message: message || `最少输入 ${min} 个字符`
  }),

  // 最大长度验证
  maxLength: (max: number, message?: string): ValidationRule => ({
    max,
    message: message || `最多输入 ${max} 个字符`
  }),

  // 邮箱验证
  email: (message = '请输入有效的邮箱地址'): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message
  }),

  // 手机号验证
  phone: (message = '请输入有效的手机号'): ValidationRule => ({
    pattern: /^1[3-9]\d{9}$/,
    message
  }),

  // 数字验证
  number: (message = '请输入有效的数字'): ValidationRule => ({
    pattern: /^\d+$/,
    message
  }),

  // 正数验证
  positiveNumber: (message = '请输入正数'): ValidationRule => ({
    pattern: /^[1-9]\d*$/,
    message
  }),

  // 非负数验证
  nonNegativeNumber: (message = '请输入非负数'): ValidationRule => ({
    pattern: /^(0|[1-9]\d*)$/,
    message
  })
}

// 验证函数
export const validate = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    // 必填验证
    if (rule.required && (value === null || value === undefined || value === '')) {
      return rule.message
    }

    // 如果值为空且不是必填，跳过其他验证
    if (value === null || value === undefined || value === '') {
      continue
    }

    // 最小长度验证
    if (rule.min && typeof value === 'string' && value.length < rule.min) {
      return rule.message
    }

    // 最大长度验证
    if (rule.max && typeof value === 'string' && value.length > rule.max) {
      return rule.message
    }

    // 正则验证
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message
    }
  }

  return null
}

// 批量验证
export const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule[]>): Record<string, string> => {
  const errors: Record<string, string> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validate(data[field], fieldRules)
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

// 实时验证函数（用于表单输入时）
export const createValidator = (rules: ValidationRule[]) => {
  return (value: any) => validate(value, rules)
}

// 防抖验证
export const debounceValidate = (
  validateFn: (value: any) => string | null,
  delay: number = 300
) => {
  let timeoutId: number | null = null

  return (value: any): Promise<string | null> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        const result = validateFn(value)
        resolve(result)
      }, delay)
    })
  }
}
