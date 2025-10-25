/**
 * CoinGecko API Integration with localStorage caching
 * Cache duration: 4 hours
 */

const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const CACHE_KEY_PREFIX = 'crypto_cache_';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * Get cached data from localStorage
 * @param {string} key - Cache key
 * @returns {Object|null} - Cached data or null if expired/not found
 */
function getCachedData(key) {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid (within 4 hours)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY_PREFIX + key);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Save data to localStorage cache
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 */
function setCachedData(key, data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

/**
 * Fetch cryptocurrency data from CoinGecko
 * @param {string|Array} cryptoIds - Single crypto ID or array of IDs (e.g., 'bitcoin' or ['bitcoin', 'ethereum'])
 * @returns {Promise<Array>} - Array of crypto data objects
 */
export async function fetchCryptoData(cryptoIds) {
  // Normalize to array
  const ids = Array.isArray(cryptoIds) ? cryptoIds : [cryptoIds];
  
  // Filter out empty strings
  const validIds = ids.filter(id => id && id.trim());
  
  if (validIds.length === 0) {
    return [];
  }

  const results = [];

  for (const id of validIds) {
    const trimmedId = id.trim().toLowerCase();
    const cacheKey = trimmedId;

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`Using cached data for ${trimmedId}`);
      results.push(cached);
      continue;
    }

    // Fetch from API
    try {
      const response = await fetch(
        `${COINGECKO_API}/coins/${trimmedId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      );

      if (!response.ok) {
        console.error(`Failed to fetch ${trimmedId}: ${response.status}`);
        results.push({
          id: trimmedId,
          error: true,
          message: `Failed to fetch data for ${trimmedId}`,
        });
        continue;
      }

      const data = await response.json();

      // Extract relevant data
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
      };

      // Cache the data
      setCachedData(cacheKey, cryptoData);
      results.push(cryptoData);

      // Rate limiting: wait 1 second between requests to avoid hitting API limits
      if (validIds.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error fetching ${trimmedId}:`, error);
      results.push({
        id: trimmedId,
        error: true,
        message: error.message,
      });
    }
  }

  return results;
}

/**
 * Clear all crypto cache
 */
export function clearCryptoCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('Crypto cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Format price with appropriate decimals
 * @param {number} price - Price value
 * @returns {string} - Formatted price
 */
export function formatCryptoPrice(price) {
  if (!price) return 'N/A';
  
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else if (price < 100) {
    return `$${price.toFixed(2)}`;
  } else {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Format large numbers (market cap, volume)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatLargeNumber(num) {
  if (!num) return 'N/A';
  
  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  } else if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
}

/**
 * Get color class for price change
 * @param {number} change - Price change percentage
 * @returns {string} - Tailwind color class
 */
export function getPriceChangeColor(change) {
  if (!change && change !== 0) return 'text-gray-500';
  return change >= 0 ? 'text-green-600' : 'text-red-600';
}

/**
 * Get background color class for price change
 * @param {number} change - Price change percentage
 * @returns {string} - Tailwind background color class
 */
export function getPriceChangeBgColor(change) {
  if (!change && change !== 0) return 'bg-gray-100';
  return change >= 0 ? 'bg-green-50' : 'bg-red-50';
}
