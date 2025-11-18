
/**
 * 🌐 INTELLIGENT LOAD BALANCER
 * Smart request routing based on blockchain operations
 */
const cluster = require('cluster');
const os = require('os');

class IntelligentLoadBalancer {
    constructor() {
        this.workers = new Map();
        this.requestQueue = [];
        this.metrics = {
            totalRequests: 0,
            activeConnections: 0,
            avgResponseTime: 0,
            errorRate: 0
        };
        
        this.initializeCluster();
    }

    initializeCluster() {
        const numCPUs = os.cpus().length;
        console.log(`🌐 Initializing cluster with ${numCPUs} workers`);

        if (cluster.isMaster) {
            // Master process - load balancer
            for (let i = 0; i < numCPUs; i++) {
                this.createWorker(i);
            }

            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died. Restarting...`);
                this.createWorker();
            });

            // Start metrics collection
            setInterval(() => this.collectMetrics(), 5000);
            
        } else {
            // Worker process - actual server
            require('./server-production-hardened.js');
        }
    }

    createWorker(id) {
        const worker = cluster.fork();
        this.workers.set(worker.id, {
            worker,
            load: 0,
            requests: 0,
            responseTime: 0,
            specialization: this.determineSpecialization(id)
        });

        worker.on('message', (msg) => {
            if (msg.type === 'metrics') {
                this.updateWorkerMetrics(worker.id, msg.data);
            }
        });
    }

    determineSpecialization(workerId) {
        // Specialize workers for different blockchain operations
        const specializations = [
            'transaction-processing',
            'smart-contracts',
            'wallet-operations', 
            'blockchain-queries',
            'api-endpoints',
            'websocket-connections'
        ];
        
        return specializations[workerId % specializations.length];
    }

    routeRequest(request) {
        const requestType = this.analyzeRequest(request);
        const suitableWorkers = Array.from(this.workers.values())
            .filter(w => w.specialization === requestType || requestType === 'general')
            .sort((a, b) => a.load - b.load);

        if (suitableWorkers.length > 0) {
            const selectedWorker = suitableWorkers[0];
            selectedWorker.load += 1;
            selectedWorker.requests += 1;
            return selectedWorker.worker;
        }

        // Fallback to least loaded worker
        return Array.from(this.workers.values())
            .sort((a, b) => a.load - b.load)[0].worker;
    }

    analyzeRequest(request) {
        const url = request.url || '';
        
        if (url.includes('/api/transaction')) return 'transaction-processing';
        if (url.includes('/api/contract')) return 'smart-contracts';
        if (url.includes('/api/wallet')) return 'wallet-operations';
        if (url.includes('/api/blockchain')) return 'blockchain-queries';
        if (url.includes('/ws')) return 'websocket-connections';
        
        return 'general';
    }

    collectMetrics() {
        const totalWorkers = this.workers.size;
        const totalLoad = Array.from(this.workers.values()).reduce((sum, w) => sum + w.load, 0);
        
        this.metrics.activeConnections = totalLoad;
        this.metrics.avgResponseTime = this.calculateAvgResponseTime();
        
        console.log(`📊 Load Balancer Metrics: ${totalWorkers} workers, ${totalLoad} active connections`);
    }

    calculateAvgResponseTime() {
        const workers = Array.from(this.workers.values());
        const totalResponseTime = workers.reduce((sum, w) => sum + w.responseTime, 0);
        return workers.length > 0 ? totalResponseTime / workers.length : 0;
    }

    updateWorkerMetrics(workerId, metrics) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.load = metrics.load || 0;
            worker.responseTime = metrics.responseTime || 0;
        }
    }

    getHealthStatus() {
        return {
            healthy: this.workers.size > 0,
            workers: this.workers.size,
            metrics: this.metrics,
            uptime: process.uptime()
        };
    }
}

module.exports = IntelligentLoadBalancer;