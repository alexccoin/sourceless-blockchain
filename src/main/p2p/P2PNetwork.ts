// P2PNetwork.ts
// Mock BitTorrent-style P2P network for Sourceless Blockchain
// This lightweight mock simulates peer discovery and network activity without native dependencies.

export class P2PNetwork {
  private timer?: NodeJS.Timeout;
  private running = false;
  private peers = 0;

  constructor() {}

  start() {
    if (this.running) return;
    this.running = true;
    console.log('P2PNetwork mock started');
    this.timer = setInterval(() => {
      // Simulate peer fluctuations
      const delta = Math.floor(Math.random() * 3) - 1; // -1,0,1
      this.peers = Math.max(0, this.peers + delta);
      console.log(`[P2P] peers=${this.peers}`);
    }, 3000);
  }

  stop() {
  if (this.timer) clearInterval(this.timer as unknown as number);
    this.running = false;
    console.log('P2PNetwork mock stopped');
  }

  getStats() {
    return { running: this.running, peers: this.peers };
  }
}
