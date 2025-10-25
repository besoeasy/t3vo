<template>
  <div v-if="bookmarkUrl">
    <a 
      :href="bookmarkUrl" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="block p-5 bg-white border border-gray-200 rounded-xl hover:border-violet-400 hover:shadow-md transition-all duration-200 group"
    >
      <!-- Icon and Label -->
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
          <svg class="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
          </svg>
        </div>
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Bookmark</span>
      </div>
      
      <!-- URL -->
      <div class="flex items-center gap-2 text-sm text-gray-900 font-medium">
        <span class="truncate flex-1">{{ displayUrl }}</span>
        <svg class="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
      </div>
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

const bookmarkUrl = computed(() => {
  return props.value || props.parsed?.tags?.bookmark || null
})

const displayUrl = computed(() => {
  if (!bookmarkUrl.value) return ''
  return bookmarkUrl.value
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
})
</script>
