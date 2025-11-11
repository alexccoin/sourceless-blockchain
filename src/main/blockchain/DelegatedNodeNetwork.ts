// DelegatedNodeNetwork.ts
// Scaling to 100+ TPMS (100,000+ TPS) with delegated node network

interface DelegatedNode {
  id: string;
  strDomain: string;
  tpmsCapacity: number; // Transactions per millisecond
  tpsCapacity: number;  // Transactions per second (tpms * 1000)
  isActive: boolean;
  uptime: number;
  reputation: number;
}

export class DelegatedNodeNetwork {
  private nodes: DelegatedNode[] = [];

  addNode(node: DelegatedNode) {
    this.nodes.push(node);
  }

  getActiveNodes(): DelegatedNode[] {
    return this.nodes.filter(n => n.isActive);
  }

  getTotalTPMS(): number {
    return this.getActiveNodes().reduce((sum, n) => sum + n.tpmsCapacity, 0);
  }

  getTotalTPS(): number {
    return this.getActiveNodes().reduce((sum, n) => sum + n.tpsCapacity, 0);
  }

  updateUptime(id: string, uptime: number) {
    const node = this.nodes.find(n => n.id === id);
    if (node) node.uptime = uptime;
  }

  updateReputation(id: string, reputation: number) {
    const node = this.nodes.find(n => n.id === id);
    if (node) node.reputation = reputation;
  }

  getNetworkStats() {
    return {
      totalNodes: this.nodes.length,
      activeNodes: this.getActiveNodes().length,
      totalTPMS: this.getTotalTPMS(),
      totalTPS: this.getTotalTPS(),
      averageUptime: this.nodes.reduce((sum, n) => sum + n.uptime, 0) / this.nodes.length,
      averageReputation: this.nodes.reduce((sum, n) => sum + n.reputation, 0) / this.nodes.length
    };
  }
}
