// DynamicNetworkSimulator.ts
// Emulates 1313 distributed nodes with dynamic metrics and full blockchain history

import * as crypto from 'crypto';

export interface SimulatedNode {
  id: string;
  strDomain: string;
  tpmsCapacity: number;
  tpsCapacity: number;
  isActive: boolean;
  uptime: number;
  reputation: number;
  region: string;
  nodeType: 'validator' | 'delegated' | 'personal' | 'worker';
  connections: number;
  lastSeen: number;
  blocksMined: number;
  transactionsProcessed: number;
}

export interface NetworkMetrics {
  totalNodes: number;
  activeNodes: number;
  totalTPMS: number;
  totalTPS: number;
  currentTPMS: number;
  currentTPS: number;
  networkLatency: number;
  averageUptime: number;
  averageReputation: number;
  regions: { [region: string]: number };
  nodeTypes: { [type: string]: number };
  totalBlocks: number;
  totalTransactions: number;
}

export class DynamicNetworkSimulator {
  private nodes: Map<string, SimulatedNode>;
  private targetTPMS: number = 1_000_000; // 1 million transactions per millisecond
  private updateInterval: NodeJS.Timeout | null = null;
  private metrics: NetworkMetrics;
  private totalBlocks: number = 0;
  private totalTransactions: number = 0;
  private lastUpdateTime: number = Date.now();
  private txCounter: number = 0;

  // Regions for distribution
  private regions = [
    'North America', 'South America', 'Europe', 'Asia', 'Africa', 
    'Oceania', 'Middle East', 'Antarctica'
  ];

  constructor(totalNodes: number = 1313) {
    this.nodes = new Map();
    this.metrics = this.createInitialMetrics();
    this.generateNodes(totalNodes);
    this.startDynamicUpdates();
  }

  private createInitialMetrics(): NetworkMetrics {
    return {
      totalNodes: 0,
      activeNodes: 0,
      totalTPMS: 0,
      totalTPS: 0,
      currentTPMS: 0,
      currentTPS: 0,
      networkLatency: 0,
      averageUptime: 0,
      averageReputation: 0,
      regions: {},
      nodeTypes: {},
      totalBlocks: 0,
      totalTransactions: 0
    };
  }

  private generateNodes(count: number): void {
    const nodeTypes: SimulatedNode['nodeType'][] = ['validator', 'delegated', 'personal', 'worker'];
    const nodeTypeDistribution = [100, 400, 600, 213]; // Total: 1313

    let nodeIndex = 0;
    for (let typeIndex = 0; typeIndex < nodeTypes.length; typeIndex++) {
      const type = nodeTypes[typeIndex];
      const typeCount = nodeTypeDistribution[typeIndex];

      for (let i = 0; i < typeCount; i++) {
        const node = this.createNode(type, nodeIndex);
        this.nodes.set(node.id, node);
        nodeIndex++;
      }
    }

    // Ensure we have exactly 1313 nodes
    while (this.nodes.size < count) {
      const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      const node = this.createNode(type, nodeIndex);
      this.nodes.set(node.id, node);
      nodeIndex++;
    }

    // Scale node capacities to reach target TPMS
    this.scaleNodeCapacities();
  }

  private scaleNodeCapacities(): void {
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.isActive);
    const currentTotal = activeNodes.reduce((sum, n) => sum + n.tpmsCapacity, 0);
    
