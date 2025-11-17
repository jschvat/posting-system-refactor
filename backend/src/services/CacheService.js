/**
 * Cache Service using Redis
 * Provides caching utilities for the application
 * Based on API Optimization Analysis recommendations
 */

const Redis = require('ioredis');
const cacheConfig = require('../config/cache');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.enabled = cacheConfig.enabled;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    if (!this.enabled) {
      console.log('[Cache] Cache disabled');
      return;
    }

    try {
      this.client = new Redis(cacheConfig.redis);

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('[Cache] Connected to Redis');
      });

      this.client.on('error', (err) => {
        console.error('[Cache] Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.isConnected = false;
        console.log('[Cache] Redis connection closed');
      });

      // Test connection
      await this.client.ping();
      console.log('[Cache] Redis initialized successfully');
    } catch (error) {
      console.error('[Cache] Failed to connect to Redis:', error.message);
      this.enabled = false;
    }
  }

  /**
   * Check if cache is enabled and connected
   */
  isReady() {
    return this.enabled && this.isConnected && this.client;
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Parsed value or null
   */
  async get(key) {
    if (!this.isReady()) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`[Cache] Error getting key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300)
   */
  async set(key, value, ttl = 300) {
    if (!this.isReady()) return false;

    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[Cache] Error setting key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   */
  async del(key) {
    if (!this.isReady()) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`[Cache] Error deleting key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., "user:*")
   */
  async delPattern(pattern) {
    if (!this.isReady()) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`[Cache] Error deleting pattern ${pattern}:`, error.message);
      return false;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if cache miss
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} - Cached or fetched value
   */
  async getOrSet(key, fetchFn, ttl = 300) {
    // Try to get from cache
    let value = await this.get(key);

    if (value !== null) {
      return value;
    }

    // Cache miss - fetch data
    try {
      value = await fetchFn();

      // Store in cache
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttl);
      }

      return value;
    } catch (error) {
      console.error(`[Cache] Error in getOrSet for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Increment a numeric value
   * @param {string} key - Cache key
   * @param {number} amount - Amount to increment (default: 1)
   * @returns {Promise<number>} - New value
   */
  async incr(key, amount = 1) {
    if (!this.isReady()) return amount;

    try {
      return await this.client.incrby(key, amount);
    } catch (error) {
      console.error(`[Cache] Error incrementing key ${key}:`, error.message);
      return amount;
    }
  }

  /**
   * Decrement a numeric value
   * @param {string} key - Cache key
   * @param {number} amount - Amount to decrement (default: 1)
   * @returns {Promise<number>} - New value
   */
  async decr(key, amount = 1) {
    if (!this.isReady()) return -amount;

    try {
      return await this.client.decrby(key, amount);
    } catch (error) {
      console.error(`[Cache] Error decrementing key ${key}:`, error.message);
      return -amount;
    }
  }

  /**
   * Set expiration on a key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   */
  async expire(key, ttl) {
    if (!this.isReady()) return false;

    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(`[Cache] Error setting expiration on key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Hash operations for complex data structures
   */
  async hset(key, field, value) {
    if (!this.isReady()) return false;

    try {
      await this.client.hset(key, field, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[Cache] Error in hset for key ${key}:`, error.message);
      return false;
    }
  }

  async hget(key, field) {
    if (!this.isReady()) return null;

    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`[Cache] Error in hget for key ${key}:`, error.message);
      return null;
    }
  }

  async hgetall(key) {
    if (!this.isReady()) return {};

    try {
      const hash = await this.client.hgetall(key);
      const result = {};
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      return result;
    } catch (error) {
      console.error(`[Cache] Error in hgetall for key ${key}:`, error.message);
      return {};
    }
  }

  async hincrby(key, field, amount = 1) {
    if (!this.isReady()) return amount;

    try {
      return await this.client.hincrby(key, field, amount);
    } catch (error) {
      console.error(`[Cache] Error in hincrby for key ${key}:`, error.message);
      return amount;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      console.log('[Cache] Disconnected from Redis');
    }
  }
}

// Export singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
