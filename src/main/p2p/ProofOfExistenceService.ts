// ProofOfExistenceService.ts
// Liveliness as PoE: basic heartbeat and scoring

import { ProofOfExistence } from '../../shared/types';

export class ProofOfExistenceService {
  private activity: Map<string, number> = new Map();
  private reputation: Map<string, number> = new Map();

  constructor(private liveWindowMs: number = 60_000) {}

  updateActivity(address: string): void {
    this.activity.set(address, Date.now());
    const rep = (this.reputation.get(address) || 100);
    this.reputation.set(address, Math.min(100, rep + 0.1)); // slow growth
  }

  getPoE(address: string): ProofOfExistence {
    const last = this.activity.get(address) || 0;
    const now = Date.now();
    const isLive = now - last <= this.liveWindowMs;
    const rep = this.reputation.get(address) || 100;

    // zk13Score: simple function of freshness and reputation
    const freshness = Math.max(0, (this.liveWindowMs - (now - last)) / this.liveWindowMs);
    const zk13Score = Math.round((freshness * 50) + (rep * 0.5));

    return {
      address,
      lastActivity: last,
      isLive,
      zk13Score,
      reputation: rep
    };
  }
}
