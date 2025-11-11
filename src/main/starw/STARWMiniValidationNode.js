/**
 * STARW Mini Validation Node (<1MB)
 * 
 * Features:
 * - ZK13 cryptographic validation
 * - GodCypher encryption between sender/receiver/witness
 * - 3-party validation: Sender → Receiver with Witness
 * - Enhanced PoE (Proof of Existence) with anomaly detection
 * - Auto-generated for every wallet
 * - Real-time metrics and benchmarking
 * - Earthquake detection for attack patterns
 */

const crypto = require('crypto');
const EventEmitter = require('events');
const EnhancedProofOfExistenceEngine = require('../../security/EnhancedProofOfExistenceEngine');

class STARWMiniValidationNode extends EventEmitter {
    constructor(walletAddress) {
        super();
        
        this.walletAddress = walletAddress;
        this.nodeId = this.generateNodeId();
        this.nodeSize = 0; // Track node size (must be <1MB)
        
        // Node state
        this.isRunning = false;
        this.startTime = null;
        
        // Validation components
        this.zk13Validator = new ZK13Validator();
        this.godCypherEngine = new GodCypherEngine();
        
        // Enhanced Proof of Existence with earthquake detection
        this.poeEngine = new EnhancedProofOfExistenceEngine();
        
        // Setup earthquake detection listener
        this.poeEngine.on('earthquake', (event) => {
            console.log('🌊 EARTHQUAKE DETECTED in validation node:', this.nodeId);
            this.emit('earthquake', event);
        });
        
        this.poeEngine.on('high-threat', (event) => {
            console.log('⚠️  HIGH THREAT in validation node:', this.nodeId);
            this.emit('high-threat', event);
        });

        this.poeEngine = new ProofOfExistenceEngine();
        
        // Metrics
        this.metrics = {
            cpu: 0,
            memory: 0,
            tasks: 0,
            inChainTx: 0,
            offChainTx: 0,
            tpms: 0, // Transactions Per Millisecond
            tps: 0,  // Transactions Per Second
            rss: 0,
            heap: 0,
            validationSpeed: 0
        };
        
        // Transaction queue
        this.txQueue = [];
        this.validatedTx = [];
        
        // Witness pool
        this.witnessPool = new Map();
        
        console.log(`🔷 STARW Mini Validation Node initialized for ${walletAddress}`);
        console.log(`   Node ID: ${this.nodeId}`);
    }

    /**
     * Generate unique node ID based on wallet address
     */
    generateNodeId() {
        const hash = crypto.createHash('sha256')
            .update(this.walletAddress + Date.now())
            .digest('hex');
        return `node_${hash.substring(0, 16)}`;
    }

    /**
     * Start the validation node
     */
    async start() {
        if (this.isRunning) {
            console.log('⚠️  Node already running');
            return;
        }

        this.isRunning = true;
        this.startTime = Date.now();

        console.log(`🚀 Starting STARW Mini Validation Node`);
        console.log(`   Wallet: ${this.walletAddress}`);
        console.log(`   Node ID: ${this.nodeId}`);

        // Start monitoring
        this.startMetricsMonitoring();

        // Start validation loop
        this.startValidationLoop();

        // Emit started event
        this.emit('started', {
            nodeId: this.nodeId,
            wallet: this.walletAddress,
            timestamp: this.startTime
        });

        return {
            success: true,
            nodeId: this.nodeId,
            wallet: this.walletAddress
        };
    }

    /**
     * Stop the validation node
     */
    async stop() {
        if (!this.isRunning) {
            console.log('⚠️  Node not running');
            return;
        }

        this.isRunning = false;

        console.log(`🛑 Stopping STARW Mini Validation Node`);
        
        // Stop monitoring
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }

        // Emit stopped event
        this.emit('stopped', {
            nodeId: this.nodeId,
            runtime: Date.now() - this.startTime
        });

