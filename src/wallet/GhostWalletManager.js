/**
 * Ghost Wallet Manager
 * 
 * Manages multiple ghost wallets and coordinates with validation nodes
 */

const GhostWallet = require('./GhostWallet');
const EventEmitter = require('events');

class GhostWalletManager extends EventEmitter {
    constructor(validationNode = null) {
        super();
        
        this.validationNode = validationNode;
        this.ghostWallets = new Map(); // address -> GhostWallet
        
        // Global settings
        this.globalAutoPush = true;
        this.globalPushInterval = 5000; // 5 seconds
        
        // Statistics
        this.globalStats = {
            totalWallets: 0,
            totalGhosted: 0,
            totalPushed: 0,
            totalConfirmed: 0,
            totalFailed: 0
        };
        
        console.log('👻 Ghost Wallet Manager created');
    }

    /**
     * Create or get ghost wallet for address
     */
    getOrCreateGhostWallet(walletAddress, options = {}) {
        if (this.ghostWallets.has(walletAddress)) {
            return this.ghostWallets.get(walletAddress);
        }
        
        const ghostWallet = new GhostWallet(walletAddress, {
            autoPush: options.autoPush !== undefined ? options.autoPush : this.globalAutoPush,
            autoPushInterval: options.autoPushInterval || this.globalPushInterval,
            ...options
        });
        
        // Forward events
        ghostWallet.on('ghost-created', (data) => {
            this.emit('ghost-created', { wallet: walletAddress, ...data });
            this.globalStats.totalGhosted++;
        });
        
        ghostWallet.on('confirmed', (data) => {
            this.emit('confirmed', { wallet: walletAddress, ...data });
            this.globalStats.totalConfirmed++;
        });
        
        ghostWallet.on('failed', (data) => {
            this.emit('failed', { wallet: walletAddress, ...data });
            this.globalStats.totalFailed++;
        });
        
        ghostWallet.on('pushed', (data) => {
            this.emit('pushed', { wallet: walletAddress, ...data });
            this.globalStats.totalPushed++;
        });
        
        this.ghostWallets.set(walletAddress, ghostWallet);
        this.globalStats.totalWallets++;
        
        console.log(`👻 Ghost wallet created for ${walletAddress}`);
        
        return ghostWallet;
    }

    /**
     * Start all ghost wallets
     */
    async startAll() {
        console.log(`👻 Starting ${this.ghostWallets.size} ghost wallets...`);
        
        for (const ghostWallet of this.ghostWallets.values()) {
            await ghostWallet.start();
        }
        
        console.log('✅ All ghost wallets started');
    }

    /**
     * Stop all ghost wallets
     */
    async stopAll() {
        console.log(`👻 Stopping ${this.ghostWallets.size} ghost wallets...`);
        
        for (const ghostWallet of this.ghostWallets.values()) {
            await ghostWallet.stop();
        }
        
        console.log('✅ All ghost wallets stopped');
    }

    /**
     * Create ghost transaction
     */
    async createGhostTransaction(walletAddress, tx) {
        const ghostWallet = this.getOrCreateGhostWallet(walletAddress);
        
        if (!ghostWallet.networkAvailable) {
            await ghostWallet.start();
        }
        
        return await ghostWallet.createGhostTransaction(tx);
    }

    /**
     * Push all pending transactions across all wallets
     */
    async pushAllPending() {
        console.log('📤 Pushing all pending ghost transactions...');
        
        let totalPushed = 0;
        let totalConfirmed = 0;
        let totalFailed = 0;
        
        for (const ghostWallet of this.ghostWallets.values()) {
            const result = await ghostWallet.pushBatch(this.validationNode);
            totalPushed += result.pushed;
            totalConfirmed += result.confirmed;
            totalFailed += result.failed;
        }
        
        console.log(`✅ Push complete: ${totalConfirmed} confirmed, ${totalPushed} pushed, ${totalFailed} failed`);
        
        return { totalPushed, totalConfirmed, totalFailed };
    }

    /**
     * Get global statistics
     */
    getGlobalStatistics() {
        let totalPending = 0;
        let totalLedger = 0;
        
        for (const ghostWallet of this.ghostWallets.values()) {
            const status = ghostWallet.getStatus();
            totalPending += status.ledger.pending;
            totalLedger += status.ledger.total;
        }
        
        return {
            wallets: this.globalStats.totalWallets,
            totalGhosted: this.globalStats.totalGhosted,
            totalPushed: this.globalStats.totalPushed,
            totalConfirmed: this.globalStats.totalConfirmed,
            totalFailed: this.globalStats.totalFailed,
            currentPending: totalPending,
            currentLedger: totalLedger
        };
    }

    /**
     * Get all ghost wallets status
     */
    getAllStatus() {
        const statuses = [];
        
        for (const [address, ghostWallet] of this.ghostWallets.entries()) {
            statuses.push({
                address,
                ...ghostWallet.getStatus()
            });
        }
        
        return statuses;
    }

    /**
     * Set validation node
     */
    setValidationNode(validationNode) {
        this.validationNode = validationNode;
        console.log('✅ Validation node set for ghost wallet manager');
    }
}

module.exports = GhostWalletManager;
