import NodeCache from 'node-cache';
import { config } from '../config/index.js';

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: config.cache.ttl * 0.2,
      useClones: false,
    });

    this.cache.on('expired', (key) => {
      console.log(`Cache expired for key: ${key}`);
    });
  }

  generateKey(username, type = 'user') {
    return `${type}:${username.toLowerCase()}`;
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = config.cache.ttl) {
    return this.cache.set(key, value, ttl);
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }

  // Specific methods for our use case
  getUserStats(username) {
    const key = this.generateKey(username, 'user');
    return this.get(key);
  }

  setUserStats(username, stats, ttl) {
    const key = this.generateKey(username, 'user');
    return this.set(key, stats, ttl);
  }

  getRepoStats(owner, repo) {
    const key = this.generateKey(`${owner}/${repo}`, 'repo');
    return this.get(key);
  }

  setRepoStats(owner, repo, stats, ttl) {
    const key = this.generateKey(`${owner}/${repo}`, 'repo');
    return this.set(key, stats, ttl);
  }

  // Badge cache (shorter TTL)
  getBadge(key) {
    return this.get(`badge:${key}`);
  }

  setBadge(key, svg, ttl = 300) { // 5 minutes for badges
    return this.set(`badge:${key}`, svg, ttl);
  }

  // Health check
  isHealthy() {
    try {
      const testKey = '__health_check__';
      this.set(testKey, Date.now(), 1);
      const value = this.get(testKey);
      this.del(testKey);
      return value !== undefined;
    } catch (error) {
      return false;
    }
  }
}

export default new CacheService();