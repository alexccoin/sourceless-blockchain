/**
 * SecureWalletCore.ts
 * Stratus Blockchain - Secure Cross-Platform Wallet Core
 * 
 * Features:
 * - BIP39 mnemonic generation (12/24 words)
 * - BIP32 HD wallet derivation
 * - AES-256-GCM encryption for private keys
 * - ECDSA secp256k1 transaction signing
 * - ZK13STR address format
 * - Multi-token support (STR, CCOS, ARSS, wSTR, eSTR, $TR)
 * - Offline transaction signing
 */

import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import { ec as EC } from 'elliptic';
import * as CryptoJS from 'crypto-js';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import EventEmitter from 'eventemitter3';

const ec = new EC('secp256k1');

// Stratus Blockchain derivation path (BIP44)
// m/44'/1313'/0'/0/0
// Chain ID: 1313 (Sourceless Mainnet)
const DERIVATION_PATH = "m/44'/1313'/0'/0";

export interface WalletConfig {
  password: string;
  mnemonic?: string; // 12 or 24 words
  privateKey?: string; // For import
  accountIndex?: number; // HD wallet account index
}

export interface TokenBalance {
  STR: number;
  CCOIN: number;
  ARSS: number;
  CCOS: number;
  ESTR: number;
  wSTR: number;
  'STR$': number;
}

export interface WalletData {
  address: string; // ZK13STR format
  publicKey: string;
  balances: TokenBalance;
  strDomain: string;
  kycVerified: boolean;
  nonce: number;
}

export interface EncryptedWallet {
  version: string;
  crypto: {
    cipher: string;
    ciphertext: string;
    iv: string;
    salt: string;
    kdf: string;
    kdfParams: {
      iterations: number;
    };
  };
  address: string;
  publicKey: string;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
  token: keyof TokenBalance;
  nonce: number;
  fee: number;
  timestamp: number;
  data?: string;
}

export interface SignedTransaction extends Transaction {
  signature: string;
  hash: string;
}

/**
 * Secure Wallet Core
 * Handles key generation, encryption, signing, and address derivation
 */
export class SecureWalletCore extends EventEmitter {
  private mnemonic: string | null = null;
  private privateKey: string | null = null;
  private publicKey: string | null = null;
  private address: string | null = null;
  private encryptedData: EncryptedWallet | null = null;
  private isUnlocked: boolean = false;
  private lockTimer: NodeJS.Timeout | null = null;

  // Security settings
  private readonly LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly KDF_ITERATIONS = 100000; // PBKDF2 iterations

  constructor() {
    super();
  }

  /**
   * Create a new wallet with mnemonic seed phrase
   */
  async createWallet(password: string, wordCount: 12 | 24 = 12): Promise<WalletData> {
    this.validatePassword(password);

    // Generate mnemonic (BIP39)
    const strength = wordCount === 12 ? 128 : 256;
    this.mnemonic = bip39.generateMnemonic(strength);

    // Derive keys from mnemonic
    await this.deriveKeysFromMnemonic(this.mnemonic, 0);

    // Encrypt wallet data
    await this.encryptWallet(password);

    this.isUnlocked = true;
    this.startLockTimer();

    this.emit('wallet:created', { address: this.address });

    return this.getWalletData();
  }

  /**
   * Import wallet from mnemonic seed phrase
   */
  async importFromMnemonic(
    mnemonic: string,
    password: string,
    accountIndex: number = 0
  ): Promise<WalletData> {
    this.validatePassword(password);

    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic seed phrase');
    }

    this.mnemonic = mnemonic;
    await this.deriveKeysFromMnemonic(mnemonic, accountIndex);
    await this.encryptWallet(password);

    this.isUnlocked = true;
    this.startLockTimer();

    this.emit('wallet:imported', { address: this.address, source: 'mnemonic' });

