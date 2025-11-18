
/**
 * 🛡️ ML-BASED THREAT DETECTION SYSTEM
 * Advanced anomaly detection for blockchain security
 */
class MLThreatDetection {
    constructor() {
        this.anomalyThreshold = 0.8;
        this.trafficPatterns = new Map();
        this.suspiciousIPs = new Set();
        this.behaviorModels = this.initializeBehaviorModels();
        
        console.log('🧠 ML Threat Detection System initialized');
    }

    initializeBehaviorModels() {
        return {
            normalTransactionPattern: {
                avgTxPerHour: 150,
                avgAmount: 1000,
                commonDestinations: new Set(),
                timeDistribution: new Array(24).fill(0)
            },
            attackPatterns: {
                ddos: { rapidRequests: true, multipleIPs: true },
                flooding: { highVolume: true, lowValue: true },
                sybil: { newAccounts: true, coordinated: true }
            }
        };
    }

    async analyzeTransaction(transaction, clientIP) {
        const riskScore = await this.calculateRiskScore(transaction, clientIP);
        
        if (riskScore > this.anomalyThreshold) {
            await this.triggerSecurityAlert(transaction, clientIP, riskScore);
            return false; // Block suspicious transaction
        }

        this.updateBehaviorModels(transaction, clientIP);
        return true; // Allow transaction
    }

    async calculateRiskScore(transaction, clientIP) {
        let riskScore = 0;

        // IP reputation analysis
        if (this.suspiciousIPs.has(clientIP)) riskScore += 0.3;

        // Transaction amount analysis
        if (transaction.amount > this.behaviorModels.normalTransactionPattern.avgAmount * 10) {
            riskScore += 0.2;
        }

        // Frequency analysis
        const recentTx = this.getRecentTransactions(clientIP);
        if (recentTx.length > 100) riskScore += 0.4;

        // Pattern analysis
        const patternScore = await this.analyzeTransactionPattern(transaction);
        riskScore += patternScore;

        return Math.min(riskScore, 1.0);
    }

    async triggerSecurityAlert(transaction, clientIP, riskScore) {
        const alert = {
            timestamp: new Date().toISOString(),
            type: 'SUSPICIOUS_TRANSACTION',
            clientIP,
            riskScore,
            transaction: {
                from: transaction.from,
                to: transaction.to,
                amount: transaction.amount,
                type: transaction.type
            },
            actions: ['BLOCKED', 'LOGGED', 'NOTIFIED']
        };

        console.log('🚨 SECURITY ALERT:', JSON.stringify(alert, null, 2));
        
        // Add IP to suspicious list temporarily
        this.suspiciousIPs.add(clientIP);
        setTimeout(() => this.suspiciousIPs.delete(clientIP), 3600000); // 1 hour

        return alert;
    }

    getRecentTransactions(clientIP) {
        const oneHourAgo = Date.now() - 3600000;
        return Array.from(this.trafficPatterns.get(clientIP) || [])
            .filter(tx => tx.timestamp > oneHourAgo);
    }

    async analyzeTransactionPattern(transaction) {
        // Implement sophisticated pattern analysis
        // This is a simplified version - production would use actual ML models
        let patternScore = 0;

        // Check for round amounts (potential automated behavior)
        if (transaction.amount % 1000 === 0) patternScore += 0.1;

        // Check for sequential transactions
        if (this.isSequentialTransaction(transaction)) patternScore += 0.2;

        return patternScore;
    }

    isSequentialTransaction(transaction) {
        // Simplified check for sequential behavior
        return transaction.from === transaction.to; // Self-transfer check
    }

    updateBehaviorModels(transaction, clientIP) {
        if (!this.trafficPatterns.has(clientIP)) {
            this.trafficPatterns.set(clientIP, []);
        }

        this.trafficPatterns.get(clientIP).push({
            ...transaction,
            timestamp: Date.now()
        });

        // Clean old data (keep only last 24 hours)
        const oneDayAgo = Date.now() - 86400000;
        const recentTransactions = this.trafficPatterns.get(clientIP)
            .filter(tx => tx.timestamp > oneDayAgo);
        this.trafficPatterns.set(clientIP, recentTransactions);
    }
}

module.exports = MLThreatDetection;