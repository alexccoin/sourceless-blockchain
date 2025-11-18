
/**
 * 🔗 HOSTLESS DATABASE CONNECTION POOL
 * Efficient blockchain database connections
 */
class HostlessConnectionPool {
    constructor() {
        this.maxConnections = 100;
        this.minConnections = 10;
        this.activeConnections = new Set();
        this.idleConnections = [];
        this.waitingQueue = [];
        
        this.initializePool();
    }

    async initializePool() {
        for (let i = 0; i < this.minConnections; i++) {
            const connection = await this.createConnection();
            this.idleConnections.push(connection);
        }
        
        console.log(`🔗 Connection pool initialized: ${this.minConnections} idle connections`);
    }

    async createConnection() {
        return {
            id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            blockchain: require('../database/HostlessDatabase'),
            lastUsed: Date.now(),
            inUse: false
        };
    }

    async acquire() {
        if (this.idleConnections.length > 0) {
            const connection = this.idleConnections.pop();
            connection.inUse = true;
            connection.lastUsed = Date.now();
            this.activeConnections.add(connection);
            return connection;
        }

        if (this.activeConnections.size < this.maxConnections) {
            const connection = await this.createConnection();
            connection.inUse = true;
            this.activeConnections.add(connection);
            return connection;
        }

        // Wait for available connection
        return new Promise((resolve) => {
            this.waitingQueue.push(resolve);
        });
    }

    async release(connection) {
        connection.inUse = false;
        connection.lastUsed = Date.now();
        this.activeConnections.delete(connection);
        
        if (this.waitingQueue.length > 0) {
            const waiting = this.waitingQueue.shift();
            connection.inUse = true;
            this.activeConnections.add(connection);
            waiting(connection);
        } else {
            this.idleConnections.push(connection);
        }
    }

    getStats() {
        return {
            active: this.activeConnections.size,
            idle: this.idleConnections.length,
            waiting: this.waitingQueue.length,
            total: this.activeConnections.size + this.idleConnections.length
        };
    }
}

module.exports = HostlessConnectionPool;