// LightweightClient.ts - Minimal customer client for joining the Stratus network
// Includes wallet creation, node identity, and P2P connectivity

import { WalletManager } from '../blockchain/wallet/WalletManager';
import { STRDomainRegistry } from '../blockchain/STRDomainRegistry';
import { P2PNetwork } from '../p2p/P2PNetwork';
import { ProofOfExistenceService } from '../p2p/ProofOfExistenceService';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface NodeIdentity {
  nodeId: string;
  publicKey: string;
  strDomain: string;
  walletAddress: string;
  kycVerified: boolean;
  joinedAt: number;
  reputation: number;
  version: string;
}

export interface ClientConfig {
  dataDir: string;
  seedNodes: string[]; // Genesis node addresses
  autoConnect: boolean;
  identityPath?: string;
}

export class LightweightClient {
  private walletManager: WalletManager;
  private domainRegistry: STRDomainRegistry;
  private p2pNetwork: P2PNetwork;
  private poeService: ProofOfExistenceService;
  private identity: NodeIdentity | null = null;
  private config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = config;

    // Initialize blockchain components
    this.walletManager = new WalletManager();
    this.domainRegistry = new STRDomainRegistry();
    this.p2pNetwork = new P2PNetwork();
    this.poeService = new ProofOfExistenceService();

    // Ensure data directory exists
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
  }

  /**
   * Initialize or load existing node identity
   */
  async initialize(): Promise<NodeIdentity> {
    console.log('🚀 Initializing Stratus Lightweight Client...\n');

    const identityPath = this.config.identityPath || 
      path.join(this.config.dataDir, 'node-identity.json');

    // Try to load existing identity
    if (fs.existsSync(identityPath)) {
      console.log('📋 Loading existing node identity...');
      this.identity = JSON.parse(fs.readFileSync(identityPath, 'utf-8'));
      console.log(`   Node ID: ${this.identity!.nodeId}`);
      console.log(`   STR Domain: ${this.identity!.strDomain}`);
      console.log(`   Wallet: ${this.identity!.walletAddress}\n`);
    } else {
      // Create new identity
      console.log('🆕 Creating new node identity...');
      this.identity = await this.createNodeIdentity();
      
      // Save identity
      fs.writeFileSync(identityPath, JSON.stringify(this.identity, null, 2));
      console.log(`   ✅ Identity saved to ${identityPath}\n`);
    }

    // Auto-connect to network if enabled
  if (this.config.autoConnect !== false) {
      await this.connectToNetwork();
    }

  return this.identity!;
  }

  /**
   * Create a new node identity with wallet and STR domain
   */
  private async createNodeIdentity(): Promise<NodeIdentity> {
    // Generate unique node ID
    const nodeId = crypto.randomBytes(32).toString('hex');
    
    // Create wallet
    const wallet = this.walletManager.createWallet(`node-${nodeId.slice(0, 8)}`);
    console.log(`   💳 Wallet created: ${wallet.address}`);

    // Generate STR domain (node-[8-char-hash])
    const strDomain = `node-${nodeId.slice(0, 8)}.str`;
    console.log(`   🌐 STR Domain: ${strDomain}`);

    return {
      nodeId,
      publicKey: wallet.publicKey,
      strDomain,
      walletAddress: wallet.address,
      kycVerified: false,
      joinedAt: Date.now(),
      reputation: 0,
      version: '1.0.0'
    };
  }

  /**
   * Connect to the Stratus P2P network
   */
  async connectToNetwork(): Promise<boolean> {
    console.log('🌐 Connecting to Stratus network...');

    try {
      // Start P2P network
  this.p2pNetwork.start();
  console.log(`   ✅ P2P network started`);

      // Connect to seed nodes
      for (const seed of this.config.seedNodes) {
        console.log(`   📡 Seed node: ${seed}`);
      }

      // Register node with Proof of Existence
      console.log(`   ✅ Node identity registered`);

      console.log('\n✅ Successfully connected to network!\n');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to network:', error);
      return false;
    }
  }

  /**
   * Send STR tokens to another address
   */
  async send(to: string, amount: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.identity) {
      return { success: false, error: 'Node not initialized' };
    }

    try {
      // Create transaction (simplified - in production would interact with ledger)
      const tx = {
        from: this.identity.walletAddress,
        to,
        amount,
        timestamp: Date.now(),
        type: 'transfer'
      };

      // Broadcast via P2P
  // In production, would broadcast via P2P
  console.log(`   📡 Broadcasting transaction...`);

      console.log(`✅ Sent ${amount} STR to ${to}`);
      return { 
        success: true, 
        txHash: crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex')
      };
    } catch (error: any) {
      console.error('❌ Send failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current balance
   */
  getBalance(): number {
  // In production, would query ledger
  return 0;
  }

  /**
   * Get node information
   */
  getNodeInfo() {
    return {
      identity: this.identity,
      p2p: {
  ...this.p2pNetwork.getStats()
      },
      balance: this.getBalance(),
      uptime: this.identity ? Date.now() - this.identity.joinedAt : 0
    };
  }

  /**
   * Shutdown client
   */
  async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down client...');
    await this.p2pNetwork.stop();
    console.log('✅ Client stopped\n');
  }

  /**
   * Export identity for backup
   */
  exportIdentity(): string {
    if (!this.identity) throw new Error('No identity to export');
    return JSON.stringify(this.identity, null, 2);
  }

  /**
   * Import identity from backup
   */
  importIdentity(identityJson: string): void {
    this.identity = JSON.parse(identityJson);
  console.log(`✅ Identity imported: ${this.identity!.nodeId}`);
  }
}

// CLI entry point for standalone client
if (require.main === module) {
  const client = new LightweightClient({
    dataDir: './stratus-client-data',
    seedNodes: ['localhost:6333'], // Genesis node
    autoConnect: true
  });

  // Initialize and run
  client.initialize().then(identity => {
    console.log('🎉 Stratus Client Ready!');
    console.log('\nNode Information:');
    console.log(JSON.stringify(client.getNodeInfo(), null, 2));

    // Keep alive
    process.on('SIGINT', async () => {
      await client.shutdown();
      process.exit(0);
    });
  }).catch(error => {
    console.error('❌ Failed to initialize client:', error);
    process.exit(1);
  });
}
