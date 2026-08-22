const CACHE_NAME = 'artstudio242-v2';
const STATIC_CACHE = 'artstudio242-static-v2';
const API_CACHE = 'artstudio242-api-v2';
const IMAGE_CACHE = 'artstudio242-images-v2';

// Ressources statiques à mettre en cache
const STATIC_RESOURCES = [
  '/',
  '/galerie',
  '/reserver',
  '/avis',
  '/offline',
  '/manifest.webmanifest'
];

// Configuration du cache par type de ressource
const CACHE_STRATEGIES = {
  // Images: Cache First avec fallback
  images: {
    cacheName: IMAGE_CACHE,
    strategy: 'CacheFirst',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    maxEntries: 100
  },
  // API: Network First avec cache de secours
  api: {
    cacheName: API_CACHE,
    strategy: 'NetworkFirst',
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50
  },
  // Ressources statiques: Stale While Revalidate
  static: {
    cacheName: STATIC_CACHE,
    strategy: 'StaleWhileRevalidate',
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    maxEntries: 30
  }
};

// Installation du SW
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_RESOURCES);
      }),
      self.skipWaiting()
    ])
  );
});

// Activation du SW
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!Object.values(CACHE_STRATEGIES).some(config => config.cacheName === cacheName) && 
                cacheName !== STATIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Stratégies de cache
async function cacheFirst(request, config) {
  const cache = await caches.open(config.cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback pour les images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#333"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white">Image indisponible</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

async function networkFirst(request, config) {
  const cache = await caches.open(config.cacheName);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, config) {
  const cache = await caches.open(config.cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// Gestionnaire principal des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP et non-GET
  if (!request.url.startsWith('http') || request.method !== 'GET') {
    return;
  }

  // Déterminer la stratégie de cache
  let config;
  
  if (request.destination === 'image' || url.pathname.includes('/uploads/')) {
    config = CACHE_STRATEGIES.images;
  } else if (url.pathname.startsWith('/api/')) {
    config = CACHE_STRATEGIES.api;
  } else {
    config = CACHE_STRATEGIES.static;
  }

  event.respondWith(
    (async () => {
      try {
        switch (config.strategy) {
          case 'CacheFirst':
            return await cacheFirst(request, config);
          case 'NetworkFirst':
            return await networkFirst(request, config);
          case 'StaleWhileRevalidate':
            return await staleWhileRevalidate(request, config);
          default:
            return fetch(request);
        }
      } catch (error) {
        console.error('SW Fetch error:', error);
        
        // Fallback vers page offline pour la navigation
        if (request.mode === 'navigate') {
          return caches.match('/offline') || caches.match('/') || new Response('Offline');
        }
        
        throw error;
      }
    })()
  );
});

// Nettoyage périodique des caches
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanExpiredCache();
  }
});

async function cleanExpiredCache() {
  for (const config of Object.values(CACHE_STRATEGIES)) {
    const cache = await caches.open(config.cacheName);
    const requests = await cache.keys();
    
    // Limiter le nombre d'entrées
    if (requests.length > config.maxEntries) {
      const toDelete = requests.slice(0, requests.length - config.maxEntries);
      await Promise.all(toDelete.map(request => cache.delete(request)));
    }
  }
}

// Nettoyage automatique toutes les heures
setInterval(cleanExpiredCache, 60 * 60 * 1000);
