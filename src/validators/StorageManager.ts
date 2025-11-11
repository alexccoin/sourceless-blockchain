/**
 * StorageManager.ts
 * ==================
 * 
 * Manages distributed storage contributions from validators.
 * 
 * Features:
 * - Storage path allocation and testing
 * - Data replication across 3 validators
 * - Usage tracking for rewards
 * - Storage limits enforcement
 * - Automatic cleanup of expired data
 * 
 * Reward Rate: 0.1 STR per GB per month
 * 
 * Example: 100GB storage = 10 STR/month = ~120 STR/year
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

interface StorageAllocation {
  validatorId: string;
  domain: string;
  totalGB: number;
  usedGB: number;
  availableGB: number;
  storagePath: string;
  allocatedAt: Date;
  lastVerified: Date;
}

interface StoredFile {
  fileId: string;
  fileName: string;
  fileSize: number; // bytes
  fileHash: string; // SHA-256
  uploadedBy: string; // wallet address
  uploadedAt: Date;
  expiresAt: Date | null;
  replicas: string[]; // validator IDs hosting this file
  metadata: Record<string, any>;
}

interface ReplicationConfig {
  replicaCount: number; // default: 3
  minValidatorUptime: number; // minimum uptime % required (default: 99%)
  geographicDistribution: boolean; // spread replicas across regions
}

interface StorageMetrics {
  validatorId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalGB: number;
  usedGB: number;
  filesStored: number;
  dataTransferredMB: number; // upload + download
  rewardEarned: number; // STR
}

export class StorageManager {
  private allocations: Map<string, StorageAllocation> = new Map();
  private storedFiles: Map<string, StoredFile> = new Map();
  private replicationConfig: ReplicationConfig = {
    replicaCount: 3,
    minValidatorUptime: 99.0,
    geographicDistribution: true
  };
  private readonly REWARD_RATE_PER_GB = 0.1; // STR per GB per month

  constructor() {
    console.log('💾 StorageManager initialized');
  }

  /**
   * Register a validator's storage contribution
   */
  async registerStorage(
    validatorId: string,
    domain: string,
    storageGB: number,
    storagePath: string
  ): Promise<StorageAllocation> {
    console.log(`📁 Registering ${storageGB}GB storage for ${domain}...`);

    // Verify storage path exists and is writable
    await this.verifyStoragePath(storagePath, storageGB);

    const allocation: StorageAllocation = {
      validatorId,
      domain,
      totalGB: storageGB,
      usedGB: 0,
      availableGB: storageGB,
      storagePath,
      allocatedAt: new Date(),
      lastVerified: new Date()
    };

    this.allocations.set(validatorId, allocation);

    console.log(`✅ Storage registered: ${storageGB}GB at ${storagePath}`);
    console.log(`   💰 Potential earnings: ${this.calculateMonthlyReward(storageGB)} STR/month`);

    return allocation;
  }

  /**
   * Verify storage path is valid and has sufficient space
   */
  private async verifyStoragePath(storagePath: string, requiredGB: number): Promise<void> {
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(storagePath, { recursive: true });

      // Test write permissions
      const testFile = path.join(storagePath, '.storage_test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);

      // TODO: Check actual disk space (requires platform-specific code)
      // For now, we trust the validator's declaration

      console.log(`✅ Storage path verified: ${storagePath}`);
    } catch (error: any) {
      throw new Error(`Storage path verification failed: ${error.message}`);
    }
  }

  /**
   * Store a file with 3-replica redundancy
   */
  async storeFile(
    fileName: string,
    fileData: Buffer,
    uploadedBy: string,
    expiresAt: Date | null = null,
    metadata: Record<string, any> = {}
  ): Promise<StoredFile> {
    const fileSize = fileData.length;
    const fileSizeGB = fileSize / (1024 ** 3);

    console.log(`📤 Storing file: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    // Generate file ID and hash
    const fileId = crypto.randomUUID();
    const fileHash = crypto.createHash('sha256').update(fileData).digest('hex');

    // Select validators for replication
    const selectedValidators = await this.selectReplicationValidators(fileSizeGB);

    if (selectedValidators.length < this.replicationConfig.replicaCount) {
      throw new Error(`Insufficient validators available for ${this.replicationConfig.replicaCount}-replica storage`);
    }

    // Store file on selected validators
    const replicas: string[] = [];
    for (const validatorId of selectedValidators) {
      try {
        await this.storeFileOnValidator(validatorId, fileId, fileName, fileData);
        replicas.push(validatorId);
      } catch (error: any) {
        console.error(`⚠️ Failed to store on validator ${validatorId}: ${error.message}`);
      }
    }

    if (replicas.length < this.replicationConfig.replicaCount) {
      // Rollback partial storage
      for (const validatorId of replicas) {
        await this.deleteFileFromValidator(validatorId, fileId).catch(() => {});
      }
      throw new Error(`Failed to achieve ${this.replicationConfig.replicaCount}-replica redundancy`);
    }

    // Create stored file record
    const storedFile: StoredFile = {
      fileId,
      fileName,
      fileSize,
      fileHash,
      uploadedBy,
      uploadedAt: new Date(),
      expiresAt,
      replicas,
      metadata
    };

    this.storedFiles.set(fileId, storedFile);

    console.log(`✅ File stored with ${replicas.length} replicas`);
    console.log(`   📍 Replicas on: ${replicas.join(', ')}`);

    return storedFile;
  }

  /**
   * Select validators for file replication
   */
  private async selectReplicationValidators(fileSizeGB: number): Promise<string[]> {
    const eligibleValidators = Array.from(this.allocations.entries())
      .filter(([_, allocation]) => allocation.availableGB >= fileSizeGB)
      .map(([validatorId, _]) => validatorId);

    if (eligibleValidators.length < this.replicationConfig.replicaCount) {
      throw new Error(`Only ${eligibleValidators.length} validators have sufficient space`);
    }

    // TODO: Implement intelligent selection based on:
    // - Geographic distribution
    // - Validator uptime
    // - Validator reputation
    // - Network latency

    // For now, randomly select validators
    const shuffled = eligibleValidators.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, this.replicationConfig.replicaCount);
  }

  /**
   * Store file on a specific validator
   */
  private async storeFileOnValidator(
    validatorId: string,
    fileId: string,
    fileName: string,
    fileData: Buffer
  ): Promise<void> {
    const allocation = this.allocations.get(validatorId);
    if (!allocation) {
      throw new Error(`Validator ${validatorId} not found`);
    }

    const filePath = path.join(allocation.storagePath, fileId);
    await fs.writeFile(filePath, fileData);

    // Update storage usage
    const fileSizeGB = fileData.length / (1024 ** 3);
    allocation.usedGB += fileSizeGB;
    allocation.availableGB = allocation.totalGB - allocation.usedGB;

    console.log(`   ✅ Stored on ${allocation.domain}: ${filePath}`);
  }

  /**
   * Retrieve a file (from any replica)
   */
  async retrieveFile(fileId: string): Promise<Buffer> {
    const storedFile = this.storedFiles.get(fileId);
    if (!storedFile) {
      throw new Error(`File ${fileId} not found`);
    }

    // Check if file has expired
    if (storedFile.expiresAt && storedFile.expiresAt < new Date()) {
      throw new Error(`File ${fileId} has expired`);
    }

    // Try each replica until successful
    for (const validatorId of storedFile.replicas) {
      try {
        const fileData = await this.retrieveFileFromValidator(validatorId, fileId);
        
        // Verify file integrity
        const fileHash = crypto.createHash('sha256').update(fileData).digest('hex');
        if (fileHash !== storedFile.fileHash) {
          console.error(`⚠️ Hash mismatch on validator ${validatorId}, trying next replica...`);
          continue;
        }

        console.log(`✅ File retrieved from ${validatorId}`);
        return fileData;
      } catch (error: any) {
        console.error(`⚠️ Failed to retrieve from validator ${validatorId}: ${error.message}`);
      }
    }

    throw new Error(`Failed to retrieve file ${fileId} from any replica`);
  }

  /**
   * Retrieve file from a specific validator
   */
  private async retrieveFileFromValidator(validatorId: string, fileId: string): Promise<Buffer> {
    const allocation = this.allocations.get(validatorId);
    if (!allocation) {
      throw new Error(`Validator ${validatorId} not found`);
    }

    const filePath = path.join(allocation.storagePath, fileId);
    return await fs.readFile(filePath);
  }

  /**
   * Delete a file from all replicas
   */
  async deleteFile(fileId: string): Promise<void> {
    const storedFile = this.storedFiles.get(fileId);
    if (!storedFile) {
      throw new Error(`File ${fileId} not found`);
    }

    console.log(`🗑️ Deleting file ${fileId} from all replicas...`);

    for (const validatorId of storedFile.replicas) {
      try {
        await this.deleteFileFromValidator(validatorId, fileId);
      } catch (error: any) {
        console.error(`⚠️ Failed to delete from validator ${validatorId}: ${error.message}`);
      }
    }

    this.storedFiles.delete(fileId);
    console.log(`✅ File ${fileId} deleted`);
  }

  /**
   * Delete file from a specific validator
   */
  private async deleteFileFromValidator(validatorId: string, fileId: string): Promise<void> {
    const allocation = this.allocations.get(validatorId);
    if (!allocation) {
      throw new Error(`Validator ${validatorId} not found`);
    }

    const filePath = path.join(allocation.storagePath, fileId);
    
    try {
      const stats = await fs.stat(filePath);
      const fileSizeGB = stats.size / (1024 ** 3);

      await fs.unlink(filePath);

      // Update storage usage
      allocation.usedGB -= fileSizeGB;
      allocation.availableGB = allocation.totalGB - allocation.usedGB;

      console.log(`   ✅ Deleted from ${allocation.domain}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    console.log('🧹 Cleaning up expired files...');

    for (const [fileId, storedFile] of this.storedFiles.entries()) {
      if (storedFile.expiresAt && storedFile.expiresAt < now) {
        try {
          await this.deleteFile(fileId);
          deletedCount++;
        } catch (error: any) {
          console.error(`⚠️ Failed to delete expired file ${fileId}: ${error.message}`);
        }
      }
    }

    console.log(`✅ Cleanup complete: ${deletedCount} files deleted`);
    return deletedCount;
  }

  /**
   * Calculate storage rewards for a validator
   */
  calculateStorageReward(validatorId: string, period: { start: Date; end: Date }): StorageMetrics {
    const allocation = this.allocations.get(validatorId);
    if (!allocation) {
      throw new Error(`Validator ${validatorId} not found`);
    }

    const daysInPeriod = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24);
    const monthsInPeriod = daysInPeriod / 30;

    // Count files stored by this validator
    const filesStored = Array.from(this.storedFiles.values())
      .filter(file => file.replicas.includes(validatorId))
      .length;

    // Calculate reward based on used storage (not total allocated)
    const rewardEarned = allocation.usedGB * this.REWARD_RATE_PER_GB * monthsInPeriod;

    const metrics: StorageMetrics = {
      validatorId,
      period,
      totalGB: allocation.totalGB,
      usedGB: allocation.usedGB,
      filesStored,
      dataTransferredMB: 0, // TODO: Track actual data transfer
      rewardEarned
    };

    return metrics;
  }

  /**
   * Calculate monthly reward for storage allocation
   */
  private calculateMonthlyReward(storageGB: number): number {
    return storageGB * this.REWARD_RATE_PER_GB;
  }

  /**
   * Get storage allocation for a validator
   */
  getStorageAllocation(validatorId: string): StorageAllocation | undefined {
    return this.allocations.get(validatorId);
  }

  /**
   * Get all storage allocations
   */
  getAllAllocations(): StorageAllocation[] {
    return Array.from(this.allocations.values());
  }

  /**
   * Get network-wide storage statistics
   */
  getNetworkStorageStats(): {
    totalValidators: number;
    totalStorageGB: number;
    usedStorageGB: number;
    availableStorageGB: number;
    totalFiles: number;
    averageUtilization: number;
  } {
    const allocations = this.getAllAllocations();

    const totalStorageGB = allocations.reduce((sum, a) => sum + a.totalGB, 0);
    const usedStorageGB = allocations.reduce((sum, a) => sum + a.usedGB, 0);
    const availableStorageGB = allocations.reduce((sum, a) => sum + a.availableGB, 0);

    return {
      totalValidators: allocations.length,
      totalStorageGB,
      usedStorageGB,
      availableStorageGB,
      totalFiles: this.storedFiles.size,
      averageUtilization: totalStorageGB > 0 ? (usedStorageGB / totalStorageGB) * 100 : 0
    };
  }

  /**
   * Verify storage integrity for a validator
   */
  async verifyValidatorStorage(validatorId: string): Promise<{
    verified: boolean;
    filesChecked: number;
    filesMissing: number;
    filesCorrupted: number;
  }> {
    const allocation = this.allocations.get(validatorId);
    if (!allocation) {
      throw new Error(`Validator ${validatorId} not found`);
    }

    console.log(`🔍 Verifying storage for ${allocation.domain}...`);

    const filesHostedByValidator = Array.from(this.storedFiles.values())
      .filter(file => file.replicas.includes(validatorId));

    let filesMissing = 0;
    let filesCorrupted = 0;

    for (const file of filesHostedByValidator) {
      try {
        const fileData = await this.retrieveFileFromValidator(validatorId, file.fileId);
        const fileHash = crypto.createHash('sha256').update(fileData).digest('hex');

        if (fileHash !== file.fileHash) {
          console.error(`⚠️ Corrupted file: ${file.fileId}`);
          filesCorrupted++;
        }
      } catch (error) {
        console.error(`⚠️ Missing file: ${file.fileId}`);
        filesMissing++;
      }
    }

    allocation.lastVerified = new Date();

    const verified = filesMissing === 0 && filesCorrupted === 0;

    console.log(`✅ Verification complete: ${filesHostedByValidator.length - filesMissing - filesCorrupted}/${filesHostedByValidator.length} files OK`);

    return {
      verified,
      filesChecked: filesHostedByValidator.length,
      filesMissing,
      filesCorrupted
    };
  }
}

// Singleton instance
export const storageManager = new StorageManager();
