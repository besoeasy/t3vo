/**
 * Supertag Cache Utility
 * 
 * Provides localStorage-based caching with flexible duration formats
 * for supertag components. Maximum cache duration is 50 days.
 */

const MAX_CACHE_DURATION = 50 * 24 * 60 * 60 * 1000; // 50 days in milliseconds
const CACHE_KEY_PREFIX = 'supertag_cache_';

/**
 * Parse duration string to milliseconds
 * Supports formats: 1m, 4h, 2d, 30d, etc.
 * 
 * @param {string} duration - Duration string (e.g., "4h", "7d", "30m")
 * @returns {number} Duration in milliseconds
 * 
 * @example
 * parseDuration("30m") // 30 minutes
 * parseDuration("4h")  // 4 hours
 * parseDuration("7d")  // 7 days
 */
function parseDuration(duration) {
  if (typeof duration === 'number') {
    return Math.min(duration, MAX_CACHE_DURATION);
  }

  const match = duration.match(/^(\d+)([mhd])$/);
  if (!match) {
    console.warn(`Invalid duration format: ${duration}. Using default 7d.`);
    return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
  }

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  let milliseconds;
  switch (unit) {
    case 'm': // minutes
      milliseconds = num * 60 * 1000;
      break;
    case 'h': // hours
      milliseconds = num * 60 * 60 * 1000;
      break;
    case 'd': // days
      milliseconds = num * 24 * 60 * 60 * 1000;
      break;
    default:
      milliseconds = 7 * 24 * 60 * 60 * 1000; // Default 7 days
  }

  // Enforce maximum duration
  return Math.min(milliseconds, MAX_CACHE_DURATION);
}

/**
 * Get cached data from localStorage
 * 
 * @param {string} tagName - Name of the supertag (e.g., "crypto", "bookmark")
 * @param {string} key - Cache key (e.g., "bitcoin", "https://example.com")
 * @returns {any|null} Cached data or null if not found/expired
 * 
 * @example
 * const data = getCachedData("crypto", "bitcoin");
 */
export function getCachedData(tagName, key) {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${tagName}_${key}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;

    const { data, timestamp, duration } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp < duration) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error(`Error reading cache for ${tagName}:${key}:`, error);
    return null;
  }
}

/**
 * Clear all expired cache entries across all supertags
 * Useful for manual cleanup or app initialization
 * 
 * @returns {number} Number of expired entries removed
 * 
 * @example
 * const removed = clearExpiredEntries();
 * console.log(`Removed ${removed} expired entries`);
 */
export function clearExpiredEntries() {
  try {
    const now = Date.now();
    let removed = 0;

    // Get all keys that match our cache prefix
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(CACHE_KEY_PREFIX)
    );

    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return;

        const { timestamp, duration } = JSON.parse(item);
        
        // Check if expired
        if (now - timestamp >= duration) {
          localStorage.removeItem(key);
          removed++;
        }
      } catch (e) {
        // Invalid entry, remove it
        localStorage.removeItem(key);
        removed++;
      }
    });

    if (removed > 0) {
      console.log(`Cleaned up ${removed} expired cache entries`);
    }

    return removed;
  } catch (error) {
    console.error('Error clearing expired entries:', error);
    return 0;
  }
}

/**
 * Set cached data in localStorage
 * 
 * @param {string} tagName - Name of the supertag
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {string|number} duration - Cache duration (e.g., "4h", "7d") or milliseconds
 * @returns {boolean} Success status
 * 
 * @example
 * setCachedData("crypto", "bitcoin", cryptoData, "4h");
 * setCachedData("bookmark", "https://example.com", metadata, "30d");
 */
export function setCachedData(tagName, key, data, duration = "7d") {
  // Clean up expired entries before adding new one
  clearExpiredEntries();

  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${tagName}_${key}`;
    const durationMs = parseDuration(duration);
    
    const cacheData = {
      data,
      timestamp: Date.now(),
      duration: durationMs,
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    return true;
  } catch (error) {
    console.error(`Error saving cache for ${tagName}:${key}:`, error);
    
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Clearing old cache entries...');
      clearOldestCache(tagName);
      
      // Try again after clearing
      try {
        const cacheKey = `${CACHE_KEY_PREFIX}${tagName}_${key}`;
        const durationMs = parseDuration(duration);
        const cacheData = {
          data,
          timestamp: Date.now(),
          duration: durationMs,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        return true;
      } catch (retryError) {
        console.error('Failed to cache even after clearing:', retryError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Clear specific cache entry
 * 
 * @param {string} tagName - Name of the supertag
 * @param {string} key - Cache key to clear
 * @returns {boolean} Success status
 * 
 * @example
 * clearCachedData("crypto", "bitcoin");
 */
export function clearCachedData(tagName, key) {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${tagName}_${key}`;
    localStorage.removeItem(cacheKey);
    return true;
  } catch (error) {
    console.error(`Error clearing cache for ${tagName}:${key}:`, error);
    return false;
  }
}

/**
 * Clear all cache entries for a specific supertag
 * 
 * @param {string} tagName - Name of the supertag
 * @returns {number} Number of entries cleared
 * 
 * @example
 * clearAllCache("crypto"); // Clears all crypto cache
 */
export function clearAllCache(tagName) {
  try {
    const prefix = `${CACHE_KEY_PREFIX}${tagName}_`;
    const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
    
    keys.forEach(key => localStorage.removeItem(key));
    return keys.length;
  } catch (error) {
    console.error(`Error clearing all cache for ${tagName}:`, error);
    return 0;
  }
}

/**
 * Clear oldest cache entries for a specific supertag
 * Used when localStorage quota is exceeded
 * 
 * @param {string} tagName - Name of the supertag
 * @param {number} count - Number of entries to remove (default: 5)
 * @returns {number} Number of entries cleared
 */
function clearOldestCache(tagName, count = 5) {
  try {
    const prefix = `${CACHE_KEY_PREFIX}${tagName}_`;
    const entries = [];

    // Collect all cache entries with timestamps
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          entries.push({ key, timestamp: data.timestamp || 0 });
        } catch (e) {
          // Invalid entry, mark for deletion
          entries.push({ key, timestamp: 0 });
        }
      }
    });

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries
    const toRemove = entries.slice(0, count);
    toRemove.forEach(entry => localStorage.removeItem(entry.key));

    return toRemove.length;
  } catch (error) {
    console.error(`Error clearing oldest cache for ${tagName}:`, error);
    return 0;
  }
}

/**
 * Get cache statistics for a specific supertag
 * 
 * @param {string} tagName - Name of the supertag
 * @returns {object} Cache statistics
 * 
 * @example
 * const stats = getCacheStats("crypto");
 * // { total: 10, valid: 8, expired: 2, totalSize: "45.2 KB" }
 */
export function getCacheStats(tagName) {
  try {
    const prefix = `${CACHE_KEY_PREFIX}${tagName}_`;
    const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
    
    let valid = 0;
    let expired = 0;
    let totalSize = 0;

    const now = Date.now();

    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        totalSize += item.length;
        
        const { timestamp, duration } = JSON.parse(item);
        if (now - timestamp < duration) {
          valid++;
        } else {
          expired++;
        }
      } catch (e) {
        expired++;
      }
    });

    return {
      total: keys.length,
      valid,
      expired,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    };
  } catch (error) {
    console.error(`Error getting cache stats for ${tagName}:`, error);
    return { total: 0, valid: 0, expired: 0, totalSize: "0 KB" };
  }
}

export default {
  getCachedData,
  setCachedData,
  clearCachedData,
  clearAllCache,
  clearExpiredEntries,
  getCacheStats,
};
