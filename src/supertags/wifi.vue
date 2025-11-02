<template>
  <div class="p-4 bg-white rounded-xl border border-blue-200 shadow-sm w-full">
    <div class="flex items-center gap-3 mb-3">
      <div class="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
        <Wifi class="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <div class="text-xs font-semibold text-blue-600 uppercase tracking-wide">WiFi Network</div>
      </div>
    </div>
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:gap-6 w-full">
      <div class="flex-1">
        <div class="text-xs font-medium text-gray-500 mb-1">SSID</div>
        <div class="flex items-center gap-2 w-full">
          <span class="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded select-all border border-gray-200 text-sm w-full md:w-auto">{{ ssid }}</span>
          <button @click="copyToClipboard(ssid)" class="p-1.5 rounded hover:bg-blue-100 transition-colors" title="Copy SSID">
            <Copy class="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>
      <div class="flex-1">
        <div class="text-xs font-medium text-gray-500 mb-1">Password</div>
        <div class="flex items-center gap-2 w-full">
          <span class="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded select-all border border-gray-200 text-sm w-full md:w-auto">{{ password }}</span>
          <button @click="copyToClipboard(password)" class="p-1.5 rounded hover:bg-blue-100 transition-colors" title="Copy Password">
            <Copy class="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Wifi, Copy } from 'lucide-vue-next'

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  parsed: {
    type: Object,
    default: null
  }
})

const ssid = computed(() => {
  if (!props.value) return ''
  return props.value.split(':')[0] || ''
})

const password = computed(() => {
  if (!props.value) return ''
  return props.value.split(':').slice(1).join(':') || ''
})

function copyToClipboard(text) {
  if (!text) return
  navigator.clipboard.writeText(text)
}
</script>

<script>
export const tagMetadata = {
  name: 'wifi',
  displayName: 'WiFi Credentials',
  description: 'Store WiFi network credentials (SSID and password)',
  example: 'wifi=MyNetwork:password123',
  category: 'security',
  icon: '📶',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'WiFi credentials are required' }
    }
    if (!value.includes(':')) {
      return { valid: false, error: 'Format must be SSID:password' }
    }
    return { valid: true }
  }
}
</script>
