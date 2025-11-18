
/**
 * 📊 COMPREHENSIVE OBSERVABILITY ENGINE
 * Real-time monitoring, metrics, and analytics
 */
const EventEmitter = require('events');

class ObservabilityEngine extends EventEmitter {
    constructor() {
        super();
        this.metrics = new Map();
        this.traces = [];
        this.alerts = [];
        this.dashboards = new Map();
        
        this.initializeMetrics();
        this.startMetricsCollection();
    }

    initializeMetrics() {
        // Blockchain-specific metrics
        this.registerMetric('blockchain_height', 'gauge', 'Current blockchain height');
        this.registerMetric('transactions_per_second', 'gauge', 'Real-time TPS');
        this.registerMetric('active_validators', 'gauge', 'Number of active STARW validators');
        this.registerMetric('memory_usage', 'gauge', 'Memory usage percentage');
        this.registerMetric('cpu_usage', 'gauge', 'CPU utilization percentage');
        this.registerMetric('network_latency', 'histogram', 'Network response times');
        this.registerMetric('error_rate', 'counter', 'Application error rate');
        this.registerMetric('wallet_operations', 'counter', 'Wallet operations count');
        this.registerMetric('smart_contract_deployments', 'counter', 'Contract deployments');
        this.registerMetric('zk_proof_generation_time', 'histogram', 'ZK proof generation time');

        console.log('📊 Initialized blockchain-specific metrics');
    }

    registerMetric(name, type, description) {
        this.metrics.set(name, {
            type,
            description,
            value: type === 'counter' ? 0 : null,
            history: [],
            timestamp: Date.now()
        });
    }

    updateMetric(name, value, labels = {}) {
        const metric = this.metrics.get(name);
        if (!metric) return;

        const timestamp = Date.now();
        
        if (metric.type === 'counter') {
            metric.value += value;
        } else {
            metric.value = value;
        }

        metric.history.push({ value: metric.value, timestamp, labels });
        metric.timestamp = timestamp;

        // Keep only last 1000 data points
        if (metric.history.length > 1000) {
            metric.history = metric.history.slice(-1000);
        }

        // Emit metric update event
        this.emit('metric_updated', { name, value: metric.value, timestamp, labels });

        // Check for alerts
        this.checkAlerts(name, metric.value);
    }

    startMetricsCollection() {
        // Collect system metrics every 5 seconds
        setInterval(() => {
            this.collectSystemMetrics();
        }, 5000);

        // Collect blockchain metrics every 10 seconds
        setInterval(() => {
            this.collectBlockchainMetrics();
        }, 10000);

        console.log('📊 Started automatic metrics collection');
    }

    collectSystemMetrics() {
        // CPU and Memory metrics
        const used = process.memoryUsage();
        this.updateMetric('memory_usage', used.heapUsed / 1024 / 1024); // MB

        // CPU usage (simplified)
        const cpuUsage = process.cpuUsage();
        this.updateMetric('cpu_usage', (cpuUsage.user + cpuUsage.system) / 1000000); // Convert to seconds
    }

    async collectBlockchainMetrics() {
        try {
            // Simulate blockchain metrics collection
            const blockHeight = Math.floor(Date.now() / 10000); // Simulated block height
            const tps = Math.random() * 1000 + 130000; // Simulated TPS around 131K
            const activeValidators = 1313 + Math.floor(Math.random() * 100); // Around 1313 validators

            this.updateMetric('blockchain_height', blockHeight);
            this.updateMetric('transactions_per_second', tps);
            this.updateMetric('active_validators', activeValidators);

            // ZK proof metrics
            const zkProofTime = Math.random() * 50 + 10; // 10-60ms
            this.updateMetric('zk_proof_generation_time', zkProofTime);

        } catch (error) {
            console.error('Error collecting blockchain metrics:', error);
            this.updateMetric('error_rate', 1);
        }
    }

    createAlert(metricName, condition, threshold, severity = 'warning') {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            metricName,
            condition, // 'above', 'below', 'equals'
            threshold,
            severity,
            active: true,
            created: Date.now(),
            triggered: []
        };

        this.alerts.push(alert);
        console.log(`🚨 Alert created: ${metricName} ${condition} ${threshold}`);
        return alert.id;
    }

    checkAlerts(metricName, value) {
        this.alerts
            .filter(alert => alert.metricName === metricName && alert.active)
            .forEach(alert => {
                let triggered = false;

                switch (alert.condition) {
                    case 'above':
                        triggered = value > alert.threshold;
                        break;
                    case 'below':
                        triggered = value < alert.threshold;
                        break;
                    case 'equals':
                        triggered = value === alert.threshold;
                        break;
                }

                if (triggered) {
                    this.triggerAlert(alert, value);
                }
            });
    }

    triggerAlert(alert, value) {
        const alertEvent = {
            alertId: alert.id,
            metricName: alert.metricName,
            value,
            threshold: alert.threshold,
            severity: alert.severity,
            timestamp: Date.now()
        };

        alert.triggered.push(alertEvent);
        
        console.log(`🚨 ALERT TRIGGERED: ${alert.metricName} = ${value} (${alert.condition} ${alert.threshold})`);
        
        this.emit('alert_triggered', alertEvent);
    }

    getMetrics(names = null) {
        if (names) {
            const result = {};
            names.forEach(name => {
                if (this.metrics.has(name)) {
                    result[name] = this.metrics.get(name);
                }
            });
            return result;
        }
        return Object.fromEntries(this.metrics);
    }

    getDashboardData(timeRange = 3600) { // Default 1 hour
        const now = Date.now();
        const startTime = now - (timeRange * 1000);

        const dashboardData = {};
        
        this.metrics.forEach((metric, name) => {
            const filteredHistory = metric.history.filter(
                point => point.timestamp >= startTime
            );
            
            dashboardData[name] = {
                current: metric.value,
                history: filteredHistory,
                description: metric.description,
                type: metric.type
            };
        });

        return {
            timeRange,
            startTime,
            endTime: now,
            metrics: dashboardData,
            alerts: this.alerts.filter(alert => 
                alert.triggered.some(t => t.timestamp >= startTime)
            )
        };
    }

    exportPrometheusMetrics() {
        let output = '';
        
        this.metrics.forEach((metric, name) => {
            output += `# HELP ${name} ${metric.description}\n`;
            output += `# TYPE ${name} ${metric.type}\n`;
            output += `${name} ${metric.value || 0}\n`;
        });

        return output;
    }
}

module.exports = ObservabilityEngine;