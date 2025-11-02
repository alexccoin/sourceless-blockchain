// Sourceless Blockchain v0.13 - Main Blockchain Class
import { Block } from './Block';
import { Transaction } from './Transaction';
import { Ledger } from '../../../shared/types';

export class Blockchain implements Ledger {
  public type: 'main' | 'asset' | 'contract' | 'governance';
  public chain: Block[];
  public pendingTransactions: Transaction[];
  public difficulty: number;
  public miningReward: number;
  private validators: Map<string, number>;

  constructor(
    type: 'main' | 'asset' | 'contract' | 'governance' = 'main',
    difficulty: number = 4
  ) {
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
