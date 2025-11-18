/**
 * ResourceMonitor.ts
 * ==================
 * 
 * Continuous monitoring and coordination of all validator resources.
 * 
 * Features:
 * - Real-time resource usage tracking
 * - Performance metrics collection
 * - Uptime percentage calculation
 * - Anomaly detection and alerts
 * - Automated reward distribution
 * - Health checks and status reporting
 * 
 * Uptime Bonus: +10% rewards for validators with ≥99% uptime
 */

import * as crypto from 'crypto';
import { storageManager, StorageManager } from './StorageManager';
import { cpuManager, CPUManager } from './CPUManager';
import { bandwidthManager, BandwidthManager } from './BandwidthManager';

interface ValidatorHealth {
  validatorId: string;
  domain: string;
  status: 'healthy' | 'degraded' | 'offline';
  uptime: number; // percentage
  lastSeen: Date;
  issues: string[];
  performance: {
    storage: {
      totalGB: number;
      usedGB: number;
      utilizationPercent: number;
    };
    cpu: {
      coresAllocated: number;
      averageUsagePercent: number;
    };
    bandwidth: {
      uploadMbps: number;
      downloadMbps: number;
      averageLatencyMs: number;
    };
  };
}

interface ResourceSnapshot {
  timestamp: Date;
  validatorId: string;
  storage: {
    usedGB: number;
    availableGB: number;
  };
  cpu: {
    tasksRunning: number;
    usagePercent: number;
  };
  bandwidth: {
    uploadMbps: number;
    downloadMbps: number;
  };
}

interface UptimeRecord {
  validatorId: string;
  timestamp: Date;
  isOnline: boolean;
  responseTimeMs: number;
}

interface PerformanceAlert {
  alertId: string;
  validatorId: string;
  severity: 'warning' | 'critical';
  type: 'storage' | 'cpu' | 'bandwidth' | 'uptime';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface CombinedReward {
  validatorId: string;
  domain: string;
  period: {
    start: Date;
    end: Date;
  };
  breakdown: {
    storage: number;
    cpu: number;
    bandwidth: number;
    contractFees: number;
    subtotal: number;
    uptimeBonus: number;
    total: number;
  };
  uptime: number;
  performance: {
    storageUtilization: number;
    cpuUtilization: number;
    bandwidthTransferred: number;
  };
}

export class ResourceMonitor {
  private snapshots: ResourceSnapshot[] = [];
  private uptimeRecords: UptimeRecord[] = [];
  private alerts: PerformanceAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly UPTIME_BONUS_THRESHOLD = 99.0; // 99% uptime
  private readonly UPTIME_BONUS_PERCENTAGE = 10; // 10% bonus

  constructor(
    private storageManager: StorageManager,
    private cpuManager: CPUManager,
    private bandwidthManager: BandwidthManager
  ) {
    console.log('📊 ResourceMonitor initialized');
  }

