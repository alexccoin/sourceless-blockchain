// WalletManager.ts
// Sourceless Blockchain v0.13 - Wallet Management System
// ZK13STR Address Format + STR.Domain Integration

import * as crypto from 'crypto';
import { ec as EC } from 'elliptic';
import { v4 as uuidv4 } from 'uuid';
import { Wallet, TokenBalance } from '../../../shared/types';

const ec = new EC('secp256k1'); // Same curve as Bitcoin/Ethereum

export interface WalletKeyPair {
  privateKey: string;
  publicKey: string;
  address: string; // ZK13STR format
  strDomain: string;
}

export class WalletManager {
  private wallets: Map<string, Wallet> = new Map();
  private keyPairs: Map<string, WalletKeyPair> = new Map();

  /**
   * Generate a new wallet with ZK13STR address format
   * ZK13STR format: zk13str_{hash}_{checksum}
   * @param strDomain - STR.domain name (e.g., STR.alexccoin)
   * @param kycVerified - Whether KYC/AML verification is completed
   */
  createWallet(strDomain: string, kycVerified: boolean = false): WalletKeyPair {
    // Generate ECDSA key pair (same as Bitcoin/Ethereum)
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate('hex');
    const publicKey = keyPair.getPublic('hex');

    // Generate ZK13STR address from public key
    const address = this.generateZK13STRAddress(publicKey);

    // Create wallet object
    const wallet: Wallet = {
      address,
      publicKey,
      balances: {
        STR: 0,
        CCOIN: 0,
        ARSS: 0,
        CCOS: 0,
        ESTR: 0,
        wSTR: 0,
        'STR$': 0
      },
      stakedAmount: 0,
      nonce: 0,
      domains: [strDomain],
      strDomain,
      kycVerified
    };

    // Store wallet and keypair
    this.wallets.set(address, wallet);
    const walletKeyPair: WalletKeyPair = {
      privateKey,
      publicKey,
      address,
      strDomain
    };
    this.keyPairs.set(address, walletKeyPair);

    console.log(`✅ Wallet created: ${address} (${strDomain})`);
    return walletKeyPair;
  }

  /**
   * Generate ZK13STR address format from public key
   * Format: zk13str_{hash}_{checksum}
   * Example: zk13str_a7b3c9d2e1f4a8b5c3d7e9f2a1b6c8d4_c4f2
   */
  private generateZK13STRAddress(publicKey: string): string {
    // Step 1: SHA-256 hash of public key
    const hash1 = crypto.createHash('sha256').update(publicKey).digest('hex');
    
    // Step 2: RIPEMD-160 hash for shorter address
    const hash2 = crypto.createHash('ripemd160').update(hash1).digest('hex');
    
    // Step 3: Generate checksum (first 4 bytes of double SHA-256)
    const checksum = crypto
      .createHash('sha256')
      .update(crypto.createHash('sha256').update(hash2).digest())
      .digest('hex')
      .substring(0, 4);
    
    // Step 4: Construct ZK13STR address
    return `zk13str_${hash2}_${checksum}`;
  }

  /**
   * Import existing wallet from private key
   */
  importWallet(privateKey: string, strDomain: string, kycVerified: boolean = false): WalletKeyPair {
    try {
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      const publicKey = keyPair.getPublic('hex');
      const address = this.generateZK13STRAddress(publicKey);

      const wallet: Wallet = {
        address,
        publicKey,
        balances: {
          STR: 0,
          CCOIN: 0,
          ARSS: 0,
          CCOS: 0,
          ESTR: 0,
          wSTR: 0,
          'STR$': 0
        },
        stakedAmount: 0,
        nonce: 0,
        domains: [strDomain],
        strDomain,
        kycVerified
      };

      this.wallets.set(address, wallet);
      const walletKeyPair: WalletKeyPair = {
        privateKey,
        publicKey,
        address,
        strDomain
      };
      this.keyPairs.set(address, walletKeyPair);

      console.log(`✅ Wallet imported: ${address} (${strDomain})`);
      return walletKeyPair;
    } catch (e) {
      throw new Error('Invalid private key');
    }
  }

  /**
   * Get wallet by address
   */
  getWallet(address: string): Wallet | undefined {
    return this.wallets.get(address);
  }