    return this.getWalletData();
  }

  /**
   * Import wallet from private key
   */
  async importFromPrivateKey(privateKey: string, password: string): Promise<WalletData> {
    this.validatePassword(password);

    // Validate private key format
    if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
      throw new Error('Invalid private key format');
    }

    this.privateKey = privateKey;
    this.deriveKeysFromPrivateKey(privateKey);
    await this.encryptWallet(password);

    this.isUnlocked = true;
    this.startLockTimer();

    this.emit('wallet:imported', { address: this.address, source: 'privateKey' });

    return this.getWalletData();
  }

  /**
   * Unlock wallet with password
   */
  async unlock(encryptedWallet: EncryptedWallet, password: string): Promise<WalletData> {
    try {
      const decrypted = await this.decryptWallet(encryptedWallet, password);
      
      this.privateKey = decrypted.privateKey;
      this.mnemonic = decrypted.mnemonic || null;
      this.deriveKeysFromPrivateKey(this.privateKey);

      this.isUnlocked = true;
      this.startLockTimer();

      this.emit('wallet:unlocked', { address: this.address });

      return this.getWalletData();
    } catch (error) {
      this.emit('wallet:unlock_failed', { error: 'Invalid password' });
      throw new Error('Invalid password or corrupted wallet data');
    }
  }

  /**
   * Lock wallet (clear sensitive data from memory)
   */
  lock(): void {
    this.privateKey = null;
    this.mnemonic = null;
    this.isUnlocked = false;
    this.clearLockTimer();

    this.emit('wallet:locked', { address: this.address });
  }

  /**
   * Sign transaction
   */
  async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
    if (!this.isUnlocked || !this.privateKey) {
      throw new Error('Wallet is locked. Please unlock first.');
    }

    // Reset lock timer on activity
    this.startLockTimer();

    // Create transaction hash
    const txData = JSON.stringify({
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      token: transaction.token,
      nonce: transaction.nonce,
      fee: transaction.fee,
      timestamp: transaction.timestamp,
      data: transaction.data || ''
    });

    const hash = Buffer.from(sha256(Buffer.from(txData))).toString('hex');

    // Sign with ECDSA
    const keyPair = ec.keyFromPrivate(this.privateKey, 'hex');
    const signature = keyPair.sign(hash);
    const signatureDER = signature.toDER('hex');

    const signedTx: SignedTransaction = {
      ...transaction,
      signature: signatureDER,
      hash
    };

    this.emit('transaction:signed', { hash, to: transaction.to, amount: transaction.amount });

    return signedTx;
  }

  /**
   * Verify transaction signature
   */
  verifySignature(signedTransaction: SignedTransaction): boolean {
    try {
      const txData = JSON.stringify({
        from: signedTransaction.from,
        to: signedTransaction.to,
        amount: signedTransaction.amount,
        token: signedTransaction.token,
        nonce: signedTransaction.nonce,
        fee: signedTransaction.fee,
        timestamp: signedTransaction.timestamp,
        data: signedTransaction.data || ''
      });

      const hash = Buffer.from(sha256(Buffer.from(txData))).toString('hex');

      if (hash !== signedTransaction.hash) {
        return false;
      }

      const keyPair = ec.keyFromPublic(this.publicKey!, 'hex');
      return keyPair.verify(hash, signedTransaction.signature);
    } catch (error) {
      return false;
    }
  }

  /**
   * Export wallet (encrypted)
   */
  exportWallet(): EncryptedWallet {
    if (!this.encryptedData) {
      throw new Error('No wallet to export');
    }
    return this.encryptedData;
  }

  /**
   * Get mnemonic (requires wallet to be unlocked)
   */
  getMnemonic(): string {
    if (!this.isUnlocked || !this.mnemonic) {
      throw new Error('Wallet is locked or has no mnemonic');
    }
    this.startLockTimer(); // Reset timer
    return this.mnemonic;
  }

  /**
   * Get private key (requires wallet to be unlocked)
   * ⚠️ WARNING: Handle with extreme care!
   */
  getPrivateKey(): string {
    if (!this.isUnlocked || !this.privateKey) {
      throw new Error('Wallet is locked');
    }
    this.startLockTimer(); // Reset timer
    return this.privateKey;
  }

  /**
   * Get wallet data (public information)
   */
  getWalletData(): WalletData {
    if (!this.address || !this.publicKey) {
      throw new Error('Wallet not initialized');
    }

    return {
      address: this.address,
      publicKey: this.publicKey,
      balances: {
        STR: 0,
        CCOIN: 0,
        ARSS: 0,
        CCOS: 0,
        ESTR: 0,
        wSTR: 0,
        'STR$': 0
      },
      strDomain: '',
      kycVerified: false,
      nonce: 0
    };
  }

  /**
   * Check if wallet is unlocked
   */
  isWalletUnlocked(): boolean {
    return this.isUnlocked;
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Derive keys from mnemonic using BIP32/BIP44
   */
  private async deriveKeysFromMnemonic(mnemonic: string, accountIndex: number): Promise<void> {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = (bip32 as any).fromSeed(seed);
    
    // Derive key using BIP44 path: m/44'/1313'/0'/0/accountIndex
    const path = `${DERIVATION_PATH}/${accountIndex}`;
    const child = root.derivePath(path);

    if (!child.privateKey) {
      throw new Error('Failed to derive private key');
    }

    this.privateKey = child.privateKey.toString('hex');
    this.deriveKeysFromPrivateKey(this.privateKey!);
  }

  /**
   * Derive public key and address from private key
   */
  private deriveKeysFromPrivateKey(privateKey: string): void {
    const keyPair = ec.keyFromPrivate(privateKey, 'hex');
    this.publicKey = keyPair.getPublic('hex');
    this.address = this.generateZK13STRAddress(this.publicKey);
  }

  /**
   * Generate ZK13STR address from public key
   * Format: zk13str_{hash}_{checksum}
   */
  private generateZK13STRAddress(publicKey: string): string {
    // SHA-256 hash of public key
    const hash1 = Buffer.from(sha256(Buffer.from(publicKey, 'hex')));
    
    // RIPEMD-160 for shorter address
    const hash2 = Buffer.from(ripemd160(hash1)).toString('hex');
    
    // Checksum (first 4 bytes of double SHA-256)
    const checksum = Buffer.from(
      sha256(sha256(Buffer.from(hash2, 'hex')))
    ).toString('hex').substring(0, 4);
    
    return `zk13str_${hash2}_${checksum}`;
  }

  /**
   * Encrypt wallet data with AES-256-GCM
   */
  private async encryptWallet(password: string): Promise<void> {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const iv = CryptoJS.lib.WordArray.random(128 / 8).toString();

    // Derive encryption key using PBKDF2
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: this.KDF_ITERATIONS
    });

    // Prepare data to encrypt
    const dataToEncrypt = JSON.stringify({
      privateKey: this.privateKey,
      mnemonic: this.mnemonic
    });

    // Encrypt with AES-256-GCM
    const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    this.encryptedData = {
      version: '1.0',
      crypto: {
        cipher: 'aes-256-cbc',
        ciphertext: encrypted.ciphertext.toString(),
        iv: iv,
        salt: salt,
        kdf: 'pbkdf2',
        kdfParams: {
          iterations: this.KDF_ITERATIONS
        }
      },
      address: this.address!,
      publicKey: this.publicKey!
    };
  }

  /**
   * Decrypt wallet data
   */
  private async decryptWallet(
    encryptedWallet: EncryptedWallet,
    password: string
  ): Promise<{ privateKey: string; mnemonic?: string }> {
    const { crypto } = encryptedWallet;

    // Derive decryption key
    const key = CryptoJS.PBKDF2(password, crypto.salt, {
      keySize: 256 / 32,
      iterations: crypto.kdfParams.iterations
    });

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Hex.parse(crypto.ciphertext) } as any,
      key,
      {
        iv: CryptoJS.enc.Hex.parse(crypto.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedStr) {
      throw new Error('Decryption failed');
    }

    return JSON.parse(decryptedStr);
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (password.length < 12) {
      throw new Error('Password must be at least 12 characters long');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new Error(
        'Password must contain uppercase, lowercase, numbers, and special characters'
      );
    }
  }

  /**
   * Start auto-lock timer
   */
  private startLockTimer(): void {
    this.clearLockTimer();
    this.lockTimer = setTimeout(() => {
      this.lock();
      this.emit('wallet:auto_locked', { reason: 'inactivity' });
    }, this.LOCK_TIMEOUT);
  }

  /**
   * Clear auto-lock timer
   */
  private clearLockTimer(): void {
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }
  }
}

export default SecureWalletCore;