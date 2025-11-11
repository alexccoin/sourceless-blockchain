// Sourceless Blockchain v0.13 - Transaction Class
import * as crypto from 'crypto';
import { Transaction as TransactionType, TransactionType as TxType } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class Transaction implements TransactionType {
  public id: string;
  public from: string;
  public to: string;
  public amount: number;
  public fee: number;
  public timestamp: number;
  public signature: string;
  public type: TxType;
  public data?: any;

  constructor(
    from: string,
    to: string,
    amount: number,
    type: TxType = 'transfer',
    fee: number = 0.001,
    data?: any
  ) {
    this.id = uuidv4();
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.fee = fee;
    this.type = type;
    this.timestamp = Date.now();
    this.data = data;
    this.signature = '';
  }

  // Calculate transaction hash
  calculateHash(): string {
    const data = 
      this.id +
      this.from +
      this.to +
      this.amount +
      this.fee +
      this.timestamp +
      this.type +
      JSON.stringify(this.data || {});
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Sign transaction (simplified version)
  sign(privateKey: string): void {
    const hash = this.calculateHash();
    const sign = crypto.createSign('SHA256');
    sign.update(hash);
    sign.end();
    this.signature = sign.sign(privateKey, 'hex');
  }

  // Verify transaction signature
  verifySignature(publicKey: string): boolean {
    if (!this.signature) {
      return false;
    }

    const hash = this.calculateHash();
    const verify = crypto.createVerify('SHA256');
    verify.update(hash);
    verify.end();

    try {
      return verify.verify(publicKey, this.signature, 'hex');
    } catch (error) {
      return false;
    }
  }

  // Validate transaction
  isValid(): boolean {
    // Basic validation
    if (!this.from || !this.to) {
      return false;
    }

    if (this.amount <= 0) {
      return false;
    }

    if (this.fee < 0) {
      return false;
    }

    // Type-specific validation
    switch (this.type) {
      case 'transfer':
        return this.from !== this.to;
      case 'stake':
      case 'unstake':
        return this.amount > 0;
      case 'mint':
        return this.from === 'system' && this.data;
      case 'contract':
        return this.data && this.data.code;
      case 'governance':
        return this.data && this.data.proposalId;
      default:
        return false;
    }
  }

  // Get transaction size
  getSize(): number {
    return Buffer.byteLength(JSON.stringify(this));
  }

  // Convert to JSON
  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      from: this.from,
      to: this.to,
      amount: this.amount,
      fee: this.fee,
      timestamp: this.timestamp,
      type: this.type,
      signature: this.signature,
      data: this.data
    });
  }
}
