/**
 * Enhanced Proof of Existence Engine with Anomaly Detection
 * 
 * Features:
 * - ZK13-based proof generation
 * - GodCypher validation with earthquake detection
 * - Pattern analysis for suspicious activity
 * - Real-time threat scoring
 * - Anomaly detection (velocity attacks, replay attacks, etc.)
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class EnhancedProofOfExistenceEngine extends EventEmitter {
    constructor() {
        super();
        
        // Proof history for pattern detection
        this.proofHistory = [];
        this.maxHistorySize = 10000;
        
        // Anomaly detection thresholds
        this.thresholds = {
            velocityAttack: {
                maxTxPerSecond: 1000,      // Max transactions per second from one source
                timeWindow: 1000            // 1 second window
            },
            replayAttack: {
                duplicateWindow: 300000     // 5 minutes - consider duplicates within this window
            },
            godCypherIntegrity: {
                minProofLength: 16,         // Minimum proof length
                maxProofAge: 60000          // 1 minute max proof age
            },
            zk13Score: {
                minScore: 50,               // Minimum acceptable ZK13 score
                criticalScore: 30           // Critical threshold
            },
            earthquake: {
                massiveSpike: 500,          // Transactions in short burst
                spikeWindow: 5000,          // 5 second window
                patternDeviation: 3.0       // Standard deviations from normal
            }
        };
        
        // Transaction velocity tracking
        this.velocityTracker = new Map(); // address -> [timestamps]
        
        // Replay attack prevention
        this.seenTransactions = new Map(); // txHash -> timestamp
        
        // Pattern analysis
        this.baselineMetrics = {
            avgTxPerSecond: 0,
            avgTxSize: 0,
            stdDeviation: 0
        };
        
        // Threat scoring
        this.threatScores = new Map(); // address -> score (0-100)
        
        // Earthquake detection
        this.earthquakeEvents = [];
        
        console.log('🔐 Enhanced Proof of Existence Engine initialized');
        console.log('   ⚡ Velocity attack detection: ENABLED');
        console.log('   🔄 Replay attack prevention: ENABLED');
        console.log('   🌊 Earthquake detection: ENABLED');
        console.log('   🛡️  GodCypher validation: ENHANCED');
    }

    /**
     * Create enhanced proof with anomaly detection
     */
    async createProof(validationData) {
        const timestamp = Date.now();
        const { tx, zk13Proof, encryptedPayload, validationContext } = validationData;

        // Step 1: Run all anomaly checks
        const anomalyResults = await this.detectAnomalies(validationData);

        // Step 2: Validate GodCypher integrity
        const godCypherValidation = this.validateGodCypherIntegrity(encryptedPayload);

        // Step 3: Check ZK13 score
        const zk13Validation = this.validateZK13Score(zk13Proof);

        // Step 4: Calculate threat score
        const threatScore = this.calculateThreatScore(tx.from, anomalyResults);

        // Step 5: Detect earthquake patterns
        const earthquakeDetection = this.detectEarthquake(tx, timestamp);

        // Step 6: Generate proof hash
        const proofHash = crypto.createHash('sha256')
            .update(JSON.stringify(validationData) + timestamp)
            .digest('hex');

        // Step 7: Create Merkle root
        const merkleRoot = this.calculateMerkleRoot([proofHash]);

        // Step 8: Compile comprehensive proof
        const proof = {
            // Core proof data
            hash: proofHash,
            timestamp,
            exists: true,
            merkleRoot,
            
            // Validation results
            zk13Valid: zk13Validation.valid,
            zk13Score: zk13Proof.score || 0,
            godCypherValid: godCypherValidation.valid,
            
            // Anomaly detection
            anomalies: {
                velocityAttack: anomalyResults.velocityAttack,
                replayAttack: anomalyResults.replayAttack,
                earthquake: earthquakeDetection,
                suspicious: anomalyResults.suspicious
            },
            
            // Threat assessment
            threatScore,
            threatLevel: this.getThreatLevel(threatScore),
            
            // Security flags
            flags: {
                highVelocity: anomalyResults.velocityAttack.detected,
                possibleReplay: anomalyResults.replayAttack.detected,
                earthquakeDetected: earthquakeDetection.detected,
                godCypherCompromised: !godCypherValidation.valid,
                lowZK13Score: !zk13Validation.valid
            },
            
            // Action recommendation
            recommendation: this.getRecommendation(threatScore, anomalyResults, earthquakeDetection)
        };

        // Step 9: Store proof in history
        this.addToHistory(proof, tx);

        // Step 10: Update metrics
        this.updateBaselineMetrics();

        // Step 11: Emit alerts if needed
        if (proof.flags.earthquakeDetected) {
            this.emit('earthquake', {
                proof,
                tx,
                severity: earthquakeDetection.severity
            });
        }

        if (threatScore > 70) {
            this.emit('high-threat', {
                proof,
                tx,
                threatScore
            });
        }

        return proof;
    }

    /**
     * Detect all types of anomalies
     */
    async detectAnomalies(validationData) {
        const { tx } = validationData;
        
        return {
            velocityAttack: this.detectVelocityAttack(tx.from),
            replayAttack: this.detectReplayAttack(tx.hash, tx.timestamp),
            suspicious: this.detectSuspiciousPatterns(tx)
        };
    }

    /**
     * Detect velocity attacks (too many transactions too fast)
     */
    detectVelocityAttack(address) {
        const now = Date.now();
        const window = this.thresholds.velocityAttack.timeWindow;
        const maxTx = this.thresholds.velocityAttack.maxTxPerSecond;

        // Get or create velocity tracker for this address
        if (!this.velocityTracker.has(address)) {
            this.velocityTracker.set(address, []);
        }

        const timestamps = this.velocityTracker.get(address);
        
        // Add current timestamp
        timestamps.push(now);

        // Remove old timestamps outside window
        const recentTx = timestamps.filter(ts => now - ts < window);
        this.velocityTracker.set(address, recentTx);

        // Calculate transactions per second
        const txPerSecond = (recentTx.length / window) * 1000;

        const detected = txPerSecond > maxTx;

        return {
            detected,
            txPerSecond: Math.round(txPerSecond),
            threshold: maxTx,
            recentCount: recentTx.length,
            severity: detected ? (txPerSecond > maxTx * 2 ? 'CRITICAL' : 'HIGH') : 'NORMAL'
        };
    }

    /**
     * Detect replay attacks (duplicate transactions)
     */
    detectReplayAttack(txHash, txTimestamp) {
        const now = Date.now();
        const window = this.thresholds.replayAttack.duplicateWindow;

        // Check if we've seen this transaction before
        if (this.seenTransactions.has(txHash)) {
            const previousTimestamp = this.seenTransactions.get(txHash);
            const timeSincePrevious = now - previousTimestamp;

            // If within window, it's a replay attack
            if (timeSincePrevious < window) {
                return {
                    detected: true,
                    previousTimestamp,
                    timeSincePrevious,
                    severity: 'CRITICAL'
                };
            }
        }

        // Store this transaction
        this.seenTransactions.set(txHash, txTimestamp || now);

        // Clean up old transactions
        this.cleanupSeenTransactions(now, window);

        return {
            detected: false,
            severity: 'NORMAL'
        };
    }

    /**
     * Detect suspicious patterns
     */
    detectSuspiciousPatterns(tx) {
        const suspicious = [];

        // Check for round amounts (possible automated/bot activity)
        if (tx.amount && tx.amount % 1000 === 0 && tx.amount > 10000) {
            suspicious.push('ROUND_AMOUNT');
        }

        // Check for sequential transactions
        if (tx.nonce && this.isSequentialPattern(tx.from, tx.nonce)) {
            suspicious.push('SEQUENTIAL_PATTERN');
        }

        // Check for same-amount pattern
        if (this.isSameAmountPattern(tx.from, tx.amount)) {
            suspicious.push('SAME_AMOUNT_PATTERN');
        }

        return {
            detected: suspicious.length > 0,
            patterns: suspicious,
            severity: suspicious.length > 2 ? 'HIGH' : suspicious.length > 0 ? 'MEDIUM' : 'NORMAL'
        };
    }

    /**
     * Detect earthquake patterns (massive transaction spikes)
     */
    detectEarthquake(tx, timestamp) {
        const window = this.thresholds.earthquake.spikeWindow;
        const maxSpike = this.thresholds.earthquake.massiveSpike;
        const deviationThreshold = this.thresholds.earthquake.patternDeviation;

        // Count recent transactions
        const recentProofs = this.proofHistory.filter(
            p => timestamp - p.timestamp < window
        );

        const recentCount = recentProofs.length;

        // Calculate deviation from baseline
        const deviation = this.baselineMetrics.avgTxPerSecond > 0
            ? (recentCount - this.baselineMetrics.avgTxPerSecond) / this.baselineMetrics.stdDeviation
            : 0;

        const detected = recentCount > maxSpike || deviation > deviationThreshold;

        if (detected) {
            const event = {
                timestamp,
                count: recentCount,
                deviation,
                severity: recentCount > maxSpike * 2 ? 'CRITICAL' : 'HIGH',
                type: 'EARTHQUAKE'
            };

            this.earthquakeEvents.push(event);

            console.log(`🌊 EARTHQUAKE DETECTED!`);
            console.log(`   Transactions: ${recentCount} in ${window}ms`);
            console.log(`   Deviation: ${deviation.toFixed(2)}σ`);
            console.log(`   Severity: ${event.severity}`);
        }

        return {
            detected,
            recentCount,
            threshold: maxSpike,
            deviation: deviation.toFixed(2),
            severity: detected ? (recentCount > maxSpike * 2 ? 'CRITICAL' : 'HIGH') : 'NORMAL',
            baseline: this.baselineMetrics.avgTxPerSecond
        };
    }

    /**
     * Validate GodCypher integrity
     */
    validateGodCypherIntegrity(encryptedPayload) {
        const issues = [];

        // Check payload structure
        if (!encryptedPayload) {
            issues.push('MISSING_PAYLOAD');
            return { valid: false, issues };
        }

        // Check required fields
        if (!encryptedPayload.encrypted || !encryptedPayload.encrypted.data) {
            issues.push('MISSING_ENCRYPTED_DATA');
        }

        if (!encryptedPayload.encrypted.iv) {
            issues.push('MISSING_IV');
        }

        // Check proofs
        const requiredProofs = ['senderProof', 'receiverProof', 'witnessProof'];
        for (const proof of requiredProofs) {
            if (!encryptedPayload[proof]) {
                issues.push(`MISSING_${proof.toUpperCase()}`);
            } else if (encryptedPayload[proof].length < this.thresholds.godCypherIntegrity.minProofLength) {
                issues.push(`INVALID_${proof.toUpperCase()}_LENGTH`);
            }
        }

        // Check encryption timestamp
        if (encryptedPayload.encryptionTime) {
            const age = Date.now() - (encryptedPayload.timestamp || 0);
            if (age > this.thresholds.godCypherIntegrity.maxProofAge) {
                issues.push('PROOF_TOO_OLD');
            }
        }

        // Check IV length (should be 32 hex chars for 16 bytes)
        if (encryptedPayload.encrypted && encryptedPayload.encrypted.iv) {
            if (encryptedPayload.encrypted.iv.length !== 32) {
                issues.push('INVALID_IV_LENGTH');
            }
        }

        const valid = issues.length === 0;

        if (!valid) {
            console.warn('⚠️  GodCypher validation failed:', issues);
        }

        return {
            valid,
            issues,
            integrity: valid ? 100 : Math.max(0, 100 - (issues.length * 20))
        };
    }

    /**
     * Validate ZK13 score
     */
    validateZK13Score(zk13Proof) {
        const score = zk13Proof.score || 0;
        const minScore = this.thresholds.zk13Score.minScore;
        const criticalScore = this.thresholds.zk13Score.criticalScore;

        const valid = score >= minScore;

        return {
            valid,
            score,
            minScore,
            level: score >= minScore ? 'GOOD' : score >= criticalScore ? 'WARNING' : 'CRITICAL'
        };
    }

    /**
     * Calculate overall threat score
     */
    calculateThreatScore(address, anomalyResults) {
        let score = 0;

        // Velocity attack weight: 40 points
        if (anomalyResults.velocityAttack.detected) {
            score += anomalyResults.velocityAttack.severity === 'CRITICAL' ? 40 : 25;
        }

        // Replay attack weight: 50 points (very serious)
        if (anomalyResults.replayAttack.detected) {
            score += 50;
        }

        // Suspicious patterns weight: 20 points
        if (anomalyResults.suspicious.detected) {
            score += anomalyResults.suspicious.severity === 'HIGH' ? 20 : 10;
        }

        // Update address-specific threat score
        this.threatScores.set(address, score);

        return score;
    }

    /**
     * Get threat level from score
     */
    getThreatLevel(score) {
        if (score >= 80) return 'CRITICAL';
        if (score >= 60) return 'HIGH';
        if (score >= 40) return 'MEDIUM';
        if (score >= 20) return 'LOW';
        return 'NORMAL';
    }

    /**
     * Get recommendation based on threat assessment
     */
    getRecommendation(threatScore, anomalyResults, earthquakeDetection) {
        if (threatScore >= 80 || earthquakeDetection.detected) {
            return {
                action: 'REJECT',
                reason: 'Critical threat detected',
                details: 'Transaction rejected due to high threat score or earthquake pattern'
            };
        }

        if (threatScore >= 60) {
            return {
                action: 'QUARANTINE',
                reason: 'High threat level',
                details: 'Transaction should be quarantined for manual review'
            };
        }

        if (threatScore >= 40) {
            return {
                action: 'FLAG',
                reason: 'Medium threat level',
                details: 'Transaction flagged for monitoring'
            };
        }

        return {
            action: 'ACCEPT',
            reason: 'Normal threat level',
            details: 'Transaction accepted with standard validation'
        };
    }

    /**
     * Calculate Merkle root
     */
    calculateMerkleRoot(hashes) {
        if (hashes.length === 1) return hashes[0];

        const newHashes = [];
        for (let i = 0; i < hashes.length; i += 2) {
            const left = hashes[i];
            const right = hashes[i + 1] || left;
            const combined = crypto.createHash('sha256')
                .update(left + right)
                .digest('hex');
            newHashes.push(combined);
        }

        return this.calculateMerkleRoot(newHashes);
    }

    /**
     * Add proof to history
     */
    addToHistory(proof, tx) {
        this.proofHistory.push({
            timestamp: proof.timestamp,
            hash: proof.hash,
            from: tx.from,
            amount: tx.amount,
            threatScore: proof.threatScore
        });

        // Limit history size
        if (this.proofHistory.length > this.maxHistorySize) {
            this.proofHistory.shift();
        }
    }

    /**
     * Update baseline metrics
     */
    updateBaselineMetrics() {
        if (this.proofHistory.length < 100) return; // Need minimum data

        const last100 = this.proofHistory.slice(-100);
        const timeSpan = last100[last100.length - 1].timestamp - last100[0].timestamp;
        
        this.baselineMetrics.avgTxPerSecond = (last100.length / timeSpan) * 1000;

        // Calculate standard deviation
        const amounts = last100.map(p => p.amount || 0);
        const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const squaredDiffs = amounts.map(amount => Math.pow(amount - avg, 2));
        this.baselineMetrics.stdDeviation = Math.sqrt(
            squaredDiffs.reduce((a, b) => a + b, 0) / amounts.length
        );
    }

    /**
     * Helper: Clean up old seen transactions
     */
    cleanupSeenTransactions(now, window) {
        for (const [hash, timestamp] of this.seenTransactions.entries()) {
            if (now - timestamp > window) {
                this.seenTransactions.delete(hash);
            }
        }
    }

    /**
     * Helper: Check for sequential pattern
     */
    isSequentialPattern(address, nonce) {
        const recentFromAddress = this.proofHistory
            .filter(p => p.from === address)
            .slice(-10);

        if (recentFromAddress.length < 3) return false;

        // Check if nonces are sequential
        const sequential = recentFromAddress.every((p, i) => {
            if (i === 0) return true;
            return p.nonce === recentFromAddress[i - 1].nonce + 1;
        });

        return sequential;
    }

    /**
     * Helper: Check for same amount pattern
     */
    isSameAmountPattern(address, amount) {
        const recentFromAddress = this.proofHistory
            .filter(p => p.from === address && p.amount === amount)
            .slice(-5);

        return recentFromAddress.length >= 3;
    }

    /**
     * Get statistics
     */
    getStatistics() {
        return {
            totalProofs: this.proofHistory.length,
            earthquakeEvents: this.earthquakeEvents.length,
            activeAddresses: this.velocityTracker.size,
            seenTransactions: this.seenTransactions.size,
            baselineMetrics: this.baselineMetrics,
            recentThreats: Array.from(this.threatScores.entries())
                .filter(([, score]) => score > 0)
                .map(([address, score]) => ({ address, score, level: this.getThreatLevel(score) }))
        };
    }
}

module.exports = EnhancedProofOfExistenceEngine;
