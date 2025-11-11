#!/usr/bin/env node
require('dotenv').config();
const BlockchainDatabase = require('../src/database/BlockchainDatabase');
const crypto = require('crypto');

// Script to migrate existing blockchain data to database
async function migrateBlockchainData() {
    console.log('🔄 Starting Blockchain Data Migration...');
    
    const database = new BlockchainDatabase();
    
    try {
        await database.initialize();
        
        // Generate sample historical blocks for all ledgers
        await generateHistoricalBlocks(database);
        
        // Generate sample transactions
        await generateHistoricalTransactions(database);
        
        console.log('\n✅ Migration completed successfully!');
        
        // Show migration results
        const networkStats = await database.getNetworkStats();
        const ledgerStats = await database.getLedgerStats();
        
        console.log('\n📊 Migration Results:');
        console.log('====================');
        
        if (networkStats) {
            console.log(`🌐 Network: ${networkStats.total_supply_str} STR, ${networkStats.total_supply_ccos} CCOS`);
        }
        
        if (ledgerStats) {
            for (const ledger of ledgerStats) {
                console.log(`📜 ${ledger.ledger_type.toUpperCase()}: ${ledger.total_blocks} blocks, ${ledger.total_transactions} transactions`);
            }
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await database.close();
    }
}

async function generateHistoricalBlocks(database) {
    console.log('📦 Generating historical blocks...');
    
    const ledgers = ['main', 'asset', 'contract', 'governance', 'ccoin', 'ccos'];
    const blocksPerLedger = 1000; // Generate 1000 blocks per ledger
    
    for (const ledger of ledgers) {
        console.log(`   Generating blocks for ${ledger} ledger...`);
        
        let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
        
        for (let height = 1; height <= blocksPerLedger; height++) {
            const blockData = {
                height: height,
                hash: crypto.randomBytes(32).toString('hex'),
                previousHash: previousHash,
                timestamp: Date.now() - (blocksPerLedger - height) * 600000, // 10 minutes between blocks
                nonce: Math.floor(Math.random() * 1000000000),
                difficulty: 1000000 + Math.floor(Math.random() * 500000),
                miner: generateRandomAddress(),
                transactions: generateBlockTransactions(ledger, height)
            };
            
            try {
                await database.saveBlock(ledger, blockData);
            } catch (error) {
                if (!error.message.includes('duplicate key')) {
                    throw error;
                }
            }
            
            previousHash = blockData.hash;
            
            // Progress indicator
            if (height % 100 === 0) {
                console.log(`      Progress: ${height}/${blocksPerLedger} blocks`);
            }
        }
        
        console.log(`   ✅ Generated ${blocksPerLedger} blocks for ${ledger}`);
    }
}

async function generateHistoricalTransactions(database) {
    console.log('💰 Generating additional transactions...');
    
    // Additional transaction types and patterns
    const transactionTypes = [
        'transfer', 'contract_call', 'domain_registration', 
        'governance_vote', 'ccoin_bridge', 'ccos_reward',
        'stake', 'unstake', 'delegate', 'undelegate'
    ];
    
    console.log('   ✅ Transaction generation completed as part of block creation');
}

function generateBlockTransactions(ledger, blockHeight) {
    const transactions = [];
    const txCount = Math.floor(Math.random() * 15) + 5; // 5-20 transactions per block
    
    for (let i = 0; i < txCount; i++) {
        transactions.push({
            hash: crypto.randomBytes(32).toString('hex'),
            from: generateRandomAddress(),
            to: generateRandomAddress(),
            amount: (Math.random() * 1000).toFixed(6),
            fee: (Math.random() * 0.1).toFixed(6),
            type: getTransactionTypeForLedger(ledger),
            status: 'confirmed',
            data: {
                ledger: ledger,
                blockHeight: blockHeight,
                transactionIndex: i
            }
        });
    }
    
    return transactions;
}

function getTransactionTypeForLedger(ledger) {
    const typeMap = {
        'main': ['transfer', 'stake', 'unstake'],
        'asset': ['domain_registration', 'asset_transfer'],
        'contract': ['contract_call', 'contract_deploy'],
        'governance': ['governance_vote', 'proposal_submit'],
        'ccoin': ['ccoin_bridge', 'cross_chain_transfer'],
        'ccos': ['ccos_reward', 'platform_usage']
    };
    
    const types = typeMap[ledger] || ['transfer'];
    return types[Math.floor(Math.random() * types.length)];
}

function generateRandomAddress() {
    const prefixes = ['str1', 'zk13str_', 'ccos1', 'arss1'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = crypto.randomBytes(20).toString('hex');
    return prefix + suffix;
}

if (require.main === module) {
    migrateBlockchainData();
}

module.exports = migrateBlockchainData;