  /**
   * Start continuous monitoring (every 5 minutes)
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      console.log('⚠️ Monitoring already running');
      return;
    }

    console.log('🔄 Starting resource monitoring...');

    // Initial snapshot
    this.captureSnapshots();

    // Run every 5 minutes
    this.monitoringInterval = setInterval(() => {
      this.captureSnapshots();
      this.checkValidatorHealth();
      this.detectAnomalies();
    }, 5 * 60 * 1000);

    console.log('✅ Resource monitoring started (5-minute intervals)');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('✅ Resource monitoring stopped');
    }
  }

  /**
   * Capture resource snapshots for all validators
   */
  private captureSnapshots(): void {
    const storageAllocations = this.storageManager.getAllAllocations();
    const cpuAllocations = this.cpuManager.getAllAllocations();
    const bandwidthAllocations = this.bandwidthManager.getAllAllocations();

    // Get unique validator IDs
    const validatorIds = new Set([
      ...storageAllocations.map(a => a.validatorId),
      ...cpuAllocations.map(a => a.validatorId),
      ...bandwidthAllocations.map(a => a.validatorId)
    ]);

    for (const validatorId of validatorIds) {
      const storageAlloc = this.storageManager.getStorageAllocation(validatorId);
      const cpuAlloc = this.cpuManager.getCPUAllocation(validatorId);
      const bandwidthAlloc = this.bandwidthManager.getBandwidthAllocation(validatorId);

      const snapshot: ResourceSnapshot = {
        timestamp: new Date(),
        validatorId,
        storage: {
          usedGB: storageAlloc?.usedGB || 0,
          availableGB: storageAlloc?.availableGB || 0
        },
        cpu: {
          tasksRunning: this.cpuManager.getValidatorTasks(validatorId)
            .filter(t => t.status === 'running').length,
          usagePercent: 0 // TODO: Calculate actual CPU usage
        },
        bandwidth: {
          uploadMbps: bandwidthAlloc?.uploadMbps || 0,
          downloadMbps: bandwidthAlloc?.downloadMbps || 0
        }
      };

      this.snapshots.push(snapshot);

      // Record uptime (simplified - assume online if snapshot captured)
      this.uptimeRecords.push({
        validatorId,
        timestamp: new Date(),
        isOnline: true,
        responseTimeMs: Math.random() * 100 // simulated
      });
    }

    // Keep only last 1000 snapshots
    if (this.snapshots.length > 1000) {
      this.snapshots = this.snapshots.slice(-1000);
    }

    // Keep only last 10000 uptime records
    if (this.uptimeRecords.length > 10000) {
      this.uptimeRecords = this.uptimeRecords.slice(-10000);
    }
  }

  /**
   * Check health status of all validators
   */
  private checkValidatorHealth(): void {
    const validatorHealths = this.getAllValidatorHealth();

    for (const health of validatorHealths) {
      // Check for degraded performance
      if (health.status === 'degraded') {
        console.log(`⚠️ Validator ${health.domain} is degraded: ${health.issues.join(', ')}`);
      }

      // Check for offline validators
      if (health.status === 'offline') {
        console.log(`❌ Validator ${health.domain} is offline`);
        this.createAlert(health.validatorId, 'critical', 'uptime', `Validator is offline`);
      }

      // Check for low uptime
      if (health.uptime < this.UPTIME_BONUS_THRESHOLD) {
        console.log(`⚠️ Validator ${health.domain} has low uptime: ${health.uptime.toFixed(2)}%`);
      }
    }
  }

  /**
   * Detect anomalies in resource usage
   */
  private detectAnomalies(): void {
    const storageStats = this.storageManager.getNetworkStorageStats();
    const cpuStats = this.cpuManager.getNetworkCPUStats();
    const bandwidthStats = this.bandwidthManager.getNetworkBandwidthStats();

    // Check for unusual patterns
    // TODO: Implement advanced anomaly detection

    // Simple threshold checks
    if (storageStats.averageUtilization > 90) {
      console.log(`⚠️ Network storage utilization high: ${storageStats.averageUtilization.toFixed(2)}%`);
    }

    if (cpuStats.averageUsagePercent > 80) {
      console.log(`⚠️ Network CPU usage high: ${cpuStats.averageUsagePercent.toFixed(2)}%`);
    }

    if (bandwidthStats.averageLatencyMs > 1000) {
      console.log(`⚠️ Network latency high: ${bandwidthStats.averageLatencyMs.toFixed(2)}ms`);
    }
  }