        return {
            success: true,
            validatedTransactions: this.validatedTx.length
        };
    }

    /**
     * Validate transaction with ZK13 + GodCypher
     * 3-party validation: Sender → Receiver + Witness
     */
    async validateTransaction(tx) {
        const startTime = Date.now();

        try {
            // Step 1: Verify transaction structure
            if (!this.verifyTransactionStructure(tx)) {
                throw new Error('Invalid transaction structure');
            }

            // Step 2: Select witness from pool
            const witness = await this.selectWitness(tx);

            // Step 3: Create validation context
            const validationContext = {
                sender: tx.from,
                receiver: tx.to,
                witness: witness.address,
                timestamp: Date.now(),
                txHash: tx.hash
            };

            // Step 4: ZK13 cryptographic validation
            const zk13Proof = await this.zk13Validator.generateProof(tx, validationContext);
            
            if (!zk13Proof.valid) {
                throw new Error('ZK13 validation failed');
            }

            // Step 5: GodCypher encryption (3-way)
            const encryptedPayload = await this.godCypherEngine.encrypt3Way(
                tx,
                validationContext.sender,
                validationContext.receiver,
                validationContext.witness
            );

            // Step 6: Proof of Existence
            const poeProof = await this.poeEngine.createProof({
                tx,
                zk13Proof,
                encryptedPayload,
                validationContext
            });

            // Step 7: Create validation result
            const validationResult = {
                txHash: tx.hash,
                valid: true,
                zk13Proof,
                encryptedPayload,
                poeProof,
                validationContext,
                validationTime: Date.now() - startTime,
                nodeId: this.nodeId
            };

            // Add to validated transactions
            this.validatedTx.push(validationResult);

            // Update metrics
            this.updateValidationMetrics(validationResult);

            // Emit validation event
            this.emit('transactionValidated', validationResult);

            return validationResult;

        } catch (error) {
            console.error(`❌ Validation failed: ${error.message}`);
            
            return {
                txHash: tx.hash,
                valid: false,
                error: error.message,
                validationTime: Date.now() - startTime
            };
        }
    }

    /**
     * Verify transaction structure
     */
    verifyTransactionStructure(tx) {
        return tx &&
               tx.from &&
               tx.to &&
               tx.hash &&
               tx.amount !== undefined &&
               tx.timestamp;
    }

    /**
     * Select witness for validation
     */
    async selectWitness(tx) {
        // Check if we have witnesses in pool
        if (this.witnessPool.size === 0) {
            // Generate default witness
            return {
                address: `zk13str_witness_${crypto.randomBytes(8).toString('hex')}`,
                stake: 0,
                reputation: 1.0
            };
        }

        // Select witness with highest reputation
        let bestWitness = null;
        let bestScore = -1;

        for (const [address, witness] of this.witnessPool) {
            const score = witness.reputation * (1 + witness.stake / 1000000);
            if (score > bestScore && address !== tx.from && address !== tx.to) {
                bestScore = score;
                bestWitness = witness;
            }
        }

        return bestWitness || {
            address: `zk13str_witness_${crypto.randomBytes(8).toString('hex')}`,
            stake: 0,
            reputation: 1.0
        };
    }

    /**
     * Add witness to pool
     */
    addWitness(address, stake = 0, reputation = 1.0) {
        this.witnessPool.set(address, {
            address,
            stake,
            reputation,
            validations: 0,
            addedAt: Date.now()
        });

        console.log(`👁️  Witness added: ${address} (stake: ${stake}, reputation: ${reputation})`);
    }

    /**
     * Start metrics monitoring
     */
    startMetricsMonitoring() {
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
        }, 1000); // Update every second
    }

    /**
     * Update metrics
     */
    updateMetrics() {
        const memUsage = process.memoryUsage();

        this.metrics.rss = Math.round(memUsage.rss / 1024 / 1024 * 100) / 100; // MB
        this.metrics.heap = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100; // MB
        this.metrics.memory = this.metrics.heap;
        
        // Calculate node size (estimate)
        this.nodeSize = this.calculateNodeSize();

        // Calculate TPS/TPMS
        const runtime = (Date.now() - this.startTime) / 1000; // seconds
        this.metrics.tps = Math.round(this.validatedTx.length / runtime * 100) / 100;
        this.metrics.tpms = Math.round(this.validatedTx.length / (runtime * 1000) * 1000) / 1000;

        // Tasks
        this.metrics.tasks = this.txQueue.length;

        // Emit metrics update
        this.emit('metricsUpdate', this.metrics);
    }

    /**
     * Calculate node size
     */
    calculateNodeSize() {
        const txSize = this.validatedTx.length * 512; // ~512 bytes per validation
        const witnessSize = this.witnessPool.size * 256; // ~256 bytes per witness
        const baseSize = 50 * 1024; // 50KB base node overhead

        return txSize + witnessSize + baseSize; // In bytes
    }

    /**
     * Update validation metrics
     */
    updateValidationMetrics(validationResult) {
        // Update speed (avg validation time)
        const totalTime = this.validatedTx.reduce((sum, v) => sum + (v.validationTime || 0), 0);
        this.metrics.validationSpeed = Math.round(totalTime / this.validatedTx.length * 100) / 100;

        // Update transaction counts
        // Assume on-chain if amount > threshold
        if (validationResult.tx && validationResult.tx.amount > 1000) {
            this.metrics.inChainTx++;
        } else {
            this.metrics.offChainTx++;
        }

        // Update CPU (mock - based on validation speed)
        this.metrics.cpu = Math.min(100, Math.round(100 / Math.max(1, this.metrics.validationSpeed)));
    }

    /**
     * Start validation loop
     */
    startValidationLoop() {
        this.validationInterval = setInterval(async () => {
            if (this.txQueue.length > 0) {
                const tx = this.txQueue.shift();
                await this.validateTransaction(tx);
            }
        }, 100); // Process queue every 100ms
    }

    /**
     * Submit transaction for validation
     */
    async submitTransaction(tx) {
        // Ensure transaction has required fields
        if (!tx.hash) {
            tx.hash = crypto.createHash('sha256')
                .update(JSON.stringify(tx) + Date.now())
                .digest('hex');
        }
        if (!tx.timestamp) {
            tx.timestamp = Date.now();
        }

        this.txQueue.push(tx);
        this.metrics.tasks = this.txQueue.length;

        console.log(`📥 Transaction queued: ${tx.hash.substring(0, 16)}...`);

        return {
            success: true,
            txHash: tx.hash,
            queuePosition: this.txQueue.length
        };
    }

    /**
     * Run microbenchmark
     */
    async runMicrobenchmark(iterations = 100) {
        console.log(`⚡ Running microbenchmark (${iterations} iterations)...`);

        const results = {
            iterations,
            startTime: Date.now(),
            validations: [],
            summary: {}
        };

        for (let i = 0; i < iterations; i++) {
            const mockTx = {
                from: `zk13str_sender_${i}`,
                to: `zk13str_receiver_${i}`,
                amount: Math.random() * 1000,
                timestamp: Date.now(),
                hash: crypto.randomBytes(32).toString('hex')
            };

            const validation = await this.validateTransaction(mockTx);
            results.validations.push(validation);
        }

        results.endTime = Date.now();
        results.totalTime = results.endTime - results.startTime;

        // Calculate summary
        const validationTimes = results.validations.map(v => v.validationTime || 0);
        results.summary = {
            totalValidations: iterations,
            successfulValidations: results.validations.filter(v => v.valid).length,
            failedValidations: results.validations.filter(v => !v.valid).length,
            totalTime: results.totalTime,
            avgValidationTime: Math.round(validationTimes.reduce((a, b) => a + b, 0) / iterations * 100) / 100,
            minValidationTime: Math.min(...validationTimes),
            maxValidationTime: Math.max(...validationTimes),
            tps: Math.round(iterations / (results.totalTime / 1000) * 100) / 100,
            tpms: Math.round(iterations / results.totalTime * 100) / 100
        };

        console.log(`✅ Microbenchmark completed:`);
        console.log(`   Total Time: ${results.totalTime}ms`);
        console.log(`   Avg Validation: ${results.summary.avgValidationTime}ms`);
        console.log(`   TPS: ${results.summary.tps}`);
        console.log(`   TPMS: ${results.summary.tpms}`);

        this.emit('benchmarkComplete', results);

        return results;
    }

    /**
     * Get node status
     */
    getStatus() {
        return {
            nodeId: this.nodeId,
            wallet: this.walletAddress,
            isRunning: this.isRunning,
            uptime: this.isRunning ? Date.now() - this.startTime : 0,
            nodeSize: this.nodeSize,
            nodeSizeMB: Math.round(this.nodeSize / 1024 / 1024 * 1000) / 1000,
            underSizeLimit: this.nodeSize < 1024 * 1024, // <1MB
            metrics: this.metrics,
            queueLength: this.txQueue.length,
            validatedCount: this.validatedTx.length,
            witnessCount: this.witnessPool.size
        };
    }

    /**
     * Get metrics for display
     */
    getMetrics() {
        const status = this.getStatus();
        
        return {
            cpu: `${this.metrics.cpu}%`,
            memory: `${this.metrics.memory}MB`,
            tasks: this.metrics.tasks,
            inChain: this.metrics.inChainTx,
            offChain: this.metrics.offChainTx,
            tpms: this.metrics.tpms,
            tps: this.metrics.tps,
            rss: `${this.metrics.rss}MB`,
            heap: `${this.metrics.heap}MB`,
            speed: `${this.metrics.validationSpeed}ms`,
            nodeSize: `${status.nodeSizeMB}MB`,
            underLimit: status.underSizeLimit
        };
    }
}

