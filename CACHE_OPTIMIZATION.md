# 🚀 Optimisations de Cache - Art Studio 242

Ce document détaille les optimisations de cache multi-couches implémentées pour améliorer drastiquement les performances de l'application.

## 📊 Architecture de Cache

### 1. **Cache Serveur (Redis)**
- **Durée**: 1-24h selon le type de données
- **Usage**: Cache des requêtes API, données de galerie
- **Avantages**: Évite les requêtes DB répétitives
- **Invalidation**: Automatique lors des modifications

### 2. **Cache HTTP (CDN/Browser)**
- **Durée**: 5min-7j selon le type de ressource
- **Usage**: Headers Cache-Control, ETag, Last-Modified
- **Avantages**: Évite les requêtes serveur

### 3. **Cache Client (Browser)**
- **Memory Cache**: Données en mémoire (session)
- **Local Storage**: Persistance entre sessions
- **Service Worker**: Cache offline et stratégies avancées

## 🛠️ Installation

### Redis (Windows)
```powershell
# Installation automatique
npm run redis:install

# Ou manuel avec Chocolatey
choco install redis-64 -y
redis-server --service-install
redis-server --service-start
```

### Redis (macOS/Linux)
```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt install redis-server
sudo systemctl start redis
```

## 🚀 Démarrage Rapide

```bash
# Démarrer tous les services (avec vérification Redis)
npm run dev

# Ou séparément
npm run dev:api    # API avec cache Redis
npm run dev:web    # Application web optimisée
```

## 📈 Stratégies de Cache Implémentées

### Images et Assets
- **Stratégie**: Cache First
- **Durée Server**: 24h
- **Durée Browser**: 1h
- **Durée CDN**: 7j
- **Lazy Loading**: ✅ Intersection Observer
- **WebP**: ✅ Conversion automatique
- **Srcset**: ✅ Images responsives

### API Data
- **Stratégie**: Network First
- **Durée Server**: 5min-1h
- **Fallback**: Cache Redis
- **Stale-While-Revalidate**: ✅

### Static Resources
- **Stratégie**: Stale While Revalidate
- **Service Worker**: ✅ Cache offline
- **Compression**: ✅ Gzip

## 🔧 Configuration

### Variables d'environnement
```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Commandes utiles
```bash
# Vider le cache Redis
npm run cache:clear

# Redémarrer Redis
npm run redis:stop
npm run redis:start

# Monitoring Redis
redis-cli monitor
```

## 📊 Performance Attendue

### Avant optimisation
- **First Contentful Paint**: ~2-3s
- **Images**: Chargement séquentiel
- **API**: Requête DB à chaque appel
- **Offline**: Non supporté

### Après optimisation
- **First Contentful Paint**: ~0.5-1s
- **Images**: Lazy loading + WebP + Cache
- **API**: Cache Redis (95% de cache hit attendu)
- **Offline**: Support complet

### Gains estimés
- **Réduction requêtes DB**: 80-95%
- **Temps de chargement**: 60-80% plus rapide
- **Bande passante**: 40-60% de réduction
- **Expérience utilisateur**: Chargement instantané des pages visitées

## 🔍 Monitoring

### Redis Stats
```bash
redis-cli info stats
redis-cli info memory
```

### Cache Headers (DevTools)
- Vérifier headers `Cache-Control`, `ETag`
- Status `X-Cache: HIT/MISS`
- Network tab pour validation

### Performance Metrics
- Core Web Vitals améliorés
- Time to Interactive réduit
- Cache hit ratio élevé

## 🐛 Debugging

### Cache Issues
```bash
# Vérifier Redis
redis-cli ping

# Vider cache spécifique
redis-cli keys "gallery:*"
redis-cli del "gallery:*"

# Service Worker
# DevTools > Application > Storage > Clear
```

### Common Issues
- **Redis non démarré**: Vérifier le service
- **Cache stale**: Invalidation automatique activée
- **Images lentes**: Vérifier WebP support et lazy loading
- **Service Worker**: Refresh hard (Ctrl+Shift+R)

## 🔄 Cache Invalidation

### Automatique
- **Create/Update/Delete**: Invalidation patterns Redis
- **Service Worker**: Stratégies par type de ressource
- **Browser**: Headers ETag et Last-Modified

### Manuel
```javascript
// Client-side
const { invalidate } = useCache();
invalidate('gallery_images');

// Server-side
await redis.invalidatePattern('gallery:*');
```

## 📚 Architecture Technique

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   Server        │    │   Database      │
│                 │    │                 │    │                 │
│ Memory Cache    │◄─► │ Redis Cache     │◄─► │ PostgreSQL      │
│ LocalStorage    │    │ HTTP Headers    │    │ Prisma ORM      │
│ Service Worker  │    │ Compression     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

Cette architecture garantit des performances optimales avec une stratégie de fallback robuste en cas de défaillance d'une couche de cache.