<template>
  <div class="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
    <div class="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">Password</div>
    <div class="flex items-center justify-between gap-3">
      <div class="text-sm text-blue-900 font-mono font-bold select-all flex-1 break-all">
        {{ showPassword ? value : "••••••••••••" }}
      </div>
      <button
        @click="showPassword = !showPassword"
        class="px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
      >
        {{ showPassword ? "Hide" : "Show" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const showPassword = ref(false)
</script>

<script>
export const tagMetadata = {
  name: 'password',
  displayName: 'Password',
  description: 'Store login credentials securely with show/hide functionality',
  example: 'password=MySecurePass123!',
  category: 'security',
  icon: '🔐',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Password is required' }
    }
    return { valid: true }
  }
}
</script>
