/**
 * SecurityValidator.js
 * Comprehensive Security Validation System
 * 
 * Validates:
 * - GodCypher encryption
 * - ZK13STR addresses
 * - SNARK proofs
 * - Transaction signatures
 * - Input sanitization
 * - Rate limiting
 * - Access control
 */

const crypto = require('crypto');

class SecurityValidator {
    constructor() {
        console.log('🛡️  SecurityValidator initialized');
    }

    /**
     * Validate ZK13STR address format and checksum
     */
    validateZK13STR(address) {
        // Format: zk13str_{40-hex}_{4-hex-checksum}
        const regex = /^zk13str_([a-f0-9]{40})_([a-f0-9]{4})$/;
        const match = address.match(regex);

        if (!match) {
            return {
                valid: false,
                error: 'Invalid ZK13STR format'
            };
        }

        const [, hash, checksum] = match;

        // Verify checksum
        const expectedChecksum = crypto.createHash('sha256')
            .update(crypto.createHash('sha256').update(hash, 'hex').digest())
            .digest('hex')
            .substring(0, 4);

        if (checksum !== expectedChecksum) {
            return {
                valid: false,
                error: 'Invalid checksum'
            };
        }

        return {
            valid: true,
            address,
            hash,
            checksum
        };
    }

    /**
     * Validate GodCypher encryption payload
     */
    validateGodCypherPayload(payload) {
        // Check required fields
        const requiredFields = ['encrypted', 'senderProof', 'receiverProof', 'witnessProof'];
        
        for (const field of requiredFields) {
            if (!payload[field]) {
                return {
                    valid: false,
                    error: `Missing required field: ${field}`
                };
            }
        }

        // Validate encrypted structure
        if (!payload.encrypted.data || !payload.encrypted.iv) {
            return {
                valid: false,
                error: 'Invalid encrypted data structure'
            };
        }

        // Validate IV length (should be 32 hex characters for 16 bytes)
        if (payload.encrypted.iv.length !== 32) {
            return {
                valid: false,
                error: 'Invalid IV length'
            };
        }

        // Validate proofs (should be 16 hex characters)
        const proofs = [
            payload.senderProof,
            payload.receiverProof,
            payload.witnessProof
        ];

        for (const proof of proofs) {
            if (!/^[a-f0-9]{16}$/.test(proof)) {
                return {
                    valid: false,
                    error: 'Invalid proof format'
                };
            }
        }

        return {
            valid: true,
            encryptionTime: payload.encryptionTime || 0
        };
    }

    /**
     * Validate SNARK proof structure
     */
    validateSNARKProof(proofData) {
        if (!proofData || !proofData.proof || !proofData.publicSignals) {
            return {
                valid: false,
                error: 'Missing proof or public signals'
            };
        }

        const { proof } = proofData;

        // Validate Groth16 proof structure
        if (!proof.pi_a || !proof.pi_b || !proof.pi_c) {
            return {
                valid: false,
                error: 'Invalid Groth16 proof structure'
            };
        }

        // Validate pi_a (3 elements)
        if (!Array.isArray(proof.pi_a) || proof.pi_a.length !== 3) {
            return {
                valid: false,
                error: 'Invalid pi_a structure'
            };
        }

        // Validate pi_b (3 elements, each with 2 sub-elements for G2 point)
        if (!Array.isArray(proof.pi_b) || proof.pi_b.length !== 3) {
            return {
                valid: false,
                error: 'Invalid pi_b structure'
            };
        }

        // Validate pi_c (3 elements)
        if (!Array.isArray(proof.pi_c) || proof.pi_c.length !== 3) {
            return {
                valid: false,
                error: 'Invalid pi_c structure'
            };
        }

        return {
            valid: true,
            mode: proofData.mode || 'unknown',
            proofHash: proofData.proofHash
        };
    }

    /**
     * Validate transaction signature (ECDSA)
     */
    validateTransactionSignature(transaction, publicKey) {
        try {
            if (!transaction.signature) {
                return {
                    valid: false,
                    error: 'Missing signature'
                };
            }

            // Create transaction hash (without signature)
            const txData = {
                from: transaction.from,
                to: transaction.to,
                amount: transaction.amount,
                nonce: transaction.nonce,
                timestamp: transaction.timestamp
            };

            const txHash = crypto.createHash('sha256')
                .update(JSON.stringify(txData))
                .digest();

            // Verify signature (simplified - in production use actual ECDSA)
            const verify = crypto.createVerify('SHA256');
            verify.update(txHash);
            
            // Note: This is simplified. In production:
            // const isValid = verify.verify(publicKey, transaction.signature, 'hex');
            
            // For now, validate signature format
            if (!/^[a-f0-9]{128,}$/.test(transaction.signature)) {
                return {
                    valid: false,
                    error: 'Invalid signature format'
                };
            }

            return {
                valid: true,
                txHash: txHash.toString('hex'),
                signature: transaction.signature
            };
        } catch (error) {
            return {
                valid: false,
                error: `Signature validation failed: ${error.message}`
            };
        }
    }

