// Sourceless Blockchain v0.13 - Asset Ledger
// Ledger for NFTs, domain tokens, and digital assets

import { Blockchain } from '../core/Blockchain';
import { Transaction } from '../core/Transaction';
import { Domain } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class AssetLedger extends Blockchain {
  private domains: Map<string, Domain>;
  private nfts: Map<string, any>;

  constructor(difficulty: number = 3) {
    super('asset', difficulty);
    this.miningReward = 50; // Lower reward for asset ledger
    this.domains = new Map();
    this.nfts = new Map();
  }

  // Mint a new domain NFT
  mintDomain(
    owner: string,
    domainName: string,
    metadata: { title: string; description: string; avatar?: string }
  ): boolean {
    const domainId = uuidv4();
    const tokenId = uuidv4();

    const domain: Domain = {
      id: domainId,
      name: domainName,
      owner,
      metadata,
      createdAt: Date.now(),
      expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
      tokenId,
      isNFT: true,
      status: 'active'
    };

    // Create mint transaction
    const transaction = new Transaction(
      'system',
      owner,
      0, // No STR amount for minting
      'mint',
      0.1, // Small fee
      { type: 'domain', domain }
    );

    if (this.addTransaction(transaction)) {
      this.domains.set(domainId, domain);
      console.log(`Domain ${domainName} minted for ${owner}`);
      return true;
    }

    return false;
  }

  // Transfer domain ownership
  transferDomain(domainId: string, from: string, to: string): boolean {
    const domain = this.domains.get(domainId);

    if (!domain) {
      console.error('Domain not found');
      return false;
    }

    if (domain.owner !== from) {
      console.error('Not the domain owner');
      return false;
    }

    const transaction = new Transaction(
      from,
      to,
      0,
      'transfer',
      0.01,
      { type: 'domain-transfer', domainId }
    );

    if (this.addTransaction(transaction)) {
      domain.owner = to;
      this.domains.set(domainId, domain);
      console.log(`Domain ${domain.name} transferred to ${to}`);
      return true;
    }

    return false;
  }

  // Get all domains owned by an address
  getDomainsByOwner(owner: string): Domain[] {
    const ownedDomains: Domain[] = [];

    for (const domain of this.domains.values()) {
      if (domain.owner === owner) {
        ownedDomains.push(domain);
      }
    }

    return ownedDomains;
  }

  // Renew domain
  renewDomain(domainId: string, owner: string): boolean {
    const domain = this.domains.get(domainId);

    if (!domain || domain.owner !== owner) {
      return false;
    }

    domain.expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000);
    this.domains.set(domainId, domain);

    const transaction = new Transaction(
      owner,
      'system',
      10, // Renewal fee in STR
      'transfer',
      0.01,
      { type: 'domain-renewal', domainId }
    );

    return this.addTransaction(transaction);
  }

  // Get asset ledger stats
  getAssetLedgerStats() {
    const baseStats = this.getStats();
    return {
      ...baseStats,
      totalDomains: this.domains.size,
      totalNFTs: this.nfts.size,
      ledgerType: 'Asset Ledger (Domains & NFTs)'
    };
  }
}
