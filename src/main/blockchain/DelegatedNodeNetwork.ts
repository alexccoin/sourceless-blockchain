// DelegatedNodeNetwork.ts
// Scaling to 100,000 TPS with delegated node network

interface DelegatedNode {
  id: string;
  strDomain: string;
  tpsCapacity: number;
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
}
