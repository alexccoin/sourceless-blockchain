const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class BlockchainDatabase {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/stratus_blockchain',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        
        this.initialized = false;
        this.genesisHash = null;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🗄️ Initializing blockchain database...');
            await this.createTables();
            await this.loadOrCreateGenesis();
            this.initialized = true;
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    async createTables() {
        const schema = `
            -- Blockchain blocks table
            CREATE TABLE IF NOT EXISTS blockchain_blocks (
                id SERIAL PRIMARY KEY,
                ledger_type VARCHAR(50) NOT NULL,
                block_height BIGINT NOT NULL,
                block_hash VARCHAR(66) UNIQUE NOT NULL,
                previous_hash VARCHAR(66),
                merkle_root VARCHAR(66),
                timestamp TIMESTAMP WITH TIME ZONE,
                nonce BIGINT,
                difficulty BIGINT,
                miner_address VARCHAR(100),
                transaction_count INTEGER DEFAULT 0,
                block_size INTEGER DEFAULT 0,
                block_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(ledger_type, block_height)
            );

            -- Blockchain transactions table
            CREATE TABLE IF NOT EXISTS blockchain_transactions (
                id SERIAL PRIMARY KEY,
                tx_hash VARCHAR(66) UNIQUE NOT NULL,
                block_id INTEGER REFERENCES blockchain_blocks(id),
                ledger_type VARCHAR(50) NOT NULL,
                from_address VARCHAR(100),
                to_address VARCHAR(100),
                amount DECIMAL(30,18),
                fee DECIMAL(30,18),
                tx_type VARCHAR(50),
                status VARCHAR(20) DEFAULT 'confirmed',
                tx_data JSONB,
                timestamp TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Blockchain wallets table
            CREATE TABLE IF NOT EXISTS blockchain_wallets (
                id SERIAL PRIMARY KEY,
                address VARCHAR(100) UNIQUE NOT NULL,
                wallet_type VARCHAR(50),
                balance_str DECIMAL(30,18) DEFAULT 0,
                balance_ccos DECIMAL(30,18) DEFAULT 0,
                balance_arss DECIMAL(30,18) DEFAULT 0,
                balance_wstr DECIMAL(30,18) DEFAULT 0,
                balance_estr DECIMAL(30,18) DEFAULT 0,
                balance_usd DECIMAL(30,18) DEFAULT 0,
                nonce BIGINT DEFAULT 0,
                wallet_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Network state table
            CREATE TABLE IF NOT EXISTS blockchain_network_state (
                id SERIAL PRIMARY KEY,
                total_nodes INTEGER DEFAULT 0,
                active_nodes INTEGER DEFAULT 0,
                network_hashrate BIGINT DEFAULT 0,
                total_supply_str DECIMAL(30,18) DEFAULT 0,
                total_supply_ccos DECIMAL(30,18) DEFAULT 0,
                last_block_height BIGINT DEFAULT 0,
                genesis_hash VARCHAR(66),
                network_data JSONB,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Blockchain ledgers metadata
            CREATE TABLE IF NOT EXISTS blockchain_ledgers (
                id SERIAL PRIMARY KEY,
                ledger_type VARCHAR(50) UNIQUE NOT NULL,
                total_blocks BIGINT DEFAULT 0,
                total_transactions BIGINT DEFAULT 0,
                last_block_height BIGINT DEFAULT 0,
                last_block_hash VARCHAR(66),
                ledger_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- System configuration
            CREATE TABLE IF NOT EXISTS system_config (
                id SERIAL PRIMARY KEY,
                config_key VARCHAR(100) UNIQUE NOT NULL,
                config_value TEXT,
                config_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Create indexes for performance
            CREATE INDEX IF NOT EXISTS idx_blocks_ledger_height ON blockchain_blocks(ledger_type, block_height);
            CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blockchain_blocks(block_hash);
            CREATE INDEX IF NOT EXISTS idx_transactions_hash ON blockchain_transactions(tx_hash);
            CREATE INDEX IF NOT EXISTS idx_transactions_addresses ON blockchain_transactions(from_address, to_address);
            CREATE INDEX IF NOT EXISTS idx_wallets_address ON blockchain_wallets(address);
            CREATE INDEX IF NOT EXISTS idx_ledgers_type ON blockchain_ledgers(ledger_type);
        `;

        await this.pool.query(schema);
        console.log('✅ Database tables created/verified');
    }

    async loadOrCreateGenesis() {
        // Check if genesis already exists
        const genesisCheck = await this.pool.query(
            'SELECT genesis_hash FROM blockchain_network_state LIMIT 1'
        );

        if (genesisCheck.rows.length > 0 && genesisCheck.rows[0].genesis_hash) {
            this.genesisHash = genesisCheck.rows[0].genesis_hash;
            console.log('✅ Existing genesis found:', this.genesisHash);
            return;
        }

        // Create new genesis
        console.log('🌍 Creating new genesis blockchain state...');
        await this.createGenesisState();
    }

    async createGenesisState() {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            // Create genesis hash
            this.genesisHash = this.generateGenesisHash();

            // Initialize ledgers
            const ledgers = ['main', 'asset', 'contract', 'governance', 'ccoin', 'ccos'];
            
            for (const ledger of ledgers) {
                await client.query(
                    `INSERT INTO blockchain_ledgers (ledger_type, total_blocks, total_transactions, ledger_data)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (ledger_type) DO UPDATE SET
                     total_blocks = EXCLUDED.total_blocks,
                     total_transactions = EXCLUDED.total_transactions,
                     ledger_data = EXCLUDED.ledger_data,
                     updated_at = NOW()`,
                    [ledger, 1001, this.calculateLedgerTransactions(ledger), JSON.stringify({
                        initialized: true,
                        genesis_block_height: 1,
                        network_capacity: '100 TPMS'
                    })]
                );
            }

            // Create genesis wallets
            const genesisWallets = [
                {
                    address: 'zk13str_foundation_genesis_wallet_address_001',
                    type: 'foundation',
                    balances: { str: '21000000000', ccos: '21000000' }
                },
                {
                    address: 'zk13str_treasury_genesis_wallet_address_002', 
                    type: 'treasury',
                    balances: { str: '42210000000', ccos: '42210000' }
                },
                {
                    address: 'zk13str_market_genesis_wallet_address_003',
                    type: 'market', 
                    balances: { str: '20790000000', ccos: '20790000' }
                }
            ];

            for (const wallet of genesisWallets) {
                await client.query(
                    `INSERT INTO blockchain_wallets (address, wallet_type, balance_str, balance_ccos, wallet_data)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (address) DO UPDATE SET
                     balance_str = EXCLUDED.balance_str,
                     balance_ccos = EXCLUDED.balance_ccos,
                     wallet_data = EXCLUDED.wallet_data,
                     updated_at = NOW()`,
                    [
                        wallet.address,
                        wallet.type,
                        wallet.balances.str,
                        wallet.balances.ccos,
                        JSON.stringify({ genesis: true, created_at: new Date().toISOString() })
                    ]
                );
            }

            // Create network state
            await client.query(
                `INSERT INTO blockchain_network_state (
                    total_nodes, active_nodes, total_supply_str, total_supply_ccos, 
                    last_block_height, genesis_hash, network_data
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (id) DO UPDATE SET
                 total_supply_str = EXCLUDED.total_supply_str,
                 total_supply_ccos = EXCLUDED.total_supply_ccos,
                 genesis_hash = EXCLUDED.genesis_hash,
                 network_data = EXCLUDED.network_data,
                 updated_at = NOW()`,
                [
                    1313, // total_nodes
                    0,    // active_nodes (will be updated by P2P)
                    '63000000000', // total STR supply
                    '63000000',    // total CCOS supply
                    6000,  // last_block_height
                    this.genesisHash,
                    JSON.stringify({
                        chain_id: 1313,
                        network_name: 'Sourceless Mainnet',
                        genesis_time: new Date().toISOString(),
                        version: '0.14.0'
                    })
                ]
            );

            await client.query('COMMIT');
            console.log('✅ Genesis blockchain state created');
            console.log('📋 Genesis Hash:', this.genesisHash);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    generateGenesisHash() {
        const crypto = require('crypto');
        const timestamp = Date.now();
        const data = `sourceless-blockchain-genesis-${timestamp}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    calculateLedgerTransactions(ledger) {
        // Calculate realistic transaction counts per ledger
        const baseTxPerBlock = 10;
        const blocks = 1001;
        const multipliers = {
            'main': 1.5,      // More STR transfers
            'asset': 0.8,     // Domain registrations
            'contract': 1.2,  // Smart contracts
            'governance': 0.5, // DAO activities
            'ccoin': 0.9,     // Cross-chain
            'ccos': 1.1       // Platform usage
        };
        
        return Math.floor(blocks * baseTxPerBlock * (multipliers[ledger] || 1));
    }

    // API Methods for blockchain operations
    async saveBlock(ledger, blockData) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Insert block
            const blockResult = await client.query(
                `INSERT INTO blockchain_blocks (
                    ledger_type, block_height, block_hash, previous_hash, 
                    timestamp, nonce, difficulty, miner_address, 
                    transaction_count, block_data
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id`,
                [
                    ledger,
                    blockData.height,
                    blockData.hash,
                    blockData.previousHash,
                    new Date(blockData.timestamp),
                    blockData.nonce || 0,
                    blockData.difficulty || 1000000,
                    blockData.miner,
                    blockData.transactions?.length || 0,
                    JSON.stringify(blockData)
                ]
            );

            const blockId = blockResult.rows[0].id;

            // Insert transactions
            if (blockData.transactions && blockData.transactions.length > 0) {
                for (const tx of blockData.transactions) {
                    await client.query(
                        `INSERT INTO blockchain_transactions (
                            tx_hash, block_id, ledger_type, from_address, to_address,
                            amount, fee, tx_type, tx_data, timestamp
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                        [
                            tx.hash,
                            blockId,
                            ledger,
                            tx.from,
                            tx.to,
                            tx.amount || 0,
                            tx.fee || 0,
                            tx.type || 'transfer',
                            JSON.stringify(tx),
                            new Date(blockData.timestamp)
                        ]
                    );
                }
            }

            // Update ledger stats
            await client.query(
                `UPDATE blockchain_ledgers SET
                 total_blocks = total_blocks + 1,
                 total_transactions = total_transactions + $1,
                 last_block_height = $2,
                 last_block_hash = $3,
                 updated_at = NOW()
                 WHERE ledger_type = $4`,
                [blockData.transactions?.length || 0, blockData.height, blockData.hash, ledger]
            );

            await client.query('COMMIT');
            return blockId;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getBlocks(ledger, page = 1, pageSize = 10) {
        const offset = (page - 1) * pageSize;
        
        const result = await this.pool.query(
            `SELECT * FROM blockchain_blocks 
             WHERE ledger_type = $1 
             ORDER BY block_height DESC 
             LIMIT $2 OFFSET $3`,
            [ledger, pageSize, offset]
        );

        const countResult = await this.pool.query(
            'SELECT COUNT(*) FROM blockchain_blocks WHERE ledger_type = $1',
            [ledger]
        );

        return {
            blocks: result.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            pageSize,
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / pageSize)
        };
    }

    async getNetworkStats() {
        const result = await this.pool.query(
            'SELECT * FROM blockchain_network_state ORDER BY id DESC LIMIT 1'
        );
        
        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async getLedgerStats() {
        const result = await this.pool.query(
            'SELECT * FROM blockchain_ledgers ORDER BY ledger_type'
        );
        
        return result.rows;
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = BlockchainDatabase;