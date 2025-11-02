// STRDomainRegistry.ts
// STR.domain registry, KYC/AML, and lifetime ownership system

interface STRDomain {
  name: string; // e.g., STR.username
  owner: string; // Wallet address
  kycVerified: boolean;
  createdAt: number;
  expiresAt: number | null; // null = lifetime
}

export class STRDomainRegistry {
  private domains: Map<string, STRDomain> = new Map();

  registerDomain(name: string, owner: string, kycVerified: boolean): STRDomain {
    if (this.domains.has(name)) throw new Error('Domain already registered');
    const domain: STRDomain = {
      name,
      owner,
      kycVerified,
      createdAt: Date.now(),
      expiresAt: null
    };
    this.domains.set(name, domain);
    return domain;
  }

  verifyKYC(name: string): boolean {
    const domain = this.domains.get(name);
    if (!domain) return false;
    domain.kycVerified = true;
    return true;
  }

  getDomain(name: string): STRDomain | undefined {
    return this.domains.get(name);
  }

  transferDomain(name: string, newOwner: string): boolean {
    const domain = this.domains.get(name);
    if (!domain) return false;
    domain.owner = newOwner;
    return true;
  }
}
