/**
 * Compact Proof of Existence Engine (<1MB per validation)
 * 
 * Features:
 * - Off-chain heavy processing (anomaly detection, pattern analysis)
 * - On-chain minimal proof (<1KB per transaction)
 * - Batch compression for network efficiency
 * - Time-based proof windows (TPMS - Transactions Per Millisecond tracking)
 * - Merkle tree optimization for space efficiency
 * 
 * Design Philosophy:
 * - Process everything locally (off-chain)
 * - Send only critical proof data (on-chain)
 * - Keep total validation package under 1MB
 */

const crypto = require('crypto');
const EventEmitter = require('events');
const zlib = require('zlib');

class CompactProofOfExistenceEngine extends EventEmitter {
    constructor() {
        super();
        
        // Off-chain: Full validation history (can be large)
        this.offchainHistory = [];
        this.offchainMaxSize = 1000000; // 1 million records off-chain
        
        // On-chain: Minimal proof data (must be <1MB total)
        this.onchainProofs = [];
        this.onchainMaxSize = 900; // ~900KB limit (leaves 100KB buffer)
        
        // Time-based tracking (TPMS - Transactions Per Millisecond)
        this.tpmsTracker = new Map(); // window -> tx count
        this.tpmsWindow = 1000; // 1 second windows
        
        // Compact anomaly scores (instead of full reports)
        this.compactScores = new Map(); // address -> compact score
        
        // Merkle tree cache (for efficient proof generation)
        this.merkleCache = [];
        this.merkleCacheSize = 100; // Keep last 100 roots
        
        // Batch processing
        this.pendingBatch = [];
        this.batchSize = 100; // Process in batches of 100
        this.batchTimeout = null;
        
        // Compression settings
        this.compressionEnabled = true;
        
        console.log('📦 Compact Proof of Existence Engine initialized');
        console.log('   ⚡ Target size: <1MB per validation');
        console.log('   🗜️  Compression: ENABLED');
        console.log('   📊 TPMS tracking: ENABLED');
        console.log('   🌐 Off-chain processing: ENABLED');
    }

    /**
     * Create compact proof with off-chain validation
     * Returns minimal on-chain proof (<1KB)
     */
    async createCompactProof(validationData) {
        const timestamp = Date.now();
        const { tx } = validationData;

        // STEP 1: Off-chain - Full anomaly detection (not sent on-chain)
        const offchainAnalysis = await this.performOffchainAnalysis(validationData);

        // STEP 2: Off-chain - Calculate threat score (not sent on-chain)
        const threatScore = this.calculateCompactThreatScore(offchainAnalysis);

        // STEP 3: On-chain - Create minimal proof (ONLY this is sent)
        const onchainProof = this.createMinimalProof(validationData, offchainAnalysis, threatScore);

        // STEP 4: Store full data off-chain
        this.storeOffchain({
            timestamp,
            txHash: tx.hash,
            from: tx.from,
            fullAnalysis: offchainAnalysis,
            threatScore,
            onchainProof
        });

        // STEP 5: Store minimal proof on-chain
        this.storeOnchain(onchainProof);

        // STEP 6: Track TPMS
        this.trackTPMS(timestamp);

        // STEP 7: Emit events if needed (off-chain only)
        if (offchainAnalysis.earthquake) {
            this.emit('earthquake', { 
                severity: offchainAnalysis.earthquake.severity,
                timestamp,
                // Don't send full tx data
                txHash: tx.hash
            });
        }

        // Return both off-chain (for local processing) and on-chain (for network)
        return {
            // Off-chain data (NOT sent over network)
            offchain: {
                fullAnalysis: offchainAnalysis,
                threatScore,
                recommendation: this.getRecommendation(threatScore, offchainAnalysis)
            },
            
            // On-chain data (sent over network - MUST BE <1KB)
            onchain: onchainProof,
            
            // Metadata
            size: {
                onchain: JSON.stringify(onchainProof).length,
                offchain: JSON.stringify(offchainAnalysis).length,
                total: this.getTotalOnchainSize()
            }
        };
    }