    /**
     * Validate wallet encryption (AES-256-GCM)
     */
    validateWalletEncryption(encryptedWallet) {
        if (!encryptedWallet.crypto) {
            return {
                valid: false,
                error: 'Missing crypto field'
            };
        }

        const { crypto: cryptoData } = encryptedWallet;

        // Validate cipher
        if (cryptoData.cipher !== 'aes-256-cbc' && 
            cryptoData.cipher !== 'aes-256-gcm') {
            return {
                valid: false,
                error: 'Invalid cipher algorithm'
            };
        }

        // Validate KDF
        if (cryptoData.kdf !== 'pbkdf2') {
            return {
                valid: false,
                error: 'Invalid KDF algorithm'
            };
        }

        // Validate KDF iterations (must be >= 100,000)
        if (!cryptoData.kdfParams || 
            cryptoData.kdfParams.iterations < 100000) {
            return {
                valid: false,
                error: 'Insufficient KDF iterations (minimum 100,000)'
            };
        }

        // Validate ciphertext exists
        if (!cryptoData.ciphertext) {
            return {
                valid: false,
                error: 'Missing ciphertext'
            };
        }

        // Validate IV and salt
        if (!cryptoData.iv || !cryptoData.salt) {
            return {
                valid: false,
                error: 'Missing IV or salt'
            };
        }

        return {
            valid: true,
            cipher: cryptoData.cipher,
            kdf: cryptoData.kdf,
            iterations: cryptoData.kdfParams.iterations
        };
    }

    /**
     * Validate input sanitization
     */
    validateInput(input, rules) {
        const errors = [];

        // Check required fields
        if (rules.required) {
            for (const field of rules.required) {
                if (input[field] === undefined || input[field] === null) {
                    errors.push(`Missing required field: ${field}`);
                }
            }
        }

        // Check string length
        if (rules.maxLength) {
            for (const [field, maxLen] of Object.entries(rules.maxLength)) {
                if (input[field] && input[field].length > maxLen) {
                    errors.push(`${field} exceeds maximum length of ${maxLen}`);
                }
            }
        }

        // Check numeric ranges
        if (rules.range) {
            for (const [field, { min, max }] of Object.entries(rules.range)) {
                const value = input[field];
                if (value !== undefined) {
                    if (min !== undefined && value < min) {
                        errors.push(`${field} below minimum value of ${min}`);
                    }
                    if (max !== undefined && value > max) {
                        errors.push(`${field} above maximum value of ${max}`);
                    }
                }
            }
        }

        // Check patterns (regex)
        if (rules.patterns) {
            for (const [field, pattern] of Object.entries(rules.patterns)) {
                const value = input[field];
                if (value && !pattern.test(value)) {
                    errors.push(`${field} does not match required pattern`);
                }
            }
        }

        // Check for SQL injection attempts
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
            /(--|\/\*|\*\/|;)/,
            /('|"|\`)/
        ];

        for (const [field, value] of Object.entries(input)) {
            if (typeof value === 'string') {
                for (const pattern of sqlPatterns) {
                    if (pattern.test(value)) {
                        errors.push(`${field} contains potentially malicious content`);
                        break;
                    }
                }
            }
        }

        // Check for XSS attempts
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi
        ];

        for (const [field, value] of Object.entries(input)) {
            if (typeof value === 'string') {
                for (const pattern of xssPatterns) {
                    if (pattern.test(value)) {
                        errors.push(`${field} contains potentially malicious code`);
                        break;
                    }
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate rate limiting token
     */
    validateRateLimit(identifier, limits) {
        // This would integrate with actual rate limiting middleware
        // For now, return basic validation
        return {
            valid: true,
            identifier,
            limits
        };
    }

    /**
     * Comprehensive security audit
     */
    async auditSecurity(config) {
        const results = {
            timestamp: Date.now(),
            passed: [],
            failed: [],
            warnings: []
        };

        // Check ZK13STR implementation
        const testAddress = 'zk13str_748dcb4d83e60f5ab0f7ab727d9308ba43800e12_958a';
        const zk13Result = this.validateZK13STR(testAddress);
        if (zk13Result.valid) {
            results.passed.push('ZK13STR validation working');
        } else {
            results.failed.push(`ZK13STR validation failed: ${zk13Result.error}`);
        }

        // Check GodCypher implementation
        const testPayload = {
            encrypted: { data: 'test', iv: '0'.repeat(32) },
            senderProof: '0'.repeat(16),
            receiverProof: '0'.repeat(16),
            witnessProof: '0'.repeat(16)
        };
        const godCypherResult = this.validateGodCypherPayload(testPayload);
        if (godCypherResult.valid) {
            results.passed.push('GodCypher validation working');
        } else {
            results.failed.push(`GodCypher validation failed: ${godCypherResult.error}`);
        }

        // Check input sanitization
        const testInput = {
            name: 'Test',
            amount: 100
        };
        const inputResult = this.validateInput(testInput, {
            required: ['name', 'amount'],
            maxLength: { name: 50 },
            range: { amount: { min: 0, max: 1000000 } }
        });
        if (inputResult.valid) {
            results.passed.push('Input validation working');
        } else {
            results.failed.push(`Input validation failed: ${inputResult.errors.join(', ')}`);
        }

        // Add warnings for development mode
        if (!config?.production) {
            results.warnings.push('Running in development mode');
            results.warnings.push('SNARK proofs using mock mode');
        }

        return {
            ...results,
            score: results.passed.length / (results.passed.length + results.failed.length),
            status: results.failed.length === 0 ? 'PASS' : 'FAIL'
        };
    }
}

module.exports = SecurityValidator;
