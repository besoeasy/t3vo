<template>
  <div v-if="cryptoAddresses && cryptoAddresses.length > 0" class="p-4 bg-orange-50 rounded-xl border border-orange-200 shadow-sm">
    <div class="text-xs font-semibold text-orange-700 mb-3 uppercase tracking-wide">
      Crypto Addresses ({{ cryptoAddresses.length }})
    </div>
    <div class="space-y-2">
      <div
        v-for="(addr, index) in cryptoAddresses"
        :key="index"
        class="p-3 bg-white rounded-lg border border-orange-200 hover:border-orange-400 transition-all"
      >
        <div class="flex items-start gap-2 mb-2">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="getCryptoColorClass(addr.type)">
              <span class="text-lg font-bold">{{ addr.icon }}</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-semibold text-gray-900">{{ addr.currency }}</div>
            <div class="text-xs text-gray-500">{{ addr.subtype }}</div>
          </div>
        </div>
        
        <div class="space-y-2">
          <!-- Address with copy button -->
          <div class="flex items-center gap-2">
            <div class="flex-1 min-w-0 p-2 bg-gray-50 rounded border border-gray-200">
              <code class="text-xs text-gray-700 break-all font-mono">{{ addr.address }}</code>
            </div>
            <button
              @click="copyToClipboard(addr.address)"
              class="flex-shrink-0 p-2 text-orange-600 hover:bg-orange-100 rounded transition-colors"
              title="Copy address"
            >
              <Copy class="w-4 h-4" />
            </button>
          </div>
          
          <!-- Blockchair link -->
          <a
            :href="`https://blockchair.com/search?q=${addr.address}`"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-xs font-medium"
          >
            <ExternalLink class="w-3.5 h-3.5" />
            View on Blockchair
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Copy, ExternalLink } from 'lucide-vue-next'

defineProps({
  cryptoAddresses: {
    type: Array,
    default: () => []
  }
})

const getCryptoColorClass = (type) => {
  switch (type) {
    case 'bitcoin':
      return 'bg-orange-100 text-orange-800'
    case 'ethereum':
      return 'bg-blue-100 text-blue-800'
    case 'litecoin':
      return 'bg-gray-100 text-gray-800'
    case 'solana':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
    console.log('Address copied to clipboard')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}
</script>
