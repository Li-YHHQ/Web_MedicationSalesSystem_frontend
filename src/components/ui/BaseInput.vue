<template>
  <div class="base-input">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <div class="input-wrapper">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClass"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <span v-if="suffixIcon" class="suffix-icon">{{ suffixIcon }}</span>
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div v-else-if="helperText" class="helper-text">
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  type?: 'text' | 'password' | 'number' | 'email' | 'tel'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  size?: 'small' | 'medium' | 'large'
  suffixIcon?: string
  errorMessage?: string
  helperText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'medium'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
  focus: []
}>()

const isFocused = ref(false)
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClass = computed(() => {
  return [
    'input-field',
    `input-field--${props.size}`,
    {
      'input-field--error': props.errorMessage,
      'input-field--focused': isFocused.value,
      'input-field--disabled': props.disabled,
      'input-field--readonly': props.readonly
    }
  ]
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  if (props.type === 'number') {
    value = target.value === '' ? '' : Number(target.value)
  }
  
  emit('update:modelValue', value)
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')
}

const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}
</script>

<style scoped>
.base-input {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.required {
  color: var(--danger-color);
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  font-size: 14px;
  transition: all 0.3s;
  outline: none;
  background: var(--bg-color);
}

.input-field:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.input-field--error {
  border-color: var(--danger-color);
}

.input-field--error:focus {
  border-color: var(--danger-color);
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

.input-field--disabled {
  background: var(--bg-page);
  color: var(--text-placeholder);
  cursor: not-allowed;
}

.input-field--readonly {
  background: var(--bg-page);
  color: var(--text-regular);
}

/* 尺寸 */
.input-field--small {
  padding: 8px 12px;
  font-size: 12px;
}

.input-field--medium {
  padding: 12px 16px;
  font-size: 14px;
}

.input-field--large {
  padding: 16px 20px;
  font-size: 16px;
}

/* 后缀图标 */
.suffix-icon {
  position: absolute;
  right: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.input-field--small + .suffix-icon {
  right: 8px;
  font-size: 12px;
}

.input-field--large + .suffix-icon {
  right: 16px;
  font-size: 16px;
}

/* 错误和帮助文本 */
.error-message {
  color: var(--danger-color);
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

.helper-text {
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
