/**
 * Compact STARW Validation Node (<1MB total validation package)
 * 
 * Design:
 * - Off-chain: Full validation, anomaly detection, pattern analysis
 * - On-chain: Minimal proof (<35 bytes per transaction)
 * - Network: Only send compact proofs + confirmations
 * - TPMS: Track Transactions Per Millisecond for performance
 * 
 * Size Optimization:
 * - Single transaction validation: ~35 bytes on-chain
 * - Batch of 100 transactions: ~3.5KB on-chain
 * - Maximum storage: <900KB (allows ~25,000 proofs)
 */

const crypto = require('crypto');
const EventEmitter = require('events');
const CompactProofOfExistenceEngine = require('../../security/CompactProofOfExistenceEngine');

class CompactValidationNode extends EventEmitter {
    constructor(walletAddress) {
        super();
        
        this.walletAddress = walletAddress;
        this.nodeId = this.generateNodeId();
        
        // Node state
        this.isRunning = false;
        this.startTime = null;
        
        // Compact PoE engine
        this.poeEngine = new CompactProofOfExistenceEngine();
        
        // Witness pool (kept minimal)
        this.witnessPool = [];
        this.maxWitnessPool = 10; // Only keep 10 recent witnesses
        
        // Metrics (lightweight)
        this.metrics = {
            validations: 0,
            avgValidationTime: 0,
            onchainBytes: 0,
            offchainBytes: 0
        };
        
        // Setup event listeners
        this.poeEngine.on('earthquake', (event) => {
            this.emit('earthquake', event);
            console.log('🌊 Compact Node: Earthquake detected (off-chain)', event.txHash);
        });
        
        console.log('📦 Compact Validation Node created');
        console.log(`   Node ID: ${this.nodeId}`);
        console.log(`   Wallet: ${walletAddress}`);
        console.log(`   Target: <1MB total validation package`);
    }

    /**
     * Generate compact node ID (8 bytes)
     */
    generateNodeId() {
        return crypto.createHash('sha256')
            .update(this.walletAddress + Date.now())
            .digest('hex')
            .substring(0, 16); // 8 bytes
    }

    /**
     * Start the validation node
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️  Node already running');
            return;
        }
        
        this.isRunning = true;
        this.startTime = Date.now();
        
        console.log('✅ Compact Validation Node started');
        this.emit('started', { nodeId: this.nodeId });
    }

    /**
     * Stop the validation node
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️  Node already stopped');
            return;
        }
        
        this.isRunning = false;
        
        console.log('🛑 Compact Validation Node stopped');
        this.emit('stopped', { nodeId: this.nodeId });
    }

    /**
     * Validate transaction with compact proof
     * Returns: { offchain: full data, onchain: minimal proof }
     */
    async validateTransaction(tx) {
        if (!this.isRunning) {
            throw new Error('Validation node not running');
        }
        
        const startTime = Date.now();
        
        try {
            // STEP 1: Verify transaction structure (off-chain)
            this.verifyTransactionStructure(tx);
            
            // STEP 2: Select witness (minimal data)
            const witness = this.selectWitness();
            
            // STEP 3: Create validation context (off-chain)
            const validationContext = {
                witness: witness.address,
                nodeId: this.nodeId,
                timestamp: Date.now()
            };
            
            // STEP 4: Generate ZK13 proof (off-chain)
            const zk13Proof = await this.generateZK13Proof(tx);
            
            // STEP 5: Encrypt with GodCypher (off-chain)
            const encryptedPayload = await this.encryptWithGodCypher(tx, witness);
            
            // STEP 6: Create compact proof (off-chain analysis, on-chain minimal proof)
            const proof = await this.poeEngine.createCompactProof({
                tx,
                zk13Proof,
                encryptedPayload,
                validationContext
            });
            
            // STEP 7: Update metrics
            const validationTime = Date.now() - startTime;
            this.updateMetrics(validationTime, proof.size);
            
            // STEP 8: Return validation result
            return {
                // Off-chain (for local use, NOT sent over network)
                offchain: {
                    valid: proof.offchain.recommendation.action === 'ACCEPT',
                    nodeId: this.nodeId,
                    witness: witness.address,
                    fullAnalysis: proof.offchain.fullAnalysis,
                    threatScore: proof.offchain.threatScore,
                    recommendation: proof.offchain.recommendation,
                    validationTime,
                    timestamp: Date.now()
                },
                
                // On-chain (sent over network - <35 bytes)
                onchain: {
                    proof: proof.onchain,  // Minimal proof (~35 bytes)
                    nodeId: this.nodeId.substring(0, 8), // 4 bytes
                    valid: proof.offchain.recommendation.action === 'ACCEPT' ? 1 : 0 // 1 bit
                },
                
                // Size information
                size: proof.size
            };
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            throw error;
        }
    }