    /**
     * Perform full analysis off-chain (not sent over network)
     */
    async performOffchainAnalysis(validationData) {
        const { tx, zk13Proof, encryptedPayload } = validationData;
        
        return {
            // Velocity check (off-chain only)
            velocity: this.checkVelocity(tx.from),
            
            // Replay check (off-chain only)
            replay: this.checkReplay(tx.hash),
            
            // Pattern check (off-chain only)
            pattern: this.checkPattern(tx),
            
            // Earthquake check (off-chain only)
            earthquake: this.checkEarthquake(tx),
            
            // GodCypher validation (off-chain only)
            godCypher: this.validateGodCypher(encryptedPayload),
            
            // ZK13 validation (off-chain only)
            zk13: this.validateZK13(zk13Proof)
        };
    }

    /**
     * Create minimal on-chain proof (<1KB)
     */
    createMinimalProof(validationData, offchainAnalysis, threatScore) {
        const { tx } = validationData;
        const timestamp = Date.now();

        // Generate compact proof hash (32 bytes)
        const proofHash = crypto.createHash('sha256')
            .update(tx.hash + timestamp + threatScore)
            .digest('hex')
            .substring(0, 16); // Only 16 chars = 8 bytes

        // Get Merkle root from cache (32 bytes)
        const merkleRoot = this.getOrCreateMerkleRoot(proofHash);

        // Compact flags (1 byte as bitmask)
        const flags = this.createCompactFlags(offchainAnalysis);

        // Minimal on-chain proof (target: <200 bytes)
        return {
            // Essential fields only
            h: proofHash,              // 8 bytes
            t: timestamp,              // 8 bytes
            m: merkleRoot.substring(0, 16), // 8 bytes
            f: flags,                  // 1 byte
            s: Math.min(threatScore, 255), // 1 byte (0-255)
            v: offchainAnalysis.zk13.valid ? 1 : 0, // 1 bit
            g: offchainAnalysis.godCypher.valid ? 1 : 0 // 1 bit
        };
        // Total: ~35 bytes per proof (allows ~28,000 proofs in 1MB)
    }

    /**
     * Create compact flags as bitmask (1 byte = 8 flags)
     */
    createCompactFlags(analysis) {
        let flags = 0;
        
        if (analysis.velocity.detected) flags |= 0b00000001; // Bit 0
        if (analysis.replay.detected)   flags |= 0b00000010; // Bit 1
        if (analysis.pattern.detected)  flags |= 0b00000100; // Bit 2
        if (analysis.earthquake.detected) flags |= 0b00001000; // Bit 3
        if (!analysis.godCypher.valid)  flags |= 0b00010000; // Bit 4
        if (!analysis.zk13.valid)       flags |= 0b00100000; // Bit 5
        // Bits 6-7 reserved for future use
        
        return flags;
    }

    /**
     * Decode compact flags
     */
    decodeFlags(flags) {
        return {
            velocityAttack: !!(flags & 0b00000001),
            replayAttack:   !!(flags & 0b00000010),
            suspiciousPattern: !!(flags & 0b00000100),
            earthquake:     !!(flags & 0b00001000),
            godCypherInvalid: !!(flags & 0b00010000),
            zk13Invalid:    !!(flags & 0b00100000)
        };
    }

    /**
     * Store off-chain data (can be large)
     */
    storeOffchain(data) {
        this.offchainHistory.push(data);
        
        // Limit off-chain storage
        if (this.offchainHistory.length > this.offchainMaxSize) {
            this.offchainHistory.shift();
        }
    }

    /**
     * Store on-chain proof (must be minimal)
     */
    storeOnchain(proof) {
        this.onchainProofs.push(proof);
        
        // Calculate current size
        const currentSize = this.getTotalOnchainSize();
        
        // If approaching 1MB limit, remove oldest proofs
        while (currentSize > this.onchainMaxSize * 1024 && this.onchainProofs.length > 0) {
            this.onchainProofs.shift();
        }
    }

    /**
     * Get total on-chain size in bytes
     */
    getTotalOnchainSize() {
        return JSON.stringify(this.onchainProofs).length;
    }

