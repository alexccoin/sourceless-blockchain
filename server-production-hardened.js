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
// INPUT VALIDATION UTILITIES
// ============================================================================

class SecurityValidator {
    static validateString(input, options = {}) {
        if (typeof input !== 'string') {
            return { valid: false, error: 'Input must be a string' };
        }

        const {
            maxLength = 10000,
            minLength = 0,
            allowEmpty = true,
            pattern = null,
            trim = true
        } = options;

        let sanitized = trim ? input.trim() : input;

        if (!allowEmpty && sanitized.length === 0) {
            return { valid: false, error: 'Input cannot be empty' };
        }

        if (sanitized.length < minLength) {
            return { valid: false, error: `Input must be at least ${minLength} characters` };
        }

        if (sanitized.length > maxLength) {
            return { valid: false, error: `Input must be at most ${maxLength} characters` };
        }

        if (pattern && !pattern.test(sanitized)) {
            return { valid: false, error: 'Input format is invalid' };
        }

        return { valid: true, value: sanitized };
    }

    static sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    static validateLedgerType(ledger) {
        const validLedgers = ['main', 'asset', 'contract', 'governance', 'ccoin', 'ccos'];
        if (!validLedgers.includes(ledger)) {
            return { valid: false, error: `Invalid ledger type. Must be one of: ${validLedgers.join(', ')}` };
        }
        return { valid: true, value: ledger };
    }
}

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
            console.warn('⚠️ AutoRunAll not available - running in database-only mode');
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
            
            // Sync blockchain data with database
            await this.syncBlockchainToDatabase();
            
            console.log('✅ Blockchain systems initialized');
            
        } catch (error) {
            console.error('⚠️ Error initializing blockchain systems:', error.message);
            // Server continues in database-only mode
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
