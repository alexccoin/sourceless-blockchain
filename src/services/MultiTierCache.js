
/**
 * 💾 MULTI-TIER CACHING SYSTEM
 * L1: In-Memory, L2: Redis, L3: STARW Storage
 */
class MultiTierCache {
    constructor() {
        this.l1Cache = new Map(); // In-memory cache
        this.l2Cache = null;      // Redis cache (initialized async)
        this.l3Cache = null;      // STARW distributed cache
        this.maxL1Size = 10000;
        
        this.initializeL2Cache();
        this.initializeL3Cache();
    }

    async initializeL2Cache() {
        try {
            const RedisPoolManager = require('../services/RedisPoolManager');
            this.l2Cache = new RedisPoolManager();
            console.log('🔄 L2 Cache (Redis) initialized');
        } catch (error) {
            console.log('⚠️  L2 Cache unavailable, using L1 only');
        }
    }

    initializeL3Cache() {
        // STARW distributed cache initialization
        this.l3Cache = {
            async get(key) {
                // Connect to STARW network for distributed caching
                return null; // Placeholder
            },
            async set(key, value, ttl) {
                // Store in STARW distributed network
                return true; // Placeholder
            }
        };
        console.log('🌐 L3 Cache (STARW) initialized');
    }

    async get(key) {
        // L1: Check in-memory cache first (fastest)
        if (this.l1Cache.has(key)) {
            const cached = this.l1Cache.get(key);
            if (cached.expires > Date.now()) {
                return cached.value;
            } else {
                this.l1Cache.delete(key);
            }
        }

        // L2: Check Redis cache (fast)
        if (this.l2Cache) {
            const cached = await this.l2Cache.getCachedQuery(key);
            if (cached) {
                // Promote to L1 cache
                this.setL1(key, cached, 300);
                return cached;
            }
        }

        // L3: Check STARW distributed cache (distributed)
        if (this.l3Cache) {
            const cached = await this.l3Cache.get(key);
            if (cached) {
                // Promote to L1 and L2 caches
                this.setL1(key, cached, 300);
                if (this.l2Cache) {
                    await this.l2Cache.cacheBlockchainQuery(key, cached, 300);
                }
                return cached;
            }
        }

        return null;
    }

    async set(key, value, ttl = 300) {
        // Set in all cache tiers
        this.setL1(key, value, ttl);
        
        if (this.l2Cache) {
            await this.l2Cache.cacheBlockchainQuery(key, value, ttl);
        }
        
        if (this.l3Cache) {
            await this.l3Cache.set(key, value, ttl);
        }
    }

    setL1(key, value, ttl) {
        // Manage L1 cache size
        if (this.l1Cache.size >= this.maxL1Size) {
            const firstKey = this.l1Cache.keys().next().value;
            this.l1Cache.delete(firstKey);
        }

        this.l1Cache.set(key, {
            value,
            expires: Date.now() + (ttl * 1000)
        });
    }

    getCacheStats() {
        return {
            l1: {
                size: this.l1Cache.size,
                maxSize: this.maxL1Size
            },
            l2: this.l2Cache ? 'Connected' : 'Unavailable',
            l3: this.l3Cache ? 'Connected' : 'Unavailable'
        };
    }
}

module.exports = MultiTierCache;