    /**
     * Get or create Merkle root (cached for efficiency)
     */
    getOrCreateMerkleRoot(proofHash) {
        // Check if we have recent roots
        if (this.merkleCache.length > 0) {
            // Reuse last root with new proof hash
            const lastRoot = this.merkleCache[this.merkleCache.length - 1];
            const newRoot = crypto.createHash('sha256')
                .update(lastRoot + proofHash)
                .digest('hex');
            
            this.merkleCache.push(newRoot);
            
            // Limit cache size
            if (this.merkleCache.length > this.merkleCacheSize) {
                this.merkleCache.shift();
            }
            
            return newRoot;
        }
        
        // Create first root
        const root = crypto.createHash('sha256')
            .update(proofHash)
            .digest('hex');
        
        this.merkleCache.push(root);
        return root;
    }

    /**
     * Track TPMS (Transactions Per Millisecond)
     */
    trackTPMS(timestamp) {
        const window = Math.floor(timestamp / this.tpmsWindow) * this.tpmsWindow;
        const count = this.tpmsTracker.get(window) || 0;
        this.tpmsTracker.set(window, count + 1);
        
        // Clean old windows (keep last 60 seconds)
        const cutoff = timestamp - 60000;
        for (const [w, _] of this.tpmsTracker.entries()) {
            if (w < cutoff) {
                this.tpmsTracker.delete(w);
            }
        }
    }

    /**
     * Get TPMS statistics
     */
    getTPMS() {
        const windows = Array.from(this.tpmsTracker.entries());
        if (windows.length === 0) return { current: 0, avg: 0, max: 0 };
        
        const counts = windows.map(([_, count]) => count);
        const current = counts[counts.length - 1] || 0;
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        const max = Math.max(...counts);
        
        return {
            current: (current / this.tpmsWindow) * 1000, // Convert to per-second
            avg: (avg / this.tpmsWindow) * 1000,
            max: (max / this.tpmsWindow) * 1000,
            windows: windows.length
        };
    }

    /**
     * Compact threat score calculation
     */
    calculateCompactThreatScore(analysis) {
        let score = 0;
        
        if (analysis.velocity.detected) score += analysis.velocity.severity === 'CRITICAL' ? 40 : 25;
        if (analysis.replay.detected) score += 50;
        if (analysis.pattern.detected) score += 20;
        if (analysis.earthquake.detected) score += 30;
        if (!analysis.godCypher.valid) score += 25;
        if (!analysis.zk13.valid) score += 30;
        
        return Math.min(score, 255); // Cap at 255 (fits in 1 byte)
    }

    /**
     * Compact anomaly checks (lightweight)
     */
    checkVelocity(address) {
        // Simplified velocity check
        const recent = this.offchainHistory
            .filter(h => h.from === address && Date.now() - h.timestamp < 1000)
            .length;
        
        return {
            detected: recent > 1000,
            severity: recent > 2000 ? 'CRITICAL' : recent > 1000 ? 'HIGH' : 'NORMAL'
        };
    }

    checkReplay(txHash) {
        const seen = this.offchainHistory.some(h => h.txHash === txHash);
        return {
            detected: seen,
            severity: seen ? 'CRITICAL' : 'NORMAL'
        };
    }

    checkPattern(tx) {
        // Simplified pattern check
        const roundAmount = tx.amount && tx.amount % 1000 === 0 && tx.amount > 10000;
        return {
            detected: roundAmount,
            severity: roundAmount ? 'MEDIUM' : 'NORMAL'
        };
    }

    checkEarthquake(tx) {
        const tpms = this.getTPMS();
        const detected = tpms.current > 500;
        return {
            detected,
            severity: detected ? (tpms.current > 1000 ? 'CRITICAL' : 'HIGH') : 'NORMAL',
            tpms: tpms.current
        };
    }

    validateGodCypher(payload) {
        if (!payload || !payload.encrypted) {
            return { valid: false, integrity: 0 };
        }
        
        const hasProofs = payload.senderProof && payload.receiverProof && payload.witnessProof;
        return {
            valid: hasProofs,
            integrity: hasProofs ? 100 : 0
        };
    }

    validateZK13(proof) {
        if (!proof) return { valid: false, score: 0 };
        return {
            valid: (proof.score || 0) >= 50,
            score: proof.score || 0
        };
    }

    /**
     * Get recommendation
     */
    getRecommendation(threatScore, analysis) {
        if (threatScore >= 80 || analysis.earthquake.detected) {
            return { action: 'REJECT', reason: 'Critical threat' };
        }
        if (threatScore >= 60) {
            return { action: 'QUARANTINE', reason: 'High threat' };
        }
        if (threatScore >= 40) {
            return { action: 'FLAG', reason: 'Medium threat' };
        }
        return { action: 'ACCEPT', reason: 'Normal' };
    }

