const { redis } = require('../lib/redis');

// Middleware de cache Redis avec support CDN/Browser
function createCacheMiddleware(options = {}) {
  const {
    ttl = 3600, // 1 heure par défaut
    browserCacheTtl = 300, // 5 minutes pour le browser
    cdnCacheTtl = 86400, // 24 heures pour le CDN
    keyGenerator = (req) => `api:${req.originalUrl || req.url}`,
    skipCache = false,
    invalidatePatterns = []
  } = options;

  return async (req, res, next) => {
    // Skip cache pour certaines conditions
    if (skipCache || req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator(req);
    
    try {
      // Vérifier le cache Redis
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        // Headers de cache pour browser et CDN
        res.set({
          'Cache-Control': `public, max-age=${browserCacheTtl}, s-maxage=${cdnCacheTtl}`,
          'ETag': `"${cached.etag || Date.now()}"`,
          'Last-Modified': cached.lastModified || new Date().toUTCString(),
          'X-Cache': 'HIT'
        });
        
        return res.json(cached.data);
      }

      // Si pas en cache, intercepter la réponse
      const originalJson = res.json;
      res.json = function(body) {
        // Sauvegarder en cache Redis
        const cacheData = {
          data: body,
          etag: Date.now().toString(),
          lastModified: new Date().toUTCString(),
          timestamp: Date.now()
        };
        
        redis.set(cacheKey, cacheData, ttl).catch(err => {
          console.error('Cache save error:', err);
        });

        // Headers de cache
        res.set({
          'Cache-Control': `public, max-age=${browserCacheTtl}, s-maxage=${cdnCacheTtl}`,
          'ETag': `"${cacheData.etag}"`,
          'Last-Modified': cacheData.lastModified,
          'X-Cache': 'MISS'
        });

        // Envoyer la réponse originale
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

// Middleware pour invalider le cache
function createCacheInvalidator(patterns = []) {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(body) {
      // Invalider les patterns de cache après la réponse
      setImmediate(async () => {
        try {
          for (const pattern of patterns) {
            await redis.invalidatePattern(pattern);
          }
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      });
      
      return originalJson.call(this, body);
    };
    
    next();
  };
}

// Cache spécialisé pour les images
const imageCacheMiddleware = createCacheMiddleware({
  ttl: 86400, // 24 heures pour les images
  browserCacheTtl: 3600, // 1 heure browser
  cdnCacheTtl: 86400 * 7, // 7 jours CDN
  keyGenerator: (req) => `images:${req.originalUrl}:${req.query.category || 'all'}`
});

// Cache pour les données de configuration
const configCacheMiddleware = createCacheMiddleware({
  ttl: 3600, // 1 heure
  browserCacheTtl: 600, // 10 minutes browser
  cdnCacheTtl: 3600, // 1 heure CDN
  keyGenerator: (req) => `config:${req.originalUrl}`
});

// Cache pour les données dynamiques (reviews, bookings)
const dynamicCacheMiddleware = createCacheMiddleware({
  ttl: 300, // 5 minutes
  browserCacheTtl: 60, // 1 minute browser
  cdnCacheTtl: 300, // 5 minutes CDN
  keyGenerator: (req) => `dynamic:${req.originalUrl}:${JSON.stringify(req.query)}`
});

module.exports = {
  createCacheMiddleware,
  createCacheInvalidator,
  imageCacheMiddleware,
  configCacheMiddleware,
  dynamicCacheMiddleware
};