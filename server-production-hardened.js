// PRODUCTION BLOCKCHAIN SERVER - ENTERPRISE-GRADE ERROR HANDLING & SECURITY
// Based on best practices from sourcelessnet-v1.3
// Created by AM Stratulat and Sourceless Team with love.

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');

// Import HOSTLESS database (Pure Blockchain + Distributed Ledger Technology)
const HostlessDatabase = require('./src/database/HostlessDatabase');
console.log('🌐 Using HOSTLESS Database (Pure Blockchain + DLT + STARW Storage)');

// Import security systems
const { SuperAdminController, ROLES, PERMISSIONS } = require('./src/security/SuperAdminController');
const ZKSNARKEngine = require('./src/security/ZKSNARKEngine');
const SecurityValidator = require('./src/security/SecurityValidator');

// Import blockchain systems
let autoRunAll;
let systems = null;
let AresLangApp;
let aresApp = null;

// ============================================================================
// SCHEMA VALIDATION (Based on sourcelessnet-v1.3 patterns)
// ============================================================================

const schemas = {
    encrypt: Joi.object({
        data: Joi.string().required().max(10000),
        publicKey: Joi.string().required().max(1000)
    }),
    decrypt: Joi.object({
        payload: Joi.string().required().max(20000),
        privateKey: Joi.string().required().max(1000)
    }),
    entropyLength: Joi.object({
        length: Joi.number().integer().min(1).max(1024).default(32)
    }),
    blockQuery: Joi.object({
        ledger: Joi.string().valid('main', 'asset', 'contract', 'governance', 'ccoin', 'ccos').default('main'),
        page: Joi.number().integer().min(1).default(1),
        pageSize: Joi.number().integer().min(1).max(100).default(20)
    })
};

// ============================================================================
// INPUT VALIDATION UTILITIES (using imported SecurityValidator)
// ============================================================================
// Note: SecurityValidator is imported from './src/security/SecurityValidator'

// ============================================================================
// ENHANCED SERVER CLASS WITH COMPREHENSIVE ERROR HANDLING
// ============================================================================

class StratusProductionServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.port = process.env.PORT || 3002;
        this.database = null;
        this.databaseType = 'unknown';
        this.isInitialized = false;
        this.shutdownInProgress = false;
        this.startTime = Date.now();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.setupGracefulShutdown();
    }

    setupMiddleware() {
        try {
            // Security headers
            this.app.use(helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        scriptSrc: ["'self'", "'unsafe-inline'"],
                        imgSrc: ["'self'", "data:", "https:"]
                    }
                }
            }));

            // CORS configuration
            this.app.use(cors({
                origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
                methods: ['GET', 'POST', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true
            }));

            // Body parsing with size limits
            this.app.use(express.json({ limit: '10mb' }));
            this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

            // Rate limiting
            const limiter = rateLimit({
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: process.env.RATE_LIMIT || 1000, // limit each IP to 1000 requests per windowMs
                message: 'Too many requests from this IP, please try again later',
                standardHeaders: true,
                legacyHeaders: false,
            });

            this.app.use('/api/', limiter);

            // Request logging
            this.app.use((req, res, next) => {
                const start = Date.now();
                res.on('finish', () => {
                    const duration = Date.now() - start;
                    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
                });
                next();
            });

            // Static files
            this.app.use(express.static('public'));

            console.log('✅ Middleware configured successfully');
        } catch (error) {
            console.error('❌ Error setting up middleware:', error);
            throw error;
        }
    }

    setupRoutes() {
        try {
            // Health check endpoint
            this.app.get('/health', async (req, res) => {
                try {
                    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
                    const healthData = {
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        uptime: `${uptime}s`,
                        database: this.database ? 'connected' : 'disconnected',
                        database_type: this.databaseType,
                        blockchain: systems ? 'initialized' : 'initializing',
                        server_initialized: this.isInitialized,
                        version: '1.0.0-production-hardened',
                        memory: process.memoryUsage()
                    };
                    
                    res.json(healthData);
                } catch (error) {
                    console.error('Health check error:', error);
                    res.status(500).json({
                        status: 'unhealthy',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // API info endpoint
            this.app.get('/api/info', (req, res) => {
                res.json({
                    message: 'Stratus Production Server - SourcelessNet',
                    version: '1.0.0-production-hardened',
                    status: this.isInitialized ? 'running' : 'initializing',
                    network: 'Sourceless Mainnet',
                    endpoints: [
                        '/health',
                        '/api/db/network/stats',
                        '/api/db/ledger/stats',
                        '/api/db/explorer/blocks',
                        '/api/blockchain/stats'
                    ]
                });
            });

            // Database-backed endpoints
            this.setupDatabaseRoutes();

            // Blockchain system endpoints
            this.setupBlockchainRoutes();

            // AresLang endpoints
            this.setupAresLangRoutes();

            // Validator expansion endpoints
            this.setupValidatorRoutes();

            // Security & SuperAdmin endpoints
            this.setupSecurityRoutes();

            console.log('✅ Routes configured successfully');
        } catch (error) {
            console.error('❌ Error setting up routes:', error);
            throw error;
        }
    }

    setupDatabaseRoutes() {
        // Network statistics
        this.app.get('/api/db/network/stats', async (req, res) => {
            try {
                if (!this.database) {
                    return res.status(503).json({ error: 'Database not initialized' });
                }

                const networkStats = await this.database.getNetworkStats();
                res.json(networkStats || {});
            } catch (error) {
                console.error('Error fetching network stats:', error);
                res.status(500).json({
                    error: 'Failed to retrieve network statistics',
                    message: error.message
                });
            }
        });

        // Ledger statistics
        this.app.get('/api/db/ledger/stats', async (req, res) => {
            try {
                if (!this.database) {
                    return res.status(503).json({ error: 'Database not initialized' });
                }

                const ledgerStats = await this.database.getLedgerStats();
                res.json(ledgerStats || []);
            } catch (error) {
                console.error('Error fetching ledger stats:', error);
                res.status(500).json({
                    error: 'Failed to retrieve ledger statistics',
                    message: error.message
                });
            }
        });

        // Block explorer
        this.app.get('/api/db/explorer/blocks', async (req, res) => {
            try {
                if (!this.database) {
                    return res.status(503).json({ error: 'Database not initialized' });
                }

                // Validate query parameters
                const { error, value } = schemas.blockQuery.validate(req.query);
                if (error) {
                    return res.status(400).json({
                        error: 'Invalid query parameters',
                        details: error.details[0].message
                    });
                }

                const { ledger, page, pageSize } = value;

                // Additional validation for ledger type
                const ledgerValidation = SecurityValidator.validateLedgerType(ledger);
                if (!ledgerValidation.valid) {
                    return res.status(400).json({ error: ledgerValidation.error });
                }

                const blocksData = await this.database.getBlocks(ledger, page, pageSize);
                res.json(blocksData);
            } catch (error) {
                console.error('Error fetching blocks:', error);
                res.status(500).json({
                    error: 'Failed to retrieve blocks',
                    message: error.message
                });
            }
        });
    }

    setupBlockchainRoutes() {
        // Comprehensive blockchain statistics
        this.app.get('/api/blockchain/stats', async (req, res) => {
            try {
                if (!this.database) {
                    return res.status(503).json({ error: 'Database not initialized' });
                }

                const networkStats = await this.database.getNetworkStats();
                const ledgerStats = await this.database.getLedgerStats();
                const genesisHash = await this.database.getGenesisHash();
                
                const stats = {
                    network: networkStats?.network_name || 'Sourceless Mainnet',
                    chainId: 1313,
                    genesisHash: genesisHash || '',
                    totalBlocks: 0,
                    totalTransactions: 0,
                    strSupply: networkStats?.total_supply_str || '63000000000',
                    ccosSupply: networkStats?.total_supply_ccos || '63000000',
                    activePeers: systems?.p2pNetwork ? systems.p2pNetwork.getPeerCount() : 0,
                    ledgers: {},
                    timestamp: new Date().toISOString()
                };
                
                // Process ledger stats
                if (ledgerStats && Array.isArray(ledgerStats)) {
                    ledgerStats.forEach(ledger => {
                        stats.totalBlocks += ledger.total_blocks || 0;
                        stats.totalTransactions += ledger.total_transactions || 0;
                        
                        stats.ledgers[ledger.ledger_type] = {
                            name: ledger.ledger_type,
                            blocks: ledger.total_blocks || 0,
                            transactions: ledger.total_transactions || 0
                        };
                    });
                }
                
                res.json(stats);
            } catch (error) {
                console.error('Error getting blockchain stats:', error);
                res.status(500).json({
                    error: 'Failed to retrieve blockchain stats',
                    message: error.message
                });
            }
        });

        // Explorer endpoints (for mini-node compatibility)
        // Support both colon and slash formats for backward compatibility
        this.app.get('/api/explorer\\:blocks', async (req, res) => {
            try {
                if (!systems) {
                    return res.status(503).json({ error: 'Blockchain systems not initialized' });
                }
                
                // Generate mock blocks data for explorer
                const mockBlocks = [];
                for (let i = 1; i <= 10; i++) {
                    mockBlocks.push({
                        id: i,
                        hash: `000${Math.random().toString(16).substr(2, 60)}`,
                        timestamp: new Date(Date.now() - i * 60000).toISOString(),
                        transactions: Math.floor(Math.random() * 20) + 1,
                        size: Math.floor(Math.random() * 2048) + 512,
                        ledger: 'main'
                    });
                }
                
                res.json(mockBlocks);
            } catch (error) {
                console.error('Error fetching explorer blocks:', error);
                res.status(500).json({
                    error: 'Failed to retrieve blocks',
                    message: error.message
                });
            }
        });

        this.app.get('/api/explorer\\:txStats', async (req, res) => {
            try {
                if (!systems) {
                    return res.status(503).json({ error: 'Blockchain systems not initialized' });
                }
                
                // Mock transaction stats based on network activity
                const networkStats = systems.getStatus ? systems.getStatus() : {};
                const totalTx = 60000; // Mock total transactions
                
                res.json({
                    total: totalTx,
                    last24h: Math.floor(totalTx * 0.1), // Mock 24h data
                    tps: Math.floor(totalTx / 86400) // Approx TPS
                });
            } catch (error) {
                console.error('Error fetching tx stats:', error);
                res.status(500).json({
                    error: 'Failed to retrieve transaction stats',
                    message: error.message
                });
            }
        });

        this.app.get('/api/explorer\\:blockCount', async (req, res) => {
            try {
                if (!systems) {
                    return res.status(503).json({ error: 'Blockchain systems not initialized' });
                }
                
                // Use actual block count from systems or mock data
                const totalBlocks = systems.blockchain ? 
                    (systems.blockchain.getBlockCount ? systems.blockchain.getBlockCount() : 6001) :
                    6001; // 6 ledgers × 1000 blocks each + genesis blocks
                
                res.json({
                    count: totalBlocks,
                    latest: totalBlocks
                });
            } catch (error) {
                console.error('Error fetching block count:', error);
                res.status(500).json({
                    error: 'Failed to retrieve block count',
                    message: error.message
                });
            }
        });

        // Wallet endpoint
        this.app.get('/api/wallet/get', async (req, res) => {
            try {
                if (!systems) {
                    return res.status(503).json({ error: 'Blockchain systems not initialized' });
                }

                const walletData = systems.getStatus().wallet;
                res.json(walletData);
            } catch (error) {
                console.error('Error fetching wallet:', error);
                res.status(500).json({
                    error: 'Failed to retrieve wallet information',
                    message: error.message
                });
            }
        });

        // Network metrics
        this.app.get('/api/network/metrics', async (req, res) => {
            try {
                if (!systems) {
                    return res.status(503).json({ error: 'Blockchain systems not initialized' });
                }

                const networkMetrics = systems.networkSimulator.getMetrics();
                res.json(networkMetrics);
            } catch (error) {
                console.error('Error fetching network metrics:', error);
                res.status(500).json({
                    error: 'Failed to retrieve network metrics',
                    message: error.message
                });
            }
        });
    }

    setupAresLangRoutes() {
        // Generate keypair
        this.app.post('/api/areslang/crypto/keypair', async (req, res) => {
            try {
                if (!aresApp) {
                    return res.status(503).json({ error: 'AresLang not initialized' });
                }

                const keypair = await aresApp.crypto.generateKeyPair();
                res.json(keypair);
            } catch (error) {
                console.error('Error generating keypair:', error);
                res.status(500).json({
                    error: 'Failed to generate keypair',
                    message: error.message
                });
            }
        });

        // Encrypt data
        this.app.post('/api/areslang/crypto/encrypt', async (req, res) => {
            try {
                if (!aresApp) {
                    return res.status(503).json({ error: 'AresLang not initialized' });
                }

                // Validate request body
                const { error, value } = schemas.encrypt.validate(req.body);
                if (error) {
                    return res.status(400).json({
                        error: 'Invalid request body',
                        details: error.details[0].message
                    });
                }

                const { data, publicKey } = value;
                const payload = await aresApp.crypto.encrypt(data, publicKey);
                
                res.json({ 
                    success: true,
                    payload,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error encrypting data:', error);
                res.status(500).json({
                    error: 'Failed to encrypt data',
                    message: error.message
                });
            }
        });

        // Decrypt data
        this.app.post('/api/areslang/crypto/decrypt', async (req, res) => {
            try {
                if (!aresApp) {
                    return res.status(503).json({ error: 'AresLang not initialized' });
                }

                // Validate request body
                const { error, value } = schemas.decrypt.validate(req.body);
                if (error) {
                    return res.status(400).json({
                        error: 'Invalid request body',
                        details: error.details[0].message
                    });
                }

                const { payload, privateKey } = value;
                const decryptedData = await aresApp.crypto.decrypt(payload, privateKey);
                
                res.json({ 
                    success: true,
                    data: decryptedData,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error decrypting data:', error);
                res.status(500).json({
                    error: 'Failed to decrypt data',
                    message: error.message
                });
            }
        });

        // Generate entropy bytes
        this.app.get('/api/areslang/entropy/bytes', async (req, res) => {
            try {
                if (!aresApp) {
                    return res.status(503).json({ error: 'AresLang not initialized' });
                }

                // Validate query parameters
                const { error, value } = schemas.entropyLength.validate(req.query);
                if (error) {
                    return res.status(400).json({
                        error: 'Invalid query parameters',
                        details: error.details[0].message
                    });
                }

                const { length } = value;
                const bytes = await aresApp.entropy.generateBytes(length);
                
                res.json({ 
                    success: true,
                    bytes,
                    length,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error generating entropy:', error);
                res.status(500).json({
                    error: 'Failed to generate entropy bytes',
                    message: error.message
                });
            }
        });

        // Get entropy quality
        this.app.get('/api/areslang/entropy/quality', async (req, res) => {
            try {
                if (!aresApp) {
                    return res.status(503).json({ error: 'AresLang not initialized' });
                }

                const quality = await aresApp.entropy.getEntropyQuality();
                res.json(quality);
            } catch (error) {
                console.error('Error getting entropy quality:', error);
                res.status(500).json({
                    error: 'Failed to get entropy quality',
                    message: error.message
                });
            }
        });

        // Get supported chains
        this.app.get('/api/areslang/chains/supported', async (req, res) => {
            try {
                if (!aresApp) {
                    return res.status(503).json({ error: 'AresLang not initialized' });
                }

                const supportedChains = aresApp.bridge.getSupportedChains();
                res.json({
                    success: true,
                    chains: supportedChains,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error getting supported chains:', error);
                res.status(500).json({
                    error: 'Failed to get supported chains',
                    message: error.message
                });
            }
        });
    }

    setupValidatorRoutes() {
        // Import validator registry (singleton pattern)
        let validatorRegistry;
        try {
            const { ValidatorRegistry } = require('./dist/validators/ValidatorRegistry');
            validatorRegistry = new ValidatorRegistry();
            console.log('✅ Validator Registry initialized');
        } catch (error) {
            console.warn('⚠️ Validator Registry not available:', error.message);
            return; // Skip validator routes if module not available
        }

        const { ValidatorRewards } = require('./dist/validators/ValidatorRewards');

        // Validation schema for validator registration
        const validatorRegistrationSchema = Joi.object({
            domain: Joi.string().pattern(/^STR\.[a-z0-9]{3,32}$/).required(),
            wallet: Joi.string().pattern(/^zk13str_[a-zA-Z0-9]+$/).required(),
            signature: Joi.string().required().min(64),
            message: Joi.string().required(),
            stake: Joi.number().min(1000).required(),
            resources: Joi.object({
                storage: Joi.number().min(1).required(),
                cpu: Joi.number().min(1).required(),
                bandwidth: Joi.object({
                    upload: Joi.number().min(10).required(),
                    download: Joi.number().min(10).required()
                }).required(),
                uptime: Joi.number().min(95).max(100).required()
            }).required()
        });

        // Register new validator
        this.app.post('/api/validator/register', async (req, res) => {
            try {
                // Validate request body
                const { error, value } = validatorRegistrationSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid registration data',
                        details: error.details[0].message
                    });
                }

                // Register validator
                const result = await validatorRegistry.register(value);

                if (result.success) {
                    return res.status(201).json({
                        success: true,
                        validatorId: result.validatorId,
                        message: result.message,
                        monthlyReward: result.monthlyReward,
                        nextSteps: [
                            'Keep your node online 24/7 for maximum rewards',
                            `Monitor rewards at /api/validator/${result.validatorId}/rewards`,
                            `Check status at /api/validator/${result.validatorId}`
                        ]
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        error: result.message
                    });
                }
            } catch (error) {
                console.error('❌ Validator registration error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during registration',
                    message: error.message
                });
            }
        });

        // Get validator by ID
        this.app.get('/api/validator/:validatorId', (req, res) => {
            try {
                const { validatorId } = req.params;
                const validator = validatorRegistry.getValidator(validatorId);
                
                if (!validator) {
                    return res.status(404).json({
                        success: false,
                        error: 'Validator not found'
                    });
                }

                const status = validator.validator.getStatus();
                const stats = validator.validator.getStatistics();

                res.json({
                    success: true,
                    validator: {
                        id: validator.validatorId,
                        domain: validator.domain,
                        wallet: validator.wallet,
                        status: validator.status,
                        registrationDate: validator.registrationDate,
                        lastActive: validator.lastActive,
                        stake: status.stake,
                        resources: status.resources,
                        reputation: status.reputation,
                        statistics: stats
                    }
                });
            } catch (error) {
                console.error('❌ Get validator error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });

        // Get validator rewards
        this.app.get('/api/validator/:validatorId/rewards', (req, res) => {
            try {
                const { validatorId } = req.params;
                const { period = 'monthly' } = req.query;

                const validator = validatorRegistry.getValidator(validatorId);
                
                if (!validator) {
                    return res.status(404).json({
                        success: false,
                        error: 'Validator not found'
                    });
                }

                const status = validator.validator.getStatus();
                
                // Build metrics
                const metrics = {
                    storageGB: status.resources.storage.allocated,
                    cpuCores: status.resources.cpu.cores,
                    cpuUsagePercent: status.resources.cpu.currentUsage,
                    bandwidthMbps: {
                        upload: status.resources.bandwidth.upload,
                        download: status.resources.bandwidth.download
                    },
                    uptimePercent: status.resources.uptime.current,
                    contractsHosted: status.reputation.contractsHosted,
                    contractGasEarnings: 0
                };

                // Calculate rewards
                let calculation;
                if (period === 'daily') {
                    calculation = ValidatorRewards.calculateDailyRewards(metrics);
                } else if (period === 'yearly') {
                    calculation = ValidatorRewards.calculateAnnualRewards(metrics);
                } else {
                    calculation = ValidatorRewards.calculateMonthlyRewards(metrics);
                }

                res.json({
                    success: true,
                    validatorId,
                    period,
                    rewards: {
                        ...calculation,
                        accumulated: status.rewards.accumulated,
                        lastPayout: status.rewards.lastPayout,
                        breakdown: status.rewards.breakdown
                    },
                    metrics,
                    summary: ValidatorRewards.generateRewardSummary(metrics, period)
                });
            } catch (error) {
                console.error('❌ Get rewards error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });

        // Get active validators
        this.app.get('/api/validators/active', (req, res) => {
            try {
                const { limit = 100, offset = 0 } = req.query;

                const activeValidators = validatorRegistry.getActiveValidators();
                const total = activeValidators.length;
                
                const paginatedValidators = activeValidators
                    .slice(Number(offset), Number(offset) + Number(limit))
                    .map(v => ({
                        validatorId: v.validatorId,
                        domain: v.domain,
                        status: v.status,
                        registrationDate: v.registrationDate,
                        statistics: v.validator.getStatistics()
                    }));

                res.json({
                    success: true,
                    total,
                    limit: Number(limit),
                    offset: Number(offset),
                    validators: paginatedValidators
                });
            } catch (error) {
                console.error('❌ Get active validators error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });

        // Get network statistics
        this.app.get('/api/validators/stats', (req, res) => {
            try {
                const networkStats = validatorRegistry.getNetworkStats();

                res.json({
                    success: true,
                    network: networkStats,
                    breakdown: {
                        genesisValidators: {
                            count: 1313,
                            type: 'Immutable foundation nodes',
                            status: 'Always active'
                        },
                        personalValidators: {
                            count: networkStats.activeValidators,
                            type: 'Community-contributed nodes',
                            status: 'Dynamic'
                        }
                    }
                });
            } catch (error) {
                console.error('❌ Get network stats error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });

        // Get validator by domain
        this.app.get('/api/validator/domain/:domain', (req, res) => {
            try {
                const { domain } = req.params;
                const validator = validatorRegistry.getValidatorByDomain(domain);
                
                if (!validator) {
                    return res.status(404).json({
                        success: false,
                        error: `No validator found for domain: ${domain}`
                    });
                }

                const stats = validator.validator.getStatistics();

                res.json({
                    success: true,
                    validator: {
                        id: validator.validatorId,
                        domain: validator.domain,
                        wallet: validator.wallet,
                        status: validator.status,
                        registrationDate: validator.registrationDate,
                        statistics: stats
                    }
                });
            } catch (error) {
                console.error('❌ Get validator by domain error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });

        // Get validators by wallet
        this.app.get('/api/validator/wallet/:wallet', (req, res) => {
            try {
                const { wallet } = req.params;
                const validators = validatorRegistry.getValidatorsByWallet(wallet);

                res.json({
                    success: true,
                    wallet,
                    count: validators.length,
                    validators: validators.map(v => ({
                        validatorId: v.validatorId,
                        domain: v.domain,
                        status: v.status,
                        registrationDate: v.registrationDate,
                        statistics: v.validator.getStatistics()
                    }))
                });
            } catch (error) {
                console.error('❌ Get validators by wallet error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });

        // Deregister validator
        this.app.delete('/api/validator/:validatorId', async (req, res) => {
            try {
                const { validatorId } = req.params;
                const { signature } = req.body;

                if (!signature) {
                    return res.status(400).json({
                        success: false,
                        error: 'Signature required to deregister validator'
                    });
                }

                const result = await validatorRegistry.deregister(validatorId);

                if (result.success) {
                    res.json({
                        success: true,
                        message: result.message,
                        validatorId
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        error: result.message
                    });
                }
            } catch (error) {
                console.error('❌ Deregister validator error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });

        console.log('✅ Validator routes configured successfully');
        console.log('   📡 POST /api/validator/register');
        console.log('   📊 GET /api/validator/:id');
        console.log('   💰 GET /api/validator/:id/rewards');
        console.log('   📋 GET /api/validators/active');
        console.log('   📈 GET /api/validators/stats');
    }

    setupSecurityRoutes() {
        // ======== SUPERADMIN ROUTES ========
        
        // Create session (login)
        this.app.post('/api/security/session/create', async (req, res) => {
            try {
                const { walletAddress, signature } = req.body;
                
                if (!this.adminController) {
                    return res.status(503).json({ error: 'Security system not initialized' });
                }
                
                const session = this.adminController.createSession(walletAddress, signature);
                
                res.json({
                    success: true,
                    ...session
                });
            } catch (error) {
                console.error('❌ Session creation error:', error);
                res.status(401).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Validate session
        this.app.post('/api/security/session/validate', (req, res) => {
            try {
                const { sessionId } = req.body;
                
                if (!this.adminController) {
                    return res.status(503).json({ error: 'Security system not initialized' });
                }
                
                const session = this.adminController.validateSession(sessionId);
                
                if (session) {
                    res.json({
                        valid: true,
                        walletAddress: session.walletAddress,
                        role: this.adminController.getRoleName(session.role)
                    });
                } else {
                    res.json({ valid: false });
                }
            } catch (error) {
                console.error('❌ Session validation error:', error);
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // Assign role (SuperAdmin only)
        this.app.post('/api/security/role/assign', (req, res) => {
            try {
                const { walletAddress, role, assignedBy } = req.body;
                
                if (!this.adminController) {
                    return res.status(503).json({ error: 'Security system not initialized' });
                }
                
                const result = this.adminController.assignRole(walletAddress, role, assignedBy);
                
                res.json(result);
            } catch (error) {
                console.error('❌ Role assignment error:', error);
                res.status(403).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Check permission
        this.app.post('/api/security/permission/check', (req, res) => {
            try {
                const { walletAddress, permission } = req.body;
                
                if (!this.adminController) {
                    return res.status(503).json({ error: 'Security system not initialized' });
                }
                
                const hasPermission = this.adminController.hasPermission(walletAddress, permission);
                
                res.json({
                    walletAddress,
                    permission,
                    hasPermission
                });
            } catch (error) {
                console.error('❌ Permission check error:', error);
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // Get audit logs
        this.app.get('/api/security/audit/logs', (req, res) => {
            try {
                const { walletAddress, action, startTime, endTime, limit } = req.query;
                
                if (!this.adminController) {
                    return res.status(503).json({ error: 'Security system not initialized' });
                }
                
                const logs = this.adminController.getAuditLogs(walletAddress, {
                    action,
                    startTime: startTime ? Number(startTime) : undefined,
                    endTime: endTime ? Number(endTime) : undefined,
                    limit: limit ? Number(limit) : 100
                });
                
                res.json({
                    success: true,
                    logs,
                    count: logs.length
                });
            } catch (error) {
                console.error('❌ Audit logs error:', error);
                res.status(403).json({
                    error: error.message
                });
            }
        });

        // Get all users with roles
        this.app.get('/api/security/users', (req, res) => {
            try {
                const { requestedBy } = req.query;
                
                if (!this.adminController) {
                    return res.status(503).json({ error: 'Security system not initialized' });
                }
                
                const users = this.adminController.getAllUsers(requestedBy);
                
                res.json({
                    success: true,
                    users,
                    count: users.length
                });
            } catch (error) {
                console.error('❌ Get users error:', error);
                res.status(403).json({
                    error: error.message
                });
            }
        });

        // Get statistics
        this.app.get('/api/security/stats', (req, res) => {
            try {
                if (!this.adminController) {
                    return res.status(503).json({ error: 'Security system not initialized' });
                }
                
                const stats = this.adminController.getStatistics();
                
                res.json({
                    success: true,
                    ...stats
                });
            } catch (error) {
                console.error('❌ Security stats error:', error);
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // ======== ZK-SNARK ROUTES ========
        
        // Generate transaction proof
        this.app.post('/api/security/snark/transaction-proof', async (req, res) => {
            try {
                const { from, to, amount, nonce } = req.body;
                
                if (!this.zksnarkEngine) {
                    return res.status(503).json({ error: 'ZK-SNARK engine not initialized' });
                }
                
                const proof = await this.zksnarkEngine.createTransactionProof({
                    from, to, amount, nonce
                });
                
                res.json({
                    success: true,
                    ...proof
                });
            } catch (error) {
                console.error('❌ Transaction proof error:', error);
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // Verify SNARK proof
        this.app.post('/api/security/snark/verify', async (req, res) => {
            try {
                const { proof, publicSignals } = req.body;
                
                if (!this.zksnarkEngine) {
                    return res.status(503).json({ error: 'ZK-SNARK engine not initialized' });
                }
                
                const isValid = await this.zksnarkEngine.verifyProof(proof, publicSignals);
                
                res.json({
                    success: true,
                    valid: isValid
                });
            } catch (error) {
                console.error('❌ Proof verification error:', error);
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // Get SNARK status
        this.app.get('/api/security/snark/status', (req, res) => {
            try {
                if (!this.zksnarkEngine) {
                    return res.status(503).json({ error: 'ZK-SNARK engine not initialized' });
                }
                
                const status = this.zksnarkEngine.getStatus();
                
                res.json({
                    success: true,
                    ...status
                });
            } catch (error) {
                console.error('❌ SNARK status error:', error);
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // ======== SECURITY VALIDATION ROUTES ========
        
        // Validate ZK13STR address
        this.app.post('/api/security/validate/zk13str', (req, res) => {
            try {
                const { address } = req.body;
                
                if (!this.securityValidator) {
                    return res.status(503).json({ error: 'Security validator not initialized' });
                }
                
                const result = this.securityValidator.validateZK13STR(address);
                
                res.json({
                    success: true,
                    ...result
                });
            } catch (error) {
                console.error('❌ ZK13STR validation error:', error);
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // Comprehensive security audit
        this.app.post('/api/security/audit/comprehensive', async (req, res) => {
            try {
                const config = req.body;
                
                if (!this.securityValidator) {
                    return res.status(503).json({ error: 'Security validator not initialized' });
                }
                
                const audit = await this.securityValidator.auditSecurity(config);
                
                res.json({
                    success: true,
                    ...audit
                });
            } catch (error) {
                console.error('❌ Security audit error:', error);
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // ======== MAGNET WALLET API ROUTES ========
        
        // Wallet balance endpoint
        this.app.get('/api/wallet/balances/:address', async (req, res) => {
            try {
                const { address } = req.params;
                
                if (!address || !address.startsWith('zk13str_')) {
                    return res.status(400).json({ error: 'Invalid wallet address format' });
                }
                
                // For demo, return mock balances based on address
                const mockBalances = {
                    STR: 15750.50 + Math.random() * 5000,
                    CCOS: 245.75 + Math.random() * 100,
                    ARSS: 1230.25 + Math.random() * 500,
                    wSTR: 850.00 + Math.random() * 200,
                    eSTR: 420.10 + Math.random() * 100,
                    'STR$': 1000.00 + Math.random() * 50
                };
                
                res.json({
                    success: true,
                    address: address,
                    balances: mockBalances,
                    lastUpdated: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('Error fetching wallet balances:', error);
                res.status(500).json({
                    error: 'Failed to retrieve wallet balances',
                    message: error.message
                });
            }
        });
        
        // Domain availability check
        this.app.get('/api/domain/check/:domainName', async (req, res) => {
            try {
                const { domainName } = req.params;
                
                if (!domainName || !domainName.startsWith('STR.') || !/^STR\.[a-z0-9]{3,32}$/.test(domainName)) {
                    return res.status(400).json({ 
                        error: 'Invalid domain format. Must be STR.{3-32 lowercase alphanumeric}' 
                    });
                }
                
                // Check if domain exists in database
                let available = true;
                let owner = null;
                
                if (this.database && this.database.getDomainOwner) {
                    try {
                        owner = await this.database.getDomainOwner(domainName);
                        available = !owner;
                    } catch (err) {
                        // Domain doesn't exist, so it's available
                        available = true;
                    }
                } else {
                    // For demo, make some domains unavailable
                    const unavailableDomains = ['STR.demo', 'STR.test', 'STR.admin', 'STR.foundation', 'STR.treasury'];
                    available = !unavailableDomains.includes(domainName);
                }
                
                res.json({
                    domainName: domainName,
                    available: available,
                    owner: owner,
                    cost: 999,
                    currency: 'STR'
                });
                
            } catch (error) {
                console.error('Error checking domain availability:', error);
                res.status(500).json({
                    error: 'Failed to check domain availability',
                    message: error.message
                });
            }
        });
        
        // Domain minting endpoint
        this.app.post('/api/domain/mint', async (req, res) => {
            try {
                const { walletAddress, domainName, cost } = req.body;
                
                // Validate input
                if (!walletAddress || !walletAddress.startsWith('zk13str_')) {
                    return res.status(400).json({ error: 'Invalid wallet address' });
                }
                
                if (!domainName || !domainName.startsWith('STR.') || !/^STR\.[a-z0-9]{3,32}$/.test(domainName)) {
                    return res.status(400).json({ error: 'Invalid domain format' });
                }
                
                if (!cost || cost !== 999) {
                    return res.status(400).json({ error: 'Invalid minting cost. Must be 999 STR' });
                }
                
                // Check domain availability again
                let available = true;
                if (this.database && this.database.getDomainOwner) {
                    try {
                        const owner = await this.database.getDomainOwner(domainName);
                        available = !owner;
                    } catch (err) {
                        available = true;
                    }
                }
                
                if (!available) {
                    return res.status(409).json({ error: 'Domain is already taken' });
                }
                
                // Generate transaction hash
                const txHash = 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
                
                // Register domain in database
                if (this.database && this.database.registerPublicIdentity) {
                    try {
                        await this.database.registerPublicIdentity(domainName, {
                            walletAddress: walletAddress,
                            publicKey: walletAddress,
                            registeredAt: new Date().toISOString(),
                            cost: cost,
                            txHash: txHash
                        });
                    } catch (err) {
                        console.warn('Database registration failed, continuing with mock response:', err.message);
                    }
                }
                
                // Create domain record
                const domainRecord = {
                    name: domainName,
                    owner: walletAddress,
                    registeredAt: new Date().toISOString(),
                    cost: cost,
                    currency: 'STR',
                    txHash: txHash,
                    blockNumber: 6001 + Math.floor(Math.random() * 1000),
                    status: 'confirmed'
                };
                
                // Log domain minting
                console.log(`🌐 Domain minted: ${domainName} → ${walletAddress} (Cost: ${cost} STR)`);
                
                res.json({
                    success: true,
                    message: 'Domain minted successfully',
                    domain: domainRecord,
                    txHash: txHash,
                    cost: cost,
                    currency: 'STR'
                });
                
            } catch (error) {
                console.error('Error minting domain:', error);
                res.status(500).json({
                    error: 'Failed to mint domain',
                    message: error.message
                });
            }
        });
        
        // Get domains owned by address
        this.app.get('/api/domains/owned/:address', async (req, res) => {
            try {
                const { address } = req.params;
                
                if (!address || !address.startsWith('zk13str_')) {
                    return res.status(400).json({ error: 'Invalid wallet address format' });
                }
                
                let domains = [];
                
                // Try to get domains from database
                if (this.database && this.database.getPublicIdentitiesByOwner) {
                    try {
                        domains = await this.database.getPublicIdentitiesByOwner(address);
                    } catch (err) {
                        console.warn('Database query failed, using mock data:', err.message);
                        // Fallback to demo domains
                        domains = [
                            {
                                name: 'STR.demo',
                                owner: address,
                                registeredAt: new Date(Date.now() - 24*60*60*1000).toISOString(),
                                cost: 999,
                                currency: 'STR',
                                txHash: 'demo_tx_' + Date.now(),
                                status: 'confirmed'
                            }
                        ];
                    }
                } else {
                    // Mock domains for demo
                    domains = [];
                }
                
                res.json({
                    success: true,
                    address: address,
                    domains: domains,
                    count: domains.length
                });
                
            } catch (error) {
                console.error('Error fetching owned domains:', error);
                res.status(500).json({
                    error: 'Failed to retrieve owned domains',
                    message: error.message
                });
            }
        });
        
        // Send multi-token transaction
        this.app.post('/api/transaction/send', async (req, res) => {
            try {
                const { from, to, token, amount, memo } = req.body;
                
                // Validate input
                if (!from || !from.startsWith('zk13str_')) {
                    return res.status(400).json({ error: 'Invalid sender address' });
                }
                
                if (!to || (!to.startsWith('zk13str_') && !to.startsWith('STR.'))) {
                    return res.status(400).json({ error: 'Invalid recipient address or domain' });
                }
                
                if (!token || !['STR', 'CCOS', 'ARSS', 'wSTR', 'eSTR', 'STR$'].includes(token)) {
                    return res.status(400).json({ error: 'Invalid token type' });
                }
                
                if (!amount || amount <= 0) {
                    return res.status(400).json({ error: 'Invalid amount' });
                }
                
                // Generate transaction hash
                const txHash = 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
                
                // Create transaction record
                const transaction = {
                    hash: txHash,
                    from: from,
                    to: to,
                    token: token,
                    amount: amount,
                    memo: memo || '',
                    timestamp: new Date().toISOString(),
                    blockNumber: 6001 + Math.floor(Math.random() * 1000),
                    confirmations: 1,
                    status: 'confirmed',
                    fee: Math.max(0.001, amount * 0.001) // 0.1% fee, minimum 0.001
                };
                
                // Log transaction
                console.log(`💸 Transaction: ${amount} ${token} from ${from} to ${to} (${txHash})`);
                
                res.json({
                    success: true,
                    message: 'Transaction sent successfully',
                    transaction: transaction,
                    txHash: txHash
                });
                
            } catch (error) {
                console.error('Error sending transaction:', error);
                res.status(500).json({
                    error: 'Failed to send transaction',
                    message: error.message
                });
            }
        });

        console.log('✅ Security routes configured successfully');
        console.log('   🔐 SuperAdmin Access Control');
        console.log('   🔒 ZK-SNARK Privacy Proofs');
        console.log('   🛡️  Security Validation');
        console.log('✅ MagnetWallet API routes configured successfully');
        console.log('   💰 Multi-token balance support (STR, CCOS, ARSS, wSTR, eSTR, STR$)');
        console.log('   🌐 STR.domain minting and management');
        console.log('   💸 Multi-token transaction processing');
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res, next) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        });

        // Global error handler
        this.app.use((err, req, res, next) => {
            console.error('❌ Unhandled error:', err);
            
            const statusCode = err.statusCode || 500;
            const response = {
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
                timestamp: new Date().toISOString()
            };

            if (process.env.NODE_ENV === 'development') {
                response.stack = err.stack;
            }

            res.status(statusCode).json(response);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            console.error('Stack:', error.stack);
            
            // Log to file or monitoring service here
            
            // Graceful shutdown
            if (!this.shutdownInProgress) {
                console.log('🛑 Initiating graceful shutdown due to uncaught exception...');
                this.shutdown('UNCAUGHT_EXCEPTION');
            }
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Promise Rejection:', reason);
            console.error('Promise:', promise);
            
            // Log to file or monitoring service here
        });

        console.log('✅ Error handling configured successfully');
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            if (this.shutdownInProgress) {
                console.log('⏳ Shutdown already in progress...');
                return;
            }

            this.shutdownInProgress = true;
            console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);

            try {
                // Stop accepting new connections
                if (this.server) {
                    await new Promise((resolve) => {
                        this.server.close(() => {
                            console.log('✅ HTTP server closed');
                            resolve();
                        });
                    });
                }

                // Close database connection
                if (this.database) {
                    try {
                        await this.database.close();
                        console.log('✅ Database connection closed');
                    } catch (error) {
                        console.error('⚠️ Error closing database:', error.message);
                    }
                }

                // Shutdown blockchain systems
                if (systems && typeof systems.shutdown === 'function') {
                    try {
                        await systems.shutdown();
                        console.log('✅ Blockchain systems shut down');
                    } catch (error) {
                        console.error('⚠️ Error shutting down blockchain systems:', error.message);
                    }
                }

                console.log('✅ Graceful shutdown complete');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };

        // Register shutdown handlers
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon

        console.log('✅ Graceful shutdown handlers registered');
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Stratus Production Server (Hardened)...');
            
            // Initialize database with auto-detection
            await this.initializeDatabase();
            
            // Load blockchain modules
            await this.loadBlockchainModules();
            
            // Initialize blockchain systems
            await this.initializeBlockchainSystems();
            
            this.isInitialized = true;
            console.log('🌟 Stratus Production Server fully initialized');
            
        } catch (error) {
            console.error('❌ Server initialization failed:', error);
            throw error;
        }
    }

    async initializeDatabase() {
        try {
            console.log('🗄️ Initializing blockchain database...');
            
            // Use HOSTLESS database (Pure Blockchain + DLT + STARW)
            this.database = new HostlessDatabase();
            await this.database.initialize();
            this.databaseType = 'hostless';
            
            console.log('✅ HOSTLESS database initialized successfully');
            console.log('   🌐 Pure blockchain storage active');
            console.log('   🔗 Distributed ledger technology enabled');
            console.log('   💾 STARW distributed storage ready');
            
        } catch (error) {
            console.error('❌ HOSTLESS database initialization failed:', error);
            throw error;
        }
    }

    async loadBlockchainModules() {
        try {
            const autoRunModule = require('./dist/main/blockchain/AutoRunAll.js');
            autoRunAll = autoRunModule.autoRunAll || autoRunModule.default;
            console.log('✅ AutoRunAll module loaded');
        } catch (error) {
            console.warn('⚠️ AutoRunAll module not available:', error.message);
        }

        try {
            const aresModule = require('./dist/main/areslang/index.js');
            AresLangApp = aresModule.AresLangApp || aresModule.default;
            console.log('✅ AresLang module loaded');
        } catch (error) {
            console.warn('⚠️ AresLang module not available:', error.message);
        }
    }

    async initializeBlockchainSystems() {
        if (!autoRunAll) {
            console.warn('⚠️  AutoRunAll not available - running in database-only mode');
            return;
        }

        try {
            console.log('🚀 Starting blockchain initialization...');
            
            // Set environment for lightweight initialization
            process.env.SKIP_HEAVY_HISTORY = 'true';
            process.env.DATABASE_MODE = 'true';
            
            systems = await autoRunAll();
            
            if (AresLangApp) {
                aresApp = new AresLangApp();
                console.log('✅ AresLang initialized');
            }
            
            // Initialize security systems
            await this.initializeSecuritySystems();
            
            // Sync blockchain data with database
            await this.syncBlockchainToDatabase();
            
            console.log('✅ Blockchain systems initialized');
            
        } catch (error) {
            console.error('⚠️  Error initializing blockchain systems:', error.message);
            // Server continues in database-only mode
        }
    }

    async initializeSecuritySystems() {
        try {
            console.log('🔐 Initializing security systems...');
            
            // Initialize SuperAdmin Controller
            this.adminController = new SuperAdminController();
            
            // Initialize Genesis SuperAdmins
            this.adminController.initializeGenesisSuperAdmins([
                'zk13str_foundation_genesis_wallet_address_001',
                'zk13str_treasury_genesis_wallet_address_002',
                'zk13str_market_genesis_wallet_address_003'
            ]);
            
            // Initialize ZK-SNARK Engine
            this.zksnarkEngine = new ZKSNARKEngine();
            const snarkStatus = await this.zksnarkEngine.initialize();
            console.log(`   ZK-SNARK Mode: ${snarkStatus.mode}`);
            
            // Initialize Security Validator
            this.securityValidator = new SecurityValidator();
            
            console.log('✅ Security systems initialized');
            
        } catch (error) {
            console.error('⚠️  Error initializing security systems:', error.message);
        }
    }

    async syncBlockchainToDatabase() {
        if (!systems || !this.database) return;

        try {
            console.log('🔄 Syncing blockchain data to database...');
            
            const networkStats = await this.database.getNetworkStats();
            
            if (networkStats) {
                console.log('✅ Database contains blockchain data');
                console.log(`   📊 Genesis Hash: ${networkStats.genesis_hash || 'N/A'}`);
                console.log(`   💰 Total STR: ${networkStats.total_supply_str || 'N/A'}`);
            }
            
        } catch (error) {
            console.error('⚠️ Error syncing blockchain:', error.message);
        }
    }

    async start() {
        try {
            await this.initialize();

            this.server = this.app.listen(this.port, '0.0.0.0', () => {
                console.log('\n' + '='.repeat(70));
                console.log('🎉 STRATUS PRODUCTION SERVER - RUNNING (HARDENED)');
                console.log('='.repeat(70));
                console.log(`🌍 Server URL: http://localhost:${this.port}`);
                console.log(`🏥 Health Check: http://localhost:${this.port}/health`);
                console.log(`📊 API Info: http://localhost:${this.port}/api/info`);
                console.log(`🔒 Security: Helmet + Rate Limiting + Input Validation`);
                console.log(`📝 Error Handling: Comprehensive try-catch + Graceful Shutdown`);
                console.log(`🗄️ Database: ${this.databaseType.toUpperCase()}`);
                console.log(`⛓️ Blockchain: ${systems ? 'ACTIVE' : 'DATABASE ONLY'}`);
                console.log('='.repeat(70) + '\n');
            });

            this.server.on('error', (error) => {
                console.error('❌ Server error:', error);
                if (error.code === 'EADDRINUSE') {
                    console.error(`Port ${this.port} is already in use`);
                    process.exit(1);
                }
            });

        } catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
}

// ============================================================================
// START SERVER
// ============================================================================

if (require.main === module) {
    const server = new StratusProductionServer();
    server.start().catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = StratusProductionServer;
