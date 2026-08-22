const CACHE_NAME = 'artstudio242-v5';
const STATIC_CACHE = 'artstudio242-static-v5';
const API_CACHE = 'artstudio242-api-v5';
const IMAGE_CACHE = 'artstudio242-images-v5';

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
      caches.open(STATIC_CACHE).then((cache) =>
        // On ajoute chaque ressource individuellement : si l'une échoue
        // (404, offline pendant le build, etc.), les autres restent en cache
        // et l'installation du SW n'échoue jamais entièrement.
        Promise.all(
          STATIC_RESOURCES.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('SW install: échec cache pour', url, err.message);
            })
          )
        )
      ),
      self.skipWaiting(),
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

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      // Pas de réponse réseau : on retombe sur le cache si dispo,
      // sinon on laisse l'appelant gérer l'erreur (jamais de valeur `undefined`
      // silencieuse qui casserait la navigation).
      if (cached) return cached;
      throw error;
    });

  // Important : `cached` est déjà une valeur résolue (pas une Promise),
  // donc ce `||` est sûr ici (contrairement à comparer deux Promises).
  return cached || fetchPromise;
}

// Réponse HTML minimale garantie valide, utilisée en tout dernier recours.
function offlineFallbackResponse() {
  return new Response(
    '<h1>Hors connexion</h1><p>Vérifiez votre connexion internet et réessayez.</p>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

// Pour une navigation complète (changement de page/URL dans la barre
// d'adresse, rechargement, premier chargement), on ne fait JAMAIS dépendre
// l'affichage du site de la logique de cache : le réseau est toujours tenté
// en premier, exactement comme sans Service Worker. Le cache n'intervient
// que si l'utilisateur est réellement hors connexion. Ainsi, un bug dans les
// stratégies de cache ci-dessous ne peut plus jamais empêcher le site de
// s'afficher.
async function handleNavigate(request) {
  try {
    const response = await fetch(request);
    if (response instanceof Response) return response;
  } catch {
    /* réseau indisponible, on tente le cache ci-dessous */
  }

  try {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match('/offline');
    if (offline) return offline;
    const home = await caches.match('/');
    if (home) return home;
  } catch {
    /* accès au cache impossible, on retombe sur la réponse minimale */
  }

  return offlineFallbackResponse();
}

// Gestionnaire principal des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorer les requêtes non-HTTP et non-GET
  if (!request.url.startsWith('http') || request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request));
    return;
  }

  const url = new URL(request.url);

  // Déterminer la stratégie de cache pour les sous-ressources
  // (images, appels API, assets statiques) — jamais pour la navigation.
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
        let response;
        switch (config.strategy) {
          case 'CacheFirst':
            response = await cacheFirst(request, config);
            break;
          case 'NetworkFirst':
            response = await networkFirst(request, config);
            break;
          case 'StaleWhileRevalidate':
            response = await staleWhileRevalidate(request, config);
            break;
          default:
            response = await fetch(request);
        }
        // Ne jamais renvoyer une valeur non-Response à respondWith :
        // Chrome affiche "This page couldn't load" si la valeur est undefined.
        if (response instanceof Response) return response;
        throw new Error('Réponse invalide du cache/réseau');
      } catch (error) {
        console.error('SW Fetch error:', error);
        // Sous-ressource en échec (image, appel API, asset) : on laisse le
        // navigateur gérer normalement (image cassée, requête en erreur)
        // plutôt que de risquer une réponse invalide qui casserait la page.
        return fetch(request).catch(() => {
          throw error;
        });
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
