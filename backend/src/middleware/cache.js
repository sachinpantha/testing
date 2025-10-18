const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

const cacheMiddleware = (key) => {
  return (req, res, next) => {
    const cachedData = cache.get(key);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.json(cachedData.data);
    }
    
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      originalJson.call(this, data);
    };
    
    next();
  };
};

const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

module.exports = { cacheMiddleware, clearCache };