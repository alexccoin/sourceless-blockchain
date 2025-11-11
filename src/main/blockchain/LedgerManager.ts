// LedgerManager.ts
// Sourceless Blockchain v0.13 - Multi-Ledger Manager
// Auto-initializes and manages all 5 ledgers with proper naming

import { MainLedger } from './ledgers/MainLedger';
import { AssetLedger } from './ledgers/AssetLedger';
import { ContractLedger } from './ledgers/ContractLedger';
import { GovernanceLedger } from './ledgers/GovernanceLedger';
import { CcoinLedger } from './ledgers/CcoinLedger';
import { CcosLedger } from './ledgers/CcosLedger';

export class LedgerManager {
  public mainLedger: MainLedger;
  public assetLedger: AssetLedger;
  public contractLedger: ContractLedger;
  public governanceLedger: GovernanceLedger;
  public ccoinLedger: CcoinLedger;
  public ccosLedger: CcosLedger;

  constructor() {
    console.log('🚀 Initializing Sourceless Multi-Ledger System...');

  // Initialize all ledgers
    this.mainLedger = new MainLedger(4); // Difficulty 4 for main ledger
    this.assetLedger = new AssetLedger(3); // Difficulty 3 for asset ledger
    this.contractLedger = new ContractLedger(3); // Difficulty 3 for contract ledger
    this.governanceLedger = new GovernanceLedger(2); // Difficulty 2 for governance ledger
    this.ccoinLedger = new CcoinLedger(3); // Difficulty 3 for cross-chain ledger
  this.ccosLedger = new CcosLedger(3); // Difficulty 3 for CCOS ledger

    console.log('✅ Main Ledger (STR Transfers) - initialized');
    console.log('✅ Asset Ledger (Domains & NFTs) - initialized');
    console.log('✅ Contract Ledger (Smart Contracts) - initialized');
    console.log('✅ Governance Ledger (DAO & Voting) - initialized');
  console.log('✅ CCOIN Ledger (Cross-Chain Bridge) - initialized');
  console.log('✅ CCOS Ledger (IgniteHex Platform) - initialized');
  }

  /**
   * Get comprehensive stats for all ledgers
   */
  getAllLedgerStats() {
    const main = this.mainLedger.getMainLedgerStats();
    const asset = this.assetLedger.getAssetLedgerStats();
    const contract = this.contractLedger.getContractLedgerStats();
    const governance = this.governanceLedger.getGovernanceLedgerStats();
    const ccoin = this.ccoinLedger.getCcoinLedgerStats();
    const ccos = this.ccosLedger.getCcosLedgerStats();

    const inChainTx =
      this.mainLedger.chain.reduce((s, b) => s + b.transactions.length, 0) +
      this.assetLedger.chain.reduce((s, b) => s + b.transactions.length, 0) +
      this.contractLedger.chain.reduce((s, b) => s + b.transactions.length, 0) +
      this.governanceLedger.chain.reduce((s, b) => s + b.transactions.length, 0) +
      this.ccosLedger.chain.reduce((s, b) => s + b.transactions.length, 0);

    const offChainTx = (ccoin.crossChainTxs || 0);

    return {
      main,
      asset,
      contract,
      governance,
      ccoin,
      ccos,
      inChainTx,
      offChainTx
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
    
    if (this.ccoinLedger.pendingTransactions.length > 0) {
      this.ccoinLedger.minePendingTransactions(minerAddress);
    }

    if (this.ccosLedger.pendingTransactions.length > 0) {
      this.ccosLedger.minePendingTransactions(minerAddress);
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
      this.governanceLedger.getBalance(address) +
      this.ccoinLedger.getBalance(address) +
      this.ccosLedger.getBalance(address)
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
      this.governanceLedger.isChainValid() &&
      this.ccoinLedger.isChainValid() &&
      this.ccosLedger.isChainValid()
    );
  }
}
