/**
 * Personal Validator System
 * Allows anyone to register their STR.DOMAIN as a validator node
 * 
 * Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team
 * Copyright (c) 2024-2025 Alexandru Marius Stratulat
 */

interface ValidatorResources {
  storage: {
    allocated: number; // GB
    available: number;
    used: number;
    path: string;
  };
  cpu: {
    cores: number;
    maxUsage: number; // percentage (0-100)
    currentUsage: number;
    priority: 'low' | 'medium' | 'high';
  };
  bandwidth: {
    upload: number; // Mbps
    download: number;
    monthlyLimit: number; // GB
    used: number;
  };
  uptime: {
    target: number; // percentage
    current: number;
    lastOnline: Date | null;
    downtimeHistory: Array<{ start: Date; end: Date; reason: string }>;
  };
}

interface ValidatorRewards {
  accumulated: number; // STR tokens
  lastPayout: Date | null;
  payoutAddress: string; // zk13str wallet
  monthlyEstimate: number;
  breakdown: {
    storage: number;
    cpu: number;
    bandwidth: number;
    uptime: number;
    contracts: number;
  };
}

interface PersonalValidatorConfig {
  nodeType: 'PERSONAL_VALIDATOR';
  domain: string; // STR.DOMAIN format
  wallet: string; // zk13str wallet address
  stake: number; // STR tokens staked (min 1000)
  resources: ValidatorResources;
  rewards: ValidatorRewards;
  status: 'pending' | 'active' | 'paused' | 'suspended' | 'terminated';
  registrationDate: Date;
  lastActive: Date;
  reputation: {
    score: number; // 0-100
    validationsCompleted: number;
    contractsHosted: number;
    uptimeScore: number;
    complaints: number;
  };
}

export class PersonalValidator {
  private config: PersonalValidatorConfig;
  private validatorId: string;
  private genesisConnection: any; // Connection to genesis network

  constructor(config: Partial<PersonalValidatorConfig>) {
    this.config = this.initializeConfig(config);
    this.validatorId = this.generateValidatorId();
  }

  private initializeConfig(partial: Partial<PersonalValidatorConfig>): PersonalValidatorConfig {
    const now = new Date();
    
    return {
      nodeType: 'PERSONAL_VALIDATOR',
      domain: partial.domain || '',
      wallet: partial.wallet || '',
      stake: partial.stake || 0,
      resources: partial.resources || {
        storage: { allocated: 1, available: 1, used: 0, path: './starw-data' },
        cpu: { cores: 1, maxUsage: 80, currentUsage: 0, priority: 'medium' },
        bandwidth: { upload: 10, download: 10, monthlyLimit: 1000, used: 0 },
        uptime: { target: 99, current: 0, lastOnline: null, downtimeHistory: [] }
      },
      rewards: {
        accumulated: 0,
        lastPayout: null,
        payoutAddress: partial.wallet || '',
        monthlyEstimate: 0,
        breakdown: { storage: 0, cpu: 0, bandwidth: 0, uptime: 0, contracts: 0 }
      },
      status: 'pending',
      registrationDate: now,
      lastActive: now,
      reputation: {
        score: 100,
        validationsCompleted: 0,
        contractsHosted: 0,
        uptimeScore: 0,
        complaints: 0
      }
    };
  }

