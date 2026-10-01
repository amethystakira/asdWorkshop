// In-memory cache store
const cache = new Map();

// Default TTL: 1 minute (60,000 ms)
const DEFAULT_TTL_MS = 60 * 1000;

/**
 * Middleware to cache GET responses with TTL support.
 * @param {number} ttlMs Time to live in milliseconds (default: 60000 ms = 1 minute)
 */
function cacheMiddleware(ttlMs = DEFAULT_TTL_MS) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedEntry = cache.get(key);

    if (cachedEntry) {
      const isExpired = Date.now() - cachedEntry.createdAt > ttlMs;
      if (!isExpired) {
        // Cache HIT: return cached data with X-Cache header
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedEntry.data);
      }
      // Expired: remove stale entry from cache and proceed to fetch fresh data
      cache.delete(key);
    }

    // Cache MISS: set header and capture response to cache fresh data
    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Only cache successful 2xx responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, {
          data,
          createdAt: Date.now()
        });
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * Middleware to invalidate cache entries when data is modified (POST, PUT, PATCH, DELETE).
 * Invalidates only when the mutation response is successful (2xx).
 */
function invalidateCacheMiddleware(req, res, next) {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      clearCache();
    }
  });
  next();
}

/**
 * Clears all entries from the cache.
 */
function clearCache() {
  cache.clear();
}

/**
 * Returns the current cache map.
 */
function getCache() {
  return cache;
}

module.exports = {
  cacheMiddleware,
  invalidateCacheMiddleware,
  clearCache,
  getCache,
  DEFAULT_TTL_MS
};
