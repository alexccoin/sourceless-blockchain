// Sourceless Blockchain v0.13 - Validator Node
import { ValidatorNode as ValidatorType } from '../../../shared/types';
import { Transaction } from './Transaction';
import { Block } from './Block';

export class Validator implements ValidatorType {
  public address: string;
  public stake: number;
  public reputation: number;
  public uptime: number;
  public lastBlock: number;
  public isActive: boolean;
  private startTime: number;

  constructor(address: string, initialStake: number = 0) {
    this.address = address;
    this.stake = initialStake;
    this.reputation = 100;
    this.uptime = 100;
    this.lastBlock = 0;
    this.isActive = true;
    this.startTime = Date.now();
  }

  // Add stake
  addStake(amount: number): void {
    if (amount > 0) {
      this.stake += amount;
      console.log(`Validator ${this.address} staked ${amount} STR`);
    }
  }

  // Remove stake
  removeStake(amount: number): boolean {
    if (amount > this.stake) {
      console.error('Insufficient stake');
      return false;
    }

    this.stake -= amount;
    console.log(`Validator ${this.address} unstaked ${amount} STR`);
    return true;
  }

  // Validate transaction
  validateTransaction(transaction: Transaction): boolean {
    if (!transaction.isValid()) {
      this.reputation = Math.max(0, this.reputation - 1);
      return false;
    }

    return true;
  }

  // Validate block
  validateBlock(block: Block): boolean {
    if (!block.isValid()) {
      this.reputation = Math.max(0, this.reputation - 5);
      return false;
    }

    if (!block.verifyTransactions()) {
      this.reputation = Math.max(0, this.reputation - 5);
      return false;
    }

    // Increase reputation for successful validation
    this.reputation = Math.min(100, this.reputation + 1);
    this.lastBlock = block.index;
    return true;
  }

  // Calculate uptime percentage
  calculateUptime(): number {
    const currentTime = Date.now();
    const totalTime = currentTime - this.startTime;
    // Simplified uptime calculation
    this.uptime = Math.min(100, (totalTime / (24 * 60 * 60 * 1000)) * 10);
    return this.uptime;
  }

  // Check if validator is eligible to propose next block
  isEligible(minStake: number = 1000): boolean {
    return (
      this.isActive &&
      this.stake >= minStake &&
      this.reputation >= 50 &&
      this.uptime >= 80
    );
  }

  // Get validator power (used in consensus)
  getValidatorPower(): number {
    return this.stake * (this.reputation / 100) * (this.uptime / 100);
  }

  // Deactivate validator
  deactivate(): void {
    this.isActive = false;
    console.log(`Validator ${this.address} deactivated`);
  }

  // Reactivate validator
  reactivate(): void {
    if (this.stake > 0) {
      this.isActive = true;
      console.log(`Validator ${this.address} reactivated`);
    }
  }

  // Get validator stats
  getStats() {
    return {
      address: this.address,
      stake: this.stake,
      reputation: this.reputation,
      uptime: this.calculateUptime(),
      lastBlock: this.lastBlock,
      isActive: this.isActive,
      validatorPower: this.getValidatorPower(),
      isEligible: this.isEligible()
    };
  }
}
