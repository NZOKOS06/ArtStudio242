"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// Cache en mémoire global avec TTL
const memoryCache = new Map();
const cacheMetadata = new Map();

// Nettoyage automatique du cache
setInterval(() => {
  const now = Date.now();
  for (const [key, meta] of cacheMetadata.entries()) {
    if (meta.expires < now) {
      memoryCache.delete(key);
      cacheMetadata.delete(key);
    }
  }
}, 60000); // Nettoyage chaque minute

export function useCache() {
  // Récupérer depuis le cache multi-couches
  const get = useCallback((key) => {
    // 1. Vérifier le cache mémoire
    const memoryData = memoryCache.get(key);
    const metadata = cacheMetadata.get(key);
    
    if (memoryData && metadata && metadata.expires > Date.now()) {
      return { data: memoryData, source: 'memory' };
    }

    // 2. Vérifier le localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expires > Date.now()) {
          // Remettre en cache mémoire
          memoryCache.set(key, parsed.data);
          cacheMetadata.set(key, { expires: parsed.expires });
          return { data: parsed.data, source: 'localStorage' };
        } else {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Cache localStorage error:', error);
    }

    return null;
  }, []);

  // Sauvegarder dans le cache multi-couches
  const set = useCallback((key, data, ttlMs = 5 * 60 * 1000) => {
    const expires = Date.now() + ttlMs;
    
    // 1. Cache mémoire
    memoryCache.set(key, data);
    cacheMetadata.set(key, { expires });

    // 2. localStorage (si possible)
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        expires,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Cache localStorage save error:', error);
    }
  }, []);

  // Invalider une clé ou un pattern
  const invalidate = useCallback((keyOrPattern) => {
    if (keyOrPattern.includes('*')) {
      // Pattern matching
      const pattern = keyOrPattern.replace('*', '');
      
      // Nettoyer le cache mémoire
      for (const key of memoryCache.keys()) {
        if (key.startsWith(pattern)) {
          memoryCache.delete(key);
          cacheMetadata.delete(key);
        }
      }

      // Nettoyer localStorage
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`cache_${pattern}`)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn('Cache invalidation error:', error);
      }
    } else {
      // Clé spécifique
      memoryCache.delete(keyOrPattern);
      cacheMetadata.delete(keyOrPattern);
      try {
        localStorage.removeItem(`cache_${keyOrPattern}`);
      } catch (error) {
        console.warn('Cache removal error:', error);
      }
    }
  }, []);

  return { get, set, invalidate };
}

// Hook pour données avec cache automatique et fallback
export function useCachedData(key, fetchFunction, options = {}) {
  const { 
    ttl = 5 * 60 * 1000, // 5 minutes par défaut
    staleWhileRevalidate = true,
    retryOnError = true,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { get, set, invalidate } = useCache();
  
  const fetchRef = useRef(fetchFunction);
  fetchRef.current = fetchFunction;

  const loadData = useCallback(async (useStale = false) => {
    try {
      if (!useStale) {
        setLoading(true);
        setError(null);
      }

      // Vérifier le cache
      const cached = get(key);
      if (cached) {
        setData(cached.data);
        if (!useStale) {
          setLoading(false);
        }
        
        // Si stale-while-revalidate et données anciennes, recharger en arrière-plan
        if (staleWhileRevalidate && cached.source === 'localStorage') {
          // Revalider en arrière-plan
          try {
            const freshData = await fetchRef.current();
            set(key, freshData, ttl);
            setData(freshData);
          } catch (err) {
            console.warn('Background revalidation failed:', err);
          }
        }
        
        return cached.data;
      }

      // Pas de cache, charger les données
      const freshData = await fetchRef.current();
      setData(freshData);
      set(key, freshData, ttl);
      
      return freshData;
    } catch (err) {
      console.error('Data loading error:', err);
      setError(err);
      
      if (retryOnError) {
        // Retry avec backoff exponentiel
        setTimeout(() => loadData(true), 1000);
      }
    } finally {
      setLoading(false);
    }
  }, [key, ttl, staleWhileRevalidate, retryOnError, get, set]);

  // Fonction de refetch manuel
  const refetch = useCallback(() => {
    invalidate(key);
    return loadData();
  }, [key, loadData, invalidate]);

  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate: () => invalidate(key)
  };
}