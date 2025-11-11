/**
 * Validator Registry
 * Central registry for all personal validators in the network
 * 
 * Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team
 * Copyright (c) 2024-2025 Alexandru Marius Stratulat
 */

import { PersonalValidator } from './PersonalValidator';

interface RegistrationRequest {
  domain: string; // STR.DOMAIN
  wallet: string; // zk13str wallet
  signature: string; // Wallet signature proving ownership
  message: string; // Signed message for verification
  stake: number; // STR tokens to stake (min 1000)
  resources: {
    storage: number; // GB
    cpu: number; // cores
    bandwidth: { upload: number; download: number }; // Mbps
    uptime: number; // target uptime percentage
  };
}

interface RegistryEntry {
  validatorId: string;
  domain: string;
  wallet: string;
  status: 'pending' | 'active' | 'paused' | 'suspended' | 'terminated';
  registrationDate: Date;
  lastActive: Date;
  validator: PersonalValidator;
}

export class ValidatorRegistry {
  private validators: Map<string, RegistryEntry>;
  private domainIndex: Map<string, string>; // domain -> validatorId
  private walletIndex: Map<string, string[]>; // wallet -> validatorIds
  
  constructor() {
    this.validators = new Map();
    this.domainIndex = new Map();
    this.walletIndex = new Map();
  }

  /**
   * Register a new personal validator
   */
  async register(request: RegistrationRequest): Promise<{ 
    success: boolean; 
    validatorId?: string; 
    message: string;
    monthlyReward?: number;
  }> {
    try {
      // 1. Validate domain format
      if (!this.isValidDomain(request.domain)) {
        return {
          success: false,
          message: 'Invalid STR.DOMAIN format. Must be STR.NAME (3-32 alphanumeric characters)'
        };
      }

      // 2. Check if domain already registered
      if (this.domainIndex.has(request.domain)) {
        return {
          success: false,
          message: `Domain ${request.domain} is already registered as a validator`
        };
      }

      // 3. Verify domain ownership
      const domainOwnership = await this.verifyDomainOwnership(request.domain, request.wallet);
      if (!domainOwnership.success) {
        return {
          success: false,
          message: `Domain ownership verification failed: ${domainOwnership.message}`
        };
      }

      // 4. Verify wallet signature
      const walletVerification = await this.verifyWalletSignature(
        request.wallet,
        request.signature,
        request.message
      );
      if (!walletVerification.success) {
        return {
          success: false,
          message: `Wallet verification failed: ${walletVerification.message}`
        };
      }

      // 5. Validate minimum stake
      if (request.stake < 1000) {
        return {
          success: false,
          message: 'Minimum stake of 1000 STR required to prevent spam attacks'
        };
      }

      // 6. Verify wallet has sufficient balance
      const hasBalance = await this.checkWalletBalance(request.wallet, request.stake);
      if (!hasBalance) {
        return {
          success: false,
          message: `Insufficient balance. Need ${request.stake} STR in wallet ${request.wallet}`
        };
      }

      // 7. Validate resources meet minimum requirements
      const resourceValidation = this.validateResources(request.resources);
      if (!resourceValidation.success) {
        return {
          success: false,
          message: `Resource validation failed: ${resourceValidation.message}`
        };
      }

      // 8. Lock stake
      await this.lockStake(request.wallet, request.stake);

      // 9. Create validator instance
      const validator = new PersonalValidator({
        domain: request.domain,
        wallet: request.wallet,
        stake: request.stake,
        resources: {
          storage: {
            allocated: request.resources.storage,
            available: request.resources.storage,
            used: 0,
            path: `./starw-data/${request.domain}`
          },
          cpu: {
            cores: request.resources.cpu,
            maxUsage: 80,
            currentUsage: 0,
            priority: 'medium'
          },
          bandwidth: {
            upload: request.resources.bandwidth.upload,
            download: request.resources.bandwidth.download,
            monthlyLimit: 1000,
            used: 0
          },
          uptime: {
            target: request.resources.uptime,
            current: 0,
            lastOnline: null,
            downtimeHistory: []
          }
        }
      });

      // 10. Start validator
      const startResult = await validator.start();
      if (!startResult.success) {
        // Unlock stake if start failed
        await this.unlockStake(request.wallet, request.stake);
        
        return {
          success: false,
          message: `Failed to start validator: ${startResult.message}`
        };
      }

      // 11. Add to registry
      const validatorStatus = validator.getStatus();
      const validatorId = `PVAL_${request.domain.replace('STR.', '')}_${Date.now()}`;
      
      const entry: RegistryEntry = {
        validatorId,
        domain: request.domain,
        wallet: request.wallet,
        status: 'active',
        registrationDate: new Date(),
        lastActive: new Date(),
        validator
      };

      this.validators.set(validatorId, entry);
      this.domainIndex.set(request.domain, validatorId);
      
      // Update wallet index
      const walletValidators = this.walletIndex.get(request.wallet) || [];
      walletValidators.push(validatorId);
      this.walletIndex.set(request.wallet, walletValidators);

      // 12. Notify genesis network
      await this.notifyGenesisNetwork(validatorId, request.domain);

      // 13. Calculate monthly reward
      const monthlyReward = validator.calculateMonthlyRewards();

      return {
        success: true,
        validatorId,
        message: `Validator ${validatorId} registered successfully! Domain: ${request.domain}`,
        monthlyReward
      };
    } catch (error) {
      return {
        success: false,
        message: `Registration failed: ${error}`
      };
    }
  }

