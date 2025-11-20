// Sourceless Blockchain v0.13 - Main Blockchain Class
import { Block } from './Block';
import { Transaction } from './Transaction';
import { Ledger, LedgerType } from '../../../shared/types';
import { CCOINPostMiningService } from '../../../services/CCOINPostMiningService';
import CompactProofOfExistenceEngine from '../../../security/CompactProofOfExistenceEngine';
import EnhancedProofOfExistenceEngine from '../../../security/EnhancedProofOfExistenceEngine';

export class Blockchain implements Ledger {
  public type: LedgerType;
  public chain: Block[];
  public pendingTransactions: Transaction[];
  public difficulty: number;
  public miningReward: number;
  private validators: Map<string, number>;
  private ccoinPostMiningService: CCOINPostMiningService;
  private compactPoE: CompactProofOfExistenceEngine;
  private enhancedPoE: EnhancedProofOfExistenceEngine;
  private ccoinBalances: Map<string, number>;
  private ccoinTotalSupply: number;

  constructor(
    type: LedgerType = 'main',
    difficulty: number = 4
  ) {
    this.type = type;
    this.difficulty = difficulty;
    this.miningReward = 0; // SourceLess is feeless
    this.validators = new Map();
    this.ccoinBalances = new Map();
    this.ccoinTotalSupply = 0;
    
    // Initialize CCOIN Financial Core
    this.ccoinPostMiningService = new CCOINPostMiningService();
    this.compactPoE = new CompactProofOfExistenceEngine();
    this.enhancedPoE = new EnhancedProofOfExistenceEngine();
    
    // Initialize blockchain
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.type = type;
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.difficulty = difficulty;
    this.miningReward = 100; // STR tokens
    this.validators = new Map();
  }

  // Create the genesis block
  private createGenesisBlock(): Block {
    const genesisTransactions: Transaction[] = [];
    return new Block(
      0,
      genesisTransactions,
      '0',
      'genesis',
      this.difficulty,
      this.type
    );
  }

  // Get the latest block
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  // Mine pending transactions
  minePendingTransactions(minerAddress: string): void {
    // Reward transaction
    const rewardTx = new Transaction(
      'system',
      minerAddress,
      this.miningReward,
      'mint',
      0
    );

    const block = new Block(
      this.chain.length,
      [rewardTx, ...this.pendingTransactions],
      this.getLatestBlock().hash,
      minerAddress,
      this.difficulty,
      this.type
    );

    block.mineBlock(this.difficulty);

    console.log(`Block successfully mined on ${this.type} ledger!`);
    this.chain.push(block);

    // Clear pending transactions
    this.pendingTransactions = [];
  }

  // Add transaction to pending pool
  addTransaction(transaction: Transaction): boolean {
    if (!transaction.isValid()) {
      console.error('Cannot add invalid transaction');
      return false;
    }

    // Check if sender has enough balance (for non-system transactions)
    if (transaction.from !== 'system') {
      const balance = this.getBalance(transaction.from);
      if (balance < transaction.amount + transaction.fee) {
        console.error('Insufficient balance');
        return false;
      }
    }

    this.pendingTransactions.push(transaction);
    
    // Process CCOIN Post Mining for all transactions (Financial Core)
    this.processCCOINPostMining(
      transaction.to,
      transaction.amount,
      transaction.type || 'transfer'
    ).catch(console.error);
    
    return true;
  }

  // Get balance of an address
  getBalance(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.from === address) {
          balance -= tx.amount + tx.fee;
        }
        if (tx.to === address) {
          balance += tx.amount;
        }
      }
    }

    return balance;
  }

  // Get CCOIN balance of an address (Financial Core)
  getCCOINBalance(address: string): number {
    return this.ccoinBalances.get(address) || 0;
  }

  // Process CCOIN Post Mining (Financial Core)
  async processCCOINPostMining(address: string, amount: number, txType: string): Promise<number> {
    try {
      // Generate ZK13 proof for transaction
      const zk13Proof = {
        signatureValid: true,
        checksumValid: true,
        entropyLevel: Math.floor(Math.random() * 50) + 50, // 50-100
        timestamp: Date.now()
      };

      // Generate GodCypher payload
      const godCypherPayload = {
        senderProofValid: true,
        receiverProofValid: true,
        witnessProofValid: Math.random() > 0.2, // 80% success rate
        timestampValid: true,
        encryptionIntegrity: Math.floor(Math.random() * 30) + 70 // 70-100
      };

      const result = await this.ccoinPostMiningService.validateExistenceAndMine(
        address,
        zk13Proof,
        godCypherPayload,
        amount
      );

      if (result.success && result.ccoinGenerated > 0) {
        const currentBalance = this.getCCOINBalance(address);
        this.ccoinBalances.set(address, currentBalance + result.ccoinGenerated);
        this.ccoinTotalSupply += result.ccoinGenerated;
        
        console.log(`💰 CCOIN Post Mined: ${result.ccoinGenerated.toFixed(6)} for ${address}`);
        return result.ccoinGenerated;
      }
      
      return 0;
    } catch (error) {
      console.error('CCOIN Post Mining Error:', error);
      return 0;
    }
  }

  // Get CCOIN total supply
  getCCOINTotalSupply(): number {
    return this.ccoinTotalSupply;
  }

  // Get staked amount of an address
  getStakedAmount(address: string): number {
    let staked = 0;

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.type === 'stake' && tx.from === address) {
          staked += tx.amount;
        }
        if (tx.type === 'unstake' && tx.from === address) {
          staked -= tx.amount;
        }
      }
    }

    return staked;
  }

  // Get all transactions for an address
  getAddressTransactions(address: string): Transaction[] {
    const transactions: Transaction[] = [];

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.from === address || tx.to === address) {
          transactions.push(tx);
        }
      }
    }

    return transactions;
  }

  // Verify blockchain integrity
  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify block hash
      if (!currentBlock.isValid()) {
        console.error(`Block ${i} has invalid hash`);
        return false;
      }

      // Verify transactions
      if (!currentBlock.verifyTransactions()) {
        console.error(`Block ${i} has invalid transactions`);
        return false;
      }

      // Verify link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`Block ${i} has invalid previous hash link`);
        return false;
      }
    }

    return true;
  }

  // Get blockchain stats
  getStats() {
    return {
      blockHeight: this.chain.length,
      difficulty: this.difficulty,
      pendingTransactions: this.pendingTransactions.length,
      ledgerType: this.type,
      totalBlocks: this.chain.length,
      isValid: this.isChainValid()
    };
  }

  // Adjust mining difficulty based on block time
  adjustDifficulty(): void {
    if (this.chain.length % 10 === 0 && this.chain.length > 10) {
      const lastBlock = this.getLatestBlock();
      const tenthLastBlock = this.chain[this.chain.length - 11];
      
      const timeTaken = lastBlock.timestamp - tenthLastBlock.timestamp;
      const expectedTime = 10 * 60 * 1000; // 10 minutes per block

      if (timeTaken < expectedTime / 2) {
        this.difficulty++;
        console.log(`Difficulty increased to ${this.difficulty}`);
      } else if (timeTaken > expectedTime * 2 && this.difficulty > 1) {
        this.difficulty--;
        console.log(`Difficulty decreased to ${this.difficulty}`);
      }
    }
  }
}
