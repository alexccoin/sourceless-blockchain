// BlockchainHistoryGenerator.ts
// Generates full blockchain history with blocks and transactions

import * as crypto from 'crypto';
import { LedgerType } from '../../shared/types';

export interface HistoricalBlock {
  height: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: HistoricalTransaction[];
  miner: string;
  difficulty: number;
  ledgerType: LedgerType;
}

export interface HistoricalTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  type: 'transfer' | 'mint' | 'burn' | 'stake' | 'unstake' | 'contract' | 'deploy';
  timestamp: number;
  data?: any;
}

export class BlockchainHistoryGenerator {
  private history: Map<LedgerType, HistoricalBlock[]> = new Map();
  private startTime: number;
  private currentTime: number;

  constructor() {
    this.startTime = Date.now() - (365 * 24 * 60 * 60 * 1000); // 1 year ago
    this.currentTime = Date.now();
    this.initializeLedgers();
  }

  private initializeLedgers(): void {
    const ledgerTypes: LedgerType[] = ['main', 'asset', 'contract', 'governance', 'ccoin', 'ccos'];
    
    ledgerTypes.forEach(ledgerType => {
      this.history.set(ledgerType, []);
    });
  }

  // Generate full history for all ledgers
  generateFullHistory(
    totalBlocks: number = 932178,
    transactionsPerBlock: number = 100
  ): void {
    const ledgerTypes: LedgerType[] = ['main', 'asset', 'contract', 'governance', 'ccoin', 'ccos'];
    
    ledgerTypes.forEach(ledgerType => {
      this.generateLedgerHistory(ledgerType, totalBlocks, transactionsPerBlock);
    });
  }

  private generateLedgerHistory(
    ledgerType: LedgerType,
    totalBlocks: number,
    avgTransactionsPerBlock: number
  ): void {
    const blocks: HistoricalBlock[] = [];
    let previousHash = '0';
    const blockTime = (this.currentTime - this.startTime) / totalBlocks;

    // Create genesis block
    const genesisBlock: HistoricalBlock = {
      height: 0,
      hash: crypto.createHash('sha256').update(`genesis_${ledgerType}`).digest('hex'),
      previousHash: '0',
      timestamp: this.startTime,
      transactions: [],
      miner: 'STR.system',
      difficulty: 4,
      ledgerType
    };
    blocks.push(genesisBlock);
    previousHash = genesisBlock.hash;

    // Generate blocks in batches for performance
    const batchSize = 10000;
    const totalBatches = Math.ceil(totalBlocks / batchSize);
    
    console.log(`   Generating ${ledgerType} ledger: ${totalBlocks.toLocaleString()} blocks in ${totalBatches} batches...`);
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const startBlock = batch * batchSize + 1;
      const endBlock = Math.min((batch + 1) * batchSize, totalBlocks);
      
      for (let i = startBlock; i <= endBlock; i++) {
        const timestamp = this.startTime + (i * blockTime);
        
        // Vary transaction count per block (but reduce for performance)
        const txCount = Math.floor(avgTransactionsPerBlock * (0.5 + Math.random()));
        const transactions = this.generateTransactions(Math.min(txCount, 100), timestamp, ledgerType); // Cap at 100 for performance

        const blockData = {
          height: i,
          previousHash,
          timestamp,
          transactions,
          miner: `STR.validator${Math.floor(Math.random() * 1313)}`,
          difficulty: 4 + Math.floor(i / 10000), // Difficulty increases over time
          ledgerType
        };

        const blockHash = this.calculateBlockHash(blockData);
        
        const block: HistoricalBlock = {
          ...blockData,
          hash: blockHash
        };

        blocks.push(block);
        previousHash = blockHash;
      }
      
      // Progress update every 10 batches
      if ((batch + 1) % 10 === 0 || batch === totalBatches - 1) {
        const progress = ((batch + 1) / totalBatches * 100).toFixed(1);
        console.log(`   ${ledgerType} ledger: ${progress}% complete (${endBlock.toLocaleString()}/${totalBlocks.toLocaleString()} blocks)`);
      }
    }

