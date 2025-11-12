/**
 * Sourceless Feeless Transaction Interfaces
 * Core interfaces for the feeless transaction system
 */

// Core transaction interfaces
export interface TransactionRequest {
  type: 'contract_deployment' | 'function_call' | 'transfer' | 'ccoin_mint';
  from: string;
  to: string;
  data?: string;
  value: string; // Using string instead of BigNumber for serialization
  gasLimit?: number;
  nonce?: number;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  gasUsed: number;
  gasCost: number;
  sponsoredBy: string;
  ccoinMinted?: string;
  strDomainsRevenue?: string;
  contractAddress?: string;
  type: string;
  to: string;
  value?: string;
}

export interface DistributionRule {
  recipient: string;
  percentage: number;
  type: 'developer' | 'staker' | 'str_domains' | 'treasury';
}

export interface CCOINMintingConfig {
  contractAddress: string;
  mintingPercentage: number;
  triggerEvents: string[];
  distributionRules: DistributionRule[];
  strDomainsShare: number;
}

export interface ContractDeployment {
  compiledBytecode: string;
  constructorParams: string;
  userAddress: string;
  network: string;
  ccoinMintingEnabled: boolean;
  strDomainsIntegration: boolean;
}

export interface ContractDeploymentResult extends TransactionResult {
  contractAddress: string;
  ccoinIntegrationActive: boolean;
  strDomainsIntegrationActive: boolean;
  deploymentCost: number;
}

export interface SponsorshipRequest {
  type: string;
  gasEstimate: number;
  value: string;
  from: string;
}

export interface Sponsorship {
  sponsorAddress: string;
  maxGasCost: string;
  transactionType: string;
  timestamp: number;
  expiresAt: number;
  signature: string;
}

export interface SponsorshipRecord {
  transactionHash: string;
  gasUsed: number;
  sponsorAddress: string;
}

export interface ContractEvent {
  contractAddress: string;
  eventName: string;
  transactionHash: string;
  blockNumber: number;
  data: any;
}

export interface CCOINMintingParams {
  transactionHash: string;
  amount: string;
  triggerContract?: string;
  sourceAddress?: string;
  mintingReason: string;
}

export interface CCOINMintingResult {
  mintedAmount: string;
  transactionHash: string;
  distributedAmount: string;
  ccoinBalance: string;
}

export interface ContractRegistration {
  address: string;
  mintingPercentage: number;
  triggerEvents: string[];
  distributionRules: DistributionRule[];
}

export interface STRDomainsConfig {
  sharePercentage: number;
  automaticDistribution: boolean;
  ccoinMintingEnabled: boolean;
  expectedRevenue?: string;
  revenueType?: string;
}

export interface STRDomainsRevenueConfig {
  contractAddress: string;
  sharePercentage: number;
  automaticDistribution: boolean;
  ccoinMintingEnabled: boolean;
  expectedRevenue?: string;
  revenueType?: string;
}

export interface CCOINDistributionParams {
  amount: string;
  sourceTransaction?: string;
  sourceContract?: string;
  sourceEvent?: string;
}

export interface TransactionData {
  from: string;
  to: string;
  data?: string;
  value: string;
  gasLimit?: number;
  nonce: number;
  sponsor: string;
  type: string;
}

export interface CompiledContract {
  bytecode: string;
  abi: any[];
  gasEstimate: number;
  securityScore: number;
  ccoinIntegrationCode: string;
  strDomainsIntegrationCode: string;
}

export interface SecurityValidationResult {
  passed: boolean;
  errors: string[];
  score: number;
}

// Mock implementations for compilation
export class MockBigNumber {
  constructor(private value: string) {}
  
  static from(value: string | number): MockBigNumber {
    return new MockBigNumber(value.toString());
  }
  
  mul(other: MockBigNumber): MockBigNumber {
    return new MockBigNumber((parseFloat(this.value) * parseFloat(other.value)).toString());
  }
  
  div(other: MockBigNumber): MockBigNumber {
    return new MockBigNumber((parseFloat(this.value) / parseFloat(other.value)).toString());
  }
  
  add(other: MockBigNumber): MockBigNumber {
    return new MockBigNumber((parseFloat(this.value) + parseFloat(other.value)).toString());
  }
  
  gte(other: MockBigNumber): boolean {
    return parseFloat(this.value) >= parseFloat(other.value);
  }
  
  gt(other: MockBigNumber): boolean {
    return parseFloat(this.value) > parseFloat(other.value);
  }
  
  toString(): string {
    return this.value;
  }
}

// Export BigNumber as alias
export const BigNumber = MockBigNumber;