// LiveTransactionGenerator.ts
// Generates live transactions dynamically for the Block Explorer

import * as crypto from 'crypto';
import { LedgerType } from '../../shared/types';
import { TelemetryHistoryTracker } from './TelemetryHistoryTracker';

export interface LiveTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  type: 'transfer' | 'mint' | 'burn' | 'stake' | 'unstake' | 'contract' | 'deploy';
  timestamp: number;
  ledgerType: LedgerType;
  status: 'pending' | 'confirmed' | 'failed';
  blockHeight?: number;
  blockHash?: string;
  confirmations?: number;
  data?: any;
}

export interface NodeTelemetry {
  nodeId: string;
  strDomain: string;
  nodeType: string;
  uptime: number;
  reputation: number;
  connections: number;
  blocksMined: number;
  transactionsProcessed: number;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  region: string;
  lastSeen: number;
  isActive: boolean;
}

export class LiveTransactionGenerator {
  private transactions: LiveTransaction[] = [];
  private maxTransactions: number = 1000; // Keep last 1000 transactions
  private transactionRate: number = 10; // Transactions per second
  private updateInterval: NodeJS.Timeout | null = null;
  private confirmedBlocks: Map<string, number> = new Map(); // blockHash -> height
  private nodeTelemetry: Map<string, NodeTelemetry> = new Map();
  private addresses: string[] = [];
  private telemetryHistoryTracker: TelemetryHistoryTracker;
  
  constructor() {
    this.generateAddresses(100);
    this.startTransactionGeneration();
    this.telemetryHistoryTracker = new TelemetryHistoryTracker();
    
    // Capture snapshots periodically
    setInterval(() => {
      const allNodes = this.getAllNodeTelemetry();
      this.telemetryHistoryTracker.recordSnapshot(allNodes);
    }, 5000);
  }

  private generateAddresses(count: number): void {
    for (let i = 0; i < count; i++) {
      this.addresses.push(`zk13str_${crypto.randomBytes(20).toString('hex')}_${Math.floor(Math.random() * 1000)}`);
    }
  }

  private startTransactionGeneration(): void {
    // Generate transactions at specified rate
    const interval = 1000 / this.transactionRate; // milliseconds between transactions
    
    this.updateInterval = setInterval(() => {
      this.generateTransaction();
      this.updateTransactionStatuses();
    }, interval);
  }

  private generateTransaction(): void {
    const ledgerTypes: LedgerType[] = ['main', 'asset', 'contract', 'governance', 'ccoin', 'ccos'];
    const txTypes: LiveTransaction['type'][] = ['transfer', 'mint', 'burn', 'stake', 'unstake', 'contract', 'deploy'];
    
    const ledgerType = ledgerTypes[Math.floor(Math.random() * ledgerTypes.length)];
    const txType = txTypes[Math.floor(Math.random() * txTypes.length)];
    
    let from = 'system';
    let to = this.addresses[Math.floor(Math.random() * this.addresses.length)];

    if (txType !== 'mint' && txType !== 'deploy') {
      from = this.addresses[Math.floor(Math.random() * this.addresses.length)];
      // Ensure from and to are different
      while (from === to && this.addresses.length > 1) {
        to = this.addresses[Math.floor(Math.random() * this.addresses.length)];
      }
    }

    const amount = Math.random() * 10000 + 1;
    const fee = Math.random() * 10 + 0.001;

    const tx: LiveTransaction = {
      id: crypto.randomBytes(16).toString('hex'),
      from,
      to,
      amount: Math.round(amount * 100) / 100,
      fee: Math.round(fee * 1000) / 1000,
      type: txType,
      timestamp: Date.now(),
      ledgerType,
      status: 'pending',
      confirmations: 0
    };

    // Add contract data if type is contract
    if (txType === 'contract') {
      tx.data = {
        contractAddress: `contract_${crypto.randomBytes(8).toString('hex')}`,
        method: 'execute',
        params: []
      };
    }

    this.transactions.unshift(tx); // Add to beginning
    
    // Keep only last N transactions
    if (this.transactions.length > this.maxTransactions) {
      this.transactions = this.transactions.slice(0, this.maxTransactions);
    }
  }

  private updateTransactionStatuses(): void {
    // Simulate transactions getting confirmed in blocks
    this.transactions.forEach((tx, index) => {
      if (tx.status === 'pending') {
        // 50% chance to confirm after a few seconds
        const age = Date.now() - tx.timestamp;
        if (age > 2000 && Math.random() > 0.5) {
          tx.status = 'confirmed';
          tx.blockHeight = Math.floor(Date.now() / 1000) + index; // Simulated block height
          tx.blockHash = crypto.randomBytes(16).toString('hex');
          tx.confirmations = 1;
        }
      } else if (tx.status === 'confirmed') {
        // Increment confirmations over time
        const confirmTime = Date.now() - tx.timestamp;
        tx.confirmations = Math.min(Math.floor(confirmTime / 5000), 100); // Max 100 confirmations
      }
    });
  }

