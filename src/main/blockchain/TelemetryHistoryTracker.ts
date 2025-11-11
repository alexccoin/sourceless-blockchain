// TelemetryHistoryTracker.ts
// Tracks historical telemetry data for nodes over time

import { NodeTelemetry } from './LiveTransactionGenerator';

export interface TelemetryHistoryEntry {
  timestamp: number;
  nodeId: string;
  telemetry: NodeTelemetry;
}

export interface TelemetrySnapshot {
  timestamp: number;
  nodes: NodeTelemetry[];
  summary: {
    totalNodes: number;
    activeNodes: number;
    averageCPU: number;
    averageMemory: number;
    averageUptime: number;
    averageReputation: number;
    averageLatency: number;
    totalConnections: number;
    totalBlocksMined: number;
    totalTransactionsProcessed: number;
  };
}

export class TelemetryHistoryTracker {
  private history: TelemetryHistoryEntry[] = [];
  private snapshots: TelemetrySnapshot[] = [];
  private maxHistoryEntries: number = 10000;
  private maxSnapshots: number = 1000;
  private snapshotInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startSnapshotCapture();
  }

  private startSnapshotCapture(): void {
    // Capture snapshot every 5 seconds
    this.snapshotInterval = setInterval(() => {
      // Snapshot will be created when telemetry is updated
    }, 5000);
  }

  recordTelemetry(nodeId: string, telemetry: NodeTelemetry): void {
    const entry: TelemetryHistoryEntry = {
      timestamp: Date.now(),
      nodeId,
      telemetry: { ...telemetry }
    };

    this.history.push(entry);

    // Keep only last N entries
    if (this.history.length > this.maxHistoryEntries) {
      this.history = this.history.slice(-this.maxHistoryEntries);
    }
  }

  recordSnapshot(nodes: NodeTelemetry[]): void {
    if (nodes.length === 0) return;

    const summary = {
      totalNodes: nodes.length,
      activeNodes: nodes.filter(n => n.isActive).length,
      averageCPU: nodes.reduce((sum, n) => sum + n.cpuUsage, 0) / nodes.length,
      averageMemory: nodes.reduce((sum, n) => sum + n.memoryUsage, 0) / nodes.length,
      averageUptime: nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length,
      averageReputation: nodes.reduce((sum, n) => sum + n.reputation, 0) / nodes.length,
      averageLatency: nodes.reduce((sum, n) => sum + n.networkLatency, 0) / nodes.length,
      totalConnections: nodes.reduce((sum, n) => sum + n.connections, 0),
      totalBlocksMined: nodes.reduce((sum, n) => sum + n.blocksMined, 0),
      totalTransactionsProcessed: nodes.reduce((sum, n) => sum + n.transactionsProcessed, 0)
    };

    const snapshot: TelemetrySnapshot = {
      timestamp: Date.now(),
      nodes: nodes.map(n => ({ ...n })),
      summary
    };

    this.snapshots.push(snapshot);

    // Keep only last N snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }
  }

  getNodeHistory(nodeId: string, limit: number = 100): TelemetryHistoryEntry[] {
    return this.history
      .filter(entry => entry.nodeId === nodeId)
      .slice(-limit);
  }

  getSnapshotHistory(limit: number = 100): TelemetrySnapshot[] {
    return this.snapshots.slice(-limit);
  }

  getNodeTelemetryOverTime(nodeId: string, timeWindow: number = 3600000): TelemetryHistoryEntry[] {
    const cutoff = Date.now() - timeWindow;
    return this.history.filter(
      entry => entry.nodeId === nodeId && entry.timestamp >= cutoff
    );
  }

  getNetworkMetricsOverTime(timeWindow: number = 3600000): TelemetrySnapshot[] {
    const cutoff = Date.now() - timeWindow;
    return this.snapshots.filter(snapshot => snapshot.timestamp >= cutoff);
  }

  getTelemetryTrends(nodeId?: string) {
    const entries = nodeId 
      ? this.getNodeHistory(nodeId, 100)
      : this.history.slice(-100);

    if (entries.length === 0) return null;

    const trends = {
      cpu: {
        current: entries[entries.length - 1]?.telemetry.cpuUsage || 0,
        average: entries.reduce((sum, e) => sum + e.telemetry.cpuUsage, 0) / entries.length,
        min: Math.min(...entries.map(e => e.telemetry.cpuUsage)),
        max: Math.max(...entries.map(e => e.telemetry.cpuUsage)),
        trend: 'stable' as 'increasing' | 'decreasing' | 'stable'
      },
      memory: {
        current: entries[entries.length - 1]?.telemetry.memoryUsage || 0,
        average: entries.reduce((sum, e) => sum + e.telemetry.memoryUsage, 0) / entries.length,
        min: Math.min(...entries.map(e => e.telemetry.memoryUsage)),
        max: Math.max(...entries.map(e => e.telemetry.memoryUsage)),
        trend: 'stable' as 'increasing' | 'decreasing' | 'stable'
      },
      uptime: {
        current: entries[entries.length - 1]?.telemetry.uptime || 0,
        average: entries.reduce((sum, e) => sum + e.telemetry.uptime, 0) / entries.length,
        min: Math.min(...entries.map(e => e.telemetry.uptime)),
        max: Math.max(...entries.map(e => e.telemetry.uptime)),
        trend: 'stable' as 'increasing' | 'decreasing' | 'stable'
      },
      latency: {
        current: entries[entries.length - 1]?.telemetry.networkLatency || 0,
        average: entries.reduce((sum, e) => sum + e.telemetry.networkLatency, 0) / entries.length,
        min: Math.min(...entries.map(e => e.telemetry.networkLatency)),
        max: Math.max(...entries.map(e => e.telemetry.networkLatency)),
        trend: 'stable' as 'increasing' | 'decreasing' | 'stable'
      }
    };

    // Calculate trends (comparing first half vs second half)
    if (entries.length > 2) {
      const mid = Math.floor(entries.length / 2);
      const firstHalfAvg = entries.slice(0, mid).reduce((sum, e) => sum + e.telemetry.cpuUsage, 0) / mid;
      const secondHalfAvg = entries.slice(mid).reduce((sum, e) => sum + e.telemetry.cpuUsage, 0) / (entries.length - mid);
      trends.cpu.trend = secondHalfAvg > firstHalfAvg * 1.1 ? 'increasing' : 
                         secondHalfAvg < firstHalfAvg * 0.9 ? 'decreasing' : 'stable';
    }

    return trends;
  }

  getAllHistory(): TelemetryHistoryEntry[] {
    return [...this.history];
  }

  getAllSnapshots(): TelemetrySnapshot[] {
    return [...this.snapshots];
  }

  destroy(): void {
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = null;
    }
  }
}

export default TelemetryHistoryTracker;

