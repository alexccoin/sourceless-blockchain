/**
 * API Client for Stratus Blockchain
 * Connects to production blockchain server
 */

import axios, { AxiosInstance } from 'axios';
import { SignedTransaction, TokenBalance } from './SecureWalletCore';

export interface BlockchainStats {
  totalBlocks: number;
  totalTransactions: number;
  strSupply: number;
  ccosSupply: number;
  activePeers: number;
  networkHash: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  blockNumber?: number;
}

export class StratusAPIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3002') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get wallet balances
   */
  async getBalances(address: string): Promise<TokenBalance> {
    try {
      const response = await this.client.get(`/api/wallet/${address}/balances`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      throw new Error('Failed to fetch wallet balances');
    }
  }

  /**
   * Get wallet nonce (for transaction signing)
   */
  async getNonce(address: string): Promise<number> {
    try {
      const response = await this.client.get(`/api/wallet/${address}/nonce`);
      return response.data.nonce;
    } catch (error) {
      console.error('Failed to fetch nonce:', error);
      return 0;
    }
  }

  /**
   * Submit signed transaction
   */
  async submitTransaction(signedTx: SignedTransaction): Promise<TransactionStatus> {
    try {
      const response = await this.client.post('/api/transaction/submit', signedTx);
      return response.data;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw new Error('Failed to submit transaction');
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(hash: string): Promise<TransactionStatus> {
    try {
      const response = await this.client.get(`/api/transaction/${hash}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transaction status:', error);
      throw new Error('Transaction not found');
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(): Promise<BlockchainStats> {
    try {
      const response = await this.client.get('/api/blockchain/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch blockchain stats:', error);
      throw new Error('Failed to fetch blockchain statistics');
    }
  }

  /**
   * Get transaction history for address
   */
  async getTransactionHistory(
    address: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SignedTransaction[]> {
    try {
      const response = await this.client.get(`/api/wallet/${address}/transactions`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current gas price (transaction fees)
   */
  async getGasPrice(): Promise<number> {
    try {
      const response = await this.client.get('/api/gas-price');
      return response.data.gasPrice;
    } catch (error) {
      return 0.0001; // Default fee
    }
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(transaction: {
    from: string;
    to: string;
    amount: number;
    token: string;
  }): Promise<number> {
    try {
      const response = await this.client.post('/api/transaction/estimate-fee', transaction);
      return response.data.fee;
    } catch (error) {
      return 0.0001; // Default fee
    }
  }
}

export default StratusAPIClient;