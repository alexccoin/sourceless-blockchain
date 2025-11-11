#!/usr/bin/env node

// START GENESIS NODES - Launch 1313 validation nodes with special domains

const GenesisNodeManager = require('./GenesisNodeManager');
const HostlessDatabase = require('../src/database/HostlessDatabase');

async function startGenesisNetwork() {
    console.log('🌌 SOURCELESS GENESIS NODE NETWORK');
    console.log('===================================');
    console.log('🔷 Initializing 1313 Mini Validation Nodes');
    console.log('⭐ Special Domains: STR.OBI, STR.GROK, STR.STAR, STR.DARTH, STR.STARWARS');
    console.log('===================================\n');

    try {
        // Initialize database
        console.log('🗄️ Initializing HOSTLESS database...');
        const database = new HostlessDatabase();
        await database.initialize();
        console.log('✅ Database ready\n');

        // Create genesis node manager
        const genesisManager = new GenesisNodeManager(database);

        // Initialize all 1313 nodes
        const stats = await genesisManager.initialize();

        // Display network stats
        console.log('📊 NETWORK STATISTICS:');
        console.log(`   Total Nodes: ${stats.totalNodes}`);
        console.log(`   Active Nodes: ${stats.activeNodes}`);
        console.log(`   Special Domains: ${stats.specialDomains}`);
        console.log(`   Network TPS: ${stats.totalTPS.toLocaleString()}`);
        console.log(`   Network TPMS: ${stats.totalTPMS.toLocaleString()}`);
        console.log(`   Total Validations: ${stats.totalValidations}`);
        console.log(`   Total Witnesses: ${stats.totalWitnesses}`);
        console.log(`   Avg Node Size: ${stats.averageNodeSize} MB`);

        console.log('\n⭐ SPECIAL DOMAINS:');
        const specialDomains = genesisManager.getSpecialDomains();
        for (const domain of specialDomains) {
            console.log(`   ${domain.domain} (${domain.abbreviation})`);
            console.log(`      Role: ${domain.role} | Power: ${domain.power}`);
            console.log(`      Wallet: ${domain.walletAddress.substring(0, 30)}...`);
            console.log(`      Node: ${domain.nodeId}`);
            
            // Display token balances for special domains
            if (domain.tokenBalances) {
                const formatNum = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                console.log(`      💰 STR: ${formatNum(domain.tokenBalances.STR)} | CCOS: ${formatNum(domain.tokenBalances.CCOS)} | WSTR: ${formatNum(domain.tokenBalances.WSTR)}`);
                console.log(`         ARSS: ${formatNum(domain.tokenBalances.ARSS)} | ESTR: ${formatNum(domain.tokenBalances.ESTR)}`);
            }
        }

        console.log('\n🎮 RUNNING NETWORK SIMULATION (30 seconds)...');
        console.log('   Simulating cross-node transactions...\n');
        
        const txCount = await genesisManager.runNetworkSimulation(30);
        
        console.log(`\n✅ Simulation complete: ${txCount} transactions`);

        // Keep nodes running
        console.log('\n🌐 Genesis network is LIVE');
        console.log('   Press Ctrl+C to shutdown gracefully');

        // Graceful shutdown handler
        process.on('SIGINT', async () => {
            console.log('\n\n🛑 Shutdown signal received...');
            await genesisManager.shutdown();
            await database.close();
            console.log('✅ Genesis network stopped gracefully');
            process.exit(0);
        });

        // Keep process alive and show periodic stats
        setInterval(() => {
            const currentStats = genesisManager.getNetworkStats();
            console.log(`\n📊 [${new Date().toLocaleTimeString()}] Network Status:`);
            console.log(`   Active Nodes: ${currentStats.activeNodes}/${currentStats.totalNodes}`);
            console.log(`   Total Validations: ${currentStats.totalValidations}`);
            console.log(`   Network TPMS: ${currentStats.totalTPMS}`);
        }, 10000); // Every 10 seconds

    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    startGenesisNetwork().catch(err => {
        console.error('Failed to start genesis network:', err);
        process.exit(1);
    });
}

module.exports = startGenesisNetwork;
