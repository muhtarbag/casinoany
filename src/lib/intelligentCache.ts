/**
 * Intelligent caching utility with TTL and LRU eviction
 * Optimizes performance for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class IntelligentCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes
    this.maxSize = options.maxSize || 100; // Default 100 entries
  }

  // Set cache entry
  set(key: string, data: T): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
    });
  }

  // Get cache entry
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();

    // Check if entry is expired
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Delete specific entry
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all entries
  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Evict least recently used entry
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: entries.map(([key, entry]) => ({
        key,
        age: now - entry.timestamp,
        accessCount: entry.accessCount,
        isExpired: now - entry.timestamp > this.ttl,
      })),
    };
  }

  // Invalidate entries matching pattern
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }
}

// Global cache instances
export const queryCache = new IntelligentCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
});

export const searchCache = new IntelligentCache({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 50,
});

export const userPreferencesCache = new IntelligentCache({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 20,
});

// Cache key generators
export const cacheKeys = {
  sites: {
    list: (filters?: Record<string, any>) => 
      `sites:list:${JSON.stringify(filters || {})}`,
    detail: (id: string) => `sites:detail:${id}`,
    analytics: (id: string, range?: string) => 
      `sites:analytics:${id}:${range || 'week'}`,
  },
  reviews: {
    list: (filters?: Record<string, any>) => 
      `reviews:list:${JSON.stringify(filters || {})}`,
    detail: (id: string) => `reviews:detail:${id}`,
  },
  blog: {
    list: (filters?: Record<string, any>) => 
      `blog:list:${JSON.stringify(filters || {})}`,
    detail: (id: string) => `blog:detail:${id}`,
  },
  search: (term: string, context: string) => 
    `search:${context}:${term.toLowerCase()}`,
};

// Cache invalidation helpers
export const invalidateCache = {
  sites: () => queryCache.invalidatePattern(/^sites:/),
  reviews: () => queryCache.invalidatePattern(/^reviews:/),
  blog: () => queryCache.invalidatePattern(/^blog:/),
  all: () => queryCache.clear(),
};

export { IntelligentCache };
