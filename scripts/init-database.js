#!/usr/bin/env node
require('dotenv').config();
const BlockchainDatabase = require('../src/database/BlockchainDatabase');

// Script to initialize the blockchain database
async function initializeDatabase() {
    console.log('🗄️ Initializing Stratus Blockchain Database...');
    
    const database = new BlockchainDatabase();
    
    try {
        // Test database connection
        console.log('🔌 Testing database connection...');
        const client = await database.pool.connect();
        console.log('✅ Database connection successful');
        client.release();
        
        // Initialize database schema and data
        await database.initialize();
        
        // Verify initialization
        const networkStats = await database.getNetworkStats();
        const ledgerStats = await database.getLedgerStats();
        
        console.log('\n📊 Database Initialization Complete!');
        console.log('=====================================');
        
        if (networkStats) {
            console.log(`🌐 Network Stats:`);
            console.log(`   Genesis Hash: ${networkStats.genesis_hash}`);
            console.log(`   Total STR Supply: ${networkStats.total_supply_str}`);
            console.log(`   Total CCOS Supply: ${networkStats.total_supply_ccos}`);
            console.log(`   Last Block Height: ${networkStats.last_block_height}`);
        }
        
        if (ledgerStats && ledgerStats.length > 0) {
            console.log(`\n📜 Ledger Stats:`);
            for (const ledger of ledgerStats) {
                console.log(`   ${ledger.ledger_type.toUpperCase()}: ${ledger.total_blocks} blocks, ${ledger.total_transactions} transactions`);
            }
        }
        
        console.log('\n🎉 Database is ready for production use!');
        console.log('🚀 You can now start the production server with: npm start');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Troubleshooting:');
            console.error('   1. Make sure PostgreSQL is running');
            console.error('   2. Check your DATABASE_URL in .env file');
            console.error('   3. Verify database credentials and permissions');
        } else if (error.code === '3D000') {
            console.error('\n💡 Database does not exist. Please create it first:');
            console.error('   createdb stratus_blockchain');
        }
        
        process.exit(1);
    } finally {
        await database.close();
    }
}

if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;