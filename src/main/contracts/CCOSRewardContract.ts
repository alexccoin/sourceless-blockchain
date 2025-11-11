// CCOSRewardContract.ts - Smart contract for CCOS reward mechanics
// Mints between 2.5% and 10% CCOS tokens on each financial public transaction

import { Transaction } from '../blockchain/core/Transaction';

export interface CCOSRewardConfig {
    enabled: boolean;
    minRewardPercent: number;  // 2.5%
    maxRewardPercent: number;  // 10%
    treasuryAddress: string;
    marketAddress: string;
}

export interface FinancialTransaction {
    txId: string;
    from: string;
    to: string;
    amount: number;
    isPublic: boolean;
    timestamp: number;
}

export class CCOSRewardContract {
    private config: CCOSRewardConfig;
    private totalRewarded: number = 0;
    private rewardHistory: Map<string, number> = new Map();

    constructor(config: CCOSRewardConfig) {
        this.config = config;
    }

    /**
     * Calculate reward percentage based on transaction characteristics
     * Returns a value between minRewardPercent and maxRewardPercent
     */
    private calculateRewardPercent(tx: FinancialTransaction): number {
        if (!this.config.enabled || !tx.isPublic) {
            return 0;
        }

        // Base reward: 2.5%
        let rewardPercent = this.config.minRewardPercent;

        // Increase reward based on transaction size (larger = more reward)
        // For every 1000 STR, add 0.5% (up to max)
        const sizeBonusSteps = Math.floor(tx.amount / 1000);
        const sizeBonus = Math.min(sizeBonusSteps * 0.5, this.config.maxRewardPercent - this.config.minRewardPercent);
        rewardPercent += sizeBonus;

        // Cap at maximum
        return Math.min(rewardPercent, this.config.maxRewardPercent);
    }

    /**
     * Process a financial transaction and mint CCOS rewards
     * Returns the amount of CCOS minted
     */
    processTransaction(tx: FinancialTransaction): {
        success: boolean;
        rewardAmount: number;
        rewardPercent: number;
        error?: string;
    } {
        if (!this.config.enabled) {
            return { success: false, rewardAmount: 0, rewardPercent: 0, error: 'Rewards disabled' };
        }

        if (!tx.isPublic) {
            return { success: false, rewardAmount: 0, rewardPercent: 0, error: 'Private transactions not eligible' };
        }

        // Calculate reward
        const rewardPercent = this.calculateRewardPercent(tx);
        const rewardAmount = Math.floor((tx.amount * rewardPercent) / 100);

        if (rewardAmount === 0) {
            return { success: false, rewardAmount: 0, rewardPercent: 0, error: 'Reward amount too small' };
        }

        // Record reward
        this.totalRewarded += rewardAmount;
        this.rewardHistory.set(tx.txId, rewardAmount);

        return {
            success: true,
            rewardAmount,
            rewardPercent
        };
    }

    /**
     * Distribute minted CCOS between treasury and market
     */
    distributeReward(rewardAmount: number): {
        toTreasury: number;
        toMarket: number;
    } {
        // 67% to treasury, 33% to market (same as genesis distribution)
        const toTreasury = Math.floor(rewardAmount * 0.67);
        const toMarket = rewardAmount - toTreasury;

        return { toTreasury, toMarket };
    }

    /**
     * Get total CCOS rewarded
     */
    getTotalRewarded(): number {
        return this.totalRewarded;
    }

    /**
     * Get reward for specific transaction
     */
    getRewardForTransaction(txId: string): number | null {
        return this.rewardHistory.get(txId) || null;
    }

    /**
     * Get reward statistics
     */
    getStats() {
        return {
            enabled: this.config.enabled,
            totalRewarded: this.totalRewarded,
            transactionsProcessed: this.rewardHistory.size,
            minRewardPercent: this.config.minRewardPercent,
            maxRewardPercent: this.config.maxRewardPercent,
            averageReward: this.rewardHistory.size > 0 
                ? this.totalRewarded / this.rewardHistory.size 
                : 0
        };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<CCOSRewardConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}

// Example usage:
/*
const rewardContract = new CCOSRewardContract({
    enabled: true,
    minRewardPercent: 2.5,
    maxRewardPercent: 10,
    treasuryAddress: 'STR.treasury',
    marketAddress: 'STR.market'
});

// On each public financial transaction:
const tx: FinancialTransaction = {
    txId: 'tx_123',
    from: 'wallet_a',
    to: 'wallet_b',
    amount: 5000,
    isPublic: true,
    timestamp: Date.now()
};

const result = rewardContract.processTransaction(tx);
if (result.success) {
    console.log(`Minting ${result.rewardAmount} CCOS (${result.rewardPercent}% reward)`);
    
    const distribution = rewardContract.distributeReward(result.rewardAmount);
    console.log(`Treasury: ${distribution.toTreasury} CCOS`);
    console.log(`Market: ${distribution.toMarket} CCOS`);
    
    // Mint CCOS to treasury
    ledgerManager.ccosLedger.mint(treasuryAddress, distribution.toTreasury);
    
    // Mint CCOS to market
    ledgerManager.ccosLedger.mint(marketAddress, distribution.toMarket);
}
*/
