// Mock Database for Development/Testing without PostgreSQL
// This allows testing the production server without requiring PostgreSQL installation

class MockBlockchainDatabase {
    constructor() {
        this.initialized = false;
        this.genesisHash = null;
        this.mockData = {
            networkStats: null,
            ledgerStats: [],
            blocks: {},
            transactions: []
        };
        
        console.log('⚠️ Using Mock Database (PostgreSQL not available)');
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🗄️ Initializing mock blockchain database...');
            await this.createTables();
            await this.loadOrCreateGenesis();
            this.initialized = true;
            console.log('✅ Mock database initialized successfully');
        } catch (error) {
            console.error('❌ Mock database initialization failed:', error);
            throw error;
        }
    }

    async createTables() {
        console.log('✅ Mock database tables created/verified');
        // Mock table creation - no actual database operations
        return true;
    }

    async loadOrCreateGenesis() {
        if (this.mockData.networkStats && this.mockData.networkStats.genesis_hash) {
            this.genesisHash = this.mockData.networkStats.genesis_hash;
            console.log('✅ Existing mock genesis found:', this.genesisHash);
            return;
        }

        console.log('🌍 Creating mock genesis blockchain state...');
        await this.createGenesisState();
    }

    async createGenesisState() {
        // Create genesis hash
        this.genesisHash = this.generateGenesisHash();

        // Initialize mock ledgers
        const ledgers = ['main', 'asset', 'contract', 'governance', 'ccoin', 'ccos'];
        
        this.mockData.ledgerStats = ledgers.map(ledger => ({
            id: Math.floor(Math.random() * 1000000),
            ledger_type: ledger,
            total_blocks: 1001,
            total_transactions: this.calculateLedgerTransactions(ledger),
            last_block_height: 1001,
            last_block_hash: this.generateGenesisHash(),
            ledger_data: JSON.stringify({
                initialized: true,
                genesis_block_height: 1,
                network_capacity: '100 TPMS'
            }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // Create mock network state
        this.mockData.networkStats = {
            id: 1,
            total_nodes: 1313,
            active_nodes: 0,
            network_hashrate: 0,
            total_supply_str: '63000000000',
            total_supply_ccos: '63000000',
            last_block_height: 6000,
            genesis_hash: this.genesisHash,
            network_data: JSON.stringify({
                chain_id: 1313,
                network_name: 'Sourceless Mainnet',
                genesis_time: new Date().toISOString(),
                version: '0.14.0'
            }),
            updated_at: new Date().toISOString()
        };

        // Generate mock blocks for each ledger
        for (const ledger of ledgers) {
            this.mockData.blocks[ledger] = this.generateMockBlocks(ledger, 1001);
        }

        console.log('✅ Mock genesis blockchain state created');
        console.log('📋 Mock Genesis Hash:', this.genesisHash);
    }

    generateMockBlocks(ledger, count) {
        const blocks = [];
        const crypto = require('crypto');
        
        for (let i = 1; i <= count; i++) {
            const timestamp = Date.now() - (count - i) * 600000; // 10 minutes between blocks
            
            blocks.push({
                id: i,
                ledger_type: ledger,
                block_height: i,
                block_hash: crypto.randomBytes(32).toString('hex'),
                previous_hash: i > 1 ? crypto.randomBytes(32).toString('hex') : '0000000000000000000000000000000000000000000000000000000000000000',
                merkle_root: crypto.randomBytes(32).toString('hex'),
                timestamp: new Date(timestamp).toISOString(),
                nonce: Math.floor(Math.random() * 1000000),
                difficulty: 1000000 + Math.floor(Math.random() * 500000),
                miner_address: this.generateRandomAddress(),
                transaction_count: Math.floor(Math.random() * 15) + 5,
                block_size: Math.floor(Math.random() * 50000) + 10000,
                block_data: JSON.stringify({
                    ledger: ledger,
                    blockHeight: i,
                    mock: true
                }),
                created_at: new Date(timestamp).toISOString()
            });
        }
        
        return blocks;
    }

    generateRandomAddress() {
        const crypto = require('crypto');
        const prefixes = ['str1', 'zk13str_', 'ccos1', 'arss1'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = crypto.randomBytes(20).toString('hex');
        return prefix + suffix;
    }

    generateGenesisHash() {
        const crypto = require('crypto');
        const timestamp = Date.now();
        const data = `sourceless-blockchain-genesis-mock-${timestamp}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    calculateLedgerTransactions(ledger) {
        const baseTxPerBlock = 10;
        const blocks = 1001;
        const multipliers = {
            'main': 1.5,
            'asset': 0.8,
            'contract': 1.2,
            'governance': 0.5,
            'ccoin': 0.9,
            'ccos': 1.1
        };
        
        return Math.floor(blocks * baseTxPerBlock * (multipliers[ledger] || 1));
    }

    // API Methods
    async saveBlock(ledger, blockData) {
        // Mock save - just add to memory
        if (!this.mockData.blocks[ledger]) {
            this.mockData.blocks[ledger] = [];
        }
        
        const blockId = this.mockData.blocks[ledger].length + 1;
        this.mockData.blocks[ledger].push({
            id: blockId,
            ledger_type: ledger,
            ...blockData,
            created_at: new Date().toISOString()
        });
        
        return blockId;
    }

    async getBlocks(ledger, page = 1, pageSize = 10) {
        const blocks = this.mockData.blocks[ledger] || [];
        const offset = (page - 1) * pageSize;
        const paginatedBlocks = blocks.slice(offset, offset + pageSize).reverse(); // Newest first
        
        return {
            blocks: paginatedBlocks,
            total: blocks.length,
            page,
            pageSize,
            totalPages: Math.ceil(blocks.length / pageSize)
        };
    }

    async getNetworkStats() {
        return this.mockData.networkStats;
    }

    async getLedgerStats() {
        return this.mockData.ledgerStats;
    }

    async close() {
        console.log('✅ Mock database connection closed');
        // No actual connection to close
    }
}

module.exports = MockBlockchainDatabase;