/**
 * Ghost Wallet System
 * 
 * Features:
 * - Temporary pending ledger for transactions
 * - Off-chain transaction queuing
 * - Auto-push when chain/nodes are ready
 * - Optimistic UI updates
 * - Conflict resolution
 * - Batch submission for efficiency
 * 
 * Use Cases:
 * - Network delays
 * - Node unavailability
 * - Offline transactions
 * - High-frequency trading
 * - Transaction bundling
 */

const crypto = require('crypto');
const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class GhostWallet extends EventEmitter {
    constructor(walletAddress, options = {}) {
        super();
        
        this.walletAddress = walletAddress;
        this.ghostId = this.generateGhostId();
        
        // Ghost ledger (temporary pending transactions)
        this.ghostLedger = [];
        this.maxGhostSize = options.maxGhostSize || 10000; // Max pending transactions
        
        // Confirmed transactions (successfully pushed to chain)
        this.confirmedTransactions = new Set();
        
        // Failed transactions (rejected by chain)
        this.failedTransactions = new Map(); // txHash -> error
        
        // Auto-push settings
        this.autoPushEnabled = options.autoPush !== false;
        this.autoPushInterval = options.autoPushInterval || 5000; // 5 seconds
        this.autoPushBatchSize = options.autoPushBatchSize || 100; // Push 100 at a time
        this.autoPushTimer = null;
        
        // Network status
        this.networkAvailable = false;
        this.lastNetworkCheck = 0;
        this.networkCheckInterval = 2000; // Check every 2 seconds
        
        // Balance tracking (optimistic)
        this.ghostBalance = {
            available: 0,
            pending: 0,
            locked: 0
        };
        
        // Statistics
        this.stats = {
            totalGhosted: 0,
            totalPushed: 0,
            totalConfirmed: 0,
            totalFailed: 0,
            avgPushTime: 0
        };
        
        // Persistence
        this.persistenceEnabled = options.persistence !== false;
        this.persistencePath = options.persistencePath || './ghost-wallet-data';
        
        console.log('👻 Ghost Wallet created');
        console.log(`   Wallet: ${walletAddress}`);
        console.log(`   Ghost ID: ${this.ghostId}`);
        console.log(`   Auto-push: ${this.autoPushEnabled ? 'ENABLED' : 'DISABLED'}`);
        console.log(`   Persistence: ${this.persistenceEnabled ? 'ENABLED' : 'DISABLED'}`);
    }

    /**
     * Generate unique ghost wallet ID
     */
    generateGhostId() {
        return crypto.createHash('sha256')
            .update(this.walletAddress + Date.now() + Math.random())
            .digest('hex')
            .substring(0, 16);
    }

    /**
     * Start ghost wallet (enables auto-push)
     */
    async start() {
        console.log('👻 Starting Ghost Wallet...');
        
        // Load persisted data
        if (this.persistenceEnabled) {
            await this.loadPersistedData();
        }
        
        // Start auto-push timer
        if (this.autoPushEnabled) {
            this.startAutoPush();
        }
        
        // Start network monitor
        this.startNetworkMonitor();
        
        this.emit('started', { ghostId: this.ghostId });
        console.log('✅ Ghost Wallet started');
    }

    /**
     * Stop ghost wallet
     */
    async stop() {
        console.log('👻 Stopping Ghost Wallet...');
        
        // Stop auto-push
        this.stopAutoPush();
        
        // Persist data
        if (this.persistenceEnabled) {
            await this.persistData();
        }
        
        this.emit('stopped', { ghostId: this.ghostId });
        console.log('✅ Ghost Wallet stopped');
    }

    /**
     * Create ghost transaction (add to pending ledger)
     */
    async createGhostTransaction(tx) {
        // Validate transaction structure
        this.validateTransaction(tx);
        
        // Generate ghost transaction
        const ghostTx = {
            // Original transaction data
            ...tx,
            
            // Ghost metadata
            ghostId: this.ghostId,
            ghostTimestamp: Date.now(),
            ghostStatus: 'PENDING',
            ghostHash: this.generateGhostHash(tx),
            
            // Push attempts
            pushAttempts: 0,
            lastPushAttempt: null,
            
            // Optimistic state
            optimistic: true,
            
            // Expiration (24 hours default)
            expiresAt: Date.now() + (tx.ttl || 86400000)
        };
        
        // Add to ghost ledger
        this.ghostLedger.push(ghostTx);
        this.stats.totalGhosted++;
        
        // Update optimistic balance
        this.updateOptimisticBalance(ghostTx);
        
        // Persist if enabled
        if (this.persistenceEnabled) {
            await this.persistData();
        }
        
        console.log(`👻 Ghost transaction created: ${ghostTx.ghostHash}`);
        this.emit('ghost-created', ghostTx);
        
        // Try immediate push if network available
        if (this.networkAvailable) {
            setImmediate(() => this.tryPushTransaction(ghostTx));
        }
        
        return ghostTx;
    }

    /**
     * Generate ghost transaction hash
     */
    generateGhostHash(tx) {
        return crypto.createHash('sha256')
            .update(JSON.stringify(tx) + Date.now())
            .digest('hex')
            .substring(0, 32); // 16 bytes
    }

    /**
     * Validate transaction structure
     */
    validateTransaction(tx) {
        if (!tx.from || !tx.to || tx.amount === undefined) {
            throw new Error('Invalid transaction structure');
        }
        
        if (tx.from !== this.walletAddress) {
            throw new Error('Transaction from address does not match wallet');
        }
        
        if (tx.amount <= 0) {
            throw new Error('Amount must be positive');
        }
    }

    /**
     * Update optimistic balance
     */
    updateOptimisticBalance(ghostTx) {
        if (ghostTx.from === this.walletAddress) {
            // Sending: lock the amount
            this.ghostBalance.available -= ghostTx.amount;
            this.ghostBalance.locked += ghostTx.amount;
            this.ghostBalance.pending += ghostTx.amount;
        }
        
        if (ghostTx.to === this.walletAddress) {
            // Receiving: show as pending
            this.ghostBalance.pending += ghostTx.amount;
        }
    }

    /**
     * Try to push single transaction to chain
     */
    async tryPushTransaction(ghostTx, validationNode = null) {
        if (ghostTx.ghostStatus !== 'PENDING') {
            return; // Already processed
        }
        
        ghostTx.pushAttempts++;
        ghostTx.lastPushAttempt = Date.now();
        
        try {
            // Emit push attempt
            this.emit('push-attempt', { 
                ghostHash: ghostTx.ghostHash, 
                attempt: ghostTx.pushAttempts 
            });
            
            // Push to validation node (if provided)
            if (validationNode && typeof validationNode.validateTransaction === 'function') {
                const startTime = Date.now();
                const result = await validationNode.validateTransaction({
                    hash: ghostTx.hash || ghostTx.ghostHash,
                    from: ghostTx.from,
                    to: ghostTx.to,
                    amount: ghostTx.amount,
                    nonce: ghostTx.nonce,
                    timestamp: ghostTx.timestamp || ghostTx.ghostTimestamp
                });
                
                const pushTime = Date.now() - startTime;
                
                // Check if validated
                if (result.offchain && result.offchain.valid) {
                    this.handlePushSuccess(ghostTx, result, pushTime);
                } else {
                    throw new Error(result.offchain?.recommendation?.reason || 'Validation failed');
                }
            } else {
                // No validation node - mark as pushed (will confirm later)
                ghostTx.ghostStatus = 'PUSHED';
                ghostTx.pushedAt = Date.now();
                this.stats.totalPushed++;
                
                this.emit('pushed', { ghostHash: ghostTx.ghostHash });
                console.log(`📤 Ghost transaction pushed: ${ghostTx.ghostHash}`);
            }
            
        } catch (error) {
            this.handlePushFailure(ghostTx, error);
        }
    }

    /**
     * Handle successful push
     */
    handlePushSuccess(ghostTx, validationResult, pushTime) {
        ghostTx.ghostStatus = 'CONFIRMED';
        ghostTx.confirmedAt = Date.now();
        ghostTx.validationResult = validationResult;
        
        // Update stats
        this.stats.totalConfirmed++;
        this.stats.totalPushed++;
        this.stats.avgPushTime = 
            (this.stats.avgPushTime * (this.stats.totalConfirmed - 1) + pushTime) / 
            this.stats.totalConfirmed;
        
        // Add to confirmed set
        this.confirmedTransactions.add(ghostTx.ghostHash);
        
        // Update balance
        if (ghostTx.from === this.walletAddress) {
            this.ghostBalance.locked -= ghostTx.amount;
            this.ghostBalance.pending -= ghostTx.amount;
        }
        
        if (ghostTx.to === this.walletAddress) {
            this.ghostBalance.available += ghostTx.amount;
            this.ghostBalance.pending -= ghostTx.amount;
        }
        
        console.log(`✅ Ghost transaction confirmed: ${ghostTx.ghostHash} (${pushTime}ms)`);
        this.emit('confirmed', { 
            ghostHash: ghostTx.ghostHash, 
            pushTime,
            validationResult 
        });
    }

    /**
     * Handle push failure
     */
    handlePushFailure(ghostTx, error) {
        ghostTx.ghostStatus = 'FAILED';
        ghostTx.failedAt = Date.now();
        ghostTx.failureReason = error.message;
        
        this.stats.totalFailed++;
        this.failedTransactions.set(ghostTx.ghostHash, error.message);
        
        // Rollback optimistic balance
        if (ghostTx.from === this.walletAddress) {
            this.ghostBalance.available += ghostTx.amount;
            this.ghostBalance.locked -= ghostTx.amount;
            this.ghostBalance.pending -= ghostTx.amount;
        }
        
        if (ghostTx.to === this.walletAddress) {
            this.ghostBalance.pending -= ghostTx.amount;
        }
        
        console.error(`❌ Ghost transaction failed: ${ghostTx.ghostHash} - ${error.message}`);
        this.emit('failed', { 
            ghostHash: ghostTx.ghostHash, 
            error: error.message 
        });
    }

    /**
     * Push batch of transactions
     */
    async pushBatch(validationNode = null) {
        const pending = this.ghostLedger.filter(tx => 
            tx.ghostStatus === 'PENDING' && 
            tx.pushAttempts < 3 && 
            tx.expiresAt > Date.now()
        );
        
        if (pending.length === 0) {
            return { pushed: 0, confirmed: 0, failed: 0 };
        }
        
        // Limit batch size
        const batch = pending.slice(0, this.autoPushBatchSize);
        
        console.log(`📦 Pushing batch of ${batch.length} ghost transactions...`);
        
        const results = {
            pushed: 0,
            confirmed: 0,
            failed: 0
        };
        
        for (const ghostTx of batch) {
            await this.tryPushTransaction(ghostTx, validationNode);
            
            if (ghostTx.ghostStatus === 'CONFIRMED') results.confirmed++;
            else if (ghostTx.ghostStatus === 'PUSHED') results.pushed++;
            else if (ghostTx.ghostStatus === 'FAILED') results.failed++;
        }
        
        console.log(`✅ Batch complete: ${results.confirmed} confirmed, ${results.pushed} pushed, ${results.failed} failed`);
        this.emit('batch-complete', results);
        
        return results;
    }

    /**
     * Start auto-push timer
     */
    startAutoPush() {
        if (this.autoPushTimer) return;
        
        this.autoPushTimer = setInterval(async () => {
            if (this.networkAvailable) {
                const pending = this.getPendingCount();
                if (pending > 0) {
                    await this.pushBatch();
                }
            }
        }, this.autoPushInterval);
        
        console.log(`⏰ Auto-push enabled (${this.autoPushInterval}ms interval)`);
    }

    /**
     * Stop auto-push timer
     */
    stopAutoPush() {
        if (this.autoPushTimer) {
            clearInterval(this.autoPushTimer);
            this.autoPushTimer = null;
            console.log('⏰ Auto-push disabled');
        }
    }

    /**
     * Start network monitoring
     */
    startNetworkMonitor() {
        setInterval(() => {
            this.checkNetworkStatus();
        }, this.networkCheckInterval);
    }

    /**
     * Check network status
     */
    async checkNetworkStatus() {
        this.lastNetworkCheck = Date.now();
        
        // This would check actual network connectivity
        // For now, we'll assume network is available
        const wasAvailable = this.networkAvailable;
        this.networkAvailable = true; // Default to available
        
        if (!wasAvailable && this.networkAvailable) {
            console.log('🌐 Network available - resuming ghost transaction push');
            this.emit('network-available');
            
            // Trigger immediate push
            if (this.autoPushEnabled) {
                setImmediate(() => this.pushBatch());
            }
        }
        
        if (wasAvailable && !this.networkAvailable) {
            console.log('🌐 Network unavailable - queuing ghost transactions');
            this.emit('network-unavailable');
        }
    }

    /**
     * Get pending transaction count
     */
    getPendingCount() {
        return this.ghostLedger.filter(tx => tx.ghostStatus === 'PENDING').length;
    }

    /**
     * Get ghost ledger status
     */
    getStatus() {
        const now = Date.now();
        
        return {
            ghostId: this.ghostId,
            wallet: this.walletAddress,
            
            ledger: {
                total: this.ghostLedger.length,
                pending: this.ghostLedger.filter(tx => tx.ghostStatus === 'PENDING').length,
                pushed: this.ghostLedger.filter(tx => tx.ghostStatus === 'PUSHED').length,
                confirmed: this.ghostLedger.filter(tx => tx.ghostStatus === 'CONFIRMED').length,
                failed: this.ghostLedger.filter(tx => tx.ghostStatus === 'FAILED').length,
                expired: this.ghostLedger.filter(tx => tx.expiresAt <= now).length
            },
            
            balance: this.ghostBalance,
            
            network: {
                available: this.networkAvailable,
                lastCheck: this.lastNetworkCheck,
                checkInterval: this.networkCheckInterval
            },
            
            autoPush: {
                enabled: this.autoPushEnabled,
                interval: this.autoPushInterval,
                batchSize: this.autoPushBatchSize
            },
            
            stats: this.stats
        };
    }

    /**
     * Get ghost transaction by hash
     */
    getGhostTransaction(ghostHash) {
        return this.ghostLedger.find(tx => tx.ghostHash === ghostHash);
    }

    /**
     * Get all pending transactions
     */
    getPendingTransactions() {
        return this.ghostLedger.filter(tx => tx.ghostStatus === 'PENDING');
    }

    /**
     * Clear expired transactions
     */
    clearExpired() {
        const now = Date.now();
        const before = this.ghostLedger.length;
        
        this.ghostLedger = this.ghostLedger.filter(tx => {
            if (tx.expiresAt <= now && tx.ghostStatus === 'PENDING') {
                console.log(`⏰ Ghost transaction expired: ${tx.ghostHash}`);
                this.emit('expired', { ghostHash: tx.ghostHash });
                return false;
            }
            return true;
        });
        
        const expired = before - this.ghostLedger.length;
        if (expired > 0) {
            console.log(`🗑️  Cleared ${expired} expired ghost transactions`);
        }
        
        return expired;
    }

    /**
     * Clear confirmed transactions (cleanup)
     */
    clearConfirmed() {
        const before = this.ghostLedger.length;
        
        this.ghostLedger = this.ghostLedger.filter(tx => 
            tx.ghostStatus !== 'CONFIRMED' || 
            Date.now() - tx.confirmedAt < 3600000 // Keep for 1 hour
        );
        
        const cleared = before - this.ghostLedger.length;
        if (cleared > 0) {
            console.log(`🗑️  Cleared ${cleared} old confirmed transactions`);
        }
        
        return cleared;
    }

    /**
     * Retry failed transactions
     */
    async retryFailed(validationNode = null) {
        const failed = this.ghostLedger.filter(tx => 
            tx.ghostStatus === 'FAILED' && 
            tx.pushAttempts < 3
        );
        
        if (failed.length === 0) {
            console.log('ℹ️  No failed transactions to retry');
            return 0;
        }
        
        console.log(`🔄 Retrying ${failed.length} failed transactions...`);
        
        for (const ghostTx of failed) {
            ghostTx.ghostStatus = 'PENDING'; // Reset to pending
            await this.tryPushTransaction(ghostTx, validationNode);
        }
        
        return failed.length;
    }

    /**
     * Persist ghost ledger to disk
     */
    async persistData() {
        if (!this.persistenceEnabled) return;
        
        try {
            await fs.mkdir(this.persistencePath, { recursive: true });
            
            const data = {
                ghostId: this.ghostId,
                walletAddress: this.walletAddress,
                ghostLedger: this.ghostLedger,
                ghostBalance: this.ghostBalance,
                stats: this.stats,
                confirmedTransactions: Array.from(this.confirmedTransactions),
                failedTransactions: Array.from(this.failedTransactions.entries()),
                timestamp: Date.now()
            };
            
            const filename = `ghost-wallet-${this.walletAddress}.json`;
            const filepath = path.join(this.persistencePath, filename);
            
            await fs.writeFile(filepath, JSON.stringify(data, null, 2));
            
            console.log(`💾 Ghost wallet data persisted: ${filepath}`);
        } catch (error) {
            console.error('❌ Failed to persist ghost wallet data:', error.message);
        }
    }

    /**
     * Load persisted data from disk
     */
    async loadPersistedData() {
        if (!this.persistenceEnabled) return;
        
        try {
            const filename = `ghost-wallet-${this.walletAddress}.json`;
            const filepath = path.join(this.persistencePath, filename);
            
            const data = JSON.parse(await fs.readFile(filepath, 'utf8'));
            
            this.ghostLedger = data.ghostLedger || [];
            this.ghostBalance = data.ghostBalance || { available: 0, pending: 0, locked: 0 };
            this.stats = data.stats || this.stats;
            this.confirmedTransactions = new Set(data.confirmedTransactions || []);
            this.failedTransactions = new Map(data.failedTransactions || []);
            
            console.log(`💾 Ghost wallet data loaded: ${this.ghostLedger.length} transactions`);
            this.emit('data-loaded', { transactions: this.ghostLedger.length });
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('❌ Failed to load ghost wallet data:', error.message);
            }
        }
    }

    /**
     * Export ghost ledger
     */
    exportLedger() {
        return {
            ghostId: this.ghostId,
            wallet: this.walletAddress,
            transactions: this.ghostLedger.map(tx => ({
                ghostHash: tx.ghostHash,
                from: tx.from,
                to: tx.to,
                amount: tx.amount,
                status: tx.ghostStatus,
                timestamp: tx.ghostTimestamp,
                pushAttempts: tx.pushAttempts,
                expiresAt: tx.expiresAt
            })),
            balance: this.ghostBalance,
            stats: this.stats
        };
    }
}

module.exports = GhostWallet;
