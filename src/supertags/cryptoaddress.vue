<template>
  <div class="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200 shadow-sm">
    <div class="flex items-center gap-2 mb-3">
      <span class="text-2xl">{{ addressIcon }}</span>
      <div>
        <div class="text-xs font-semibold text-orange-600 uppercase tracking-wide">
          {{ addressType }} Address
        </div>
      </div>
    </div>
    
    <div class="space-y-3">
      <!-- Address Display -->
      <div class="p-3 bg-white rounded-lg border border-orange-100">
        <div class="text-xs text-gray-500 font-mono break-all select-all">
          {{ value }}
        </div>
      </div>
      
      <!-- View on Blockchair Button -->
      <a
        :href="`https://blockchair.com/search?q=${value}`"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        View on Blockchair
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const detectAddressType = (address) => {
  if (!address) return 'Unknown'
  
  const addr = address.trim()
  
  // Bitcoin address patterns
  // Legacy (P2PKH): starts with 1, 26-35 characters
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr)) {
    return 'Bitcoin'
  }
  
  // P2SH: starts with 3, 26-35 characters
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr)) {
    return 'Bitcoin'
  }
  
  // Bech32 (SegWit): starts with bc1, 42-62 characters
  if (/^bc1[a-z0-9]{39,59}$/.test(addr)) {
    return 'Bitcoin'
  }
  
  // Ethereum address: starts with 0x, 42 characters total (0x + 40 hex chars)
  if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return 'Ethereum'
  }
  
  return 'Crypto'
}

const addressType = computed(() => detectAddressType(props.value))

const addressIcon = computed(() => {
  switch (addressType.value) {
    case 'Bitcoin':
      return '₿'
    case 'Ethereum':
      return 'Ξ'
    default:
      return '🔗'
  }
})
</script>

<script>
export const tagMetadata = {
  name: 'cryptoaddress',
  displayName: 'Crypto Address',
  description: 'Store cryptocurrency wallet addresses with automatic Bitcoin/Ethereum detection and Blockchair lookup',
  example: 'cryptoaddress=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  category: 'finance',
  icon: '🔗',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Crypto address is required' }
    }
    
    const addr = value.trim()
    
    // Check if it matches any known pattern
    const isBitcoin = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/.test(addr)
    const isEthereum = /^0x[a-fA-F0-9]{40}$/.test(addr)
    
    if (!isBitcoin && !isEthereum) {
      return { valid: false, error: 'Invalid Bitcoin or Ethereum address format' }
    }
    
    return { valid: true }
  }
}
</script>
