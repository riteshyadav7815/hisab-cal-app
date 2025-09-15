// Enhanced API cache with performance optimizations
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 60000; // 60 seconds for high performance

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clearByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Performance monitoring
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance for high-performance caching
export const apiCache = new APICache();

// High-performance cached fetch with shorter TTL
export async function cachedFetch(url: string, options?: RequestInit, ttl = 30000) {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  
  // Try cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      apiCache.set(cacheKey, data, ttl);
    }
    
    return data;
  } catch (error) {
    console.error('Cached fetch error:', error);
    throw error;
  }
}

export default apiCache;