  /**
   * Create a performance alert
   */
  private createAlert(
    validatorId: string,
    severity: PerformanceAlert['severity'],
    type: PerformanceAlert['type'],
    message: string
  ): PerformanceAlert {
    const alert: PerformanceAlert = {
      alertId: crypto.randomUUID(),
      validatorId,
      severity,
      type,
      message,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(alert);
    return alert;
  }

  /**
   * Get health status for a specific validator
   */
  getValidatorHealth(validatorId: string): ValidatorHealth {
    const storageAlloc = this.storageManager.getStorageAllocation(validatorId);
    const cpuAlloc = this.cpuManager.getCPUAllocation(validatorId);
    const bandwidthAlloc = this.bandwidthManager.getBandwidthAllocation(validatorId);

    if (!storageAlloc && !cpuAlloc && !bandwidthAlloc) {
      throw new Error(`Validator ${validatorId} not found`);
    }

    const domain = storageAlloc?.domain || cpuAlloc?.domain || bandwidthAlloc?.domain || 'Unknown';

    // Calculate uptime
    const uptime = this.calculateUptime(validatorId);

    // Get recent snapshots
    const recentSnapshots = this.snapshots
      .filter(s => s.validatorId === validatorId)
      .slice(-20);

    const lastSeen = recentSnapshots.length > 0
      ? recentSnapshots[recentSnapshots.length - 1].timestamp
      : new Date(0);

    // Determine status
    const minutesSinceLastSeen = (Date.now() - lastSeen.getTime()) / (1000 * 60);
    let status: ValidatorHealth['status'] = 'healthy';
    const issues: string[] = [];

    if (minutesSinceLastSeen > 30) {
      status = 'offline';
      issues.push('No recent activity');
    } else if (uptime < 95) {
      status = 'degraded';
      issues.push('Low uptime');
    }

    // Check storage issues
    if (storageAlloc && storageAlloc.usedGB > storageAlloc.totalGB * 0.95) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push('Storage nearly full');
    }

    return {
      validatorId,
      domain,
      status,
      uptime,
      lastSeen,
      issues,
      performance: {
        storage: {
          totalGB: storageAlloc?.totalGB || 0,
          usedGB: storageAlloc?.usedGB || 0,
          utilizationPercent: storageAlloc
            ? (storageAlloc.usedGB / storageAlloc.totalGB) * 100
            : 0
        },
        cpu: {
          coresAllocated: cpuAlloc?.coresAllocated || 0,
          averageUsagePercent: 0 // TODO: Calculate from snapshots
        },
        bandwidth: {
          uploadMbps: bandwidthAlloc?.uploadMbps || 0,
          downloadMbps: bandwidthAlloc?.downloadMbps || 0,
          averageLatencyMs: this.bandwidthManager.getAverageLatency(validatorId)
        }
      }
    };
  }

  /**
   * Get health status for all validators
   */
  getAllValidatorHealth(): ValidatorHealth[] {
    const validatorIds = new Set([
      ...this.storageManager.getAllAllocations().map(a => a.validatorId),
      ...this.cpuManager.getAllAllocations().map(a => a.validatorId),
      ...this.bandwidthManager.getAllAllocations().map(a => a.validatorId)
    ]);

    return Array.from(validatorIds).map(id => this.getValidatorHealth(id));
  }

  /**
   * Calculate uptime percentage for a validator
   */
  calculateUptime(validatorId: string, periodDays: number = 30): number {
    const now = Date.now();
    const periodStart = now - (periodDays * 24 * 60 * 60 * 1000);

    const periodRecords = this.uptimeRecords.filter(
      record =>
        record.validatorId === validatorId &&
        record.timestamp.getTime() >= periodStart
    );

    if (periodRecords.length === 0) {
      return 0;
    }

    const onlineRecords = periodRecords.filter(r => r.isOnline).length;
    return (onlineRecords / periodRecords.length) * 100;
  }

