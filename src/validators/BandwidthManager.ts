/**
 * BandwidthManager.ts
 * ===================
 * 
 * Manages bandwidth contributions from validators.
 * 
 * Features:
 * - Bandwidth speed testing and verification
 * - Upload/download tracking
 * - Monthly bandwidth cap enforcement
 * - Network latency monitoring
 * - Geographic location tracking for optimal routing
 * 
 * Reward Rate: 0.01 STR per Mbps per month (average speed)
 * 
 * Example: 100 Mbps avg = 1 STR/month = ~12 STR/year
 */

import * as crypto from 'crypto';

interface BandwidthAllocation {
  validatorId: string;
  domain: string;
  uploadMbps: number; // upload speed in Mbps
  downloadMbps: number; // download speed in Mbps
  monthlyCap: number | null; // GB per month (null = unlimited)
  location: {
    country?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
  };
  allocatedAt: Date;
  lastSpeedTest: Date;
}

interface BandwidthTransfer {
  transferId: string;
  validatorId: string;
  transferType: 'upload' | 'download';
  dataSize: number; // bytes
  duration: number; // milliseconds
  speedMbps: number; // calculated speed
  timestamp: Date;
  purpose: 'file-storage' | 'file-retrieval' | 'blockchain-sync' | 'smart-contract' | 'p2p-relay';
}

interface BandwidthUsageRecord {
  validatorId: string;
  period: {
    start: Date;
    end: Date;
  };
  uploadedGB: number;
  downloadedGB: number;
  totalGB: number;
  averageUploadMbps: number;
  averageDownloadMbps: number;
  transferCount: number;
}

interface BandwidthMetrics {
  validatorId: string;
  period: {
    start: Date;
    end: Date;
  };
  uploadMbps: number;
  downloadMbps: number;
  averageSpeedMbps: number;
  totalDataTransferredGB: number;
  transferCount: number;
  rewardEarned: number; // STR
}

interface NetworkLatency {
  validatorId: string;
  targetValidatorId: string;
  latencyMs: number;
  timestamp: Date;
}

export class BandwidthManager {
  private allocations: Map<string, BandwidthAllocation> = new Map();
  private transfers: BandwidthTransfer[] = [];
  private latencyRecords: NetworkLatency[] = [];
  private readonly REWARD_RATE_PER_MBPS = 0.01; // STR per Mbps per month

  constructor() {
    console.log('🌐 BandwidthManager initialized');
    this.startSpeedTesting();
  }

  /**
   * Register a validator's bandwidth contribution
   */
  async registerBandwidth(
    validatorId: string,
    domain: string,
    monthlyCap: number | null = null,
    location?: BandwidthAllocation['location']
  ): Promise<BandwidthAllocation> {
    console.log(`📡 Registering bandwidth for ${domain}...`);

    // Perform initial speed test
    const speedTest = await this.performSpeedTest(validatorId);

    const allocation: BandwidthAllocation = {
      validatorId,
      domain,
      uploadMbps: speedTest.uploadMbps,
      downloadMbps: speedTest.downloadMbps,
      monthlyCap,
      location: location || {},
      allocatedAt: new Date(),
      lastSpeedTest: new Date()
    };

    this.allocations.set(validatorId, allocation);

    console.log(`✅ Bandwidth registered:`);
    console.log(`   ⬆️  Upload: ${speedTest.uploadMbps.toFixed(2)} Mbps`);
    console.log(`   ⬇️  Download: ${speedTest.downloadMbps.toFixed(2)} Mbps`);
    console.log(`   📊 Monthly cap: ${monthlyCap ? `${monthlyCap} GB` : 'Unlimited'}`);
    console.log(`   💰 Potential earnings: ${this.calculateMonthlyReward(speedTest.uploadMbps, speedTest.downloadMbps)} STR/month`);

    return allocation;
  }

  /**
   * Perform bandwidth speed test
   */
  private async performSpeedTest(validatorId: string): Promise<{
    uploadMbps: number;
    downloadMbps: number;
  }> {
    console.log(`🔬 Running speed test for validator ${validatorId}...`);

    // Upload test: Send 1MB of data and measure time
    const uploadData = Buffer.alloc(1024 * 1024); // 1 MB
    const uploadStartTime = Date.now();
    
    // Simulate upload (in production, this would send to a test server)
    await this.simulateNetworkTransfer(uploadData.length);
    
    const uploadEndTime = Date.now();
    const uploadDurationMs = uploadEndTime - uploadStartTime;
    const uploadMbps = (uploadData.length * 8) / (uploadDurationMs * 1000); // bits per second / 1000 = Mbps

    // Download test: Receive 1MB of data and measure time
    const downloadStartTime = Date.now();
    
    // Simulate download
    await this.simulateNetworkTransfer(1024 * 1024);
    
    const downloadEndTime = Date.now();
    const downloadDurationMs = downloadEndTime - downloadStartTime;
    const downloadMbps = (1024 * 1024 * 8) / (downloadDurationMs * 1000);

    console.log(`✅ Speed test complete:`);
    console.log(`   ⬆️  Upload: ${uploadMbps.toFixed(2)} Mbps`);
    console.log(`   ⬇️  Download: ${downloadMbps.toFixed(2)} Mbps`);

    return { uploadMbps, downloadMbps };
  }

