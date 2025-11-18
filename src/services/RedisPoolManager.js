
/**
 * 🚀 REDIS CONNECTION POOL MANAGER
 * High-performance caching for blockchain operations
 */
const redis = require('redis');
const { createPool } = require('generic-pool');

class RedisPoolManager {
    constructor() {
        this.pool = createPool({
            create: async () => {
                const client = redis.createClient({
                    host: process.env.REDIS_HOST || 'localhost',
                    port: process.env.REDIS_PORT || 6379,
                    retry_strategy: (options) => {
                        if (options.error && options.error.code === 'ECONNREFUSED') {
                            return new Error('Redis server refused connection');
                        }
                        if (options.total_retry_time > 1000 * 60 * 60) {
                            return new Error('Retry time exhausted');
                        }
                        return Math.min(options.attempt * 100, 3000);
                    }
                });
                await client.connect();
                return client;
            },
            destroy: async (client) => {
                await client.quit();
            }
        }, {
            max: 50,    // Maximum pool size
            min: 5,     // Minimum pool size
            acquireTimeoutMillis: 3000,
            createTimeoutMillis: 3000,
            destroyTimeoutMillis: 5000,
            idleTimeoutMillis: 30000
        });

        console.log('🔗 Redis connection pool initialized (5-50 connections)');
    }

    async getConnection() {
        return await this.pool.acquire();
    }

    async releaseConnection(client) {
        await this.pool.release(client);
    }

    async cacheBlockchainQuery(key, data, ttl = 300) {
        const client = await this.getConnection();
        try {
            await client.setEx(key, ttl, JSON.stringify(data));
        } finally {
            await this.releaseConnection(client);
        }
    }

    async getCachedQuery(key) {
        const client = await this.getConnection();
        try {
            const cached = await client.get(key);
            return cached ? JSON.parse(cached) : null;
        } finally {
            await this.releaseConnection(client);
        }
    }
}

module.exports = RedisPoolManager;