  /**
   * Calculate combined rewards for a validator
   */
  calculateCombinedReward(validatorId: string, period: { start: Date; end: Date }): CombinedReward {
    const storageAlloc = this.storageManager.getStorageAllocation(validatorId);
    const cpuAlloc = this.cpuManager.getCPUAllocation(validatorId);
    const bandwidthAlloc = this.bandwidthManager.getBandwidthAllocation(validatorId);

    const domain = storageAlloc?.domain || cpuAlloc?.domain || bandwidthAlloc?.domain || 'Unknown';

    // Calculate individual rewards
    let storageReward = 0;
    let cpuReward = 0;
    let bandwidthReward = 0;

    if (storageAlloc) {
      const storageMetrics = this.storageManager.calculateStorageReward(validatorId, period);
      storageReward = storageMetrics.rewardEarned;
    }

    if (cpuAlloc) {
      const cpuMetrics = this.cpuManager.calculateCPUReward(validatorId, period);
      cpuReward = cpuMetrics.rewardEarned;
    }

    if (bandwidthAlloc) {
      const bandwidthMetrics = this.bandwidthManager.calculateBandwidthReward(validatorId, period);
      bandwidthReward = bandwidthMetrics.rewardEarned;
    }

    const subtotal = storageReward + cpuReward + bandwidthReward;

    // Calculate uptime bonus
    const daysInPeriod = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24);
    const uptime = this.calculateUptime(validatorId, Math.ceil(daysInPeriod));
    
    const uptimeBonus = uptime >= this.UPTIME_BONUS_THRESHOLD
      ? subtotal * (this.UPTIME_BONUS_PERCENTAGE / 100)
      : 0;

    const total = subtotal + uptimeBonus;

    return {
      validatorId,
      domain,
      period,
      breakdown: {
        storage: storageReward,
        cpu: cpuReward,
        bandwidth: bandwidthReward,
        contractFees: 0, // TODO: Calculate from SmartContractDeployer
        subtotal,
        uptimeBonus,
        total
      },
      uptime,
      performance: {
        storageUtilization: storageAlloc ? (storageAlloc.usedGB / storageAlloc.totalGB) * 100 : 0,
        cpuUtilization: 0, // TODO: Calculate actual CPU utilization
        bandwidthTransferred: 0 // TODO: Get from bandwidth manager
      }
    };
  }

  /**
   * Get network-wide resource statistics
   */
  getNetworkStats(): {
    totalValidators: number;
    healthyValidators: number;
    degradedValidators: number;
    offlineValidators: number;
    averageUptime: number;
    storage: ReturnType<StorageManager['getNetworkStorageStats']>;
    cpu: ReturnType<CPUManager['getNetworkCPUStats']>;
    bandwidth: ReturnType<BandwidthManager['getNetworkBandwidthStats']>;
    activeAlerts: number;
  } {
    const healthStatuses = this.getAllValidatorHealth();

    const healthyValidators = healthStatuses.filter(h => h.status === 'healthy').length;
    const degradedValidators = healthStatuses.filter(h => h.status === 'degraded').length;
    const offlineValidators = healthStatuses.filter(h => h.status === 'offline').length;

    const averageUptime = healthStatuses.length > 0
      ? healthStatuses.reduce((sum, h) => sum + h.uptime, 0) / healthStatuses.length
      : 0;

    const activeAlerts = this.alerts.filter(a => !a.resolved).length;

    return {
      totalValidators: healthStatuses.length,
      healthyValidators,
      degradedValidators,
      offlineValidators,
      averageUptime,
      storage: this.storageManager.getNetworkStorageStats(),
      cpu: this.cpuManager.getNetworkCPUStats(),
      bandwidth: this.bandwidthManager.getNetworkBandwidthStats(),
      activeAlerts
    };
  }

  /**
   * Get unresolved alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.alertId === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alert ${alertId} resolved`);
    }
  }

  /**
   * Get resource snapshots for a validator
   */
  getValidatorSnapshots(validatorId: string, count: number = 100): ResourceSnapshot[] {
    return this.snapshots
      .filter(s => s.validatorId === validatorId)
      .slice(-count);
  }
}

// Create singleton instance
const monitor = new ResourceMonitor(storageManager, cpuManager, bandwidthManager);

// Auto-start monitoring
monitor.startMonitoring();

export { monitor as resourceMonitor };