  /**
   * Simulate network transfer (replace with actual transfer in production)
   */
  private async simulateNetworkTransfer(bytes: number): Promise<void> {
    // Simulate transfer time based on typical network speeds (50-200 Mbps)
    const simulatedMbps = 100 + Math.random() * 100; // 100-200 Mbps
    const durationMs = (bytes * 8) / (simulatedMbps * 1000);
    
    return new Promise(resolve => setTimeout(resolve, durationMs));
  }

  /**
   * Record a bandwidth transfer
   */
  recordTransfer(
    validatorId: string,
    transferType: 'upload' | 'download',
    dataSize: number,
    duration: number,
    purpose: BandwidthTransfer['purpose']
  ): BandwidthTransfer {
    const allocation = this.allocations.get(validatorId);
    if (!allocation) {
      throw new Error(`Validator ${validatorId} not found`);
    }

    // Check monthly cap
    if (allocation.monthlyCap) {
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const monthlyUsage = this.getUsageForPeriod(validatorId, monthStart, monthEnd);
      const newTotalGB = monthlyUsage.totalGB + (dataSize / (1024 ** 3));

      if (newTotalGB > allocation.monthlyCap) {
        throw new Error(`Monthly bandwidth cap exceeded (${allocation.monthlyCap} GB)`);
      }
    }

    const speedMbps = (dataSize * 8) / (duration * 1000); // bits per second / 1000 = Mbps

    const transfer: BandwidthTransfer = {
      transferId: crypto.randomUUID(),
      validatorId,
      transferType,
      dataSize,
      duration,
      speedMbps,
      timestamp: new Date(),
      purpose
    };

    this.transfers.push(transfer);

    return transfer;
  }

  /**
   * Get bandwidth usage for a specific period
   */
  private getUsageForPeriod(
    validatorId: string,
    startDate: Date,
    endDate: Date
  ): BandwidthUsageRecord {
    const periodTransfers = this.transfers.filter(
      transfer =>
        transfer.validatorId === validatorId &&
        transfer.timestamp >= startDate &&
        transfer.timestamp <= endDate
    );

    const uploadTransfers = periodTransfers.filter(t => t.transferType === 'upload');
    const downloadTransfers = periodTransfers.filter(t => t.transferType === 'download');

    const uploadedGB = uploadTransfers.reduce((sum, t) => sum + t.dataSize, 0) / (1024 ** 3);
    const downloadedGB = downloadTransfers.reduce((sum, t) => sum + t.dataSize, 0) / (1024 ** 3);

    const averageUploadMbps =
      uploadTransfers.length > 0
        ? uploadTransfers.reduce((sum, t) => sum + t.speedMbps, 0) / uploadTransfers.length
        : 0;

    const averageDownloadMbps =
      downloadTransfers.length > 0
        ? downloadTransfers.reduce((sum, t) => sum + t.speedMbps, 0) / downloadTransfers.length
        : 0;

    return {
      validatorId,
      period: { start: startDate, end: endDate },
      uploadedGB,
      downloadedGB,
      totalGB: uploadedGB + downloadedGB,
      averageUploadMbps,
      averageDownloadMbps,
      transferCount: periodTransfers.length
    };
  }

  /**
   * Calculate bandwidth rewards for a validator
   */
  calculateBandwidthReward(validatorId: string, period: { start: Date; end: Date }): BandwidthMetrics {
    const allocation = this.allocations.get(validatorId);
    if (!allocation) {
      throw new Error(`Validator ${validatorId} not found`);
    }

    const usage = this.getUsageForPeriod(validatorId, period.start, period.end);

    // Average of upload and download speed
    const averageSpeedMbps = (allocation.uploadMbps + allocation.downloadMbps) / 2;

    // Calculate reward based on average speed
    const daysInPeriod = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24);
    const monthsInPeriod = daysInPeriod / 30;

    const rewardEarned = averageSpeedMbps * this.REWARD_RATE_PER_MBPS * monthsInPeriod;

