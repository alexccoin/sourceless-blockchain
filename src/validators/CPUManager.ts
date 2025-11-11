/**
 * CPUManager.ts
 * =============
 * 
 * Manages CPU processing contributions from validators.
 * 
 * Features:
 * - CPU core allocation tracking
 * - Task distribution and scheduling
 * - CPU usage monitoring
 * - Performance benchmarking
 * - Reward calculation based on actual usage
 * 
 * Reward Rate: 0.5 STR per core per month (at 100% usage)
 * 
 * Example: 4 cores at 50% avg usage = 1 STR/month = ~12 STR/year
 */

import * as os from 'os';
import * as crypto from 'crypto';

interface CPUAllocation {
  validatorId: string;
  domain: string;
  coresAllocated: number;
  totalCores: number; // total CPU cores on system
  cpuModel: string;
  benchmarkScore: number; // relative performance score
  allocatedAt: Date;
  lastBenchmark: Date;
}

interface CPUTask {
  taskId: string;
  taskType: 'smart-contract' | 'computation' | 'validation' | 'mining';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string; // validator ID
  cpuTimeMs: number; // estimated CPU time
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

interface CPUUsageRecord {
  validatorId: string;
  timestamp: Date;
  coresUsed: number;
  usagePercent: number; // average usage across allocated cores
  tasksCompleted: number;
  cpuTimeMs: number;
}

interface CPUMetrics {
  validatorId: string;
  period: {
    start: Date;
    end: Date;
  };
  coresAllocated: number;
  averageUsagePercent: number;
  tasksCompleted: number;
  totalCpuTimeMs: number;
  rewardEarned: number; // STR
}

export class CPUManager {
  private allocations: Map<string, CPUAllocation> = new Map();
  private tasks: Map<string, CPUTask> = new Map();
  private usageRecords: CPUUsageRecord[] = [];
  private readonly REWARD_RATE_PER_CORE = 0.5; // STR per core per month at 100% usage

  constructor() {
    console.log('💻 CPUManager initialized');
    this.startUsageMonitoring();
  }

  /**
   * Register a validator's CPU contribution
   */
  async registerCPU(
    validatorId: string,
    domain: string,
    coresAllocated: number
  ): Promise<CPUAllocation> {
    console.log(`⚡ Registering ${coresAllocated} CPU cores for ${domain}...`);

    // Get system CPU info
    const cpus = os.cpus();
    const totalCores = cpus.length;
    const cpuModel = cpus[0]?.model || 'Unknown';

    if (coresAllocated > totalCores) {
      throw new Error(`Cannot allocate ${coresAllocated} cores (system has ${totalCores} cores)`);
    }

    // Run performance benchmark
    const benchmarkScore = await this.benchmarkCPU();

    const allocation: CPUAllocation = {
      validatorId,
      domain,
      coresAllocated,
      totalCores,
      cpuModel,
      benchmarkScore,
      allocatedAt: new Date(),
      lastBenchmark: new Date()
    };

    this.allocations.set(validatorId, allocation);

    console.log(`✅ CPU registered: ${coresAllocated} cores (${cpuModel})`);
    console.log(`   📊 Benchmark score: ${benchmarkScore}`);
    console.log(`   💰 Potential earnings: ${this.calculateMonthlyReward(coresAllocated)} STR/month (at 100% usage)`);

    return allocation;
  }

  /**
   * Benchmark CPU performance
   */
  private async benchmarkCPU(): Promise<number> {
    console.log('🔬 Running CPU benchmark...');

    const startTime = Date.now();
    let iterations = 0;

    // Perform CPU-intensive calculation for 100ms
    const endTime = startTime + 100;
    while (Date.now() < endTime) {
      // SHA-256 hashing is a good CPU benchmark
      crypto.createHash('sha256').update(`benchmark${iterations}`).digest('hex');
      iterations++;
    }

    // Score = iterations per millisecond
    const score = iterations / 100;

    console.log(`✅ Benchmark complete: ${score.toFixed(0)} iterations/ms`);
    return score;
  }

  /**
   * Create a new CPU task
   */
  createTask(
    taskType: CPUTask['taskType'],
    priority: CPUTask['priority'],
    estimatedCpuTimeMs: number,
    taskData?: any
  ): CPUTask {
    const task: CPUTask = {
      taskId: crypto.randomUUID(),
      taskType,
      priority,
      assignedTo: '', // will be assigned by scheduler
      cpuTimeMs: estimatedCpuTimeMs,
      status: 'pending',
      createdAt: new Date()
    };

    this.tasks.set(task.taskId, task);
    console.log(`📋 Task created: ${task.taskId} (${taskType}, ${priority} priority)`);

    // Automatically assign task to best available validator
    this.scheduleTask(task.taskId);

    return task;
  }

