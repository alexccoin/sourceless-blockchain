/**
 * Validator Rewards System
 * Calculates and distributes rewards for personal validators
 * 
 * Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team
 * Copyright (c) 2024-2025 Alexandru Marius Stratulat
 */

interface RewardCalculation {
  storage: number; // STR tokens earned from storage contribution
  cpu: number; // STR tokens earned from CPU contribution
  bandwidth: number; // STR tokens earned from bandwidth contribution
  uptime: number; // Bonus from uptime
  contracts: number; // Earnings from hosting smart contracts
  total: number; // Total STR tokens earned
}

interface ValidatorMetrics {
  storageGB: number;
  cpuCores: number;
  cpuUsagePercent: number;
  bandwidthMbps: { upload: number; download: number };
  uptimePercent: number;
  contractsHosted: number;
  contractGasEarnings: number; // CCOS from contract executions
}

export class ValidatorRewards {
  // Reward rates (STR tokens per unit per month)
  private static readonly STORAGE_RATE = 0.1; // STR per GB per month
  private static readonly CPU_RATE = 0.5; // STR per core per month
  private static readonly BANDWIDTH_RATE = 0.01; // STR per Mbps per month
  private static readonly UPTIME_BONUS_THRESHOLD = 99; // % uptime for bonus
  private static readonly UPTIME_BONUS_MULTIPLIER = 1.1; // +10% bonus

  /**
   * Calculate monthly rewards for a validator
   */
  static calculateMonthlyRewards(metrics: ValidatorMetrics): RewardCalculation {
    // Storage contribution
    const storageReward = metrics.storageGB * this.STORAGE_RATE;

    // CPU contribution (adjusted by actual usage)
    const cpuReward = metrics.cpuCores * this.CPU_RATE * (metrics.cpuUsagePercent / 100);

    // Bandwidth contribution
    const avgBandwidth = (metrics.bandwidthMbps.upload + metrics.bandwidthMbps.download) / 2;
    const bandwidthReward = avgBandwidth * this.BANDWIDTH_RATE;

    // Base rewards
    const baseReward = storageReward + cpuReward + bandwidthReward;

    // Uptime bonus
    let uptimeBonus = 0;
    if (metrics.uptimePercent >= this.UPTIME_BONUS_THRESHOLD) {
      uptimeBonus = baseReward * (this.UPTIME_BONUS_MULTIPLIER - 1);
    }

    // Contract hosting earnings (from gas fees)
    const contractReward = metrics.contractGasEarnings;

    // Total rewards
    const total = baseReward + uptimeBonus + contractReward;

    return {
      storage: storageReward,
      cpu: cpuReward,
      bandwidth: bandwidthReward,
      uptime: uptimeBonus,
      contracts: contractReward,
      total
    };
  }

  /**
   * Calculate daily rewards (for real-time tracking)
   */
  static calculateDailyRewards(metrics: ValidatorMetrics): RewardCalculation {
    const monthlyRewards = this.calculateMonthlyRewards(metrics);
    const DAYS_PER_MONTH = 30;

    return {
      storage: monthlyRewards.storage / DAYS_PER_MONTH,
      cpu: monthlyRewards.cpu / DAYS_PER_MONTH,
      bandwidth: monthlyRewards.bandwidth / DAYS_PER_MONTH,
      uptime: monthlyRewards.uptime / DAYS_PER_MONTH,
      contracts: monthlyRewards.contracts / DAYS_PER_MONTH,
      total: monthlyRewards.total / DAYS_PER_MONTH
    };
  }

  /**
   * Calculate estimated annual rewards
   */
  static calculateAnnualRewards(metrics: ValidatorMetrics): RewardCalculation {
    const monthlyRewards = this.calculateMonthlyRewards(metrics);
    const MONTHS_PER_YEAR = 12;

    return {
      storage: monthlyRewards.storage * MONTHS_PER_YEAR,
      cpu: monthlyRewards.cpu * MONTHS_PER_YEAR,
      bandwidth: monthlyRewards.bandwidth * MONTHS_PER_YEAR,
      uptime: monthlyRewards.uptime * MONTHS_PER_YEAR,
      contracts: monthlyRewards.contracts * MONTHS_PER_YEAR,
      total: monthlyRewards.total * MONTHS_PER_YEAR
    };
  }

  /**
   * Calculate smart contract hosting fee distribution
   * 100 CCOS deployment fee split: 70% validators, 20% genesis, 10% dev
   */
  static calculateContractFeeDistribution(deploymentFee: number = 100): {
    validators: number;
    genesis: number;
    development: number;
  } {
    return {
      validators: deploymentFee * 0.7, // 70 CCOS to hosting validators
      genesis: deploymentFee * 0.2, // 20 CCOS to genesis network
      development: deploymentFee * 0.1 // 10 CCOS to development fund
    };
  }

  /**
   * Calculate rewards for hosting a smart contract
   * Contract replicated to 3 validators, fee split equally
   */
  static calculateContractHostingReward(deploymentFee: number = 100): number {
    const distribution = this.calculateContractFeeDistribution(deploymentFee);
    const NUM_HOSTING_VALIDATORS = 3;
    
    return distribution.validators / NUM_HOSTING_VALIDATORS; // ~23.33 CCOS per validator
  }