    return {
      validatorId,
      period,
      uploadMbps: allocation.uploadMbps,
      downloadMbps: allocation.downloadMbps,
      averageSpeedMbps,
      totalDataTransferredGB: usage.totalGB,
      transferCount: usage.transferCount,
      rewardEarned
    };
  }

  /**
   * Calculate monthly reward for bandwidth allocation
   */
  private calculateMonthlyReward(uploadMbps: number, downloadMbps: number): number {
    const averageSpeedMbps = (uploadMbps + downloadMbps) / 2;
    return averageSpeedMbps * this.REWARD_RATE_PER_MBPS;
  }

  /**
   * Measure latency between two validators
   */
  async measureLatency(fromValidatorId: string, toValidatorId: string): Promise<number> {
    const startTime = Date.now();

    // Simulate ping (in production, this would be an actual network ping)
    await this.simulateNetworkTransfer(64); // 64 bytes = typical ping packet

    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    // Record latency
    this.latencyRecords.push({
      validatorId: fromValidatorId,
      targetValidatorId: toValidatorId,
      latencyMs,
      timestamp: new Date()
    });

    return latencyMs;
  }

  /**
   * Get average latency to a validator
   */
  getAverageLatency(validatorId: string): number {
    const recentRecords = this.latencyRecords
      .filter(record => record.validatorId === validatorId || record.targetValidatorId === validatorId)
      .slice(-20); // last 20 measurements

    if (recentRecords.length === 0) {
      return 0;
    }

    return recentRecords.reduce((sum, r) => sum + r.latencyMs, 0) / recentRecords.length;
  }

  /**
   * Find validators with lowest latency to a target location
   */
  findNearestValidators(
    targetLocation: { latitude: number; longitude: number },
    count: number = 3
  ): string[] {
    const validatorsWithLocation = Array.from(this.allocations.entries())
      .filter(([_, allocation]) => allocation.location.latitude && allocation.location.longitude)
      .map(([validatorId, allocation]) => ({
        validatorId,
        distance: this.calculateDistance(
          targetLocation.latitude,
          targetLocation.longitude,
          allocation.location.latitude!,
          allocation.location.longitude!
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);

    return validatorsWithLocation.map(v => v.validatorId);
  }

  /**
   * Calculate geographic distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Start periodic speed testing (runs every 24 hours)
   */
  private startSpeedTesting(): void {
    setInterval(async () => {
      await this.runPeriodicSpeedTests();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Run speed tests for all validators
   */
  private async runPeriodicSpeedTests(): Promise<void> {
    console.log('🔄 Running periodic speed tests...');

    for (const [validatorId, allocation] of this.allocations.entries()) {
      try {
        const speedTest = await this.performSpeedTest(validatorId);
        
        // Update allocation with new speeds
        allocation.uploadMbps = speedTest.uploadMbps;
        allocation.downloadMbps = speedTest.downloadMbps;
        allocation.lastSpeedTest = new Date();

        console.log(`✅ Updated speeds for ${allocation.domain}`);
      } catch (error: any) {
        console.error(`⚠️ Speed test failed for ${allocation.domain}: ${error.message}`);
      }
    }

    console.log('✅ Periodic speed tests complete');
  }

  /**
   * Get bandwidth allocation for a validator
   */
  getBandwidthAllocation(validatorId: string): BandwidthAllocation | undefined {
    return this.allocations.get(validatorId);
  }

  /**
   * Get all bandwidth allocations
   */
  getAllAllocations(): BandwidthAllocation[] {
    return Array.from(this.allocations.values());
  }

  /**
   * Get network-wide bandwidth statistics
   */
  getNetworkBandwidthStats(): {
    totalValidators: number;
    totalUploadMbps: number;
    totalDownloadMbps: number;
    averageUploadMbps: number;
    averageDownloadMbps: number;
    totalDataTransferredGB: number;
    averageLatencyMs: number;
  } {
    const allocations = this.getAllAllocations();

    const totalUploadMbps = allocations.reduce((sum, a) => sum + a.uploadMbps, 0);
    const totalDownloadMbps = allocations.reduce((sum, a) => sum + a.downloadMbps, 0);

    const averageUploadMbps = allocations.length > 0 ? totalUploadMbps / allocations.length : 0;
    const averageDownloadMbps = allocations.length > 0 ? totalDownloadMbps / allocations.length : 0;

    const totalDataTransferredGB =
      this.transfers.reduce((sum, t) => sum + t.dataSize, 0) / (1024 ** 3);

    const averageLatencyMs =
      this.latencyRecords.length > 0
        ? this.latencyRecords.reduce((sum, r) => sum + r.latencyMs, 0) / this.latencyRecords.length
        : 0;

    return {
      totalValidators: allocations.length,
      totalUploadMbps,
      totalDownloadMbps,
      averageUploadMbps,
      averageDownloadMbps,
      totalDataTransferredGB,
      averageLatencyMs
    };
  }

  /**
   * Get validators by country
   */
  getValidatorsByCountry(country: string): string[] {
    return Array.from(this.allocations.entries())
      .filter(([_, allocation]) => allocation.location.country === country)
      .map(([validatorId, _]) => validatorId);
  }
}

// Singleton instance
export const bandwidthManager = new BandwidthManager();