    /**
     * Validate batch of transactions (efficient for network)
     */
    async validateBatch(transactions) {
        if (!this.isRunning) {
            throw new Error('Validation node not running');
        }
        
        console.log(`📦 Validating batch of ${transactions.length} transactions...`);
        
        const startTime = Date.now();
        const validationData = [];
        
        // Process each transaction
        for (const tx of transactions) {
            const witness = this.selectWitness();
            const zk13Proof = await this.generateZK13Proof(tx);
            const encryptedPayload = await this.encryptWithGodCypher(tx, witness);
            
            validationData.push({
                tx,
                zk13Proof,
                encryptedPayload,
                validationContext: {
                    witness: witness.address,
                    nodeId: this.nodeId,
                    timestamp: Date.now()
                }
            });
        }
        
        // Create batch proof with compression
        const batchResult = await this.poeEngine.processBatch(validationData);
        
        const batchTime = Date.now() - startTime;
        
        console.log(`✅ Batch validated in ${batchTime}ms`);
        console.log(`   Original size: ${batchResult.size.original} bytes`);
        if (batchResult.compressed) {
            console.log(`   Compressed size: ${batchResult.size.compressed} bytes`);
            console.log(`   Compression ratio: ${batchResult.size.ratio}`);
        }
        
        return {
            // Off-chain (full results)
            offchain: {
                results: batchResult.results,
                batchTime,
                avgTimePerTx: (batchTime / transactions.length).toFixed(2) + 'ms'
            },
            
            // On-chain (compressed batch proof)
            onchain: {
                batch: batchResult.compressed || batchResult.batch,
                compressed: !!batchResult.compressed
            },
            
            // Size info
            size: batchResult.size
        };
    }

    /**
     * Verify transaction structure (off-chain)
     */
    verifyTransactionStructure(tx) {
        if (!tx.from || !tx.to || tx.amount === undefined) {
            throw new Error('Invalid transaction structure');
        }
        
        if (!tx.from.startsWith('zk13str_')) {
            throw new Error('Invalid sender address format');
        }
        
        if (!tx.to.startsWith('zk13str_')) {
            throw new Error('Invalid receiver address format');
        }
        
        if (tx.amount < 0) {
            throw new Error('Invalid amount');
        }
    }

    /**
     * Select witness (minimal data)
     */
    selectWitness() {
        // If pool empty, add this node as witness
        if (this.witnessPool.length === 0) {
            return {
                address: this.walletAddress,
                nodeId: this.nodeId,
                timestamp: Date.now()
            };
        }
        
        // Select random witness
        const witness = this.witnessPool[Math.floor(Math.random() * this.witnessPool.length)];
        return witness;
    }

    /**
     * Add witness to pool (keep minimal)
     */
    addWitness(witnessAddress) {
        // Check if already in pool
        if (this.witnessPool.some(w => w.address === witnessAddress)) {
            return;
        }
        
        this.witnessPool.push({
            address: witnessAddress,
            nodeId: this.generateNodeId(),
            timestamp: Date.now()
        });
        
        // Limit pool size
        if (this.witnessPool.length > this.maxWitnessPool) {
            this.witnessPool.shift();
        }
    }

