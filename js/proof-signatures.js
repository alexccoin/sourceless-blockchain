/**
 * Proof Cryptographic Signatures Module
 * 
 * © 2025 Sourceless Blockchain
 * Trademark & Patents: Alexander Horn (Str4tus)
 * Licensed under Sourceless Blockchain Custom License
 * 
 * Ed25519 digital signatures for identity proofs
 * Replay attack prevention via nonce tracking
 * Version: 1.0.0
 */

(function(global) {
  'use strict';

  /**
   * Simple Ed25519-like signature implementation
   * Note: For production, use a well-tested crypto library like tweetnacl or noble-ed25519
   */
  class ProofSignatureEngine {
    constructor() {
      this.keyPairs = new Map();
      this.verifiedSignatures = new Set();
      this.nonceTracker = new Map(); // Prevent replay attacks
      this.maxNonceAge = 3600000; // 1 hour in ms
    }

    /**
     * Generate a key pair for signing proofs
     * @param {string} identity - Identity ID
     * @returns {Object} Key pair with privateKey and publicKey
     */
    generateKeyPair(identity) {
      // Simplified key generation (browser-compatible)
      const privateKey = this._generateRandomKey();
      const publicKey = this._derivePublicKey(privateKey);
      
      const keyPair = { privateKey, publicKey, identity, created: Date.now() };
      this.keyPairs.set(identity, keyPair);
      
      return keyPair;
    }

    /**
     * Sign a proof object
     * @param {Object} proof - Proof to sign
     * @param {string} privateKey - Private key (hex string)
     * @returns {string} Signature (hex string)
     */
    signProof(proof, privateKey) {
      const message = this._serializeProof(proof);
      const signature = this._sign(message, privateKey);
      return signature;
    }

    /**
     * Verify a proof signature
     * @param {Object} proof - Proof with signature
     * @param {string} publicKey - Public key (hex string)
     * @returns {boolean} Valid signature
     */
    verifySignature(proof, publicKey) {
      if (!proof.signature) return false;
      
      // Check replay attack via nonce
      if (proof.nonce && this._isReplayAttack(proof.nonce, proof.identityId)) {
        console.warn('[ProofSignatures] Replay attack detected:', proof.nonce);
        return false;
      }
      
      const message = this._serializeProof(proof);
      const valid = this._verify(message, proof.signature, publicKey);
      
      if (valid && proof.nonce) {
        this._trackNonce(proof.nonce, proof.identityId);
      }
      
      return valid;
    }

    /**
     * Add signature to proof object
     * @param {Object} proof - Proof to sign
     * @param {string} identityId - Identity ID
     * @returns {Object} Signed proof
     */
    addSignatureToProof(proof, identityId) {
      let keyPair = this.keyPairs.get(identityId);
      
      if (!keyPair) {
        keyPair = this.generateKeyPair(identityId);
      }
      
      // Add nonce for replay protection
      proof.nonce = this._generateNonce();
      proof.signedAt = Date.now();
      
      // Sign
      proof.signature = this.signProof(proof, keyPair.privateKey);
      proof.publicKey = keyPair.publicKey;
      
      return proof;
    }

    /**
     * Batch verify multiple proofs
     * @param {Array} proofs - Array of proofs to verify
     * @returns {Object} Verification results
     */
    batchVerify(proofs) {
      const results = {
        total: proofs.length,
        valid: 0,
        invalid: 0,
        replayAttacks: 0,
        details: []
      };
      
      for (const proof of proofs) {
        if (!proof.publicKey || !proof.signature) {
          results.invalid++;
          results.details.push({ id: proof.id, valid: false, reason: 'Missing signature data' });
          continue;
        }
        
        const valid = this.verifySignature(proof, proof.publicKey);
        
        if (valid) {
          results.valid++;
          results.details.push({ id: proof.id, valid: true });
        } else {
          results.invalid++;
          const isReplay = proof.nonce && this._isReplayAttack(proof.nonce, proof.identityId);
          if (isReplay) results.replayAttacks++;
          results.details.push({ 
            id: proof.id, 
            valid: false, 
            reason: isReplay ? 'Replay attack' : 'Invalid signature' 
          });
        }
      }
      
      return results;
    }

    /**
     * Get key pair for identity
     * @param {string} identityId - Identity ID
     * @returns {Object|null} Key pair or null
     */
    getKeyPair(identityId) {
      return this.keyPairs.get(identityId) || null;
    }

    /**
     * Clean old nonces to prevent memory leak
     */
    cleanOldNonces() {
      const now = Date.now();
      for (const [nonce, data] of this.nonceTracker.entries()) {
        if (now - data.timestamp > this.maxNonceAge) {
          this.nonceTracker.delete(nonce);
        }
      }
    }

    // ===== PRIVATE METHODS =====

    _generateRandomKey() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    _derivePublicKey(privateKey) {
      // Simplified derivation (hash-based)
      const encoder = new TextEncoder();
      const data = encoder.encode(privateKey + ':public');
      return crypto.subtle.digest('SHA-256', data)
        .then(hash => Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, '0')).join(''));
    }

    _sign(message, privateKey) {
      // Simplified HMAC-like signing (browser-compatible)
      const encoder = new TextEncoder();
      const keyData = encoder.encode(privateKey);
      const msgData = encoder.encode(message);
      
      return crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(key => 
        crypto.subtle.sign('HMAC', key, msgData)
      ).then(signature => 
        Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0')).join('')
      );
    }

    _verify(message, signature, publicKey) {
      // Simplified verification
      // In production, use proper Ed25519 verification
      const encoder = new TextEncoder();
      const keyData = encoder.encode(publicKey);
      const msgData = encoder.encode(message);
      const sigData = new Uint8Array(signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      
      return crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      ).then(key => 
        crypto.subtle.verify('HMAC', key, sigData, msgData)
      ).catch(() => false);
    }

    _serializeProof(proof) {
      // Create deterministic string representation (exclude signature field)
      const sigFields = ['signature', 'publicKey', 'nonce', 'signedAt'];
      const dataToSign = {};
      
      for (const key in proof) {
        if (!sigFields.includes(key)) {
          dataToSign[key] = proof[key];
        }
      }
      
      return JSON.stringify(dataToSign, Object.keys(dataToSign).sort());
    }

    _generateNonce() {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `${timestamp}-${random}`;
    }

    _isReplayAttack(nonce, identityId) {
      const key = `${identityId}:${nonce}`;
      return this.nonceTracker.has(key);
    }

    _trackNonce(nonce, identityId) {
      const key = `${identityId}:${nonce}`;
      this.nonceTracker.set(key, { timestamp: Date.now() });
      
      // Clean old nonces periodically
      if (this.nonceTracker.size > 10000) {
        this.cleanOldNonces();
      }
    }
  }

  // Singleton instance
  const signatureEngine = new ProofSignatureEngine();

  // Clean nonces every 10 minutes
  setInterval(() => signatureEngine.cleanOldNonces(), 600000);

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProofSignatureEngine, signatureEngine };
  } else {
    global.ProofSignatureEngine = ProofSignatureEngine;
    global.signatureEngine = signatureEngine;
  }

})(typeof window !== 'undefined' ? window : global);
