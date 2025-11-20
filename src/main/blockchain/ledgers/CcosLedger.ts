// Sourceless Blockchain v0.13 - CCOS Ledger
// IgniteHex platform token ledger (CCOS)

import { Blockchain } from '../core/Blockchain';
import { Transaction } from '../core/Transaction';

export class CcosLedger extends Blockchain {
  constructor(difficulty: number = 3) {
    super('ccos', difficulty);
    this.miningReward = 15; // CCOS post mining base
  }

  /**
   * Post mine CCOS tokens based on PoE validation
   */
  postMint(to: string, amount: number, proofStrength: number): boolean {
    const tx = new Transaction(
      'system',
      to,
      amount,
      'mint',
      0.01,
      { type: 'ccos-mint' }
    );
    return this.addTransaction(tx);
  }

  /**
   * Transfer CCOS tokens between addresses
   */
  transfer(from: string, to: string, amount: number, fee: number = 0.01): boolean {
    const tx = new Transaction(
      from,
      to,
      amount,
      'transfer',
      fee,
      { type: 'ccos-transfer' }
    );
    return this.addTransaction(tx);
  }

  /**
   * Calculate total supply by summing minted amounts minus burns (if any)
   */
  getTotalSupply(): number {
    let supply = 0;
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.type === 'mint') {
          supply += tx.amount;
        }
        if (tx.data?.type === 'ccos-burn') {
          supply -= tx.amount;
        }
      }
    }
    return supply;
  }

  /**
   * Get CCOS ledger stats
   */
  getCcosLedgerStats() {
    const totalTx = this.chain.reduce((sum, b) => sum + b.transactions.length, 0);
    return {
      ledgerType: 'ccos' as const,
      blockHeight: this.chain.length,
      totalTransactions: totalTx,
      totalSupply: this.getTotalSupply(),
      miningReward: this.miningReward,
      difficulty: this.difficulty
    };
  }
}
