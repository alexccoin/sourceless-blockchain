// Sourceless Blockchain v0.13 - Block Class
import * as crypto from 'crypto';
import { Block as BlockType } from '../../../shared/types';
import { Transaction as TransactionClass } from './Transaction';
import { ZkSnarkEngine } from '../../zkSnark/zkSnarkEngine';

export class Block implements BlockType {
  public index: number;
  public timestamp: number;
  public transactions: TransactionClass[];
  public previousHash: string;
  public hash: string;
  public nonce: number;
  public miner: string;
  public difficulty: number;
  public ledgerType: 'main' | 'asset' | 'contract' | 'governance';
  public zkProof?: string;
  public snarkData?: any;

  constructor(
    index: number,
  transactions: TransactionClass[],
    previousHash: string,
    miner: string,
    difficulty: number,
    ledgerType: 'main' | 'asset' | 'contract' | 'governance' = 'main'
  ) {
    this.index = index;
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.miner = miner;
    this.difficulty = difficulty;
    this.ledgerType = ledgerType;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  // Calculate hash of the block
  calculateHash(): string {
    const data = 
      this.index +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.previousHash +
      this.nonce +
      this.miner +
      this.difficulty +
      this.ledgerType;
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Mine block using Proof of Work
  mineBlock(difficulty: number): void {
    const target = '0'.repeat(difficulty);
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    
    console.log(`Block mined: ${this.hash} (${this.ledgerType} ledger)`);
  }

  // Verify block integrity
  isValid(): boolean {
    // Recalculate hash and compare
    const calculatedHash = this.calculateHash();
    if (calculatedHash !== this.hash) {
      return false;
    }

    // Verify difficulty requirement
    const target = '0'.repeat(this.difficulty);
    if (this.hash.substring(0, this.difficulty) !== target) {
      return false;
    }

    return true;
  }

  // Get block size in bytes
  getSize(): number {
    return Buffer.byteLength(JSON.stringify(this));
  }

  // Verify all transactions in the block
  verifyTransactions(): boolean {
    for (const tx of this.transactions) {
      // Basic transaction validation
      if (!tx.id || !tx.from || !tx.to || tx.amount <= 0) {
        return false;
      }
      // Signature verification would go here
    }
    return true;
  }

  async generateZkSnarkProof(circuitWasm: string, zkey: string) {
    // Generate zk-SNARK proof for this block
    const input = {
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      previousHash: this.previousHash,
      hash: this.hash,
      nonce: this.nonce,
      miner: this.miner,
      difficulty: this.difficulty,
      ledgerType: this.ledgerType
    };
    const { proof, publicSignals } = await ZkSnarkEngine.generateProof(input, circuitWasm, zkey);
    this.zkProof = JSON.stringify(proof);
    this.snarkData = publicSignals;
    return { proof, publicSignals };
  }

  async verifyZkSnarkProof(vkey: any) {
    if (!this.zkProof || !this.snarkData) return false;
    return await ZkSnarkEngine.verifyProof(vkey, this.snarkData, JSON.parse(this.zkProof));
  }
}
