<template>
  <div v-if="url" class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Website</div>
    <a :href="url" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 hover:underline break-all inline-flex items-center gap-1">
      <span>{{ url }}</span>
      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
      </svg>
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: null
  },
  parsed: {
    type: Object,
    default: null
  }
})

const url = computed(() => {
  return props.value || props.parsed?.tags?.url || null
})
</script>
