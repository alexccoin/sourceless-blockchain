/**
 * SecurityUtils.ts
 * Additional security utilities for wallet operations
 */

import * as CryptoJS from 'crypto-js';

export class SecurityUtils {
  /**
   * Generate secure random bytes
   */
  static generateSecureRandom(length: number): string {
    if (typeof globalThis !== 'undefined' && (globalThis as any).window?.crypto) {
      // Browser environment
      const array = new Uint8Array(length);
      (globalThis as any).window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js environment
      const crypto = require('crypto');
      return crypto.randomBytes(length).toString('hex');
    }
  }

  /**
   * Hash password for storage (not for encryption!)
   */
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const useSalt = salt || CryptoJS.lib.WordArray.random(128 / 8).toString();
    const hash = CryptoJS.PBKDF2(password, useSalt, {
      keySize: 256 / 32,
      iterations: 100000
    }).toString();

    return { hash, salt: useSalt };
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computed = this.hashPassword(password, salt);
    return computed.hash === hash;
  }

  /**
   * Secure memory cleanup (best effort)
   */
  static secureCleanup(data: any): void {
    if (typeof data === 'string') {
      // Overwrite string in memory (best effort)
      data = '0'.repeat(data.length);
    } else if (typeof data === 'object') {
      for (const key in data) {
        if (typeof data[key] === 'string') {
          data[key] = '0'.repeat(data[key].length);
        }
      }
    }
  }

  /**
   * Generate TOTP secret for 2FA
   */
  static generateTOTPSecret(): string {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += base32chars.charAt(Math.floor(Math.random() * base32chars.length));
    }
    return secret;
  }

  /**
   * Verify TOTP code
   */
  static verifyTOTP(secret: string, token: string, window: number = 1): boolean {
    const now = Math.floor(Date.now() / 1000 / 30);
    
    for (let i = -window; i <= window; i++) {
      const time = now + i;
      const expectedToken = this.generateTOTPToken(secret, time);
      if (expectedToken === token) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Generate TOTP token
   */
  private static generateTOTPToken(secret: string, time: number): string {
    // Simplified TOTP implementation
    // In production, use a proper TOTP library like 'otplib'
    const hmac = CryptoJS.HmacSHA1(time.toString(), secret);
    const hash = hmac.toString(CryptoJS.enc.Hex);
    const offset = parseInt(hash.slice(-1), 16);
    const binary = parseInt(hash.substr(offset * 2, 8), 16) & 0x7fffffff;
    const otp = (binary % 1000000).toString().padStart(6, '0');
    return otp;
  }

  /**
   * Validate ZK13STR address format
   */
  static validateZK13STRAddress(address: string): boolean {
    const regex = /^zk13str_[0-9a-f]{40}_[0-9a-f]{4}$/;
    if (!regex.test(address)) {
      return false;
    }

    // Verify checksum
    const parts = address.split('_');
    const hash = parts[1];
    const checksum = parts[2];

    const expectedChecksum = CryptoJS.SHA256(
      CryptoJS.SHA256(CryptoJS.enc.Hex.parse(hash)).toString()
    ).toString().substring(0, 4);

    return checksum === expectedChecksum;
  }

  /**
   * Detect root/jailbreak (mobile)
   */
  static isDeviceCompromised(): boolean {
    // This would be platform-specific
    // For React Native, use libraries like:
    // - react-native-device-info
    // - react-native-root-check
    
    if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
      // Check for common jailbreak indicators
      return false; // Placeholder
    }
    
    return false;
  }

  /**
   * Clear clipboard after timeout
   */
  static clearClipboardAfter(timeout: number = 30000): void {
    if (typeof globalThis !== 'undefined' && (globalThis as any).navigator?.clipboard) {
      setTimeout(() => {
        (globalThis as any).navigator.clipboard.writeText('');
      }, timeout);
    }
  }

  /**
   * Rate limiting helper
   */
  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map<string, number[]>();

    return {
      check: (key: string): boolean => {
        const now = Date.now();
        const userAttempts = attempts.get(key) || [];
        
        // Remove old attempts outside the window
        const recentAttempts = userAttempts.filter(time => now - time < windowMs);
        
        if (recentAttempts.length >= maxAttempts) {
          return false; // Rate limit exceeded
        }
        
        recentAttempts.push(now);
        attempts.set(key, recentAttempts);
        return true;
      },
      reset: (key: string): void => {
        attempts.delete(key);
      }
    };
  }

  /**
   * Anti-phishing visual hash
   * Generates a unique color pattern for addresses
   */
  static generateVisualHash(address: string): string[] {
    const hash = CryptoJS.SHA256(address).toString();
    const colors: string[] = [];
    
    for (let i = 0; i < 4; i++) {
      const hex = hash.substr(i * 6, 6);
      colors.push(`#${hex}`);
    }
    
    return colors;
  }

  /**
   * Transaction amount validation
   */
  static validateTransactionAmount(
    amount: number,
    balance: number,
    dailyLimit?: number,
    spentToday?: number
  ): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be positive' };
    }

    if (amount > balance) {
      return { valid: false, error: 'Insufficient balance' };
    }

    if (dailyLimit && spentToday !== undefined) {
      if (spentToday + amount > dailyLimit) {
        return { valid: false, error: 'Daily transaction limit exceeded' };
      }
    }

    return { valid: true };
  }
}

export default SecurityUtils;