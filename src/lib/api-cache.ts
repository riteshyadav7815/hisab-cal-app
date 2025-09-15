// Client-side API caching for improved performance
interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

class APICache {
  private cache = new Map<string, CacheItem>();
  
  set(key: string, data: any, ttlMs: number = 30000) { // 30 seconds default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMs
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  // Clear specific cache entries by URL pattern
  clearByPattern(pattern: string) {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? Date.now() <= item.expiry : false;
  }
}

export const apiCache = new APICache();

// Enhanced fetch with balanced caching for performance
export async function cachedFetch(url: string, options: RequestInit = {}, ttlMs: number = 30000) { // Reduced default to 30s
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  // Try cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log(`🚀 Cache hit for ${url} - INSTANT response`);
    return cached;
  }
  
  console.log(`🌐 Fetching ${url} - Fresh request`);
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Cache-Control': 'max-age=60, stale-while-revalidate=120', // More aggressive caching
      },
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`⚡ ${url} completed in ${responseTime}ms`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache successful responses with shorter TTL for better freshness
    const extendedTTL = url.includes('/friends') ? 45000 : ttlMs; // 45s for friends APIs
    apiCache.set(cacheKey, data, extendedTTL);
    
    return data;
  } catch (error) {
    console.error(`❌ ${url} failed:`, error);
    throw error;
  }
}