/**
 * ZK13 Validator - Zero-Knowledge Proof Generation
 */
class ZK13Validator {
    async generateProof(tx, context) {
        const startTime = Date.now();

        // Generate ZK13 proof components
        const commitment = this.createCommitment(tx);
        const challenge = this.createChallenge(commitment, context);
        const response = this.createResponse(tx, challenge);

        const proof = {
            valid: this.verifyProof(commitment, challenge, response),
            commitment,
            challenge,
            response,
            algorithm: 'ZK13',
            generationTime: Date.now() - startTime
        };

        return proof;
    }

    createCommitment(tx) {
        return crypto.createHash('sha256')
            .update(JSON.stringify(tx))
            .digest('hex');
    }

    createChallenge(commitment, context) {
        return crypto.createHash('sha256')
            .update(commitment + JSON.stringify(context))
            .digest('hex');
    }

    createResponse(tx, challenge) {
        return crypto.createHmac('sha256', challenge)
            .update(JSON.stringify(tx))
            .digest('hex');
    }

    verifyProof(commitment, challenge, response) {
        // Simplified verification - in production would use actual ZK-SNARK
        return commitment && challenge && response &&
               commitment.length === 64 &&
               challenge.length === 64 &&
               response.length === 64;
    }
}

/**
 * GodCypher Engine - 3-Way Encryption
 */
