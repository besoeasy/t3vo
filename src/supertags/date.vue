<template>
  <div class="w-full p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-6">
    <div class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex-shrink-0 shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
    <div class="flex flex-col flex-1 min-w-0">
      <span class="text-sm text-gray-500 font-semibold tracking-wide uppercase mb-2">Date</span>
      <span class="text-xl font-bold text-gray-900 select-all leading-tight">{{ value }}</span>
      <span v-if="relative" class="text-base text-gray-600 mt-2 font-medium">{{ relative }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { format as timeagoFormat } from "timeago.js";

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  parsed: {
    type: Object,
    default: null
  }
});

const relative = computed(() => {
  if (!props.value) return "";
  // Try to parse as date string
  const date = new Date(props.value);
  if (isNaN(date.getTime())) return "";
  return timeagoFormat(date);
});
</script>

<script>
export const tagMetadata = {
  name: 'date',
  displayName: 'Date',
  description: 'Display dates with relative time formatting (e.g., "2 days ago")',
  example: 'date=2025-11-03',
  category: 'organization',
  icon: '📅',
  aliases: [],
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Date is required' }
    }
    const date = new Date(value.trim())
    if (isNaN(date.getTime())) {
      return { valid: false, error: 'Invalid date format' }
    }
    return { valid: true }
  }
}
</script>
