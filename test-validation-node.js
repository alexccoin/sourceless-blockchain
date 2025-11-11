/**
 * STARW Mini Validation Node Test Script
 * 
 * Tests the <1MB validation node with ZK13 and GodCypher
 */

const http = require('http');

const API_BASE = 'http://localhost:3002/api';

// Helper to make API calls
function apiCall(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${API_BASE}/${endpoint}`);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log('\n🔷 STARW MINI VALIDATION NODE TESTS\n');
    console.log('=' .repeat(60));

    try {
        // Test 1: Submit transaction (auto-creates node)
        console.log('\n📝 Test 1: Submit Transaction for Validation');
        console.log('-'.repeat(60));
        
        const tx1 = {
            from: 'zk13str_alice_wallet_001',
            to: 'zk13str_bob_wallet_002',
            amount: 100.50,
            data: 'Payment for services'
        };

        const submitResult = await apiCall('validation:submit', 'POST', tx1);
        console.log('✅ Transaction submitted:');
        console.log(JSON.stringify(submitResult, null, 2));

        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 500));

        // Test 2: Check validation status
        console.log('\n📊 Test 2: Check Validation Node Status');
        console.log('-'.repeat(60));
        
        const status = await apiCall(`validation:status?wallet=${tx1.from}`);
        console.log('✅ Node status:');
        console.log(JSON.stringify(status, null, 2));

        // Test 3: Check metrics
        console.log('\n⚡ Test 3: Check Validation Metrics');
        console.log('-'.repeat(60));
        
        const metrics = await apiCall(`validation:metrics?wallet=${tx1.from}`);
        console.log('✅ Node metrics:');
        console.log(JSON.stringify(metrics, null, 2));

        // Test 4: Add witness
        console.log('\n👁️  Test 4: Add Witness to Pool');
        console.log('-'.repeat(60));
        
        const witnessData = {
            wallet: tx1.from,
            witness: 'zk13str_trusted_witness_001',
            stake: 50000,
            reputation: 0.98
        };

        const witnessResult = await apiCall('validation:addwitness', 'POST', witnessData);
        console.log('✅ Witness added:');
        console.log(JSON.stringify(witnessResult, null, 2));

        // Test 5: Submit multiple transactions
        console.log('\n📦 Test 5: Submit Multiple Transactions');
        console.log('-'.repeat(60));
        
        for (let i = 0; i < 5; i++) {
            const tx = {
                from: 'zk13str_alice_wallet_001',
                to: `zk13str_receiver_${i}_wallet`,
                amount: Math.random() * 1000,
                data: `Transaction ${i + 1}`
            };
            
            const result = await apiCall('validation:submit', 'POST', tx);
            console.log(`  ✓ Transaction ${i + 1} queued: ${result.validation?.txHash?.substring(0, 16)}...`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Test 6: Run microbenchmark
        console.log('\n⚡ Test 6: Run Microbenchmark (100 validations)');
        console.log('-'.repeat(60));
        
        const benchData = {
            wallet: 'zk13str_alice_wallet_001',
            iterations: 100
        };

        console.log('Running benchmark... (this may take a few seconds)');
        const benchResults = await apiCall('validation:benchmark', 'POST', benchData);
        
        if (benchResults.success && benchResults.results) {
            const summary = benchResults.results.summary;
            console.log('\n✅ Benchmark Results:');
            console.log(`   Total Validations: ${summary.totalValidations}`);
            console.log(`   Successful: ${summary.successfulValidations}`);
            console.log(`   Failed: ${summary.failedValidations}`);
            console.log(`   Total Time: ${summary.totalTime}ms`);
            console.log(`   Avg Validation Time: ${summary.avgValidationTime}ms`);
            console.log(`   Min/Max Time: ${summary.minValidationTime}ms / ${summary.maxValidationTime}ms`);
            console.log(`   TPS: ${summary.tps}`);
            console.log(`   TPMS: ${summary.tpms}`);
        }

        // Test 7: Final status check
        console.log('\n📊 Test 7: Final Status Check');
        console.log('-'.repeat(60));
        
        const finalStatus = await apiCall(`validation:status?wallet=${tx1.from}`);
        if (finalStatus.success && finalStatus.status) {
            const s = finalStatus.status;
            console.log('\n✅ Final Node State:');
            console.log(`   Node ID: ${s.nodeId}`);
            console.log(`   Wallet: ${s.wallet}`);
            console.log(`   Running: ${s.isRunning}`);
            console.log(`   Uptime: ${Math.round(s.uptime / 1000)}s`);
            console.log(`   Node Size: ${s.nodeSizeMB}MB (${s.underSizeLimit ? '✓ <1MB' : '✗ >1MB'})`);
            console.log(`   Validated Tx: ${s.validatedCount}`);
            console.log(`   Queue Length: ${s.queueLength}`);
            console.log(`   Witnesses: ${s.witnessCount}`);
        }

        // Test 8: Get all nodes status
        console.log('\n🌐 Test 8: All Validation Nodes');
        console.log('-'.repeat(60));
        
        const allStatus = await apiCall('validation:status');
        if (allStatus.success && allStatus.status) {
            console.log(`\n✅ Total Active Nodes: ${allStatus.status.length}`);
            allStatus.status.forEach((node, i) => {
                console.log(`\n   Node ${i + 1}:`);
                console.log(`     Wallet: ${node.wallet}`);
                console.log(`     Validated: ${node.validatedCount}`);
                console.log(`     Size: ${node.nodeSizeMB}MB`);
                console.log(`     Witnesses: ${node.witnessCount}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
        console.log('=' .repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    }
}

// Display panel simulation
function displayValidationPanel(metrics) {
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│         STARW Mini Validation                           │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│  PoE                                                    │');
    console.log('│  ✓ Proof of Existence Active                           │');
    console.log('│                                                         │');
    console.log('│  STARW VM                                               │');
    console.log(`│  cpu: ${metrics.cpu} | mem: ${metrics.memory} | tasks: ${metrics.tasks}          │`);
    console.log('│                                                         │');
    console.log('│  Tx Flow                                                │');
    console.log(`│  in-chain: ${metrics.inChain} | off-chain: ${metrics.offChain}                    │`);
    console.log('│                                                         │');
    console.log('│  Network                                                │');
    console.log(`│  ${metrics.tpms} TPMS (${metrics.tps} TPS)                            │`);
    console.log('│                                                         │');
    console.log('│  Process                                                │');
    console.log(`│  rss: ${metrics.rss} | heap: ${metrics.heap}                          │`);
    console.log('│                                                         │');
    console.log('│  Speed                                                  │');
    console.log(`│  ${metrics.speed} avg validation                               │`);
    console.log('│                                                         │');
    console.log('│  [Run microbench]                                       │');
    console.log('└─────────────────────────────────────────────────────────┘\n');
}

// Run the tests
console.log('\n🚀 Starting STARW Mini Validation Node Tests...');
console.log('   Server: ' + API_BASE);
console.log('   Waiting 2 seconds for server to be ready...\n');

setTimeout(() => {
    runTests().catch(console.error);
}, 2000);
