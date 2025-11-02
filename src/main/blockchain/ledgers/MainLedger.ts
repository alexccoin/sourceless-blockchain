// Sourceless Blockchain v0.13 - Main Ledger
// The primary ledger for STR token transfers and basic transactions

import { Blockchain } from '../core/Blockchain';
import { Transaction } from '../core/Transaction';

export class MainLedger extends Blockchain {
  constructor(difficulty: number = 4) {
    super('main', difficulty);
    this.miningReward = 100; // STR tokens per block
  }

  // Transfer STR tokens
  transfer(from: string, to: string, amount: number, privateKey?: string): boolean {
    const transaction = new Transaction(from, to, amount, 'transfer');
    
    if (privateKey) {
      transaction.sign(privateKey);
    }

    return this.addTransaction(transaction);
  }

  // Get total supply
  getTotalSupply(): number {
    let supply = 0;

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.type === 'mint') {
          supply += tx.amount;
        }
      }
    }

    return supply;
  }

  // Get circulating supply (total - staked)
  getCirculatingSupply(): number {
    const totalSupply = this.getTotalSupply();
    let totalStaked = 0;

    // Calculate total staked across all addresses
    const addresses = new Set<string>();
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        addresses.add(tx.from);
        addresses.add(tx.to);
      }
    }

    for (const address of addresses) {
      totalStaked += this.getStakedAmount(address);
    }

    return totalSupply - totalStaked;
  }

  // Get ledger-specific stats
  getMainLedgerStats() {
    const baseStats = this.getStats();
    return {
      ...baseStats,
      totalSupply: this.getTotalSupply(),
      circulatingSupply: this.getCirculatingSupply(),
      // Rebranded: SourceLess Main Ledger is the STR Fuel of the ecosystem
      ledgerType: 'Fuel Ledger (STR Fuel)'
    };
  }
}