  getRecentTransactions(limit: number = 50): LiveTransaction[] {
    return this.transactions.slice(0, limit);
  }

  getTransactionsByLedger(ledgerType: LedgerType, limit: number = 50): LiveTransaction[] {
    return this.transactions.filter(tx => tx.ledgerType === ledgerType).slice(0, limit);
  }

  getTransactionById(id: string): LiveTransaction | undefined {
    return this.transactions.find(tx => tx.id === id);
  }

  getAddressTransactions(address: string, limit: number = 50): LiveTransaction[] {
    return this.transactions.filter(
      tx => tx.from === address || tx.to === address
    ).slice(0, limit);
  }

  getAllTransactions(): LiveTransaction[] {
    return [...this.transactions];
  }

  getTransactionStats() {
    const stats = {
      total: this.transactions.length,
      pending: this.transactions.filter(tx => tx.status === 'pending').length,
      confirmed: this.transactions.filter(tx => tx.status === 'confirmed').length,
      failed: this.transactions.filter(tx => tx.status === 'failed').length,
      byLedger: {} as { [key: string]: number },
      byType: {} as { [key: string]: number },
      totalVolume: 0,
      totalFees: 0
    };

    this.transactions.forEach(tx => {
      stats.byLedger[tx.ledgerType] = (stats.byLedger[tx.ledgerType] || 0) + 1;
      stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;
      stats.totalVolume += tx.amount;
      stats.totalFees += tx.fee;
    });

    return stats;
  }

  // Node Telemetry Management
  updateNodeTelemetry(nodeId: string, telemetry: Partial<NodeTelemetry>): void {
    const existing = this.nodeTelemetry.get(nodeId) || {
      nodeId,
      strDomain: `STR.node${Math.floor(Math.random() * 1313)}`,
      nodeType: 'delegated',
      uptime: 95,
      reputation: 90,
      connections: 20,
      blocksMined: 0,
      transactionsProcessed: 0,
      cpuUsage: 15,
      memoryUsage: 256,
      networkLatency: 10,
      region: 'North America',
      lastSeen: Date.now(),
      isActive: true
    };

    const updated = { ...existing, ...telemetry, lastSeen: Date.now() };
    this.nodeTelemetry.set(nodeId, updated);
    
    // Record in history tracker
    this.telemetryHistoryTracker.recordTelemetry(nodeId, updated);
  }

  getNodeTelemetry(nodeId?: string): NodeTelemetry | NodeTelemetry[] {
    if (nodeId) {
      return this.nodeTelemetry.get(nodeId) || {} as NodeTelemetry;
    }
    return Array.from(this.nodeTelemetry.values());
  }

  getAllNodeTelemetry(): NodeTelemetry[] {
    return Array.from(this.nodeTelemetry.values());
  }

  getNodeTelemetryStats() {
    const nodes = this.getAllNodeTelemetry();
    return {
      totalNodes: nodes.length,
      activeNodes: nodes.filter(n => n.isActive).length,
      averageUptime: nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length || 0,
      averageReputation: nodes.reduce((sum, n) => sum + n.reputation, 0) / nodes.length || 0,
      totalConnections: nodes.reduce((sum, n) => sum + n.connections, 0),
      totalBlocksMined: nodes.reduce((sum, n) => sum + n.blocksMined, 0),
      totalTransactionsProcessed: nodes.reduce((sum, n) => sum + n.transactionsProcessed, 0),
      averageCPU: nodes.reduce((sum, n) => sum + n.cpuUsage, 0) / nodes.length || 0,
      averageMemory: nodes.reduce((sum, n) => sum + n.memoryUsage, 0) / nodes.length || 0,
      averageLatency: nodes.reduce((sum, n) => sum + n.networkLatency, 0) / nodes.length || 0
    };
  }

  // Telemetry History Methods
  getTelemetryHistory(nodeId?: string, limit: number = 100) {
    if (nodeId) {
      return this.telemetryHistoryTracker.getNodeHistory(nodeId, limit);
    }
    return this.telemetryHistoryTracker.getAllHistory();
  }

  getTelemetrySnapshots(limit: number = 100) {
    return this.telemetryHistoryTracker.getSnapshotHistory(limit);
  }

  getTelemetryTrends(nodeId?: string) {
    return this.telemetryHistoryTracker.getTelemetryTrends(nodeId);
  }

  getNodeTelemetryOverTime(nodeId: string, timeWindow: number = 3600000) {
    return this.telemetryHistoryTracker.getNodeTelemetryOverTime(nodeId, timeWindow);
  }

  getNetworkMetricsOverTime(timeWindow: number = 3600000) {
    return this.telemetryHistoryTracker.getNetworkMetricsOverTime(timeWindow);
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.telemetryHistoryTracker) {
      this.telemetryHistoryTracker.destroy();
    }
  }
}

// Export for use in server
export default LiveTransactionGenerator;