  /**
   * Calculate gas fee earnings from contract executions
   */
  static calculateGasEarnings(
    executionCount: number,
    avgGasFee: number = 0.1 // CCOS per execution
  ): number {
    return executionCount * avgGasFee;
  }

  /**
   * Estimate break-even time for validator investment
   */
  static estimateBreakEven(
    metrics: ValidatorMetrics,
    initialInvestment: number, // USD
    strPrice: number = 0.001 // USD per STR
  ): {
    monthlyEarningsUSD: number;
    breakEvenMonths: number;
    breakEvenDays: number;
  } {
    const monthlyRewards = this.calculateMonthlyRewards(metrics);
    const monthlyEarningsUSD = monthlyRewards.total * strPrice;
    const breakEvenMonths = initialInvestment / monthlyEarningsUSD;
    
    return {
      monthlyEarningsUSD,
      breakEvenMonths,
      breakEvenDays: breakEvenMonths * 30
    };
  }

  /**
   * Calculate total network rewards distribution
   */
  static calculateNetworkDistribution(
    totalPersonalValidators: number,
    avgMetrics: ValidatorMetrics
  ): {
    monthlyTotal: number;
    yearlyTotal: number;
    perValidator: number;
  } {
    const perValidator = this.calculateMonthlyRewards(avgMetrics).total;
    const monthlyTotal = perValidator * totalPersonalValidators;
    const yearlyTotal = monthlyTotal * 12;

    return {
      monthlyTotal,
      yearlyTotal,
      perValidator
    };
  }

  /**
   * Calculate validator rank based on contributions
   */
  static calculateValidatorRank(
    validatorMetrics: ValidatorMetrics,
    networkAverage: ValidatorMetrics
  ): {
    score: number; // 0-100
    rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    percentile: number;
  } {
    // Calculate contribution score
    const storageScore = (validatorMetrics.storageGB / networkAverage.storageGB) * 25;
    const cpuScore = (validatorMetrics.cpuCores / networkAverage.cpuCores) * 25;
    const bandwidthScore = (
      ((validatorMetrics.bandwidthMbps.upload + validatorMetrics.bandwidthMbps.download) / 2) /
      ((networkAverage.bandwidthMbps.upload + networkAverage.bandwidthMbps.download) / 2)
    ) * 25;
    const uptimeScore = (validatorMetrics.uptimePercent / 100) * 25;

    const score = Math.min(100, storageScore + cpuScore + bandwidthScore + uptimeScore);

    // Determine rank
    let rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    if (score >= 90) rank = 'diamond';
    else if (score >= 75) rank = 'platinum';
    else if (score >= 60) rank = 'gold';
    else if (score >= 40) rank = 'silver';
    else rank = 'bronze';

    return {
      score,
      rank,
      percentile: score
    };
  }

  /**
   * Calculate penalty for downtime
   */
  static calculateDowntimePenalty(
    targetUptime: number,
    actualUptime: number,
    baseReward: number
  ): {
    penalty: number; // STR tokens deducted
    penaltyPercent: number;
    finalReward: number;
  } {
    if (actualUptime >= targetUptime) {
      return { penalty: 0, penaltyPercent: 0, finalReward: baseReward };
    }

    const downtimePercent = targetUptime - actualUptime;
    const penaltyPercent = Math.min(100, downtimePercent * 2); // 2x penalty
    const penalty = baseReward * (penaltyPercent / 100);
    const finalReward = Math.max(0, baseReward - penalty);

    return {
      penalty,
      penaltyPercent,
      finalReward
    };
  }

  /**
   * Generate reward summary for display
   */
  static generateRewardSummary(
    metrics: ValidatorMetrics,
    period: 'daily' | 'monthly' | 'yearly' = 'monthly'
  ): string {
    let calculation: RewardCalculation;
    
    if (period === 'daily') {
      calculation = this.calculateDailyRewards(metrics);
    } else if (period === 'yearly') {
      calculation = this.calculateAnnualRewards(metrics);
    } else {
      calculation = this.calculateMonthlyRewards(metrics);
    }

    return `
╔══════════════════════════════════════════════════════════╗
║           VALIDATOR REWARDS SUMMARY (${period.toUpperCase()})           ║
╠══════════════════════════════════════════════════════════╣
║ Storage Contribution:     ${calculation.storage.toFixed(4)} STR
║ CPU Contribution:         ${calculation.cpu.toFixed(4)} STR
║ Bandwidth Contribution:   ${calculation.bandwidth.toFixed(4)} STR
║ Uptime Bonus:             ${calculation.uptime.toFixed(4)} STR
║ Contract Hosting:         ${calculation.contracts.toFixed(4)} CCOS
╠══════════════════════════════════════════════════════════╣
║ TOTAL EARNINGS:           ${calculation.total.toFixed(4)} STR
╚══════════════════════════════════════════════════════════╝
    `.trim();
  }
}

export default ValidatorRewards;