    if (currentTotal < this.targetTPMS) {
      // Scale up to reach target (distribute extra capacity proportionally)
      const scaleFactor = this.targetTPMS / Math.max(currentTotal, 1);
      activeNodes.forEach(node => {
        node.tpmsCapacity *= scaleFactor;
        node.tpsCapacity = node.tpmsCapacity * 1000;
      });
    }
  }

  private createNode(type: SimulatedNode['nodeType'], index: number): SimulatedNode {
    // Calculate TPMS based on node type
    let tpmsCapacity: number;
    let tpsCapacity: number;

    switch (type) {
      case 'validator':
        tpmsCapacity = Math.random() * 10000 + 5000; // 5k-15k TPMS
        break;
      case 'delegated':
        tpmsCapacity = Math.random() * 5000 + 2000; // 2k-7k TPMS
        break;
      case 'personal':
        tpmsCapacity = Math.random() * 1000 + 100; // 100-1100 TPMS
        break;
      case 'worker':
        tpmsCapacity = Math.random() * 3000 + 1000; // 1k-4k TPMS
        break;
    }

    tpsCapacity = tpmsCapacity * 1000; // Convert to TPS

    const region = this.regions[Math.floor(Math.random() * this.regions.length)];
    
    return {
      id: `node_${index}_${crypto.randomBytes(8).toString('hex')}`,
      strDomain: `STR.node${index}`,
      tpmsCapacity,
      tpsCapacity,
      isActive: Math.random() > 0.05, // 95% active
      uptime: Math.random() * 5 + 95, // 95-100%
      reputation: Math.random() * 20 + 80, // 80-100
      region,
      nodeType: type,
      connections: Math.floor(Math.random() * 50) + 10,
      lastSeen: Date.now(),
      blocksMined: Math.floor(Math.random() * 1000),
      transactionsProcessed: Math.floor(Math.random() * 100000)
    };
  }

  private startDynamicUpdates(): void {
    // Update every 100ms for smooth real-time updates
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
      this.simulateNetworkActivity();
    }, 100);
  }

  private updateMetrics(): void {
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.isActive);
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000; // seconds

    // Calculate total capacity
    const totalTPMS = activeNodes.reduce((sum, n) => sum + n.tpmsCapacity, 0);
    const totalTPS = activeNodes.reduce((sum, n) => sum + n.tpsCapacity, 0);

    // Simulate current throughput (80-120% of capacity)
    const utilizationRate = 0.8 + Math.random() * 0.4;
    const currentTPMS = Math.min(totalTPMS * utilizationRate, this.targetTPMS);
    const currentTPS = currentTPMS * 1000;

    // Update transaction counter
    this.txCounter += currentTPS * deltaTime;
    this.totalTransactions = Math.floor(this.txCounter);

    // Simulate block generation (1 block per second at high throughput)
    const blocksPerSecond = Math.max(1, currentTPS / 10000);
    this.totalBlocks += Math.floor(blocksPerSecond * deltaTime);

    // Update region distribution
    const regions: { [key: string]: number } = {};
    const nodeTypes: { [key: string]: number } = {};
    
    activeNodes.forEach(node => {
      regions[node.region] = (regions[node.region] || 0) + 1;
      nodeTypes[node.nodeType] = (nodeTypes[node.nodeType] || 0) + 1;
    });

    // Calculate averages
    const avgUptime = activeNodes.reduce((sum, n) => sum + n.uptime, 0) / activeNodes.length;
    const avgReputation = activeNodes.reduce((sum, n) => sum + n.reputation, 0) / activeNodes.length;

    // Simulate network latency (1-50ms)
    const networkLatency = Math.random() * 49 + 1;

    this.metrics = {
      totalNodes: this.nodes.size,
      activeNodes: activeNodes.length,
      totalTPMS: totalTPMS,
      totalTPS: totalTPS,
      currentTPMS: currentTPMS,
      currentTPS: currentTPS,
      networkLatency,
      averageUptime: avgUptime,
      averageReputation: avgReputation,
      regions,
      nodeTypes,
      totalBlocks: this.totalBlocks,
      totalTransactions: this.totalTransactions
    };

    this.lastUpdateTime = now;
  }

  private simulateNetworkActivity(): void {
    // Randomly update node statuses (1% chance per update)
    this.nodes.forEach(node => {
      if (Math.random() < 0.01) {
        // Toggle active status occasionally
        if (!node.isActive && Math.random() > 0.7) {
          node.isActive = true;
        } else if (node.isActive && Math.random() < 0.01) {
          node.isActive = false;
        }

        // Update metrics
        node.uptime += (Math.random() - 0.5) * 0.1;
        node.uptime = Math.max(90, Math.min(100, node.uptime));
        
        node.reputation += (Math.random() - 0.5) * 0.5;
        node.reputation = Math.max(70, Math.min(100, node.reputation));

        node.connections = Math.max(0, node.connections + Math.floor((Math.random() - 0.5) * 5));
        node.lastSeen = Date.now();

        // Increment processed transactions
        node.transactionsProcessed += Math.floor(Math.random() * 100);
      }
    });
  }

  getMetrics(): NetworkMetrics {
    return { ...this.metrics };
  }

  getNodes(): SimulatedNode[] {
    return Array.from(this.nodes.values());
  }

  getActiveNodes(): SimulatedNode[] {
    return Array.from(this.nodes.values()).filter(n => n.isActive);
  }

  getNodeById(id: string): SimulatedNode | undefined {
    return this.nodes.get(id);
  }

  // Get network statistics for display
  getNetworkStats() {
    return {
      ...this.metrics,
      nodeDetails: {
        validators: this.metrics.nodeTypes.validator || 0,
        delegated: this.metrics.nodeTypes.delegated || 0,
        personal: this.metrics.nodeTypes.personal || 0,
        workers: this.metrics.nodeTypes.worker || 0
      },
      performance: {
        throughput: this.metrics.currentTPS,
        latency: this.metrics.networkLatency,
        efficiency: (this.metrics.currentTPMS / this.metrics.totalTPMS) * 100
      }
    };
  }

  // Simulate transaction processing
  simulateTransaction(): boolean {
    const activeNodes = this.getActiveNodes();
    if (activeNodes.length === 0) return false;

    const randomNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
    randomNode.transactionsProcessed++;
    this.txCounter++;
    this.totalTransactions = Math.floor(this.txCounter);
    
    return true;
  }

  // Cleanup
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Export for use in server
export default DynamicNetworkSimulator;

