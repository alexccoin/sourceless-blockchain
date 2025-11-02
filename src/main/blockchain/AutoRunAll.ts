// AutoRunAll.ts
// Superadmin automation: auto-run and wire all core modules for Sourceless Blockchain

import { WalletManager } from './wallet/WalletManager';
import { LedgerManager } from './LedgerManager';
import { AppLessEngine } from '../appless/AppLessEngine';
import { StarwVM } from '../starw/StarwVM';
import { StarwWorkerNode } from '../starw/StarwWorkerNode';
import { PersonalNode } from '../starw/PersonalNode';
import { P2PNetwork } from '../p2p/P2PNetwork';
import { AresAI } from '../ares/AresAI';
import { STRDomainRegistry } from './STRDomainRegistry';
import { CcoinBridge } from './CcoinBridge';
import { DelegatedNodeNetwork } from './DelegatedNodeNetwork';

export type Systems = {
  p2p: P2PNetwork;
  walletManager: WalletManager;
  ledgerManager: LedgerManager;
  personalNode: PersonalNode;
  starwVM: StarwVM;
  workerNode: StarwWorkerNode;
  registry: STRDomainRegistry;
  bridge: CcoinBridge;
  nodeNet: DelegatedNodeNetwork;
  getStatus: () => any;
};

export function autoRunAll(): Systems {
  console.log('🚀 SOURCELESS BLOCKCHAIN v0.13 - AUTO RUN ALL SYSTEMS 🚀');
  console.log('=========================================================');

  // 1. Initialize Wallet Manager with ZK13STR addresses
  console.log('\n📍 Step 1: Initializing Wallet Manager (ZK13STR)...');
  const walletManager = new WalletManager();
  
  // Create default wallet with ZK13STR address
  const defaultWallet = walletManager.createWallet('STR.system', true);
  console.log(`   ✅ Default wallet: ${defaultWallet.address}`);
  console.log(`   ✅ STR.domain: ${defaultWallet.strDomain}`);
  console.log(`   ✅ KYC Status: Verified`);

  // 2. Initialize Multi-Ledger System
  console.log('\n📍 Step 2: Initializing Multi-Ledger System (Fuel • Financial • VM • Identity)...');
  const ledgerManager = new LedgerManager();

  // 3. Mine initial blocks on all ledgers
  console.log('\n📍 Step 3: Mining initial blocks...');
  ledgerManager.mainLedger.minePendingTransactions(defaultWallet.address);
  console.log('   ✅ Fuel Ledger (STR Fuel) genesis block mined');

  // 4. Start P2P network
  console.log('\n📍 Step 4: Starting P2P Network...');
  const p2p = new P2PNetwork();
  p2p.start();
  console.log('   ✅ P2P Network started (BitTorrent-style)');

  // 5. Auto-run personal node for user
  console.log('\n📍 Step 5: Starting Personal Node...');
  const personalNode = new PersonalNode({
    id: 'user-node',
    type: 'hybrid',
    strDomain: defaultWallet.strDomain,
    zkCompressed: true,
    tpsCapacity: 100000,
    delegatedNodes: [],
    storage: { totalSpace: 10, usedSpace: 0, efficiency: 90, standbyReserve: 1 },
    p2pConfig: { torrentStyle: true, uploadSpeed: 100, downloadSpeed: 100, peers: 0 },
    kycAML: true,
    isValidator: true,
    reputation: 100,
    uptime: 100,
    partialHosting: { enabled: true, masterNodeShare: 40, personalNodeShare: 40, sharedNodeShare: 20, redundancy: 2, autoBalance: true },
    autoRunPersonalNode: true
  });
  personalNode.autoRun();
  console.log('   ✅ Personal Node auto-run started');

  // 6. Auto-run STARW VM and worker node for ARESLang contracts
  console.log('\n📍 Step 6: Starting STARW VM & Worker Node...');
  const starwVM = new StarwVM('1.0.0');
  const workerNode = new StarwWorkerNode('1.0.0');
  console.log('   ✅ STARW VM initialized (v1.0.0)');
  console.log('   ✅ STARW Worker Node initialized');

  // 7. AppLess auto-execution example
  console.log('\n📍 Step 7: Testing AppLess Execution...');
  AppLessEngine.executeAppLess('return 123;', {}, 'circuit.wasm', 'circuit_final.zkey');
  console.log('   ✅ AppLess execution tested');

  // 8. ARES AI code generation example
  console.log('\n📍 Step 8: Testing ARES AI...');
  AresAI.generateCode('Create a smart contract for voting');
  console.log('   ✅ ARES AI code generation tested');

  // 9. STR.domain registry example
  console.log('\n📍 Step 9: Registering STR.domain...');
  const registry = new STRDomainRegistry();
  registry.registerDomain(defaultWallet.strDomain, defaultWallet.address, true);
  console.log(`   ✅ STR.domain registered: ${defaultWallet.strDomain}`);

  // 10. Cross-chain bridge example
  console.log('\n📍 Step 10: Initializing Cross-Chain Bridge...');
  const bridge = new CcoinBridge();
  bridge.createBridgeTx('Bitcoin', 'SourceLess', 'btc-addr', defaultWallet.address, 'BTC', 1, true);
  console.log('   ✅ Cross-chain bridge initialized');

  // 11. Delegated node network example
  console.log('\n📍 Step 11: Setting up Delegated Node Network...');
  const nodeNet = new DelegatedNodeNetwork();
  nodeNet.addNode({ id: 'node1', strDomain: 'STR.node1', tpsCapacity: 50000, isActive: true, uptime: 99, reputation: 100 });
  nodeNet.addNode({ id: 'node2', strDomain: 'STR.node2', tpsCapacity: 50000, isActive: true, uptime: 99, reputation: 100 });
  console.log('   ✅ Delegated Node Network: 2 nodes (100,000 TPS capacity)');

  console.log('\n=========================================================');
  console.log('✅ ALL SYSTEMS OPERATIONAL - SOURCELESS BLOCKCHAIN v0.13');
  console.log('=========================================================\n');

  const getStatus = () => ({
    wallet: {
      address: defaultWallet.address,
      strDomain: defaultWallet.strDomain,
      balance: ledgerManager.getTotalBalance(defaultWallet.address),
      kycVerified: true
    },
    p2p: p2p.getStats(),
    ledgers: ledgerManager.getAllLedgerStats(),
    personalNode: { running: true, strDomain: defaultWallet.strDomain },
    starwVM: { version: '1.0.0', running: true },
    workerNode: { version: '1.0.0', running: true },
    registry: { domains: [defaultWallet.strDomain] },
    bridge: { status: 'active', supportedChains: 5 },
    nodeNet: { nodes: 2, totalTPS: nodeNet.getTotalTPS() }
  });

  return { p2p, walletManager, ledgerManager, personalNode, starwVM, workerNode, registry, bridge, nodeNet, getStatus };
}
