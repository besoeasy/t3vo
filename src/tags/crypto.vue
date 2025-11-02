<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
        <p class="text-gray-600 text-sm">Loading crypto data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="cryptoData?.error" class="p-4">
      <div class="text-center text-red-600">
        <p class="font-semibold text-sm">Failed to load {{ cryptoData.id }}</p>
      </div>
    </div>
    
    <!-- Crypto Data -->
    <div v-else-if="cryptoData">
      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 border-b border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <img v-if="cryptoData.image" :src="cryptoData.image" :alt="cryptoData.name" class="w-10 h-10 rounded-full shadow-sm" />
          <div class="flex-1 min-w-0">
            <h4 class="text-lg font-bold text-gray-900 truncate">{{ cryptoData.name }}</h4>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-600 font-mono uppercase">{{ cryptoData.symbol }}</span>
              <span v-if="cryptoData.market_cap_rank" class="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                #{{ cryptoData.market_cap_rank }}
              </span>
            </div>
          </div>
        </div>
        <div class="text-2xl font-bold text-gray-900">{{ formatCryptoPrice(cryptoData.current_price) }}</div>
        <div v-if="cryptoData.price_change_24h != null" class="flex items-center gap-1 mt-1">
          <span :class="getPriceChangeColor(cryptoData.price_change_24h)" class="text-xs font-semibold">
            {{ cryptoData.price_change_24h >= 0 ? '▲' : '▼' }}
            {{ Math.abs(cryptoData.price_change_24h).toFixed(2) }}%
          </span>
          <span class="text-xs text-gray-500">24h</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="p-4 space-y-2 text-xs">
        <div v-if="cryptoData.market_cap" class="flex items-center justify-between">
          <span class="text-gray-600">Market Cap</span>
          <span class="font-bold text-gray-900">{{ formatLargeNumber(cryptoData.market_cap) }}</span>
        </div>
        <div v-if="cryptoData.total_volume" class="flex items-center justify-between">
          <span class="text-gray-600">24h Volume</span>
          <span class="font-bold text-gray-900">{{ formatLargeNumber(cryptoData.total_volume) }}</span>
        </div>
        <div v-if="cryptoData.high_24h && cryptoData.low_24h" class="flex items-center justify-between">
          <span class="text-gray-600">24h Range</span>
          <span class="font-bold text-gray-900">
            {{ formatCryptoPrice(cryptoData.low_24h) }} - {{ formatCryptoPrice(cryptoData.high_24h) }}
          </span>
        </div>
        <div v-if="cryptoData.price_change_7d != null" class="flex items-center justify-between pt-2 border-t border-gray-100">
          <span class="text-gray-600">7d Change</span>
          <span :class="getPriceChangeColor(cryptoData.price_change_7d)" class="font-bold">
            {{ cryptoData.price_change_7d >= 0 ? '+' : '' }}{{ cryptoData.price_change_7d.toFixed(1) }}%
          </span>
        </div>
        <div v-if="cryptoData.price_change_30d != null" class="flex items-center justify-between">
          <span class="text-gray-600">30d Change</span>
          <span :class="getPriceChangeColor(cryptoData.price_change_30d)" class="font-bold">
            {{ cryptoData.price_change_30d >= 0 ? '+' : '' }}{{ cryptoData.price_change_30d.toFixed(1) }}%
          </span>
        </div>
        
        <!-- CoinGecko Link -->
        <div class="pt-2 border-t border-gray-100">
          <a 
            :href="`https://www.coingecko.com/en/coins/${cryptoData.id}`" 
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

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

const cryptoData = ref(null)
const isLoading = ref(false)

const CACHE_DURATION = 4 * 60 * 60 * 1000
const CACHE_KEY_PREFIX = 'crypto_cache_'
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()

    if (now - timestamp < CACHE_DURATION) {
      return data
    }

    localStorage.removeItem(CACHE_KEY_PREFIX + key)
    return null
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

const setCachedData = (key, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error saving cache:', error)
  }
}

const fetchCryptoData = async (cryptoId) => {
  if (!cryptoId || !cryptoId.trim()) {
    return null
  }

  const trimmedId = cryptoId.trim().toLowerCase()
  const cacheKey = trimmedId

  const cached = getCachedData(cacheKey)
  if (cached) {
    console.log(`Using cached data for ${trimmedId}`)
    return cached
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${trimmedId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    )

    if (!response.ok) {
      console.error(`Failed to fetch ${trimmedId}: ${response.status}`)
      return {
        id: trimmedId,
        error: true,
        message: `Failed to fetch data for ${trimmedId}`,
      }
    }

    const data = await response.json()

    const cryptoData = {
      id: data.id,
      symbol: data.symbol?.toUpperCase(),
      name: data.name,
      image: data.image?.large || data.image?.small,
      current_price: data.market_data?.current_price?.usd,
      market_cap: data.market_data?.market_cap?.usd,
      market_cap_rank: data.market_data?.market_cap_rank,
      price_change_24h: data.market_data?.price_change_percentage_24h,
      price_change_7d: data.market_data?.price_change_percentage_7d,
      price_change_30d: data.market_data?.price_change_percentage_30d,
      price_change_1y: data.market_data?.price_change_percentage_1y,
      total_volume: data.market_data?.total_volume?.usd,
      high_24h: data.market_data?.high_24h?.usd,
      low_24h: data.market_data?.low_24h?.usd,
      website: data.links?.homepage?.[0],
      blockchain_site: data.links?.blockchain_site?.[0],
      last_updated: data.last_updated,
    }

    setCachedData(cacheKey, cryptoData)
    return cryptoData
  } catch (error) {
    console.error(`Error fetching ${trimmedId}:`, error)
    return {
      id: trimmedId,
      error: true,
      message: error.message,
    }
  }
}

const formatCryptoPrice = (price) => {
  if (!price) return 'N/A'
  
  if (price < 0.01) {
    return `$${price.toFixed(6)}`
  } else if (price < 1) {
    return `$${price.toFixed(4)}`
  } else if (price < 100) {
    return `$${price.toFixed(2)}`
  } else {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

const formatLargeNumber = (num) => {
  if (!num) return 'N/A'
  
  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`
  } else if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`
  } else {
    return `$${num.toFixed(2)}`
  }
}

const getPriceChangeColor = (change) => {
  if (!change && change !== 0) return 'text-gray-500'
  return change >= 0 ? 'text-green-600' : 'text-red-600'
}

const loadCryptoData = async () => {
  if (!props.value) return
  
  isLoading.value = true
  cryptoData.value = null

  try {
    const data = await fetchCryptoData(props.value)
    cryptoData.value = data
  } catch (error) {
    console.error('Error loading crypto data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadCryptoData())
watch(() => props.value, () => loadCryptoData())
</script>

<script>
// Tag metadata - exported for the tag registry system
export const tagMetadata = {
  name: 'crypto',
  displayName: 'Cryptocurrency',
  description: 'Track cryptocurrency prices and market data from CoinGecko',
  example: 'crypto=bitcoin',
  category: 'finance',
  icon: '₿',
  aliases: [],
  parseValue: (value) => value.trim().toLowerCase(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Cryptocurrency name is required' }
    }
    return { valid: true }
  }
}
</script>
