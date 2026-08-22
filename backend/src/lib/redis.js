const Redis = require('ioredis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      return;
    }
    this.connect();
  }

  connect() {
    try {
      this.client = process.env.REDIS_URL
        ? new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            connectTimeout: 5000,
            commandTimeout: 5000,
          })
        : new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: process.env.REDIS_DB || 0,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            connectTimeout: 5000,
            commandTimeout: 5000,
          });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on("close", () => {
        console.log("🔌 Redis connection closed");
        this.isConnected = false;
      });

      this.client.connect().catch((err) => {
        console.error("❌ Redis connect failed:", err.message);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ Redis initialization error:', error);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async invalidatePattern(pattern) {
    if (!this.isConnected || !this.client) return false;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Redis INVALIDATE error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected || !this.client) return false;
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Cache avec fallback automatique
  async getOrSet(key, fetchFunction, ttlSeconds = 3600) {
    try {
      // Essayer de récupérer depuis le cache
      let data = await this.get(key);
      
      if (data !== null) {
        return data;
      }

      // Si pas en cache, exécuter la fonction
      data = await fetchFunction();
      
      // Sauvegarder en cache
      await this.set(key, data, ttlSeconds);
      
      return data;
    } catch (error) {
      console.error('Redis getOrSet error:', error);
      // En cas d'erreur Redis, exécuter quand même la fonction
      return await fetchFunction();
    }
  }
}

// Instance singleton
const redis = new RedisClient();

module.exports = { redis };