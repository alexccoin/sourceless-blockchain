// LedgerManager.ts
// Sourceless Blockchain v0.13 - Multi-Ledger Manager
// Auto-initializes and manages all 4 ledgers with proper naming

import { MainLedger } from './ledgers/MainLedger';
import { AssetLedger } from './ledgers/AssetLedger';
import { ContractLedger } from './ledgers/ContractLedger';
import { GovernanceLedger } from './ledgers/GovernanceLedger';

export class LedgerManager {
  public mainLedger: MainLedger;
  public assetLedger: AssetLedger;
  public contractLedger: ContractLedger;
  public governanceLedger: GovernanceLedger;

  constructor() {
    console.log('🚀 Initializing Sourceless Multi-Ledger System...');

    // Initialize all 4 ledgers
    this.mainLedger = new MainLedger(4); // Difficulty 4 for main ledger
    this.assetLedger = new AssetLedger(3); // Difficulty 3 for asset ledger
    this.contractLedger = new ContractLedger(3); // Difficulty 3 for contract ledger
    this.governanceLedger = new GovernanceLedger(2); // Difficulty 2 for governance ledger

    console.log('✅ Main Ledger (STR Transfers) - initialized');
    console.log('✅ Asset Ledger (Domains & NFTs) - initialized');
    console.log('✅ Contract Ledger (Smart Contracts) - initialized');
    console.log('✅ Governance Ledger (DAO & Voting) - initialized');
  }

  /**
   * Get comprehensive stats for all ledgers
   */
  getAllLedgerStats() {
    return {
      main: this.mainLedger.getMainLedgerStats(),
      asset: this.assetLedger.getAssetLedgerStats(),
      contract: this.contractLedger.getContractLedgerStats(),
      governance: this.governanceLedger.getGovernanceLedgerStats()
    };
  }

  /**
   * Mine pending transactions on all ledgers
   */
  mineAllPendingTransactions(minerAddress: string) {
    console.log(`⛏️  Mining pending transactions for all ledgers...`);
    
    if (this.mainLedger.pendingTransactions.length > 0) {
      this.mainLedger.minePendingTransactions(minerAddress);
    }
    
    if (this.assetLedger.pendingTransactions.length > 0) {
      this.assetLedger.minePendingTransactions(minerAddress);
    }
    
    if (this.contractLedger.pendingTransactions.length > 0) {
      this.contractLedger.minePendingTransactions(minerAddress);
    }
    
    if (this.governanceLedger.pendingTransactions.length > 0) {
      this.governanceLedger.minePendingTransactions(minerAddress);
    }
  }

  /**
   * Get total balance across all ledgers for an address
   */
  getTotalBalance(address: string): number {
    return (
      this.mainLedger.getBalance(address) +
      this.assetLedger.getBalance(address) +
      this.contractLedger.getBalance(address) +
      this.governanceLedger.getBalance(address)
    );
  }

  /**
   * Validate all chains
   */
  validateAllChains(): boolean {
    return (
      this.mainLedger.isChainValid() &&
      this.assetLedger.isChainValid() &&
      this.contractLedger.isChainValid() &&
      this.governanceLedger.isChainValid()
    );
  }
}