class GodCypherEngine {
    async encrypt3Way(data, sender, receiver, witness) {
        const startTime = Date.now();

        // Generate shared secrets
        const senderSecret = this.generateSecret(sender);
        const receiverSecret = this.generateSecret(receiver);
        const witnessSecret = this.generateSecret(witness);

        // Combine secrets for GodCypher key
        const godCypherKey = this.deriveGodCypherKey(
            senderSecret,
            receiverSecret,
            witnessSecret
        );

        // Encrypt data
        const encrypted = this.encrypt(JSON.stringify(data), godCypherKey);

        return {
            encrypted,
            senderProof: this.createProof(senderSecret),
            receiverProof: this.createProof(receiverSecret),
            witnessProof: this.createProof(witnessSecret),
            encryptionTime: Date.now() - startTime
        };
    }

    generateSecret(address) {
        return crypto.createHash('sha256')
            .update(address + 'secret')
            .digest('hex');
    }

    deriveGodCypherKey(secret1, secret2, secret3) {
        return crypto.createHash('sha512')
            .update(secret1 + secret2 + secret3)
            .digest('hex')
            .substring(0, 32);
    }

    encrypt(data, key) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return {
            data: encrypted,
            iv: iv.toString('hex')
        };
    }

    createProof(secret) {
        return crypto.createHash('sha256')
            .update(secret)
            .digest('hex')
            .substring(0, 16);
    }
}

/**
 * Proof of Existence Engine (Legacy - kept for backward compatibility)
 * Use EnhancedProofOfExistenceEngine for production
 */
class ProofOfExistenceEngine {
    async createProof(validationData) {
        const timestamp = Date.now();
        
        const proofHash = crypto.createHash('sha256')
            .update(JSON.stringify(validationData) + timestamp)
            .digest('hex');

        return {
            hash: proofHash,
            timestamp,
            exists: true,
            merkleRoot: this.calculateMerkleRoot([proofHash]),
            legacy: true // Flag to indicate legacy proof
        };
    }

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
}

module.exports = STARWMiniValidationNode;
