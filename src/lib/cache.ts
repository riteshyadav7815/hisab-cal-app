import { prisma } from './db-optimized'

interface CacheOptions {
  ttl?: number // Time to live in seconds
}

class CacheService {
  private memoryCache = new Map<string, { value: unknown; expires: number }>()
  private readonly DEFAULT_TTL = 300 // 5 minutes

  // Memory cache for frequently accessed data
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && memoryEntry.expires > Date.now()) {
      return memoryEntry.value as T
    }

    // Check database cache
    try {
      const dbEntry = await prisma.cacheEntry.findUnique({
        where: { key },
      })

      if (dbEntry && dbEntry.expiresAt > new Date()) {
        const value = JSON.parse(dbEntry.value)
        
        // Store in memory cache for faster access
        this.memoryCache.set(key, {
          value,
          expires: dbEntry.expiresAt.getTime(),
        })
        
        return value as T
      }

      // Clean up expired entry
      if (dbEntry) {
        await prisma.cacheEntry.delete({
          where: { key },
        })
      }
    } catch (error) {
      console.error('Cache get error:', error)
    }

    return null
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || this.DEFAULT_TTL
    const expires = new Date(Date.now() + ttl * 1000)

    // Store in memory cache
    this.memoryCache.set(key, {
      value,
      expires: expires.getTime(),
    })

    // Store in database cache
    try {
      await prisma.cacheEntry.upsert({
        where: { key },
        update: {
          value: JSON.stringify(value),
          expiresAt: expires,
        },
        create: {
          key,
          value: JSON.stringify(value),
          expiresAt: expires,
        },
      })
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async delete(key: string): Promise<void> {
    // Remove from memory cache
    this.memoryCache.delete(key)

    // Remove from database cache
    try {
      await prisma.cacheEntry.delete({
        where: { key },
      })
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear()

    // Clear database cache
    try {
      await prisma.cacheEntry.deleteMany({})
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  // Clean up expired entries from memory
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expires <= now) {
        this.memoryCache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      memoryEntries: this.memoryCache.size,
      memoryKeys: Array.from(this.memoryCache.keys()),
    }
  }
}

// Create singleton instance
export const cache = new CacheService()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cache.cleanup()
}, 5 * 60 * 1000)

export default cache