  /**
   * Get wallet by STR.domain
   */
  getWalletByDomain(strDomain: string): Wallet | undefined {
    for (const wallet of this.wallets.values()) {
      if (wallet.strDomain === strDomain) {
        return wallet;
      }
    }
    return undefined;
  }

  /**
   * Get private key for signing transactions
   */
  getPrivateKey(address: string): string | undefined {
    return this.keyPairs.get(address)?.privateKey;
  }

  /**
   * Update wallet balance (called by blockchain)
   */
  updateBalance(address: string, token: keyof TokenBalance, amount: number): void {
    const wallet = this.wallets.get(address);
    if (wallet) {
      wallet.balances[token] = amount;
      this.wallets.set(address, wallet);
    }
  }

  /**
   * Add to wallet balance
   */
  addBalance(address: string, token: keyof TokenBalance, amount: number): void {
    const wallet = this.wallets.get(address);
    if (wallet) {
      wallet.balances[token] += amount;
      this.wallets.set(address, wallet);
    }
  }

  /**
   * Get token balance
   */
  getTokenBalance(address: string, token: keyof TokenBalance): number {
    const wallet = this.wallets.get(address);
    return wallet?.balances[token] || 0;
  }

  /**
   * Get all token balances
   */
  getAllBalances(address: string): TokenBalance | null {
    const wallet = this.wallets.get(address);
    return wallet?.balances || null;
  }

  /**
   * Update staked amount (called by blockchain)
   */
  updateStakedAmount(address: string, stakedAmount: number): void {
    const wallet = this.wallets.get(address);
    if (wallet) {
      wallet.stakedAmount = stakedAmount;
      this.wallets.set(address, wallet);
    }
  }

  /**
   * Add cross-chain asset
   */
  addCrossChainAsset(address: string, blockchain: string, amount: number): void {
    const wallet = this.wallets.get(address);
    if (wallet) {
      if (!wallet.crossChainAssets) {
        wallet.crossChainAssets = {};
      }
      wallet.crossChainAssets[blockchain] = amount;
      this.wallets.set(address, wallet);
    }
  }

  /**
   * Verify KYC/AML for wallet
   */
  verifyKYC(address: string): boolean {
    const wallet = this.wallets.get(address);
    if (wallet) {
      wallet.kycVerified = true;
      this.wallets.set(address, wallet);
      console.log(`✅ KYC verified for ${address}`);
      return true;
    }
    return false;
  }

  /**
   * Get all wallets
   */
  getAllWallets(): Wallet[] {
    return Array.from(this.wallets.values());
  }

  /**
   * Export wallet (private key + metadata)
   * ⚠️ WARNING: Keep private keys secure!
   */
  exportWallet(address: string): { wallet: Wallet; privateKey: string } | null {
    const wallet = this.wallets.get(address);
    const keyPair = this.keyPairs.get(address);
    if (wallet && keyPair) {
      return {
        wallet,
        privateKey: keyPair.privateKey
      };
    }
    return null;
  }

  /**
   * Sign message with wallet private key
   */
  signMessage(address: string, message: string): string | null {
    const keyPair = this.keyPairs.get(address);
    if (!keyPair) return null;

    const hash = crypto.createHash('sha256').update(message).digest('hex');
    const sign = crypto.createSign('SHA256');
    sign.update(hash);
    sign.end();

    const ecKeyPair = ec.keyFromPrivate(keyPair.privateKey, 'hex');
    const signature = ecKeyPair.sign(hash);
    return signature.toDER('hex');
  }

  /**
   * Verify message signature
   */
  verifySignature(address: string, message: string, signature: string): boolean {
    const wallet = this.wallets.get(address);
    if (!wallet) return false;

    try {
      const hash = crypto.createHash('sha256').update(message).digest('hex');
      const ecKeyPair = ec.keyFromPublic(wallet.publicKey, 'hex');
      return ecKeyPair.verify(hash, signature);
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate mnemonic seed phrase (12 words) for wallet backup
   * Simplified version - in production use BIP39
   */
  generateMnemonic(): string {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid'
    ];
    const mnemonic: string[] = [];
    for (let i = 0; i < 12; i++) {
      mnemonic.push(words[Math.floor(Math.random() * words.length)]);
    }
    return mnemonic.join(' ');
  }
}