  /**
   * Validate STR.DOMAIN format
   */
  private isValidDomain(domain: string): boolean {
    if (!domain.startsWith('STR.')) return false;
    
    const subdomain = domain.substring(4);
    const validPattern = /^[a-z0-9]+$/;
    
    return validPattern.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 32;
  }

  /**
   * Verify that the wallet owns the STR.DOMAIN
   */
  private async verifyDomainOwnership(domain: string, wallet: string): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      // TODO: Implement actual domain registry lookup
      // Query domain registry to verify wallet owns this domain
      
      // For now, basic validation
      console.log(`Verifying ${wallet} owns ${domain}...`);
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, message: 'Domain ownership verified' };
    } catch (error) {
      return { success: false, message: `${error}` };
    }
  }

  /**
   * Verify wallet signature
   */
  private async verifyWalletSignature(
    wallet: string,
    signature: string,
    message: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify zk13str format
      if (!wallet.startsWith('zk13str_')) {
        return { success: false, message: 'Invalid wallet format (must be zk13str_)' };
      }

      // TODO: Implement actual cryptographic signature verification
      // Use ZK13STR protocol to verify signature
      
      console.log(`Verifying signature for wallet ${wallet}...`);
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (signature.length < 64) {
        return { success: false, message: 'Invalid signature length' };
      }
      
      return { success: true, message: 'Signature verified' };
    } catch (error) {
      return { success: false, message: `${error}` };
    }
  }

  /**
   * Check if wallet has sufficient balance
   */
  private async checkWalletBalance(wallet: string, requiredAmount: number): Promise<boolean> {
    try {
      // TODO: Query blockchain for wallet balance
      console.log(`Checking balance for ${wallet}...`);
      
      // Simulate balance check
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // For now, assume wallet has balance
      return true;
    } catch (error) {
      console.error('Balance check failed:', error);
      return false;
    }
  }

  /**
   * Validate resources meet minimum requirements
   */
  private validateResources(resources: RegistrationRequest['resources']): { 
    success: boolean; 
    message: string 
  } {
    // Storage: minimum 1GB
    if (resources.storage < 1) {
      return { success: false, message: 'Minimum 1GB storage required' };
    }

    // CPU: minimum 1 core
    if (resources.cpu < 1) {
      return { success: false, message: 'Minimum 1 CPU core required' };
    }

    // Bandwidth: minimum 10 Mbps upload/download
    if (resources.bandwidth.upload < 10 || resources.bandwidth.download < 10) {
      return { success: false, message: 'Minimum 10 Mbps upload/download required' };
    }

    // Uptime: minimum 95%
    if (resources.uptime < 95) {
      return { success: false, message: 'Minimum 95% uptime commitment required' };
    }

    return { success: true, message: 'Resources validated' };
  }

  /**
   * Lock stake tokens
   */
  private async lockStake(wallet: string, amount: number): Promise<void> {
    // TODO: Implement stake locking mechanism
    // Transfer STR tokens to escrow contract
    console.log(`Locking ${amount} STR from ${wallet}...`);
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Stake locked successfully`);
  }

  /**
   * Unlock stake tokens (if registration fails)
   */
  private async unlockStake(wallet: string, amount: number): Promise<void> {
    // TODO: Implement stake unlock
    console.log(`Unlocking ${amount} STR for ${wallet}...`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Stake unlocked`);
  }

  /**
   * Notify genesis network of new validator
   */
  private async notifyGenesisNetwork(validatorId: string, domain: string): Promise<void> {
    // TODO: Broadcast to genesis network (1313 validators)
    console.log(`Notifying genesis network of new validator: ${validatorId} (${domain})`);
    
    // Simulate broadcast
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`Genesis network notified`);
  }

  /**
   * Get validator by ID
   */
  getValidator(validatorId: string): RegistryEntry | null {
    return this.validators.get(validatorId) || null;
  }

  /**
   * Get validator by domain
   */
  getValidatorByDomain(domain: string): RegistryEntry | null {
    const validatorId = this.domainIndex.get(domain);
    if (!validatorId) return null;
    
    return this.validators.get(validatorId) || null;
  }

  /**
   * Get all validators for a wallet
   */
  getValidatorsByWallet(wallet: string): RegistryEntry[] {
    const validatorIds = this.walletIndex.get(wallet) || [];
    return validatorIds
      .map(id => this.validators.get(id))
      .filter(entry => entry !== undefined) as RegistryEntry[];
  }

  /**
   * Get all active validators
   */
  getActiveValidators(): RegistryEntry[] {
    return Array.from(this.validators.values())
      .filter(entry => entry.status === 'active');
  }

  /**
   * Get network statistics
   */
  getNetworkStats() {
    const allValidators = Array.from(this.validators.values());
    const activeValidators = allValidators.filter(v => v.status === 'active');
    
    const totalStorage = activeValidators.reduce((sum, v) => {
      const status = v.validator.getStatus();
      return sum + status.resources.storage.allocated;
    }, 0);
    
    const totalCPU = activeValidators.reduce((sum, v) => {
      const status = v.validator.getStatus();
      return sum + status.resources.cpu.cores;
    }, 0);
    
    const avgBandwidth = activeValidators.reduce((sum, v) => {
      const status = v.validator.getStatus();
      const avg = (status.resources.bandwidth.upload + status.resources.bandwidth.download) / 2;
      return sum + avg;
    }, 0) / (activeValidators.length || 1);
    
    return {
      totalValidators: allValidators.length,
      activeValidators: activeValidators.length,
      genesisValidators: 1313,
      totalNetworkValidators: 1313 + activeValidators.length,
      resources: {
        totalStorageGB: totalStorage,
        totalCPUCores: totalCPU,
        avgBandwidthMbps: avgBandwidth
      }
    };
  }

  /**
   * Deregister validator
   */
  async deregister(validatorId: string): Promise<{ success: boolean; message: string }> {
    try {
      const entry = this.validators.get(validatorId);
      if (!entry) {
        return { success: false, message: 'Validator not found' };
      }

      // Stop validator
      await entry.validator.stop();

      // Unlock stake
      const status = entry.validator.getStatus();
      await this.unlockStake(entry.wallet, status.stake);

      // Remove from indices
      this.domainIndex.delete(entry.domain);
      const walletValidators = this.walletIndex.get(entry.wallet) || [];
      this.walletIndex.set(
        entry.wallet,
        walletValidators.filter(id => id !== validatorId)
      );

      // Mark as terminated
      entry.status = 'terminated';

      return { success: true, message: 'Validator deregistered successfully' };
    } catch (error) {
      return { success: false, message: `Deregistration failed: ${error}` };
    }
  }
}

export default ValidatorRegistry;
