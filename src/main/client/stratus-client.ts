#!/usr/bin/env node
// stratus-client.ts - CLI wrapper for Lightweight Client

import { LightweightClient } from './LightweightClient';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer));
  });
}

async function main() {
  console.clear();
  console.log('═══════════════════════════════════════════════════════');
  console.log('     STRATUS BLOCKCHAIN - LIGHTWEIGHT CLIENT v1.0');
  console.log('═══════════════════════════════════════════════════════\n');

  // Get configuration
  const dataDir = await prompt('Data directory [./stratus-client-data]: ') || './stratus-client-data';
  const seedNodesInput = await prompt('Genesis seed nodes [localhost:6333]: ') || 'localhost:6333';
  const seedNodes = seedNodesInput.split(',').map(s => s.trim());

  console.log('\n');

  // Initialize client
  const client = new LightweightClient({
    dataDir,
    seedNodes,
    autoConnect: true
  });

  try {
    const identity = await client.initialize();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ CLIENT READY');
    console.log('═══════════════════════════════════════════════════════\n');

    // Show node info
    const info = client.getNodeInfo();
    console.log('📊 Node Information:');
    console.log(`   Node ID: ${identity.nodeId.slice(0, 16)}...`);
    console.log(`   STR Domain: ${identity.strDomain}`);
    console.log(`   Wallet: ${identity.walletAddress}`);
    console.log(`   Balance: ${info.balance} STR`);
    console.log(`   P2P Peers: ${info.p2p.peers}`);
    console.log(`   Uptime: ${Math.floor(info.uptime / 1000)}s\n`);

    // Interactive menu
    let running = true;
    while (running) {
      console.log('───────────────────────────────────────────────────────');
      console.log('[1] Send STR');
      console.log('[2] Check Balance');
      console.log('[3] View Node Info');
      console.log('[4] Export Identity');
      console.log('[5] Exit');
      console.log('───────────────────────────────────────────────────────');

      const choice = await prompt('\nSelect option: ');

      switch (choice) {
        case '1':
          const toAddress = await prompt('  Recipient address: ');
          const amountStr = await prompt('  Amount (STR): ');
          const amount = parseFloat(amountStr);

          if (!toAddress || isNaN(amount)) {
            console.log('  ❌ Invalid input\n');
            break;
          }

          const result = await client.send(toAddress, amount);
          if (result.success) {
            console.log(`  ✅ Transaction sent! Hash: ${result.txHash?.slice(0, 16)}...\n`);
          } else {
            console.log(`  ❌ Failed: ${result.error}\n`);
          }
          break;

        case '2':
          console.log(`  💰 Balance: ${client.getBalance()} STR\n`);
          break;

        case '3':
          const currentInfo = client.getNodeInfo();
          console.log('\n  📊 Current Node Status:');
          console.log(`     Wallet: ${currentInfo.identity?.walletAddress}`);
          console.log(`     Balance: ${currentInfo.balance} STR`);
          console.log(`     P2P Running: ${currentInfo.p2p.running}`);
          console.log(`     Peers: ${currentInfo.p2p.peers}`);
          console.log(`     Uptime: ${Math.floor(currentInfo.uptime / 1000)}s\n`);
          break;

        case '4':
          const exportData = client.exportIdentity();
          console.log('\n  📋 Identity Export:');
          console.log(exportData);
          console.log('\n  ⚠️  Keep this safe! Anyone with this data can access your wallet.\n');
          break;

        case '5':
          running = false;
          break;

        default:
          console.log('  ❌ Invalid option\n');
      }
    }

    // Shutdown
    await client.shutdown();
    rl.close();
    console.log('👋 Goodbye!\n');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Client error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Handle Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Interrupted. Shutting down...');
  rl.close();
  process.exit(0);
});

// Run
main();
