<template>
  <div v-if="cryptoIds.length > 0" class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
        <p class="text-gray-600 text-sm">Loading crypto data...</p>
      </div>
    </div>

    <!-- Crypto Cards -->
    <div v-else class="space-y-4">
      <div
        v-for="crypto in cryptoData"
        :key="crypto.id"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Error State -->
        <div v-if="crypto.error" class="p-4">
          <div class="text-center text-red-600">
            <p class="font-semibold text-sm">Failed to load {{ crypto.id }}</p>
          </div>
        </div>
        
        <!-- Crypto Data -->
        <div v-else>
          <!-- Header -->
          <div class="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 border-b border-gray-200">
            <div class="flex items-center gap-3 mb-3">
              <img v-if="crypto.image" :src="crypto.image" :alt="crypto.name" class="w-10 h-10 rounded-full shadow-sm" />
              <div class="flex-1 min-w-0">
                <h4 class="text-lg font-bold text-gray-900 truncate">{{ crypto.name }}</h4>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-600 font-mono uppercase">{{ crypto.symbol }}</span>
                  <span v-if="crypto.market_cap_rank" class="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                    #{{ crypto.market_cap_rank }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ formatCryptoPrice(crypto.current_price) }}</div>
            <div v-if="crypto.price_change_24h != null" class="flex items-center gap-1 mt-1">
              <span :class="getPriceChangeColor(crypto.price_change_24h)" class="text-xs font-semibold">
                {{ crypto.price_change_24h >= 0 ? '▲' : '▼' }}
                {{ Math.abs(crypto.price_change_24h).toFixed(2) }}%
              </span>
              <span class="text-xs text-gray-500">24h</span>
            </div>
          </div>

          <!-- Stats -->
          <div class="p-4 space-y-2 text-xs">
            <div v-if="crypto.market_cap" class="flex items-center justify-between">
              <span class="text-gray-600">Market Cap</span>
              <span class="font-bold text-gray-900">{{ formatLargeNumber(crypto.market_cap) }}</span>
            </div>
            <div v-if="crypto.total_volume" class="flex items-center justify-between">
              <span class="text-gray-600">24h Volume</span>
              <span class="font-bold text-gray-900">{{ formatLargeNumber(crypto.total_volume) }}</span>
            </div>
            <div v-if="crypto.high_24h && crypto.low_24h" class="flex items-center justify-between">
              <span class="text-gray-600">24h Range</span>
              <span class="font-bold text-gray-900">
                {{ formatCryptoPrice(crypto.low_24h) }} - {{ formatCryptoPrice(crypto.high_24h) }}
              </span>
            </div>
            <div v-if="crypto.price_change_7d != null" class="flex items-center justify-between pt-2 border-t border-gray-100">
              <span class="text-gray-600">7d Change</span>
              <span :class="getPriceChangeColor(crypto.price_change_7d)" class="font-bold">
                {{ crypto.price_change_7d >= 0 ? '+' : '' }}{{ crypto.price_change_7d.toFixed(1) }}%
              </span>
            </div>
            <div v-if="crypto.price_change_30d != null" class="flex items-center justify-between">
              <span class="text-gray-600">30d Change</span>
              <span :class="getPriceChangeColor(crypto.price_change_30d)" class="font-bold">
                {{ crypto.price_change_30d >= 0 ? '+' : '' }}{{ crypto.price_change_30d.toFixed(1) }}%
              </span>
            </div>
            
            <!-- CoinGecko Link -->
            <div class="pt-2 border-t border-gray-100">
              <a 
                :href="`https://www.coingecko.com/en/coins/${crypto.id}`" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <span>View on CoinGecko</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchCryptoData, formatCryptoPrice, formatLargeNumber, getPriceChangeColor } from '@/utils/cryptoApi'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  parsed: {
    type: Object,
    default: null
  }
})

const cryptoData = ref([])
const isLoading = ref(false)

const cryptoIds = computed(() => {
  return props.value?.split(',').map(id => id.trim()).filter(Boolean) || []
})

const loadCryptoData = async () => {
  if (cryptoIds.value.length === 0) return
  
  isLoading.value = true
  cryptoData.value = []

  try {
    const data = await fetchCryptoData(cryptoIds.value)
    cryptoData.value = data
  } catch (error) {
    console.error('Error loading crypto data:', error)
  } finally {
    isLoading.value = false
  }
}

// Load data on mount and when value changes
onMounted(() => loadCryptoData())
watch(() => props.value, () => loadCryptoData())
</script>
