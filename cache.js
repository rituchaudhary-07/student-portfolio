import NodeCache from 'node-cache'

// Step 2 of Practical 9: Initialize shared cache instance with stdTTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 })

let totalHits = 0
let totalMisses = 0

export const incrementHits = () => {
  totalHits += 1
}

export const incrementMisses = () => {
  totalMisses += 1
}

// Supplementary Problem 2: Expose cache hit/miss statistics
export const getCacheStats = () => {
  const nodeStats = cache.getStats()
  const totalRequests = totalHits + totalMisses
  const hitRatio = totalRequests > 0 ? ((totalHits / totalRequests) * 100).toFixed(2) + '%' : '0%'

  return {
    success: true,
    stats: {
      totalHits,
      totalMisses,
      totalRequests,
      hitRatio,
      cachedKeysCount: cache.keys().length,
      cachedKeys: cache.keys(),
      stdTTLSeconds: 60,
      nodeCacheMetrics: nodeStats,
    },
  }
}

export const flushCacheStats = () => {
  totalHits = 0
  totalMisses = 0
  cache.flushAll()
}

export default cache
