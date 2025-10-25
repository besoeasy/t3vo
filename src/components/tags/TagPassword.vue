<template>
  <div class="space-y-3">
    <!-- Email -->
    <div v-if="email" class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Email</div>
      <div class="text-sm text-gray-900 font-mono select-all break-all">
        {{ email }}
      </div>
    </div>

    <!-- Username -->
    <div v-if="username" class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Username</div>
      <div class="text-sm text-gray-900 font-mono select-all">
        {{ username }}
      </div>
    </div>

    <!-- Password -->
    <div v-if="password" class="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
      <div class="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">Password</div>
      <div class="flex items-center justify-between gap-3">
        <div class="text-sm text-blue-900 font-mono font-bold select-all flex-1 break-all">
          {{ showPassword ? password : "••••••••••••" }}
        </div>
        <button
          @click="showPassword = !showPassword"
          class="px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
        >
          {{ showPassword ? "Hide" : "Show" }}
        </button>
      </div>
    </div>

    <!-- URL/Website -->
    <div v-if="url" class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Website</div>
      <a :href="url" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 hover:underline break-all">
        {{ url }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const showPassword = ref(false)

// Get values from parsed tags
const email = computed(() => props.parsed?.tags?.email || null)
const username = computed(() => props.parsed?.tags?.username || null)
const password = computed(() => props.parsed?.tags?.password || null)
const url = computed(() => props.parsed?.tags?.url || null)
</script>