  /**
   * Schedule a task to the best available validator
   */
  private scheduleTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Select validator based on:
    // 1. Current load (prefer less busy validators)
    // 2. Benchmark score (prefer faster CPUs for high-priority tasks)
    // 3. Task type specialization (if applicable)

    const availableValidators = Array.from(this.allocations.entries())
      .filter(([_, allocation]) => allocation.coresAllocated > 0);

    if (availableValidators.length === 0) {
      console.error(`⚠️ No validators available for task ${taskId}`);
      return;
    }

    // Simple scheduling: pick validator with highest benchmark score
    availableValidators.sort((a, b) => b[1].benchmarkScore - a[1].benchmarkScore);
    const [selectedValidatorId, _] = availableValidators[0];

    task.assignedTo = selectedValidatorId;
    console.log(`   ✅ Task assigned to ${this.allocations.get(selectedValidatorId)?.domain}`);
  }

  /**
   * Execute a task on an assigned validator
   */
  async executeTask(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (!task.assignedTo) {
      throw new Error(`Task ${taskId} has no assigned validator`);
    }

    const allocation = this.allocations.get(task.assignedTo);
    if (!allocation) {
      throw new Error(`Validator ${task.assignedTo} not found`);
    }

    console.log(`🔄 Executing task ${taskId} on ${allocation.domain}...`);

    task.status = 'running';
    task.startedAt = new Date();

    try {
      // Simulate task execution based on type
      const result = await this.simulateTaskExecution(task);

      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;

      // Record CPU usage
      this.recordCPUUsage(task);

      console.log(`✅ Task ${taskId} completed on ${allocation.domain}`);
      return result;
    } catch (error: any) {
      task.status = 'failed';
      task.completedAt = new Date();
      task.error = error.message;

      console.error(`❌ Task ${taskId} failed on ${allocation.domain}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simulate task execution (placeholder for actual work)
   */
  private async simulateTaskExecution(task: CPUTask): Promise<any> {
    // Simulate CPU work based on task type
    switch (task.taskType) {
      case 'smart-contract':
        return await this.executeSmartContract(task);
      
      case 'computation':
        return await this.executeComputation(task);
      
      case 'validation':
        return await this.executeValidation(task);
      
      case 'mining':
        return await this.executeMining(task);
      
      default:
        throw new Error(`Unknown task type: ${task.taskType}`);
    }
  }

  private async executeSmartContract(task: CPUTask): Promise<any> {
    // Simulate smart contract execution
    await this.sleep(task.cpuTimeMs);
    return {
      gasUsed: Math.floor(Math.random() * 100000),
      output: 'Contract executed successfully'
    };
  }

  private async executeComputation(task: CPUTask): Promise<any> {
    // Simulate computational work
    await this.sleep(task.cpuTimeMs);
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i);
    }
    return { result };
  }

  private async executeValidation(task: CPUTask): Promise<any> {
    // Simulate block/transaction validation
    await this.sleep(task.cpuTimeMs);
    return {
      valid: true,
      signatures: 1313,
      timestamp: new Date()
    };
  }

  private async executeMining(task: CPUTask): Promise<any> {
    // Simulate mining/consensus work
    await this.sleep(task.cpuTimeMs);
    const nonce = Math.floor(Math.random() * 1000000);
    const hash = crypto.createHash('sha256').update(`block${nonce}`).digest('hex');
    return { nonce, hash };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Record CPU usage after task completion
   */
  private recordCPUUsage(task: CPUTask): void {
    if (!task.startedAt || !task.completedAt) {
      return;
    }

    const actualCpuTimeMs = task.completedAt.getTime() - task.startedAt.getTime();
    const allocation = this.allocations.get(task.assignedTo);
    
    if (!allocation) {
      return;
    }

    // Estimate cores used (simplified)
    const coresUsed = Math.min(allocation.coresAllocated, 1);
    const usagePercent = (actualCpuTimeMs / (actualCpuTimeMs + 100)) * 100; // simplified

    const record: CPUUsageRecord = {
      validatorId: task.assignedTo,
      timestamp: new Date(),
      coresUsed,
      usagePercent,
      tasksCompleted: 1,
      cpuTimeMs: actualCpuTimeMs
    };

    this.usageRecords.push(record);
  }

  /**
   * Start monitoring CPU usage (runs every 5 minutes)
   */
  private startUsageMonitoring(): void {
    setInterval(() => {
      this.monitorCPUUsage();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Monitor current CPU usage for all validators
   */
  private monitorCPUUsage(): void {
    for (const [validatorId, allocation] of this.allocations.entries()) {
      // Count running tasks
      const runningTasks = Array.from(this.tasks.values())
        .filter(task => task.assignedTo === validatorId && task.status === 'running');

      if (runningTasks.length > 0) {
        const record: CPUUsageRecord = {
          validatorId,
          timestamp: new Date(),
          coresUsed: Math.min(runningTasks.length, allocation.coresAllocated),
          usagePercent: (runningTasks.length / allocation.coresAllocated) * 100,
          tasksCompleted: 0,
          cpuTimeMs: 0
        };

        this.usageRecords.push(record);
      }
    }
  }

  /**
   * Calculate CPU rewards for a validator
   */
  calculateCPUReward(validatorId: string, period: { start: Date; end: Date }): CPUMetrics {
    const allocation = this.allocations.get(validatorId);
    if (!allocation) {
      throw new Error(`Validator ${validatorId} not found`);
    }

    // Get usage records for this period
    const periodRecords = this.usageRecords.filter(
      record =>
        record.validatorId === validatorId &&
        record.timestamp >= period.start &&
        record.timestamp <= period.end
    );

    if (periodRecords.length === 0) {
      return {
        validatorId,
        period,
        coresAllocated: allocation.coresAllocated,
        averageUsagePercent: 0,
        tasksCompleted: 0,
        totalCpuTimeMs: 0,
        rewardEarned: 0
      };
    }

    const averageUsagePercent =
      periodRecords.reduce((sum, r) => sum + r.usagePercent, 0) / periodRecords.length;

    const tasksCompleted = periodRecords.reduce((sum, r) => sum + r.tasksCompleted, 0);

    const totalCpuTimeMs = periodRecords.reduce((sum, r) => sum + r.cpuTimeMs, 0);

    // Calculate reward based on average usage
    const daysInPeriod = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24);
    const monthsInPeriod = daysInPeriod / 30;

    const rewardEarned =
      allocation.coresAllocated *
      this.REWARD_RATE_PER_CORE *
      (averageUsagePercent / 100) *
      monthsInPeriod;

    return {
      validatorId,
      period,
      coresAllocated: allocation.coresAllocated,
      averageUsagePercent,
      tasksCompleted,
      totalCpuTimeMs,
      rewardEarned
    };
  }

  /**
   * Calculate monthly reward for CPU allocation
   */
  private calculateMonthlyReward(cores: number): number {
    return cores * this.REWARD_RATE_PER_CORE;
  }

  /**
   * Get CPU allocation for a validator
   */
  getCPUAllocation(validatorId: string): CPUAllocation | undefined {
    return this.allocations.get(validatorId);
  }

  /**
   * Get all CPU allocations
   */
  getAllAllocations(): CPUAllocation[] {
    return Array.from(this.allocations.values());
  }

  /**
   * Get network-wide CPU statistics
   */
  getNetworkCPUStats(): {
    totalValidators: number;
    totalCoresAllocated: number;
    averageBenchmarkScore: number;
    totalTasksCompleted: number;
    averageUsagePercent: number;
  } {
    const allocations = this.getAllAllocations();

    const totalCoresAllocated = allocations.reduce((sum, a) => sum + a.coresAllocated, 0);

    const averageBenchmarkScore =
      allocations.length > 0
        ? allocations.reduce((sum, a) => sum + a.benchmarkScore, 0) / allocations.length
        : 0;

    const completedTasks = Array.from(this.tasks.values()).filter(
      task => task.status === 'completed'
    );

    const recentRecords = this.usageRecords.slice(-100); // last 100 records
    const averageUsagePercent =
      recentRecords.length > 0
        ? recentRecords.reduce((sum, r) => sum + r.usagePercent, 0) / recentRecords.length
        : 0;

    return {
      totalValidators: allocations.length,
      totalCoresAllocated,
      averageBenchmarkScore,
      totalTasksCompleted: completedTasks.length,
      averageUsagePercent
    };
  }

  /**
   * Get task status
   */
  getTask(taskId: string): CPUTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks for a validator
   */
  getValidatorTasks(validatorId: string): CPUTask[] {
    return Array.from(this.tasks.values()).filter(task => task.assignedTo === validatorId);
  }

  /**
   * Get pending tasks count
   */
  getPendingTasksCount(): number {
    return Array.from(this.tasks.values()).filter(task => task.status === 'pending').length;
  }
}

// Singleton instance
export const cpuManager = new CPUManager();