    /**
     * Generate ZK13 proof (off-chain)
     */
    async generateZK13Proof(tx) {
        // Simplified ZK13 proof generation
        const hash = crypto.createHash('sha256')
            .update(JSON.stringify(tx))
            .digest('hex');
        
        const checksum = crypto.createHash('sha256')
            .update(hash)
            .digest('hex')
            .substring(0, 8);
        
        // Calculate score based on transaction properties
        let score = 50; // Base score
        
        if (tx.from.startsWith('zk13str_')) score += 20;
        if (tx.to.startsWith('zk13str_')) score += 20;
        if (tx.amount > 0) score += 10;
        
        return {
            hash,
            checksum,
            score,
            valid: score >= 50
        };
    }

    /**
     * Encrypt with GodCypher (off-chain)
     */
    async encryptWithGodCypher(tx, witness) {
        // Generate encryption key
        const key = crypto.createHash('sha256')
            .update(tx.from + tx.to + witness.address)
            .digest();
        
        // Generate IV
        const iv = crypto.randomBytes(16);
        
        // Encrypt transaction data
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encrypted = Buffer.concat([
            cipher.update(JSON.stringify(tx), 'utf8'),
            cipher.final()
        ]);
        
        // Generate proofs (simplified)
        const senderProof = crypto.createHash('sha256').update(tx.from + key.toString('hex')).digest('hex').substring(0, 16);
        const receiverProof = crypto.createHash('sha256').update(tx.to + key.toString('hex')).digest('hex').substring(0, 16);
        const witnessProof = crypto.createHash('sha256').update(witness.address + key.toString('hex')).digest('hex').substring(0, 16);
        
        return {
            encrypted: {
                data: encrypted.toString('hex'),
                iv: iv.toString('hex')
            },
            senderProof,
            receiverProof,
            witnessProof,
            timestamp: Date.now(),
            encryptionTime: 0 // Calculated elsewhere
        };
    }

    /**
     * Update metrics
     */
    updateMetrics(validationTime, size) {
        this.metrics.validations++;
        this.metrics.avgValidationTime = 
            (this.metrics.avgValidationTime * (this.metrics.validations - 1) + validationTime) / 
            this.metrics.validations;
        this.metrics.onchainBytes += size.onchain;
        this.metrics.offchainBytes += size.offchain;
    }

    /**
     * Get node statistics
     */
    getStatistics() {
        const poeStats = this.poeEngine.getStatistics();
        const uptime = this.isRunning ? Date.now() - this.startTime : 0;
        
        return {
            node: {
                id: this.nodeId,
                wallet: this.walletAddress,
                running: this.isRunning,
                uptime: uptime,
                uptimeFormatted: this.formatUptime(uptime)
            },
            validations: {
                total: this.metrics.validations,
                avgTime: this.metrics.avgValidationTime.toFixed(2) + 'ms',
                onchainBytes: this.metrics.onchainBytes,
                offchainBytes: this.metrics.offchainBytes,
                onchainKB: (this.metrics.onchainBytes / 1024).toFixed(2),
                offchainMB: (this.metrics.offchainBytes / 1024 / 1024).toFixed(2)
            },
            witnesses: {
                poolSize: this.witnessPool.length,
                maxPoolSize: this.maxWitnessPool
            },
            poe: poeStats
        };
    }

    /**
     * Format uptime
     */
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * Get compact send/receive confirmation (<100 bytes)
     */
    getCompactConfirmation(validationResult) {
        return {
            // Essential fields only (target: <100 bytes)
            n: this.nodeId.substring(0, 8),  // 4 bytes
            v: validationResult.onchain.valid, // 1 bit
            p: validationResult.onchain.proof.h, // 8 bytes
            t: validationResult.onchain.proof.t, // 8 bytes
            s: validationResult.onchain.proof.s  // 1 byte
        };
        // Total: ~21 bytes
    }
}

module.exports = CompactValidationNode;