    /**
     * Batch processing for network efficiency
     */
    async processBatch(transactions) {
        const results = [];
        
        for (const tx of transactions) {
            const proof = await this.createCompactProof(tx);
            results.push(proof);
        }
        
        // Create batch proof (compressed)
        const batchProof = {
            count: results.length,
            proofs: results.map(r => r.onchain), // Only on-chain data
            merkleRoot: this.createBatchMerkleRoot(results.map(r => r.onchain.h)),
            timestamp: Date.now()
        };
        
        // Compress if enabled
        if (this.compressionEnabled) {
            const compressed = await this.compressBatch(batchProof);
            return {
                batch: batchProof,
                compressed,
                size: {
                    original: JSON.stringify(batchProof).length,
                    compressed: compressed.length,
                    ratio: (compressed.length / JSON.stringify(batchProof).length * 100).toFixed(2) + '%'
                },
                results // Full results for off-chain use
            };
        }
        
        return {
            batch: batchProof,
            size: {
                original: JSON.stringify(batchProof).length
            },
            results
        };
    }

    /**
     * Compress batch data
     */
    async compressBatch(batchProof) {
        return new Promise((resolve, reject) => {
            const json = JSON.stringify(batchProof);
            zlib.gzip(json, (err, compressed) => {
                if (err) reject(err);
                else resolve(compressed);
            });
        });
    }

    /**
     * Decompress batch data
     */
    async decompressBatch(compressed) {
        return new Promise((resolve, reject) => {
            zlib.gunzip(compressed, (err, decompressed) => {
                if (err) reject(err);
                else resolve(JSON.parse(decompressed.toString()));
            });
        });
    }

    /**
     * Create batch Merkle root
     */
    createBatchMerkleRoot(hashes) {
        if (hashes.length === 0) return '';
        if (hashes.length === 1) return hashes[0];
        
        const newHashes = [];
        for (let i = 0; i < hashes.length; i += 2) {
            const left = hashes[i];
            const right = hashes[i + 1] || left;
            const combined = crypto.createHash('sha256')
                .update(left + right)
                .digest('hex')
                .substring(0, 16);
            newHashes.push(combined);
        }
        
        return this.createBatchMerkleRoot(newHashes);
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const onchainSize = this.getTotalOnchainSize();
        const offchainSize = JSON.stringify(this.offchainHistory).length;
        const tpms = this.getTPMS();
        
        return {
            onchain: {
                proofs: this.onchainProofs.length,
                size: onchainSize,
                sizeKB: (onchainSize / 1024).toFixed(2),
                limit: this.onchainMaxSize,
                utilization: ((onchainSize / (this.onchainMaxSize * 1024)) * 100).toFixed(2) + '%',
                avgProofSize: (onchainSize / this.onchainProofs.length || 0).toFixed(2) + ' bytes'
            },
            offchain: {
                records: this.offchainHistory.length,
                size: offchainSize,
                sizeMB: (offchainSize / 1024 / 1024).toFixed(2),
                avgRecordSize: (offchainSize / this.offchainHistory.length || 0).toFixed(2) + ' bytes'
            },
            tpms: {
                current: tpms.current.toFixed(2) + ' tx/s',
                average: tpms.avg.toFixed(2) + ' tx/s',
                max: tpms.max.toFixed(2) + ' tx/s',
                windows: tpms.windows
            },
            merkle: {
                cached: this.merkleCache.length,
                limit: this.merkleCacheSize
            },
            compression: this.compressionEnabled ? 'ENABLED' : 'DISABLED'
        };
    }

    /**
     * Retrieve full off-chain data by transaction hash
     */
    getOffchainData(txHash) {
        return this.offchainHistory.find(h => h.txHash === txHash);
    }

    /**
     * Clear old off-chain data (maintenance)
     */
    clearOldOffchainData(olderThan = 86400000) { // 24 hours default
        const cutoff = Date.now() - olderThan;
        this.offchainHistory = this.offchainHistory.filter(h => h.timestamp >= cutoff);
    }
}

module.exports = CompactProofOfExistenceEngine;
