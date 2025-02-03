// backend/src/services/cache.js
import NodeCache from 'node-cache';

class CacheService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = 600) {
    return this.cache.set(key, value, ttl);
  }

  del(key) {
    return this.cache.del(key);
  }
}

export default new CacheService();