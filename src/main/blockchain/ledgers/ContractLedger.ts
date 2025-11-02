// Sourceless Blockchain v0.13 - Contract Ledger
// Ledger for smart contracts and automated agreements

import { Blockchain } from '../core/Blockchain';
import { Transaction } from '../core/Transaction';
import { SmartContract } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class ContractLedger extends Blockchain {
  private contracts: Map<string, SmartContract>;

  constructor(difficulty: number = 3) {
    super('contract', difficulty);
    this.miningReward = 50;
    this.contracts = new Map();
  }

  // Deploy a new smart contract
  deployContract(
    creator: string,
    code: string,
    initialState: any = {},
    initialBalance: number = 0
  ): string | null {
    const contractId = uuidv4();
    const contractAddress = `contract_${contractId.substring(0, 8)}`;

    const contract: SmartContract = {
      id: contractId,
      address: contractAddress,
      creator,
      code,
      state: initialState,
      balance: initialBalance,
      createdAt: Date.now()
    };

    const transaction = new Transaction(
      creator,
      contractAddress,
      initialBalance,
      'contract',
      0.1,
      { type: 'deploy', contract }
    );

    if (this.addTransaction(transaction)) {
      this.contracts.set(contractId, contract);
      console.log(`Contract deployed at ${contractAddress}`);
      return contractAddress;
    }

    return null;
  }

  // Execute contract method
  executeContract(
    contractAddress: string,
    caller: string,
    method: string,
    params: any[] = [],
    value: number = 0
  ): boolean {
    const contract = this.getContractByAddress(contractAddress);

    if (!contract) {
      console.error('Contract not found');
      return false;
    }

    const transaction = new Transaction(
      caller,
      contractAddress,
      value,
      'contract',
      0.05,
      { type: 'execute', method, params }
    );

    if (this.addTransaction(transaction)) {
      // Simplified contract execution
      // In a real implementation, this would execute the contract code
      console.log(`Contract ${contractAddress} method ${method} executed by ${caller}`);
      return true;
    }

    return false;
  }

  // Get contract by address
  getContractByAddress(address: string): SmartContract | undefined {
    for (const contract of this.contracts.values()) {
      if (contract.address === address) {
        return contract;
      }
    }
    return undefined;
  }

  // Get all contracts by creator
  getContractsByCreator(creator: string): SmartContract[] {
    const creatorContracts: SmartContract[] = [];

    for (const contract of this.contracts.values()) {
      if (contract.creator === creator) {
        creatorContracts.push(contract);
      }
    }

    return creatorContracts;
  }

  // Update contract state (internal use)
  private updateContractState(contractAddress: string, newState: any): void {
    const contract = this.getContractByAddress(contractAddress);
    if (contract) {
      contract.state = { ...contract.state, ...newState };
      this.contracts.set(contract.id, contract);
    }
  }

  // Get contract ledger stats
  getContractLedgerStats() {
    const baseStats = this.getStats();
    let totalContractBalance = 0;

    for (const contract of this.contracts.values()) {
      totalContractBalance += contract.balance;
    }

    return {
      ...baseStats,
      totalContracts: this.contracts.size,
      totalContractBalance,
      ledgerType: 'Contract Ledger (Smart Contracts)'
    };
  }
}
