# Ghost Wallet System - Temporary Pending Ledger

## Overview

The **Ghost Wallet System** creates a **temporary pending ledger** for transactions that are queued off-chain and automatically pushed to the blockchain when nodes are ready to validate.

---

## Key Concepts

### 👻 Ghost Transaction
A transaction that exists in the **ghost ledger** (temporary pending state) before being pushed to the blockchain.

### 📋 Ghost Ledger
A temporary, off-chain ledger that stores pending transactions waiting to be validated and confirmed on-chain.

### 🔄 Auto-Push
Automatic background process that pushes pending ghost transactions to the blockchain when network and nodes are available.

### ⚡ Optimistic Balance
Balance that includes pending transactions, allowing instant UI updates while waiting for blockchain confirmation.

---

## Architecture

```
User Transaction
       ↓
Ghost Wallet (Off-Chain)
       ↓
Ghost Ledger (Pending)
       ↓
Auto-Push Process (Every 5s)
       ↓
Validation Node (When Available)
       ↓
Blockchain Confirmation
       ↓
Balance Update
```

---

## Features

### 1. **Temporary Pending Ledger**
- Off-chain transaction queue
- Max 10,000 pending transactions per wallet
- 24-hour expiration (configurable)
- Automatic cleanup of expired transactions

### 2. **Auto-Push System**
- Push interval: 5 seconds (configurable)
- Batch size: 100 transactions per push
- Maximum 3 retry attempts per transaction
- Network availability detection

### 3. **Optimistic Balance**
- **Available**: Confirmed balance
- **Pending**: Transactions awaiting confirmation
- **Locked**: Outgoing transactions in progress

### 4. **Persistence**
- Auto-save ghost ledger to disk
- Restore on wallet restart
- Survive crashes and restarts

### 5. **Network Resilience**
- Queue transactions during network outages
- Auto-resume when network available
- Retry failed transactions

---

## Usage Examples

### 1. Create Ghost Wallet

```javascript
const GhostWallet = require('./src/wallet/GhostWallet');

// Create ghost wallet for an address
const ghostWallet = new GhostWallet('zk13str_alice_001', {
    autoPush: true,              // Enable auto-push
    autoPushInterval: 5000,      // Push every 5 seconds
    autoPushBatchSize: 100,      // Push 100 tx at a time
    persistence: true,           // Save to disk
    persistencePath: './ghost-data'
});

// Start the ghost wallet
await ghostWallet.start();
```

### 2. Create Ghost Transaction

```javascript
// Create a transaction (goes to ghost ledger)
const ghostTx = await ghostWallet.createGhostTransaction({
    from: 'zk13str_alice_001',
    to: 'zk13str_bob_002',
    amount: 100.5,
    nonce: 42,
    ttl: 86400000  // 24 hours
});

console.log('Ghost transaction created:', ghostTx.ghostHash);
console.log('Status:', ghostTx.ghostStatus); // "PENDING"
console.log('Will expire at:', new Date(ghostTx.expiresAt));
```

### 3. Integration with Compact Validation

```javascript
const CompactValidationNode = require('./src/main/starw/CompactValidationNode');
const GhostWallet = require('./src/wallet/GhostWallet');

// Create validation node
const validationNode = new CompactValidationNode('zk13str_validator_001');
validationNode.start();

// Create ghost wallet
const ghostWallet = new GhostWallet('zk13str_alice_001');
await ghostWallet.start();

// Create ghost transaction
const ghostTx = await ghostWallet.createGhostTransaction({
    from: 'zk13str_alice_001',
    to: 'zk13str_bob_002',
    amount: 100
});

// Auto-push will validate with CompactValidationNode
// Returns compact proof (<35 bytes on-chain)
const result = await ghostWallet.pushBatch(validationNode);
```

---

## Complete System Integration

```javascript
const CompactValidationNode = require('./src/main/starw/CompactValidationNode');
const GhostWalletManager = require('./src/wallet/GhostWalletManager');

// Create validation node
const validationNode = new CompactValidationNode('zk13str_validator_001');
validationNode.start();

// Create ghost wallet manager
const ghostManager = new GhostWalletManager(validationNode);

// Create ghost transaction (auto-creates ghost wallet)
await ghostManager.createGhostTransaction('zk13str_alice_001', {
    from: 'zk13str_alice_001',
    to: 'zk13str_bob_002',
    amount: 100
});

// Start all ghost wallets (enables auto-push)
await ghostManager.startAll();

// Ghost transactions will auto-push every 5 seconds
// CompactValidationNode validates with <35 byte proofs
// Total validation package stays under 1MB
```

---

## Benefits

### ✅ **Under 1MB Validation**
- Ghost ledger stored off-chain
- Only compact proofs sent on-chain (~35 bytes)
- Batch compression for network efficiency
- Total package stays under 1MB

### ✅ **Network Resilience**
- Queue transactions when network unavailable
- Auto-push when nodes ready
- Retry failed transactions
- Survive network outages

### ✅ **User Experience**
- Instant optimistic balance updates
- No waiting for blockchain confirmation
- Offline transaction support
- Auto-retry on failure

### ✅ **Efficiency**
- Batch processing (100 tx at a time)
- Reduced network overhead
- Smart retry logic
- Automatic cleanup

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                     Ghost Wallet                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Ghost Ledger (Off-Chain)                │  │
│  │  • Pending transactions (max 10,000)             │  │
│  │  • Optimistic balance tracking                   │  │
│  │  • Auto-expiration (24 hours)                    │  │
│  │  • Persistence to disk                           │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │       Auto-Push (Every 5 seconds)                │  │
│  │  • Batch size: 100 transactions                  │  │
│  │  • Max retries: 3 attempts                       │  │
│  │  • Network check: Every 2 seconds                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Compact Validation Node                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │     Off-Chain Processing                         │  │
│  │  • Full anomaly detection                        │  │
│  │  • Pattern analysis                              │  │
│  │  • Threat scoring                                │  │
│  │  • Earthquake detection                          │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │     On-Chain Proof (~35 bytes)                   │  │
│  │  • Compact hash (8 bytes)                        │  │
│  │  • Timestamp (8 bytes)                           │  │
│  │  • Merkle root (8 bytes)                         │  │
│  │  • Flags (1 byte)                                │  │
│  │  • Threat score (1 byte)                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
                    Blockchain
                 (Under 1MB total)
```

---

## Conclusion

The **Ghost Wallet + Compact PoE** system provides:

1. **Temporary pending ledger** (ghost wallet) for transaction queuing
2. **Auto-push** when chain/nodes ready
3. **Compact validation** (<35 bytes per proof)
4. **Under 1MB** total validation package
5. **Network resilience** for offline scenarios
6. **Optimistic balance** for instant UI updates

**Perfect solution for keeping validation under 1MB while handling network delays and node availability!** 👻⚡
