// PersonalNode.ts
// Auto-run personal node for each user in Sourceless Blockchain

import { HybridNode } from '../../shared/types';
import { P2PNetwork } from '../p2p/P2PNetwork';

export class PersonalNode {
  nodeConfig: HybridNode;
  p2p: P2PNetwork;

  constructor(nodeConfig: HybridNode) {
    this.nodeConfig = nodeConfig;
    this.p2p = new P2PNetwork();
  }

  autoRun() {
    if (this.nodeConfig.autoRunPersonalNode) {
      this.p2p.start();
      // Additional startup logic for personal node
      console.log('Personal node auto-run started.');
    }
  }

  stop() {
    this.p2p.stop();
    console.log('Personal node stopped.');
  }
}