    this.history.set(ledgerType, blocks);
    console.log(`   ✅ ${ledgerType} ledger complete: ${blocks.length.toLocaleString()} blocks`);
  }

  private generateTransactions(
    count: number,
    timestamp: number,
    ledgerType: LedgerType
  ): HistoricalTransaction[] {
    const transactions: HistoricalTransaction[] = [];
    const txTypes: HistoricalTransaction['type'][] = ['transfer', 'mint', 'burn', 'stake', 'unstake', 'contract', 'deploy'];
    
    // Generate wallet addresses
    const addresses: string[] = [];
    for (let i = 0; i < 50; i++) {
      addresses.push(`zk13str_${crypto.randomBytes(20).toString('hex')}_${Math.floor(Math.random() * 1000)}`);
    }

    for (let i = 0; i < count; i++) {
      const txType = txTypes[Math.floor(Math.random() * txTypes.length)];
      let from = 'system';
      let to = addresses[Math.floor(Math.random() * addresses.length)];

      if (txType !== 'mint' && txType !== 'deploy') {
        from = addresses[Math.floor(Math.random() * addresses.length)];
      }

      const amount = Math.random() * 10000 + 1;
      const fee = Math.random() * 10 + 0.001;

      const tx: HistoricalTransaction = {
        id: crypto.randomBytes(16).toString('hex'),
        from,
        to,
        amount,
        fee,
        type: txType,
        timestamp: timestamp + (i * 100), // Stagger transactions
        data: txType === 'contract' ? {
          contractAddress: `contract_${crypto.randomBytes(8).toString('hex')}`,
          method: 'execute',
          params: []
        } : undefined
      };

      transactions.push(tx);
    }

    return transactions;
  }

  private calculateBlockHash(blockData: any): string {
    const data = JSON.stringify({
      height: blockData.height,
      previousHash: blockData.previousHash,
      timestamp: blockData.timestamp,
      transactions: blockData.transactions.map((tx: HistoricalTransaction) => tx.id),
      miner: blockData.miner,
      difficulty: blockData.difficulty
    });
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Get history for a specific ledger
  getLedgerHistory(ledgerType: LedgerType): HistoricalBlock[] {
    return this.history.get(ledgerType) || [];
  }

  // Get recent blocks
  getRecentBlocks(ledgerType: LedgerType, count: number = 10): HistoricalBlock[] {
    const history = this.getLedgerHistory(ledgerType);
    return history.slice(-count);
  }

  // Get blocks with pagination
  getBlocks(ledgerType: LedgerType, page: number = 1, pageSize: number = 20): {
    blocks: HistoricalBlock[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const history = this.getLedgerHistory(ledgerType);
    const total = history.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const blocks = history.slice(startIndex, endIndex).reverse(); // Most recent first

    return {
      blocks,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  // Get block by height
  getBlockByHeight(ledgerType: LedgerType, height: number): HistoricalBlock | undefined {
    const history = this.getLedgerHistory(ledgerType);
    return history.find(block => block.height === height);
  }

  // Get blocks in range
  getBlocksInRange(ledgerType: LedgerType, fromHeight: number, toHeight: number): HistoricalBlock[] {
    const history = this.getLedgerHistory(ledgerType);
    return history.filter(block => block.height >= fromHeight && block.height <= toHeight);
  }

  // Get total block count
  getTotalBlockCount(ledgerType?: LedgerType): number {
    if (ledgerType) {
      return this.getLedgerHistory(ledgerType).length;
    }
    let total = 0;
    this.history.forEach((blocks) => {
      total += blocks.length;
    });
    return total;
  }

  // Get transactions for an address
  getAddressTransactions(
    ledgerType: LedgerType,
    address: string,
    limit: number = 100
  ): HistoricalTransaction[] {
    const history = this.getLedgerHistory(ledgerType);
    const transactions: HistoricalTransaction[] = [];

    for (const block of history) {
      for (const tx of block.transactions) {
        if (tx.from === address || tx.to === address) {
          transactions.push(tx);
          if (transactions.length >= limit) {
            return transactions;
          }
        }
      }
    }

    return transactions;
  }

  // Get statistics
  getStatistics() {
    const stats: any = {};

    this.history.forEach((blocks, ledgerType) => {
      const totalTransactions = blocks.reduce((sum, block) => sum + block.transactions.length, 0);
      const uniqueAddresses = new Set<string>();
      
      blocks.forEach(block => {
        block.transactions.forEach(tx => {
          if (tx.from !== 'system') uniqueAddresses.add(tx.from);
          uniqueAddresses.add(tx.to);
        });
      });

      stats[ledgerType] = {
        totalBlocks: blocks.length,
        totalTransactions,
        uniqueAddresses: uniqueAddresses.size,
        averageTxPerBlock: totalTransactions / blocks.length,
        firstBlock: blocks[0]?.timestamp || 0,
        lastBlock: blocks[blocks.length - 1]?.timestamp || 0
      };
    });

    return stats;
  }

  // Get all history
  getAllHistory(): Map<LedgerType, HistoricalBlock[]> {
    return new Map(this.history);
  }
}

