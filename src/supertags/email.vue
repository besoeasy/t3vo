<template>
  <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Email</div>
    <div class="text-sm text-gray-900 font-mono select-all break-all">
      {{ value }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})
</script>

<script>
export const tagMetadata = {
  name: 'email',
  displayName: 'Email',
  description: 'Store email addresses',
  example: 'email=user@example.com',
  category: 'contact',
  icon: '📧',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Email is required' }
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value.trim())) {
      return { valid: false, error: 'Invalid email format' }
    }
    return { valid: true }
  }
}
</script>
