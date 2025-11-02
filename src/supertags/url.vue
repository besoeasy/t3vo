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

<script>
export const tagMetadata = {
  name: "url",
  displayName: "URL",
  description: "Display clickable web URLs with external link indicator",
  example: "url=https://example.com",
  category: "reference",
  icon: "🔗",
  aliases: ["link", "website"],
  parseValue: (value) => {
    const trimmed = value.trim();
    // Add https:// if no protocol is specified
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  },
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: "URL is required" };
    }
    try {
      const trimmed = value.trim();
      const testUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      new URL(testUrl);
      return { valid: true };
    } catch {
      return { valid: false, error: "Invalid URL format" };
    }
  },
};
</script>
