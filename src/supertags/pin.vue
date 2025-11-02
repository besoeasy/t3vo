<template>
  <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Pinned</div>
    <div class="flex items-center gap-2">
      <span class="text-2xl">📌</span>
      <span class="text-sm text-gray-900 font-medium">
        {{ isPinned ? 'This note is pinned to the top' : 'Not pinned' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: 'false'
  }
})

const isPinned = computed(() => {
  const val = props.value.toLowerCase().trim()
  return val === 'true' || val === '1' || val === 'yes'
})
</script>

<script>
export const tagMetadata = {
  name: 'pin',
  displayName: 'Pin',
  description: 'Pin this note to the top of your dashboard',
  example: 'pin=true',
  category: 'metadata',
  icon: '📌',
  parseValue: (value) => value.trim().toLowerCase(),
  validate: (value) => {
    const val = value.trim().toLowerCase()
    const validValues = ['true', 'false', '1', '0', 'yes', 'no']
    if (!validValues.includes(val)) {
      return { valid: false, error: 'Value must be true, false, 1, 0, yes, or no' }
    }
    return { valid: true }
  }
}
</script>
