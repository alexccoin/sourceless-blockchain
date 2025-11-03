/**
 * STARW Personal Machine Hosting System
 * 
 * Users share their disk space and earn ARSS tokens
 * - 1 ARSS token per GB per day
 * - Minimum commitment: 30 days
 * - P2P network distribution
 * - Automatic validation and reward distribution
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

export interface StorageCommitment {
    id: string;
    walletAddress: string;
    storageGB: number; // Amount of storage committed (GB)
    startDate: Date;
    endDate: Date; // startDate + minimum 30 days
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    totalARSSEarned: number;
    lastRewardDate: Date;
    storagePath: string; // Local directory for shared storage
}

export interface StorageStats {
    totalShared: number; // Total GB shared by this node
    totalUsed: number; // Total GB used by network
    totalAvailable: number; // Available GB
    dailyReward: number; // ARSS tokens per day
    totalEarned: number; // Total ARSS earned
    commitments: StorageCommitment[];
}

export interface HostedFile {
    id: string;
    hash: string;
    size: number; // bytes
    uploader: string; // wallet address
    timestamp: Date;
    replicas: number; // number of nodes storing this file
}

export class StarwHostingEngine extends EventEmitter {
    private commitments: Map<string, StorageCommitment> = new Map();
    private hostedFiles: Map<string, HostedFile> = new Map();
    private storagePath: string;
    private rewardInterval: NodeJS.Timeout | null = null;
    private validationInterval: NodeJS.Timeout | null = null;
    
    // Configuration
    private readonly ARSS_PER_GB_PER_DAY = 1;
    private readonly MINIMUM_COMMITMENT_DAYS = 30;
    private readonly VALIDATION_INTERVAL_MS = 3600000; // 1 hour
    private readonly REWARD_INTERVAL_MS = 86400000; // 24 hours

    constructor(storagePath: string) {
        super();
        this.storagePath = storagePath;
        console.log('🖥️  STARW Hosting Engine initializing...');
        this.ensureStorageDirectory();
    }

    private ensureStorageDirectory(): void {
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath, { recursive: true });
            console.log('📁 Storage directory created:', this.storagePath);
        }
    }

    // ==================== STORAGE COMMITMENT ====================

    /**
     * Create a new storage commitment
     * @param walletAddress User's wallet address
     * @param storageGB Amount of storage to share (GB)
     * @param durationDays Duration of commitment (minimum 30 days)
     */
    async createCommitment(
        walletAddress: string, 
        storageGB: number, 
        durationDays: number = 30
    ): Promise<StorageCommitment> {
        if (durationDays < this.MINIMUM_COMMITMENT_DAYS) {
            throw new Error(`Minimum commitment is ${this.MINIMUM_COMMITMENT_DAYS} days`);
        }

        if (storageGB <= 0) {
            throw new Error('Storage amount must be greater than 0');
        }

        const commitment: StorageCommitment = {
            id: this.generateCommitmentId(),
            walletAddress,
            storageGB,
            startDate: new Date(),
            endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
            status: 'active',
            totalARSSEarned: 0,
            lastRewardDate: new Date(),
            storagePath: path.join(this.storagePath, `commitment_${storageGB}GB`)
        };

        // Create storage directory for this commitment
        fs.mkdirSync(commitment.storagePath, { recursive: true });

        this.commitments.set(commitment.id, commitment);
        
        console.log(`✅ Storage commitment created: ${storageGB}GB for ${durationDays} days`);
        console.log(`   Daily reward: ${storageGB * this.ARSS_PER_GB_PER_DAY} ARSS`);
        console.log(`   Total potential: ${storageGB * this.ARSS_PER_GB_PER_DAY * durationDays} ARSS`);

        this.emit('commitment:created', commitment);
        return commitment;
    }

    /**
     * Get storage commitment details
     */
    getCommitment(commitmentId: string): StorageCommitment | null {
        return this.commitments.get(commitmentId) || null;
    }

    /**
     * Get all active commitments for a wallet
     */
    getCommitmentsByWallet(walletAddress: string): StorageCommitment[] {
        return Array.from(this.commitments.values())
            .filter(c => c.walletAddress === walletAddress);
    }

    /**
     * Get storage stats for a wallet
     */
    getStorageStats(walletAddress: string): StorageStats {
        const userCommitments = this.getCommitmentsByWallet(walletAddress);
        
        const totalShared = userCommitments.reduce((sum, c) => sum + c.storageGB, 0);
        const totalEarned = userCommitments.reduce((sum, c) => sum + c.totalARSSEarned, 0);
        const dailyReward = totalShared * this.ARSS_PER_GB_PER_DAY;

        // Calculate used storage (mock for now - would scan actual files)
        const totalUsed = this.calculateUsedStorage(userCommitments);

        return {
            totalShared,
            totalUsed,
            totalAvailable: totalShared - totalUsed,
            dailyReward,
            totalEarned,
            commitments: userCommitments
        };
    }

    /**
     * Cancel a commitment (with penalty)
     */
    async cancelCommitment(commitmentId: string): Promise<void> {
        const commitment = this.commitments.get(commitmentId);
        if (!commitment) {
            throw new Error('Commitment not found');
        }

        const daysPassed = this.getDaysPassed(commitment.startDate);
        
        if (daysPassed < this.MINIMUM_COMMITMENT_DAYS) {
            console.warn(`⚠️  Cancelling commitment before minimum period (${daysPassed}/${this.MINIMUM_COMMITMENT_DAYS} days)`);
            // Apply penalty: lose 50% of earned ARSS
            commitment.totalARSSEarned *= 0.5;
        }

        commitment.status = 'cancelled';
        console.log(`❌ Commitment cancelled: ${commitmentId}`);
        
        this.emit('commitment:cancelled', commitment);
    }

    // ==================== REWARD DISTRIBUTION ====================

    /**
     * Start automatic reward distribution
     */
    startRewardDistribution(): void {
        if (this.rewardInterval) {
            console.warn('⚠️  Reward distribution already running');
            return;
        }

        console.log('🎁 Starting automatic ARSS reward distribution...');
        
        // Distribute rewards every 24 hours
        this.rewardInterval = setInterval(() => {
            this.distributeRewards();
        }, this.REWARD_INTERVAL_MS);

        // Immediate first distribution
        this.distributeRewards();
    }

    /**
     * Stop automatic reward distribution
     */
    stopRewardDistribution(): void {
        if (this.rewardInterval) {
            clearInterval(this.rewardInterval);
            this.rewardInterval = null;
            console.log('🛑 ARSS reward distribution stopped');
        }
    }

    /**
     * Distribute daily ARSS rewards to all active commitments
     */
    private distributeRewards(): void {
        console.log('💰 Distributing daily ARSS rewards...');
        
        let totalDistributed = 0;
        const now = new Date();

        for (const commitment of this.commitments.values()) {
            if (commitment.status !== 'active') continue;
            if (now > commitment.endDate) {
                commitment.status = 'completed';
                console.log(`✅ Commitment completed: ${commitment.id}`);
                continue;
            }

            // Calculate days since last reward
            const daysSinceReward = this.getDaysPassed(commitment.lastRewardDate);
            
            if (daysSinceReward >= 1) {
                const reward = commitment.storageGB * this.ARSS_PER_GB_PER_DAY * daysSinceReward;
                commitment.totalARSSEarned += reward;
                commitment.lastRewardDate = now;
                totalDistributed += reward;

                console.log(`   ✅ ${commitment.walletAddress}: +${reward} ARSS (${commitment.storageGB}GB)`);
                
                this.emit('reward:distributed', {
                    commitmentId: commitment.id,
                    walletAddress: commitment.walletAddress,
                    amount: reward,
                    timestamp: now
                });
            }
        }

        console.log(`✅ Total ARSS distributed: ${totalDistributed}`);
    }

    // ==================== STORAGE VALIDATION ====================

    /**
     * Start automatic storage validation
     */
    startStorageValidation(): void {
        if (this.validationInterval) {
            console.warn('⚠️  Storage validation already running');
            return;
        }

        console.log('🔍 Starting automatic storage validation...');
        
        this.validationInterval = setInterval(() => {
            this.validateStorage();
        }, this.VALIDATION_INTERVAL_MS);

        // Immediate first validation
        this.validateStorage();
    }

    /**
     * Stop automatic storage validation
     */
    stopStorageValidation(): void {
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
            this.validationInterval = null;
            console.log('🛑 Storage validation stopped');
        }
    }

    /**
     * Validate that committed storage is actually available
     */
    private validateStorage(): void {
        console.log('🔍 Validating storage commitments...');
        
        for (const commitment of this.commitments.values()) {
            if (commitment.status !== 'active') continue;

            try {
                // Check if storage path exists
                if (!fs.existsSync(commitment.storagePath)) {
                    console.warn(`⚠️  Storage path not found: ${commitment.storagePath}`);
                    commitment.status = 'paused';
                    this.emit('commitment:paused', commitment);
                    continue;
                }

                // Check available space (simplified)
                // In production, would use proper disk space checks
                console.log(`   ✅ ${commitment.id}: ${commitment.storageGB}GB validated`);
                
            } catch (error) {
                console.error(`❌ Validation failed for ${commitment.id}:`, error);
                commitment.status = 'paused';
                this.emit('commitment:paused', commitment);
            }
        }
    }

    // ==================== FILE HOSTING ====================

    /**
     * Store a file in the network
     */
    async storeFile(fileData: Buffer, uploader: string): Promise<HostedFile> {
        const hash = this.calculateHash(fileData);
        const fileId = `file_${hash}_${Date.now()}`;

        const hostedFile: HostedFile = {
            id: fileId,
            hash,
            size: fileData.length,
            uploader,
            timestamp: new Date(),
            replicas: 1
        };

        // Store file in a commitment's storage
        const activeCommitment = Array.from(this.commitments.values())
            .find(c => c.status === 'active');

        if (!activeCommitment) {
            throw new Error('No active storage commitments available');
        }

        const filePath = path.join(activeCommitment.storagePath, fileId);
        fs.writeFileSync(filePath, fileData);

        this.hostedFiles.set(fileId, hostedFile);
        console.log(`📦 File stored: ${fileId} (${fileData.length} bytes)`);

        return hostedFile;
    }

    /**
     * Retrieve a file from the network
     */
    async retrieveFile(fileId: string): Promise<Buffer | null> {
        const hostedFile = this.hostedFiles.get(fileId);
        if (!hostedFile) return null;

        // Search for file in commitments
        for (const commitment of this.commitments.values()) {
            const filePath = path.join(commitment.storagePath, fileId);
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath);
            }
        }

        return null;
    }

    // ==================== UTILITIES ====================

    private generateCommitmentId(): string {
        return 'commitment_' + Date.now() + '_' + Math.random().toString(36).substring(7);
    }

    private calculateHash(data: Buffer): string {
        // Simplified hash - in production use proper crypto hash
        return Buffer.from(data).toString('hex').substring(0, 32);
    }

    private getDaysPassed(startDate: Date): number {
        const now = new Date();
        const diff = now.getTime() - startDate.getTime();
        return Math.floor(diff / (24 * 60 * 60 * 1000));
    }

    private calculateUsedStorage(commitments: StorageCommitment[]): number {
        // Calculate actual used storage by scanning files
        let totalUsed = 0;
        
        for (const commitment of commitments) {
            if (!fs.existsSync(commitment.storagePath)) continue;
            
            try {
                const files = fs.readdirSync(commitment.storagePath);
                for (const file of files) {
                    const filePath = path.join(commitment.storagePath, file);
                    const stats = fs.statSync(filePath);
                    totalUsed += stats.size;
                }
            } catch (error) {
                console.error('Error calculating used storage:', error);
            }
        }

        return totalUsed / (1024 * 1024 * 1024); // Convert to GB
    }

    /**
     * Get global network statistics
     */
    getNetworkStats(): {
        totalNodes: number;
        totalStorageGB: number;
        totalFilesHosted: number;
        totalARSSDistributed: number;
    } {
        const activeCommitments = Array.from(this.commitments.values())
            .filter(c => c.status === 'active');

        return {
            totalNodes: activeCommitments.length,
            totalStorageGB: activeCommitments.reduce((sum, c) => sum + c.storageGB, 0),
            totalFilesHosted: this.hostedFiles.size,
            totalARSSDistributed: Array.from(this.commitments.values())
                .reduce((sum, c) => sum + c.totalARSSEarned, 0)
        };
    }

    /**
     * Shutdown hosting engine
     */
    shutdown(): void {
        this.stopRewardDistribution();
        this.stopStorageValidation();
        console.log('🛑 STARW Hosting Engine shutdown');
    }
}

export default StarwHostingEngine;