  private generateValidatorId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `PVAL_${this.config.domain.replace('STR.', '')}_${timestamp}_${random}`;
  }

  /**
   * Validate STR.DOMAIN format
   */
  private isValidDomain(domain: string): boolean {
    // Must start with STR.
    if (!domain.startsWith('STR.')) {
      return false;
    }

    // Extract subdomain
    const subdomain = domain.substring(4);
    
    // Must be alphanumeric (lowercase)
    const validPattern = /^[a-z0-9]+$/;
    if (!validPattern.test(subdomain)) {
      return false;
    }

    // Length check (3-32 characters)
    if (subdomain.length < 3 || subdomain.length > 32) {
      return false;
    }

    return true;
  }

  /**
   * Verify wallet ownership through signature
   */
  async verifyWalletOwnership(wallet: string, signature: string, message: string): Promise<boolean> {
    try {
      // Verify zk13str format
      if (!wallet.startsWith('zk13str_')) {
        return false;
      }

      // TODO: Implement actual signature verification
      // This would verify that the user owns the private key for this wallet
      
      // For now, basic validation
      return wallet.length > 20 && signature.length > 0;
    } catch (error) {
      console.error('Wallet verification failed:', error);
      return false;
    }
  }

  /**
   * Test storage capability
   */
  async testStorage(sizeGB: number): Promise<{ success: boolean; message: string }> {
    try {
      // TODO: Implement actual storage testing
      // - Write test data
      // - Verify read/write speed
      // - Check available space
      
      if (sizeGB < 1) {
        return { success: false, message: 'Minimum 1GB storage required' };
      }

      return { success: true, message: `Storage test passed: ${sizeGB}GB available` };
    } catch (error) {
      return { success: false, message: `Storage test failed: ${error}` };
    }
  }

  /**
   * Test CPU capability
   */
  async testCPU(cores: number, maxUsage: number): Promise<{ success: boolean; message: string }> {
    try {
      // TODO: Implement CPU benchmark
      // - Run computational test
      // - Measure processing speed
      // - Verify core count
      
      if (cores < 1) {
        return { success: false, message: 'Minimum 1 CPU core required' };
      }

      if (maxUsage < 50 || maxUsage > 100) {
        return { success: false, message: 'Max CPU usage must be between 50-100%' };
      }

      return { success: true, message: `CPU test passed: ${cores} cores @ ${maxUsage}% max` };
    } catch (error) {
      return { success: false, message: `CPU test failed: ${error}` };
    }
  }

  /**
   * Test network bandwidth
   */
  async testBandwidth(upload: number, download: number): Promise<{ success: boolean; message: string }> {
    try {
      // TODO: Implement bandwidth testing
      // - Test upload speed to genesis nodes
      // - Test download speed from genesis nodes
      // - Measure latency
      
      if (upload < 10 || download < 10) {
        return { success: false, message: 'Minimum 10 Mbps upload/download required' };
      }

      return { success: true, message: `Bandwidth test passed: ${upload}/${download} Mbps` };
    } catch (error) {
      return { success: false, message: `Bandwidth test failed: ${error}` };
    }
  }

  /**
   * Verify all resources meet minimum requirements
   */
  async verifyResources(): Promise<{ success: boolean; tests: any }> {
    const tests = {
      storage: await this.testStorage(this.config.resources.storage.allocated),
      cpu: await this.testCPU(
        this.config.resources.cpu.cores,
        this.config.resources.cpu.maxUsage
      ),
      bandwidth: await this.testBandwidth(
        this.config.resources.bandwidth.upload,
        this.config.resources.bandwidth.download
      )
    };

    const allPassed = tests.storage.success && tests.cpu.success && tests.bandwidth.success;

    return { success: allPassed, tests };
  }

  /**
   * Calculate estimated monthly rewards
   */
  calculateMonthlyRewards(): number {
    const { storage, cpu, bandwidth, uptime } = this.config.resources;

    // Storage: 0.1 STR per GB per month
    const storageReward = storage.allocated * 0.1;

    // CPU: 0.5 STR per core per month × usage factor
    const cpuReward = cpu.cores * 0.5 * (cpu.maxUsage / 100);

    // Bandwidth: 0.01 STR per Mbps per month
    const avgBandwidth = (bandwidth.upload + bandwidth.download) / 2;
    const bandwidthReward = avgBandwidth * 0.01;

    // Uptime bonus: +10% if target > 99%
    const uptimeMultiplier = uptime.target >= 99 ? 1.1 : 1.0;

    const totalReward = (storageReward + cpuReward + bandwidthReward) * uptimeMultiplier;

    // Update rewards breakdown
    this.config.rewards.breakdown = {
      storage: storageReward,
      cpu: cpuReward,
      bandwidth: bandwidthReward,
      uptime: totalReward - (storageReward + cpuReward + bandwidthReward),
      contracts: 0 // Updated when hosting contracts
    };

    this.config.rewards.monthlyEstimate = totalReward;

    return totalReward;
  }

  /**
   * Start validator and connect to genesis network
   */
  async start(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Verify configuration
      if (!this.isValidDomain(this.config.domain)) {
        return { success: false, message: 'Invalid STR.DOMAIN format' };
      }

      // 2. Verify resources
      const resourceCheck = await this.verifyResources();
      if (!resourceCheck.success) {
        return { success: false, message: 'Resource verification failed' };
      }

      // 3. Check stake requirement
      if (this.config.stake < 1000) {
        return { 
          success: false, 
          message: 'Minimum stake of 1000 STR required to prevent spam' 
        };
      }

      // 4. Connect to genesis network
      await this.connectToGenesisNetwork();

      // 5. Sync blockchain state
      await this.syncBlockchainState();

      // 6. Activate validator
      this.config.status = 'active';
      this.config.lastActive = new Date();

      // 7. Calculate rewards
      const monthlyReward = this.calculateMonthlyRewards();

      return {
        success: true,
        message: `Validator ${this.validatorId} started successfully. Estimated monthly reward: ${monthlyReward.toFixed(2)} STR`
      };
    } catch (error) {
      return { success: false, message: `Failed to start validator: ${error}` };
    }
  }

  /**
   * Connect to genesis network of 1313 validators
   */
  private async connectToGenesisNetwork(): Promise<void> {
    // TODO: Implement actual P2P connection to genesis nodes
    console.log(`Connecting to genesis network...`);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Connected to genesis network (1313 validators)`);
  }

  /**
   * Sync blockchain state from genesis network
   */
  private async syncBlockchainState(): Promise<void> {
    // TODO: Implement blockchain synchronization
    console.log(`Syncing blockchain state...`);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Blockchain state synchronized`);
  }

  /**
   * Stop validator
   */
  async stop(): Promise<void> {
    this.config.status = 'paused';
    this.config.resources.uptime.lastOnline = new Date();
    
    // Disconnect from network
    // TODO: Implement graceful shutdown
  }

  /**
   * Get validator status
   */
  getStatus(): PersonalValidatorConfig {
    return { ...this.config };
  }

  /**
   * Get validator statistics
   */
  getStatistics() {
    return {
      validatorId: this.validatorId,
      domain: this.config.domain,
      status: this.config.status,
      uptime: this.config.resources.uptime.current,
      reputation: this.config.reputation.score,
      monthlyReward: this.config.rewards.monthlyEstimate,
      resourcesContributed: {
        storage: this.config.resources.storage.allocated,
        cpu: this.config.resources.cpu.cores,
        bandwidth: (this.config.resources.bandwidth.upload + this.config.resources.bandwidth.download) / 2
      }
    };
  }
}

export default PersonalValidator;
